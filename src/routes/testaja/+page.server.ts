import { error } from '@sveltejs/kit';
import { query } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Hardcode username dan slug untuk tes
	const username = 'agerr';
	const slug = 'apa-aja';

	try {
		// Mengambil data papan dari database
		const boards = await query(
			`SELECT b.id, b.name FROM boards b JOIN users u ON b.owner_uid = u.uid 
			 WHERE u.username = ? AND b.slug = ?`,
			[username, slug]
		);
		const board = (boards as any)[0];

		if (!board) {
			throw error(404, `Board '/agerr/apa-aja' not found for testing.`);
		}

		// Mengambil semua kolom dan kartu yang terkait
		const columns = await query('SELECT * FROM columns WHERE board_id = ? ORDER BY position ASC', [board.id]);
		const cards = await query(`SELECT c.* FROM cards c JOIN columns col ON c.column_id = col.id WHERE col.board_id = ? ORDER BY c.position ASC`, [board.id]);
		// console.log('=============================')
		// console.log('KARTU NIH BOS :',cards[0]);
		// console.log('=============================')
		// Menggabungkan data
		const columnsWithCards = (columns as any[]).map((column: any) => ({
			...column,
			cards: (cards as any[]).filter((card: any) => card.column_id === column.id)
		}));

		return {
			board: { ...board, columns: columnsWithCards }
		};
	} catch (err: any) {
		if (err.status) throw err;
		throw error(500, 'Failed to load test board data.');
	}
};