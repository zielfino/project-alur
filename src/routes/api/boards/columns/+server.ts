import { json, error } from '@sveltejs/kit';
import { getDbConnection } from '$lib/server/database';
import { userPermission } from '$lib/server/permissions';
import type { RequestHandler } from './$types';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { withLock } from '$lib/server/lock';

/** -------------------------------
 *  🃏 CREATE COLUMN
 *  Level 3 required
 * ------------------------------- */
export const POST: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) throw error(401, 'Unauthorized');

	const { name, board_id, subtext, state } = await request.json();
	if (!name || !board_id || !state || ![1, 2, 3].includes(state)) {
		throw error(400, 'Invalid input provided.');
	}

	const connection = await getDbConnection();

	const lockKey = `${session.user.id}:create-column:${board_id}`;

	return await withLock(lockKey, async () => {
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
				'INSERT INTO columns (board_id, name, subtext, state, position) VALUES (?, ?, ?, ?, ?)',
				[board_id, name, subtext, state, newPosition]
			);
	
			await connection.commit();
	
			return json(
				{
					success: true,
					column: {
						id: result.insertId,
						board_id,
						name,
						subtext,
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
	});
};


/** -------------------------------
 *  ✏️ UPDATE COLUMN
 *  Level 3 required
 * ------------------------------- */
export const PUT: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) throw error(401, 'Unauthorized');

	const body = await request.json();
	const { name, subtext, state, column_id } = body;

	if (!column_id) throw error(400, 'Column ID required.');
	if (name === undefined && subtext === undefined && state === undefined) {
		throw error(400, 'At least one of name, subtext, or state must be provided.');
	}

	// validate state if provided
	if (state !== undefined) {
		const s = Number(state);
		if (!Number.isInteger(s) || s < 1 || s > 3) {
			throw error(400, 'State must be an integer between 1 and 3.');
		}
	}

	const connection = await getDbConnection();
	const lockKey = `${session.user.id}:update-column:${column_id}`;

	return await withLock(lockKey, async () => {
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

			// Build dynamic update
			const sets: string[] = [];
			const params: any[] = [];
			if (name !== undefined) {
				sets.push('name = ?');
				params.push(name);
			}
			if (subtext !== undefined) {
				sets.push('subtext = ?');
				params.push(subtext);
			}
			if (state !== undefined) {
				sets.push('state = ?');
				params.push(Number(state));
			}
			if (sets.length > 0) {
				const sql = `UPDATE columns SET ${sets.join(', ')} WHERE id = ?`;
				params.push(column_id);
				await connection.execute(sql, params);
			}

			await connection.commit();
			return json({ success: true });
		} catch (err) {
			await connection.rollback();
			console.error('Failed to update column:', err);
			throw error(500, 'Failed to update column.');
		} finally {
			connection.release();
		}
	});
};


/** -------------------------------
 *  🗑️ DELETE COLUMN
 *  Level 3 required
 * ------------------------------- */
export const DELETE: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) throw error(401, 'Unauthorized');

	const { column_id } = await request.json();
	if (!column_id) throw error(400, 'Column ID is required.');

	const connection = await getDbConnection();

	const lockKey = `${session.user.id}:delete-column:${column_id}`;

	return await withLock(lockKey, async () => {
		try {
			await connection.beginTransaction();
	
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
	});
};
