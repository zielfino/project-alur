import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { getSession } }) => {
    const session = await getSession();
    if (!session) throw error(401, 'Unauthorized');

    const { card_id, new_column_id, items_in_new_column, items_in_old_column } = await request.json();
    if (!card_id || !new_column_id || !Array.isArray(items_in_new_column)) {
        throw error(400, 'Invalid data for moving card.');
    }

    const pool = getPool();
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

		// 1️⃣ Pindahkan kartu ke kolom baru
		await connection.execute('UPDATE cards SET column_id = ? WHERE id = ?', [new_column_id, card_id]);

		// 2️⃣ Update posisi di kolom asal (jika ada)
		if (Array.isArray(items_in_old_column)) {
			const updates = items_in_old_column.map((id, index) =>
				connection.execute('UPDATE cards SET position = ? WHERE id = ?', [index, id])
			);
			await Promise.all(updates);
		}

		// 3️⃣ Update posisi di kolom tujuan
		const updates = items_in_new_column.map((id, index) =>
			connection.execute('UPDATE cards SET position = ? WHERE id = ?', [index, id])
		);
		await Promise.all(updates);

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