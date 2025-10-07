import { error, redirect } from '@sveltejs/kit';
import { query } from '$lib/server/database';
import type { PageServerLoad } from './$types';
import type { RowDataPacket } from 'mysql2';

export const load: PageServerLoad = async ({ params, locals: { getSession } }) => {
    const session = await getSession();
    if (!session) {
        // throw error(401, 'Unauthorized');
		throw redirect(303, '/');
    }

    const { username, slug } = params;

    try {
        // 1. Ambil data papan dan pastikan pengguna punya akses
        const boards = (await query(
			`SELECT b.id, b.name, b.owner_uid, u.username as owner_username 
			 FROM boards b JOIN users u ON b.owner_uid = u.uid 
			 WHERE u.username = ? AND b.slug = ?`,
			[username, slug]
		)) as RowDataPacket[][];

        const board = (boards as any)[0];

        if (!board) {
            throw error(404, 'Board not found or you do not have access.');
        }

		if (session.user.id !== board.owner_uid) {
			// Jika bukan pemilik, lempar error 403 (Forbidden) dengan pesan custom
			throw error(403, `Anda perlu izin dari @${board.owner_username} untuk melihat papan ini.`);
		}

        // 2. Ambil semua kolom untuk papan ini, diurutkan berdasarkan posisi
        const columns = await query(
            'SELECT * FROM columns WHERE board_id = ? ORDER BY position ASC',
            [board.id]
        );

        // 3. Ambil semua kartu untuk papan ini, diurutkan berdasarkan posisi
        const cards = await query(
            `SELECT c.* FROM cards c JOIN columns col ON c.column_id = col.id 
             WHERE col.board_id = ? ORDER BY c.position ASC`,
            [board.id]
        );

        // 4. Susun datanya agar mudah digunakan di frontend
        const columnsWithCards = (columns as any[]).map(column => ({
            ...column,
            cards: (cards as any[]).filter(card => card.column_id === column.id)
        }));

        return {
            board: {
                ...board,
                columns: columnsWithCards
            }
        };
	} catch (err: any) {
		// 5. Tangani error yang kita lempar secara manual atau error lainnya
		if (err.status) {
			// Jika ini adalah error yang kita buat (seperti 403 atau 404), lempar kembali
			throw err;
		}
		// Untuk error tak terduga lainnya (seperti koneksi DB gagal)
		console.error('Failed to load board:', err);
		throw error(500, 'Failed to load board data.');
	}
};