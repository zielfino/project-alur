import { json, error } from '@sveltejs/kit';
import { query } from '$lib/server/database';
import type { RequestHandler } from './$types';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

// Fungsi untuk membuat kartu baru
// export const POST: RequestHandler = async ({ request, locals: { getSession } }) => {
// 	const session = await getSession();
// 	if (!session) {
// 		throw error(401, 'Unauthorized');
// 	}

// 	const { title, column_id, description, deadline, priority } = await request.json();
// 	if (!title || !column_id) {
// 		throw error(400, 'Card title and column ID are required.');
// 	}

// 	try {
// 		// Hitung jumlah kartu yang sudah ada di kolom ini untuk menentukan posisi baru
// 		const countResult = (await query(
// 			'SELECT COUNT(id) as card_count FROM cards WHERE column_id = ?',
// 			[column_id]
// 		)) as RowDataPacket[];
// 		const card_count = countResult[0].card_count;

// 		// Masukkan kartu baru ke database
// 		const result = (await query(
// 			'INSERT INTO cards (column_id, title, position, description, deadline, priority) VALUES (?, ?, ?, ?, ?, ?)',
// 			[column_id, title, card_count, description, deadline, priority]
// 		)) as ResultSetHeader;

// 		const newCard = {
// 			id: result.insertId,
// 			column_id: column_id,
// 			title: title,
// 			position: card_count,
// 			description: description,
// 			deadline: deadline,
// 			priority: priority
// 		};

// 		return json(newCard, { status: 201 });
// 	} catch (err) {
// 		console.error('Failed to create card:', err);
// 		throw error(500, 'Failed to create card');
// 	}
// };

// Fungsi untuk membuat kartu baru
export const POST: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) {
		throw error(401, 'Unauthorized');
	}

	const { title, column_id, description, deadline, priority } = await request.json();
	if (!title || !column_id) {
		throw error(400, 'Card title and column ID are required.');
	}

	try {
		// --- Pemeriksaan Izin Baru ---
		// 1. Ambil info pemilik & role dari kolom target
		const permissionRows = (await query(
			`
			SELECT 
				b.owner_uid, 
				bm.role
			FROM columns col
			JOIN boards b ON col.board_id = b.id
			LEFT JOIN board_members bm ON b.id = bm.board_id AND bm.user_uid = ?
			WHERE col.id = ?
			`,
			[session.user.id, column_id]
		)) as RowDataPacket[];

		const permissions = Array.isArray(permissionRows) ? permissionRows[0] : permissionRows;
		if (!permissions) {
			throw error(404, 'Column not found.');
		}

		const isOwner = permissions.owner_uid === session.user.id;
		const userRole = permissions.role;

		// 2. Periksa izin: harus pemilik ATAU role >= 2
		if (!isOwner && (!userRole || userRole < 2)) {
			throw error(403, 'You do not have permission to create cards in this column.');
		}
		// --- Akhir Pemeriksaan Izin ---

		// Jika lolos, lanjutkan membuat kartu
		const countRows = (await query(
			`
			SELECT COUNT(id) AS card_count 
			FROM cards 
			WHERE column_id = ?
			`,
			[column_id]
		)) as RowDataPacket[];

		const card_count = Array.isArray(countRows) ? countRows[0].card_count : (countRows as any).card_count;

		const result = (await query(
			`
			INSERT INTO cards (column_id, title, position, description, deadline, priority) 
			VALUES (?, ?, ?, ?, ?, ?)
			`,
			[column_id, title, card_count, description, deadline, priority]
		)) as ResultSetHeader;

		const newCard = {
			id: result.insertId,
			column_id,
			title,
			position: card_count,
			description,
			deadline,
			priority
		};

		return json(newCard, { status: 201 });
	} catch (err: any) {
		if (err.status) throw err;
		console.error('Failed to create card:', err);
		throw error(500, 'Failed to create card');
	}
};


// export const PUT: RequestHandler = async ({ request, locals: { getSession } }) => {
// 	const session = await getSession();
// 	if (!session) {
// 		throw error(401, 'Unauthorized');
// 	}

// 	const { id, title, description, deadline, priority } = await request.json();
// 	if (!id || !title) {
// 		throw error(400, 'Card ID and title are required.');
// 	}

// 	try {
// 		await query(
// 			`UPDATE cards c
// 			 JOIN columns col ON c.column_id = col.id
// 			 JOIN boards b ON col.board_id = b.id
// 			 SET c.title = ?, c.description = ?, c.deadline = ?, c.priority = ?
// 			 WHERE c.id = ? AND b.owner_uid = ?`,
// 			[title, description, deadline, priority, id, session.user.id]
// 		);
// 		return json({ success: true });
// 	} catch (err) {
// 		console.error('Failed to update card:', err);
// 		throw error(500, 'Failed to update card');
// 	}
// };

export const PUT: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) {
		throw error(401, 'Unauthorized');
	}

	const { id, title, description, deadline, priority } = await request.json();
	if (!id || !title) {
		throw error(400, 'Card ID and title are required.');
	}

	try {
		// --- Pemeriksaan Izin Baru ---
		// 1. Ambil info pemilik & role dari kartu yang akan di-edit
		const permissionRows = (await query(
			`
			SELECT 
				b.owner_uid, 
				bm.role
			FROM cards c
			JOIN columns col ON c.column_id = col.id
			JOIN boards b ON col.board_id = b.id
			LEFT JOIN board_members bm ON b.id = bm.board_id AND bm.user_uid = ?
			WHERE c.id = ?
			`,
			[session.user.id, id]
		)) as RowDataPacket[];

		const permissions = Array.isArray(permissionRows) ? permissionRows[0] : permissionRows;
		if (!permissions) {
			throw error(404, 'Card not found.');
		}

		const isOwner = permissions.owner_uid === session.user.id;
		const userRole = permissions.role;

		// 2. Periksa izin: harus pemilik ATAU role >= 2
		if (!isOwner && (!userRole || userRole < 2)) {
			throw error(403, 'You do not have permission to edit this card.');
		}
		// --- Akhir Pemeriksaan Izin ---

		// Jika lolos, lanjutkan update
		await query(
			`
			UPDATE cards 
			SET title = ?, description = ?, deadline = ?, priority = ?
			WHERE id = ?
			`,
			[title, description, deadline, priority, id]
		);

		return json({ success: true });
	} catch (err: any) {
		if (err.status) throw err;
		console.error('Failed to update card:', err);
		throw error(500, 'Failed to update card');
	}
};


export const DELETE: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) {
		throw error(401, 'Unauthorized');
	}

	const { id: cardIdToDelete } = await request.json();
	if (!cardIdToDelete) {
		throw error(400, 'Card ID is required.');
	}

	try {
		// 1. Dapatkan info papan (pemilik) dan role pengguna dalam satu query
		const permissionRows = (await query(
			`SELECT 
				b.owner_uid, 
				bm.role
			FROM cards c
			JOIN columns col ON c.column_id = col.id
			JOIN boards b ON col.board_id = b.id
			LEFT JOIN board_members bm ON b.id = bm.board_id AND bm.user_uid = ?
			WHERE c.id = ?`,
			[session.user.id, cardIdToDelete]
		)) as RowDataPacket[];

		const permissions = permissionRows[0];
		// console.log('pr1:',permissionRows)
		// console.log('pr2:',permissions.owner_uid)
		// console.log('pr3:',permissions.role)
		if (!permissions) {
			throw error(404, 'Card not found.');
		}

		const isOwner = permissions.owner_uid === session.user.id;
		const userRole = permissions.role; // Akan bernilai NULL jika bukan anggota
		console.log('pr4:',isOwner)
		console.log('pr5:',userRole)

		// 2. Periksa izin: harus pemilik ATAU anggota dengan role 3 (Admin)
		if (!isOwner && userRole < 2) {
			console.log('role low')
			throw error(403, 'You do not have permission to delete this card.');
		}

		// 3. Jika diizinkan, baru hapus kartunya
		await query('DELETE FROM cards WHERE id = ?', [cardIdToDelete]);

		return json({ success: true });
	} catch (err: any) {
		if (err.status) {
			throw err;
		}
		console.error('Failed to delete card:', err);
		throw error(500, 'Failed to delete card');
	}
};