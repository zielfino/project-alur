import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { getSession } }) => {
    const session = await getSession();
    if (!session) throw error(401, 'Unauthorized');

    const { items } = await request.json(); // Menerima array ID kolom
	if (!Array.isArray(items)) throw error(400, 'Invalid data for moving columns.');

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        
		const updates = items.map((id, index) =>
			connection.execute('UPDATE columns SET position = ? WHERE id = ?', [index, id])
		);
		await Promise.all(updates);
        
        await connection.commit();
        return json({ success: true });
    } catch (err) {
        await connection.rollback();
		console.error('Failed to move columns:', err);
        throw error(500, 'Failed to move columns.');
    } finally {
		connection.release();
    }
};