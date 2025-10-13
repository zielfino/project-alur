import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { getSession } }) => {
    const session = await getSession();
    if (!session) throw error(401, 'Unauthorized');

    const { card_id, new_column_id, items_in_new_column } = await request.json();
    if (!card_id || !new_column_id || !items_in_new_column) {
        throw error(400, 'Invalid data for moving card.');
    }

    const pool = getPool();
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Pindahkan kartu ke kolom baru
        await connection.execute('UPDATE cards SET column_id = ? WHERE id = ?', [new_column_id, card_id]);

        // Update posisi semua kartu di kolom tujuan
        for (let i = 0; i < items_in_new_column.length; i++) {
            await connection.execute('UPDATE cards SET position = ? WHERE id = ?', [i, items_in_new_column[i]]);
        }

        await connection.commit();
        return json({ success: true });
    } catch (err) {
        await connection.rollback();
        console.error('Failed to move card:', err);
        throw error(500, 'Failed to move card.');
    } finally {
        if (connection) connection.release();
    }
};