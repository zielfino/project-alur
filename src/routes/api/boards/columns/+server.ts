import { json, error } from '@sveltejs/kit';
import { getDbConnection } from '$lib/server/database'; // <-- Impor helper yang baru
import type { RequestHandler } from './$types';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { query } from '$lib/server/database';

export const POST: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) {
		throw error(401, 'Unauthorized');
	}

	const { name, board_id, state } = await request.json();
	if (!name || !board_id || !state || ![1, 2, 3].includes(state)) {
		throw error(400, 'Invalid input provided.');
	}

	// Dapatkan koneksi mentah dari pool untuk transaksi
	const connection = await getDbConnection();

	try {
        // --- PEMERIKSAAN IZIN BARU ---
		const permissionRows = (await query(
			`SELECT b.owner_uid, bm.role FROM boards b
			 LEFT JOIN board_members bm ON b.id = bm.board_id AND bm.user_uid = ?
			 WHERE b.id = ?`,
			[session.user.id, board_id]
		)) as RowDataPacket[];

		const permissions = permissionRows[0];
		if (!permissions) throw error(404, 'Board not found.');

		const isOwner = permissions.owner_uid === session.user.id;
		const userRole = permissions.role;

		// Periksa izin: harus pemilik ATAU role 3
		if (!isOwner && (!userRole || userRole < 3)) {
			throw error(403, 'You do not have permission to add columns to this board.');
		}
        // --- AKHIR PEMERIKSAAN IZIN ---
		
		// Batas maksimal 8 kolom
		const [countRows] = (await connection.execute(
			'SELECT COUNT(id) as column_count FROM columns WHERE board_id = ?',
			[board_id]
		)) as RowDataPacket[];
		if (countRows[0].column_count >= 8) {
			throw error(403, 'Maximum of 8 columns reached for this board.');
		}

		// --- LOGIKA BARU DIMULAI DI SINI ---

		// Mulai transaksi
		await connection.beginTransaction();

		// 1. Cari posisi sisipan yang benar
		const [posRows] = (await connection.execute(
			'SELECT MAX(position) as max_pos FROM columns WHERE board_id = ? AND state <= ?',
			[board_id, state]
		)) as RowDataPacket[];
		
		const lastPos = (posRows as any)[0].max_pos;
		const newPosition = lastPos === null ? 0 : lastPos + 1;

		// 2. Geser kolom lain yang ada untuk membuat ruang
		await connection.execute(
			'UPDATE columns SET position = position + 1 WHERE board_id = ? AND position >= ?',
			[board_id, newPosition]
		);

		// 3. Masukkan kolom baru di posisi yang benar
        const [result] = await connection.execute<ResultSetHeader>(
            'INSERT INTO columns (board_id, name, state, position) VALUES (?, ?, ?, ?)',
            [board_id, name, state, newPosition]
        );

		// Jika semua perintah SQL berhasil, simpan perubahannya
		await connection.commit();

		// --- AKHIR LOGIKA BARU ---

		const newColumn = {
			id: result.insertId,
			board_id,
			name,
			state,
			position: newPosition,
			cards: []
		};

		return json(newColumn, { status: 201 });

	} catch (err: any) {
		// Jika ada satu saja error, batalkan semua perubahan
		await connection.rollback();

		if (err.status) throw err;
		console.error('Failed to create column:', err);
		throw error(500, 'Failed to create column');

	} finally {
		// Selalu lepaskan koneksi kembali ke pool
		if (connection) connection.release();
	}
};


// --- FUNGSI BARU UNTUK UPDATE/EDIT NAMA KOLOM ---
export const PUT: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) throw error(401, 'Unauthorized');

	const { name, column_id } = await request.json();
	if (!name || !column_id) {
		throw error(400, 'New name and column ID are required.');
	}

	try {
        // --- PEMERIKSAAN IZIN BARU ---
		const permissionRows = (await query(
			`SELECT b.owner_uid, bm.role FROM columns c
			 JOIN boards b ON c.board_id = b.id
			 LEFT JOIN board_members bm ON b.id = bm.board_id AND bm.user_uid = ?
			 WHERE c.id = ?`,
			[session.user.id, column_id]
		)) as RowDataPacket[];

		const permissions = permissionRows[0];
		if (!permissions) throw error(404, 'Column not found.');

		const isOwner = permissions.owner_uid === session.user.id;
		const userRole = permissions.role;

		if (!isOwner && (!userRole || userRole < 3)) {
			throw error(403, 'You do not have permission to edit this column.');
		}
        // --- AKHIR PEMERIKSAAN IZIN ---

		await query('UPDATE columns SET name = ? WHERE id = ?', [name, column_id]);
		return json({ success: true });
	} catch (err) {
		throw error(500, 'Failed to update column name.');
	}
};

// --- FUNGSI BARU UNTUK MENGHAPUS KOLOM ---
export const DELETE: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) throw error(401, 'Unauthorized');

	const { column_id } = await request.json();
	if (!column_id) {
		throw error(400, 'Column ID is required.');
	}

	try {
        // --- PEMERIKSAAN IZIN BARU ---
		const permissionRows = (await query(
			`SELECT b.owner_uid, bm.role FROM columns c
			 JOIN boards b ON c.board_id = b.id
			 LEFT JOIN board_members bm ON b.id = bm.board_id AND bm.user_uid = ?
			 WHERE c.id = ?`,
			[session.user.id, column_id]
		)) as RowDataPacket[];

		const permissions = permissionRows[0];
		if (!permissions) throw error(404, 'Column not found.');

		console.log('test:', permissions)
		const isOwner = permissions.owner_uid === session.user.id;
		const userRole = permissions.role;

		console.log('test:', isOwner)

		if (!isOwner && (!userRole || userRole < 3)) {
			throw error(403, 'You do not have permission to edit this column.');
		}
        // --- AKHIR PEMERIKSAAN IZIN ---

		// Karena Anda sudah mengatur ON DELETE CASCADE,
		// menghapus kolom akan otomatis menghapus semua kartu di dalamnya.
		await query('DELETE FROM columns WHERE id = ?', [column_id]);
		return json({ success: true });
	} catch (err) {
		throw error(500, 'Failed to delete column.');
	}
};