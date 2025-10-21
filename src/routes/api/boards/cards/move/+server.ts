import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/database';
import { userPermission } from '$lib/server/permissions';
import type { RequestHandler } from './$types';

/** -------------------------------
 *  🔀 MOVE CARD
 *  Level 2 required
 * ------------------------------- */
export const POST: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) throw error(401, 'Unauthorized');

	const { card_id, new_column_id, items_in_new_column, items_in_old_column } = await request.json();
	if (!card_id || !new_column_id || !Array.isArray(items_in_new_column))
		throw error(400, 'Invalid data for moving card.');

	const pool = getPool();
	const connection = await pool.getConnection();

	try {
		await connection.beginTransaction();

		const [cardRows]: any = await connection.query(
			`SELECT col.board_id FROM cards c
			 JOIN columns col ON c.column_id = col.id
			 WHERE c.id = ?`,
			[card_id]
		);

		if (!Array.isArray(cardRows) || cardRows.length === 0) {
			await connection.rollback();
			return json({ success: false, message: 'Card not found.' }, { status: 404 });
		}

		const boardId = cardRows[0].board_id;
		const userLevel = await userPermission(session.user.id, boardId, 2);
		if (!userLevel) {
			await connection.rollback();
			return json({ success: false, message: 'You do not have permission to move cards.' }, { status: 403 });
		}

		await connection.execute('UPDATE cards SET column_id = ? WHERE id = ?', [new_column_id, card_id]);

		if (Array.isArray(items_in_old_column)) {
			await Promise.all(items_in_old_column.map((id, i) =>
				connection.execute('UPDATE cards SET position = ? WHERE id = ?', [i, id])
			));
		}

		await Promise.all(items_in_new_column.map((id, i) =>
			connection.execute('UPDATE cards SET position = ? WHERE id = ?', [i, id])
		));

		await connection.commit();
		return json({ success: true });
	} catch (err) {
		await connection.rollback();
		console.error('Failed to move card:', err);
		throw error(500, 'Failed to move card.');
	} finally {
		connection.release();
	}
};
