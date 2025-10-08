import { json, error } from '@sveltejs/kit';
import { query } from '$lib/server/database';
import type { RequestHandler } from './$types';
import type { RowDataPacket } from 'mysql2';

export const POST: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) {
		throw error(401, 'Unauthorized');
	}
	const inviterId = session.user.id;

	const { usernameToInvite, board_id, role } = await request.json();
	if (!usernameToInvite || !board_id || !role) {
		throw error(400, 'Username, board ID, and role are required.');
	}

	try {
		// --- PERBAIKAN: Hapus tanda kurung siku di sini ---
		const boardRows = (await query('SELECT owner_uid FROM boards WHERE id = ?', [
			board_id
		])) as RowDataPacket[];

		if (boardRows.length === 0 || boardRows[0].owner_uid !== inviterId) {
			throw error(403, 'Forbidden: You are not the owner of this board.');
		}

		// --- DAN DI SINI ---
		const userToInviteRows = (await query('SELECT uid FROM users WHERE username = ?', [
			usernameToInvite
		])) as RowDataPacket[];

		if (userToInviteRows.length === 0) {
			throw error(404, `User with username "${usernameToInvite}" not found.`);
		}
		const userToInviteId = userToInviteRows[0].uid;
		
		if (inviterId === userToInviteId) {
			throw error(400, 'You cannot invite yourself to your own board.');
		}

		// 5. Masukkan atau perbarui data ke tabel board_members
		await query(
			`INSERT INTO board_members (board_id, user_uid, role) 
			 VALUES (?, ?, ?)
			 ON DUPLICATE KEY UPDATE role = VALUES(role)`,
			[board_id, userToInviteId, role]
		);

		return json({ success: true, message: `User ${usernameToInvite} has been invited.` });
	} catch (err: any) {
		if (err.status) {
			throw err;
		}
		console.error('Failed to invite member:', err);
		throw error(500, 'Failed to invite member.');
	}
};

export const GET: RequestHandler = async ({ url, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) throw error(401, 'Unauthorized');

	const board_id = url.searchParams.get('board_id');
	if (!board_id) throw error(400, 'Board ID is required.');

	try {
		// Ambil semua anggota untuk board ini, dan gabungkan dengan tabel users untuk mendapatkan username
        const members = await query(
            `SELECT u.username, u.avatar_url, bm.role, u.uid AS user_uid 
             FROM board_members bm 
             JOIN users u ON bm.user_uid = u.uid 
             WHERE bm.board_id = ?`,
            [board_id]
        );
		return json(members);
	} catch (err) {
		throw error(500, 'Failed to fetch members.');
	}
};

export const DELETE: RequestHandler = async ({ request, locals: { getSession } }) => {
    const session = await getSession();
    if (!session) throw error(401, 'Unauthorized');

    const { board_id, user_uid_to_remove } = await request.json();
    if (!board_id || !user_uid_to_remove) {
        throw error(400, 'Board ID and User UID to remove are required.');
    }
	
		console.log('test:', user_uid_to_remove)
    try {
        // Keamanan: Pastikan hanya pemilik papan yang bisa menghapus anggota
        const [boardRows] = (await query('SELECT owner_uid FROM boards WHERE id = ?', [
            board_id
        ])) as RowDataPacket[];
		console.log('test 2:', boardRows.owner_uid)

        if (boardRows.owner_uid !== session.user.id) {
            throw error(403, 'Forbidden: You are not the owner of this board.');
        }

        // Hapus anggota dari tabel
        await query('DELETE FROM board_members WHERE board_id = ? AND user_uid = ?', [
            board_id,
            user_uid_to_remove
        ]);

        return json({ success: true });
    } catch (err: any) {
        if (err.status) throw err;
        throw error(500, 'Failed to remove member.');
    }
};