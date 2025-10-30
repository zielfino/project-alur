import { json, error } from '@sveltejs/kit';
import { query } from '$lib/server/database';
import { userPermission } from '$lib/server/permissions';
import type { RequestHandler } from './$types';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { withLock } from '$lib/server/lock';

/** -------------------------------
 *  🃏 CREATE CARD
 *  Level 2 required
 * ------------------------------- */
export const POST: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) throw error(401, 'Permission required!');

	const { title, column_id, description, deadline, priority } = await request.json();
	if (!title || !column_id) throw error(400, 'Card title and column ID are required.');

	const lockKey = `${session.user.id}:create-card:${column_id}`;

	return await withLock(lockKey, async () => {
		try {
			const boardRows = (await query(
				`SELECT board_id FROM columns WHERE id = ?`,
				[column_id]
			)) as RowDataPacket[];
			if (!boardRows[0]) throw error(404, 'Column not found.');
	
			const board_id = boardRows[0].board_id;
			const userLevel = await userPermission(session.user.id, board_id, 2);
			if (!userLevel)
				return json({ success: false, message: 'You do not have permission to create cards.' }, { status: 403 });
	
			const countRows = (await query(
				`SELECT COUNT(id) AS card_count FROM cards WHERE column_id = ?`,
				[column_id]
			)) as RowDataPacket[];
			const card_count = countRows[0].card_count ?? 0;
	
			const result = (await query(
				`
				INSERT INTO cards (column_id, title, position, description, deadline, priority)
				VALUES (?, ?, ?, ?, ?, ?)
				`,
				[column_id, title, card_count, description, deadline, priority]
			)) as ResultSetHeader;
	
			return json({
				success: true,
				card: {
					id: result.insertId,
					column_id,
					title,
					position: card_count,
					description,
					deadline,
					priority
				}
			}, { status: 201 });
		} catch (err: any) {
			console.error('Failed to create card:', err);
			throw error(500, 'Failed to create card.');
		}
	});
};

/** -------------------------------
 *  ✏️ UPDATE CARD
 *  Level 2 required
 * ------------------------------- */
export const PUT: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) throw error(401, 'Permission required!');

	const { id, title, description, deadline, priority } = await request.json();
	if (!id || !title) throw error(400, 'Card ID and title are required.');

	
	const lockKey = `${session.user.id}:update-card:${id}`;

	return await withLock(lockKey, async () => {
		try {
			const boardRows = (await query(
				`
				SELECT b.id AS board_id
				FROM cards c
				JOIN columns col ON c.column_id = col.id
				JOIN boards b ON col.board_id = b.id
				WHERE c.id = ?
				`,
				[id]
			)) as RowDataPacket[];
			if (!boardRows[0]) throw error(404, 'Card not found.');
	
			const board_id = boardRows[0].board_id;
			const userLevel = await userPermission(session.user.id, board_id, 2);
			if (!userLevel)
				return json({ success: false, message: 'You do not have permission to edit this card.' }, { status: 403 });
	
			await query(
				`UPDATE cards SET title = ?, description = ?, deadline = ?, priority = ? WHERE id = ?`,
				[title, description, deadline, priority, id]
			);
	
			return json({ success: true });
		} catch (err: any) {
			console.error('Failed to update card:', err);
			throw error(500, 'Failed to update card.');
		}
	});
};

/** -------------------------------
 *  🗑️ DELETE CARD
 *  Level 3 required
 * ------------------------------- */
export const DELETE: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) throw error(401, 'Permission required!');

	const { id: cardIdToDelete } = await request.json();
	if (!cardIdToDelete) throw error(400, 'Card ID is required.');

	const lockKey = `${session.user.id}:delete-card:${cardIdToDelete}`;

	return await withLock(lockKey, async () => {
		try {
			const boardRows = (await query(
				`
				SELECT b.id AS board_id
				FROM cards c
				JOIN columns col ON c.column_id = col.id
				JOIN boards b ON col.board_id = b.id
				WHERE c.id = ?
				`,
				[cardIdToDelete]
			)) as RowDataPacket[];
			if (!boardRows[0]) throw error(404, 'Card not found.');
	
			const board_id = boardRows[0].board_id;
			const userLevel = await userPermission(session.user.id, board_id, 2);
			if (!userLevel)
				return json({ success: false, message: 'You do not have permission to delete cards.' }, { status: 403 });
	
			await query('DELETE FROM cards WHERE id = ?', [cardIdToDelete]);
			return json({ success: true });
		} catch (err: any) {
			console.error('Failed to delete card:', err);
			throw error(500, 'Failed to delete card.');
		}
	});
};
