import { json, error } from '@sveltejs/kit';
import { query } from '$lib/server/database';
import type { RequestHandler } from './$types';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

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
		// Hitung jumlah kartu yang sudah ada di kolom ini untuk menentukan posisi baru
		const countResult = (await query(
			'SELECT COUNT(id) as card_count FROM cards WHERE column_id = ?',
			[column_id]
		)) as RowDataPacket[];
		const card_count = countResult[0].card_count;

		// Masukkan kartu baru ke database
		const result = (await query(
			'INSERT INTO cards (column_id, title, position, description, deadline, priority) VALUES (?, ?, ?, ?, ?, ?)',
			[column_id, title, card_count, description, deadline, priority]
		)) as ResultSetHeader;

		const newCard = {
			id: result.insertId,
			column_id: column_id,
			title: title,
			position: card_count,
			description: description,
			deadline: deadline,
			priority: priority
		};

		return json(newCard, { status: 201 });
	} catch (err) {
		console.error('Failed to create card:', err);
		throw error(500, 'Failed to create card');
	}
};

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
		// Query ini sedikit lebih kompleks untuk keamanan,
		// ia memastikan Anda hanya bisa mengedit kartu di papan yang Anda miliki.
		await query(
			`UPDATE cards c
			 JOIN columns col ON c.column_id = col.id
			 JOIN boards b ON col.board_id = b.id
			 SET c.title = ?, c.description = ?, c.deadline = ?, c.priority = ?
			 WHERE c.id = ? AND b.owner_uid = ?`,
			[title, description, deadline, priority, id, session.user.id]
		);
		return json({ success: true });
	} catch (err) {
		console.error('Failed to update card:', err);
		throw error(500, 'Failed to update card');
	}
};

// --- FUNGSI BARU UNTUK MENGHAPUS KARTU ---
export const DELETE: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) {
		throw error(401, 'Unauthorized');
	}

	const { id } = await request.json();
	if (!id) {
		throw error(400, 'Card ID is required.');
	}

	try {
		// Query keamanan untuk memastikan Anda hanya bisa menghapus kartu di papan Anda sendiri
		await query(
			`DELETE c FROM cards c
			 JOIN columns col ON c.column_id = col.id
			 JOIN boards b ON col.board_id = b.id
			 WHERE c.id = ? AND b.owner_uid = ?`,
			[id, session.user.id]
		);
		return json({ success: true });
	} catch (err) {
		console.error('Failed to delete card:', err);
		throw error(500, 'Failed to delete card');
	}
};