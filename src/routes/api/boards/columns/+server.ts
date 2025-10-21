import { json, error } from '@sveltejs/kit';
import { getDbConnection } from '$lib/server/database';
import { userPermission } from '$lib/server/permissions';
import type { RequestHandler } from './$types';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

/** -------------------------------
 *  🃏 CREATE COLUMN
 *  Level 3 required
 * ------------------------------- */
export const POST: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) throw error(401, 'Unauthorized');

	const { name, board_id, state } = await request.json();
	if (!name || !board_id || !state || ![1, 2, 3].includes(state)) {
		throw error(400, 'Invalid input provided.');
	}

	const connection = await getDbConnection();

	try {
		await connection.beginTransaction();

		const userLevel = await userPermission(session.user.id, board_id, 3);
		if (!userLevel) {
			await connection.rollback();
			return json({ success: false, message: 'You do not have permission to manage columns.' }, { status: 403 });
		}

		const [countRows] = (await connection.execute(
			'SELECT COUNT(id) AS column_count FROM columns WHERE board_id = ?',
			[board_id]
		)) as RowDataPacket[];
		if ((countRows as any)[0].column_count >= 8) {
			await connection.rollback();
			return json({ success: false, message: 'Maximum of 8 columns reached.' }, { status: 403 });
		}

		const [posRows] = (await connection.execute(
			'SELECT MAX(position) AS max_pos FROM columns WHERE board_id = ? AND state <= ?',
			[board_id, state]
		)) as RowDataPacket[];
		const lastPos = (posRows as any)[0].max_pos;
		const newPosition = lastPos === null ? 0 : lastPos + 1;

		await connection.execute(
			'UPDATE columns SET position = position + 1 WHERE board_id = ? AND position >= ?',
			[board_id, newPosition]
		);

		const [result] = await connection.execute<ResultSetHeader>(
			'INSERT INTO columns (board_id, name, state, position) VALUES (?, ?, ?, ?)',
			[board_id, name, state, newPosition]
		);

		await connection.commit();

		return json(
			{
				success: true,
				column: {
					id: result.insertId,
					board_id,
					name,
					state,
					position: newPosition,
					cards: []
				}
			},
			{ status: 201 }
		);
	} catch (err) {
		await connection.rollback();
		console.error('Failed to create column:', err);
		throw error(500, 'Failed to create column.');
	} finally {
		connection.release();
	}
};


/** -------------------------------
 *  ✏️ UPDATE COLUMN
 *  Level 3 required
 * ------------------------------- */
export const PUT: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) throw error(401, 'Unauthorized');

	const { name, column_id } = await request.json();
	if (!name || !column_id) throw error(400, 'Name and column ID required.');

	const connection = await getDbConnection();

	try {
		await connection.beginTransaction();

		// Get board id from column
		const [rows] = (await connection.execute(
			'SELECT board_id FROM columns WHERE id = ?',
			[column_id]
		)) as RowDataPacket[];
		if (!Array.isArray(rows) || rows.length === 0) {
			await connection.rollback();
			return json({ success: false, message: 'Column not found.' }, { status: 404 });
		}

		const boardId = (rows as any)[0].board_id;
		const userLevel = await userPermission(session.user.id, boardId, 3);
		if (!userLevel) {
			await connection.rollback();
			return json({ success: false, message: 'You do not have permission to manage columns.' }, { status: 403 });
		}

		await connection.execute('UPDATE columns SET name = ? WHERE id = ?', [name, column_id]);
		await connection.commit();

		return json({ success: true });
	} catch (err) {
		await connection.rollback();
		console.error('Failed to update column:', err);
		throw error(500, 'Failed to update column name.');
	} finally {
		connection.release();
	}
};

/** -------------------------------
 *  🗑️ DELETE COLUMN
 *  Owner required
 * ------------------------------- */
export const DELETE: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) throw error(401, 'Unauthorized');

	const { column_id } = await request.json();
	if (!column_id) throw error(400, 'Column ID is required.');

	const connection = await getDbConnection();

	try {
		await connection.beginTransaction();

		// 🔍 Cek board_id berdasarkan column_id
		const [rows] = (await connection.execute(
			'SELECT board_id FROM columns WHERE id = ?',
			[column_id]
		)) as RowDataPacket[];
		if (!Array.isArray(rows) || rows.length === 0) {
			await connection.rollback();
			return json({ success: false, message: 'Column not found.' }, { status: 404 });
		}

		const boardId = (rows as any)[0].board_id;

		// 🔐 Cek apakah user adalah owner
		const [ownerCheck] = (await connection.execute(
			'SELECT owner_uid FROM boards WHERE id = ?',
			[boardId]
		)) as RowDataPacket[];
		if (!Array.isArray(ownerCheck) || ownerCheck.length === 0) {
			await connection.rollback();
			return json({ success: false, message: 'Board not found.' }, { status: 404 });
		}

		const isOwner = ownerCheck[0].owner_uid === session.user.id;
		if (!isOwner) {
			await connection.rollback();
			return json(
				{ success: false, message: 'Only the board owner can delete this column.' },
				{ status: 403 }
			);
		}

		// 🧱 Hapus kolom
		await connection.execute('DELETE FROM columns WHERE id = ?', [column_id]);
		await connection.commit();

		return json({ success: true });
	} catch (err) {
		await connection.rollback();
		console.error('Failed to delete column:', err);
		throw error(500, 'Failed to delete column.');
	} finally {
		connection.release();
	}
};

