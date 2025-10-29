import { error } from '@sveltejs/kit';
import { query } from '$lib/server/database';
import type { PageServerLoad } from './$types';
import type { RowDataPacket } from 'mysql2';

export const load: PageServerLoad = async () => {
	const username = 'agerr';
	const slug = 'apa-aja';

	console.log('Loading board for test:', slug);

	try {
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

		// Gabungkan columns dan cards
		const columnsWithCards = columns.map((column) => ({
			...column,
			cards: cards.filter((card) => card.column_id === column.id)
		}));

		return {
			board: {
				...board,
				columns: columnsWithCards
			},
			userRole: 4 // untuk testing seolah owner
		};
	} catch (err: any) {
		console.error('Failed to load board:', err);
		throw error(500, 'Failed to load board data.');
	}
};
