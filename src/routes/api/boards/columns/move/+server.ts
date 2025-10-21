import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/database';
import { userPermission } from '$lib/server/permissions';
import type { RequestHandler } from './$types';
import type { RowDataPacket } from 'mysql2';

/** -------------------------------
 *  ↕️ MOVE COLUMN
 *  Level 3 required
 * ------------------------------- */
export const POST: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) throw error(401, 'Unauthorized');

	const { items } = await request.json();
	if (!Array.isArray(items) || items.length === 0)
		throw error(400, 'Invalid data for moving columns.');

	const pool = getPool();
	const connection = await pool.getConnection();

	try {
		await connection.beginTransaction();

		const [validateRows] = (await connection.query<RowDataPacket[]>(
			'SELECT id, board_id FROM columns WHERE id IN (?)',
			[items]
		)) as any;

		if (!Array.isArray(validateRows) || validateRows.length === 0) {
			await connection.rollback();
			return json({ success: false, message: 'Invalid columns.' }, { status: 400 });
		}

		const board_id = validateRows[0].board_id;
		const userLevel = await userPermission(session.user.id, board_id, 3);
		if (!userLevel) {
			await connection.rollback();
			return json({ success: false, message: 'You do not have permission to move columns.' }, { status: 403 });
		}

		const validIds = new Set(validateRows.map((r) => r.id));
		for (const id of items) {
			if (!validIds.has(id)) {
				await connection.rollback();
				return json({ success: false, message: 'Invalid column detected in reordering request.' }, { status: 400 });
			}
		}

		await Promise.all(items.map((id, index) =>
			connection.execute('UPDATE columns SET position = ? WHERE id = ?', [index, id])
		));

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
