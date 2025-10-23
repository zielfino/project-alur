import { json, error } from '@sveltejs/kit';
import { query } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { getSession } }) => {
    const session = await getSession();
    if (!session) {
        throw error(401, 'Unauthorized');
    }

	const lockKey = `${session.user.id}:select-board`;

	return await withLock(lockKey, async () => {
		try {
			// Ambil semua papan yang owner_uid-nya cocok dengan ID pengguna yang login
			const boards = await query(
				'SELECT * FROM boards WHERE owner_uid = ?',
				[session.user.id]
			);
	
			return json(boards || []);
		} catch (err) {
			console.error('Failed to fetch boards:', err);
			throw error(500, 'Failed to fetch boards');
		}
	});
};

import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { withLock } from '$lib/server/lock';

export const POST: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) {
		throw error(401, 'Unauthorized');
	}

	const { name } = await request.json();

	// 1. Validasi Nama: Hanya boleh huruf, angka, dan spasi
	const nameRegex = /^[a-zA-Z0-9 ]+$/;
	if (!name || name.length < 1 || !nameRegex.test(name)) {
		throw error(400, 'Board name is required and can only contain letters, numbers, and spaces.');
	}

	// 2. Buat slug dasar
	let slug = name.toLowerCase().trim().replace(/\s+/g, '-');

	const lockKey = `${session.user.id}:create-board`;

	return await withLock(lockKey, async () => {
		try {
			// 3. Cek apakah slug sudah ada untuk pengguna ini
			let existingBoard = (await query('SELECT id FROM boards WHERE owner_uid = ? AND slug = ?', [
				session.user.id,
				slug
			])) as RowDataPacket[];
			
			let counter = 2;
			const baseSlug = slug;

			// 4. Jika slug sudah ada, tambahkan angka sampai menjadi unik
			while (existingBoard.length > 0) {
				slug = `${baseSlug}-${counter}`;
				existingBoard = (await query('SELECT id FROM boards WHERE owner_uid = ? AND slug = ?', [
					session.user.id,
					slug
				])) as RowDataPacket[];
				counter++;
			}
			
			// 5. Setelah slug unik ditemukan, masukkan ke database
			const result = (await query(
				'INSERT INTO boards (owner_uid, name, slug) VALUES (?, ?, ?)',
				[session.user.id, name, slug]
			)) as ResultSetHeader;

			const newBoard = {
				id: result.insertId,
				owner_uid: session.user.id,
				name: name,
				slug: slug,
				created_at: new Date().toISOString() // Kirim kembali data yang relevan
			};

			return json(newBoard, { status: 201 });
		} catch (err) {
			console.error('Failed to create board:', err);
			throw error(500, 'Failed to create board');
		}
	});
};

// --- FUNGSI BARU UNTUK UPDATE/EDIT NAMA PAPAN ---
export const PUT: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) throw error(401, 'Unauthorized');

	const { board_id, name } = await request.json();
	if (!board_id || !name) {
		throw error(400, 'Board ID and new name are required.');
	}

	// Logika validasi dan slug unik yang sama seperti saat membuat papan
	const nameRegex = /^[a-zA-Z0-9 ]+$/;
	if (name.length < 1 || !nameRegex.test(name)) {
		throw error(400, 'Board name is invalid.');
	}

	let slug = name.toLowerCase().trim().replace(/\s+/g, '-');

	const lockKey = `${session.user.id}:edit-boad`;

	return await withLock(lockKey, async () => {
		try {
			// Cek apakah slug baru sudah ada untuk pengguna ini (di papan yang lain)
			let existingBoard = (await query(
				'SELECT id FROM boards WHERE owner_uid = ? AND slug = ? AND id != ?', // id != ? untuk mengabaikan papan saat ini
				[session.user.id, slug, board_id]
			)) as RowDataPacket[];
			
			if (existingBoard.length > 0) {
				// Jika sudah ada, tambahkan akhiran angka (hanya untuk slug)
				slug = `${slug}-2`; // Implementasi sederhana, bisa dipercanggih dengan loop
			}
			
			// Update papan di database
			await query(
				'UPDATE boards SET name = ?, slug = ? WHERE id = ? AND owner_uid = ?',
				[name, slug, board_id, session.user.id]
			);
	
			return json({ success: true, newName: name, newSlug: slug });
	
		} catch (err) {
			throw error(500, 'Failed to update board.');
		}
	});
};

// --- FUNGSI BARU UNTUK MENGHAPUS PAPAN ---
export const DELETE: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) throw error(401, 'Unauthorized');

	const { board_id } = await request.json();
	if (!board_id) {
		throw error(400, 'Board ID is required.');
	}

	const lockKey = `${session.user.id}:delete-board`;

	return await withLock(lockKey, async () => {
		try {
			// Hapus papan. ON DELETE CASCADE di database akan otomatis
			// menghapus semua kolom dan kartu yang terkait.
			await query('DELETE FROM boards WHERE id = ? AND owner_uid = ?', [board_id, session.user.id]);
			return json({ success: true });
		} catch (err) {
			throw error(500, 'Failed to delete board.');
		}
	});
};