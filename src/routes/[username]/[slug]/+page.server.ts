// src/routes/[username]/[slug]/+page.server.ts
import { error, redirect } from '@sveltejs/kit';
import { query } from '$lib/server/database';
import type { PageServerLoad } from './$types';
import type { RowDataPacket } from 'mysql2';

export const load: PageServerLoad = async ({ params, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) throw redirect(303, '/');

	const { username, slug } = params;
	console.log('Loading board for slug:', slug);

	try {
		// Ambil board
		const boardsResult = (await query(
			`
			SELECT 
				b.id, 
				b.name, 
				b.owner_uid, 
				u.username AS owner_username 
			FROM boards b 
			JOIN users u ON b.owner_uid = u.uid 
			WHERE u.username = ? AND b.slug = ?
			`,
			[username, slug]
		)) as RowDataPacket[];

		const board = boardsResult[0];
		if (!board) throw error(404, 'Board not found.');

		// Izin akses dasar
		const isOwner = session.user.id === board.owner_uid;
		let isMember = false;
		let userRole = 0;

		if (!isOwner) {
			const memberRows = (await query(
				`
				SELECT user_uid, role
				FROM board_members 
				WHERE board_id = ? AND user_uid = ?
				`,
				[board.id, session.user.id]
			)) as RowDataPacket[];

			isMember = memberRows.length > 0;
			if (isMember) {
				userRole = memberRows[0].role ?? 0;
			}
		} else {
			// Owner selalu dianggap role tertinggi (4)
			userRole = 4;
		}

		// Cegah akses tanpa izin
		if (!isOwner && !isMember) {
			throw error(403, `Anda perlu izin dari @${board.owner_username} untuk melihat papan ini.`);
		}

		// Ambil columns
		const columns = (await query(
			`
			SELECT * 
			FROM columns 
			WHERE board_id = ? 
			ORDER BY position ASC
			`,
			[board.id]
		)) as RowDataPacket[];

		// Ambil cards
		const cards = (await query(
			`
			SELECT c.* 
			FROM cards c 
			JOIN columns col ON c.column_id = col.id 
			WHERE col.board_id = ? 
			ORDER BY c.position ASC
			`,
			[board.id]
		)) as RowDataPacket[];

		// Gabungkan columns + cards
		const columnsWithCards = columns.map((column) => ({
			...column,
			cards: cards.filter((card) => card.column_id === column.id)
		}));

		// Return data lengkap
		return {
			board: {
				...board,
				columns: columnsWithCards
			},
			userRole // ⬅️ cukup ini saja tambahan baru
		};
	} catch (err: any) {
		if (err.status) throw err;
		console.error('Failed to load board:', err);
		throw error(500, 'Failed to load board data.');
	}
};
