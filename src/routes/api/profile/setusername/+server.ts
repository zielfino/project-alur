import { json } from '@sveltejs/kit';
import { query } from '$lib/server/database';
import type { RowDataPacket } from 'mysql2';

export async function POST({ request, locals: { getSession } }) {
	const session = await getSession();

	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Ambil profil yang ada terlebih dahulu
	const [profileRows] = (await query('SELECT username FROM users WHERE uid = ?', [
		session.user.id
	])) as RowDataPacket[][];

	const profile = profileRows[0];

	// Pengecekan: Jika username sudah ada, tolak perubahan.
	if (profile && profile.username) {
		return json({ error: 'Username is already set and cannot be changed.' }, { status: 403 });
	}

	const { username } = await request.json();

	// --- VALIDASI BARU DIMULAI DI SINI ---

	// Aturan 1: Cek panjang username
	if (!username || username.length < 3 || username.length > 25) {
		return json(
			{ error: 'Username must be between 3 and 25 characters.' },
			{ status: 400 }
		);
	}

	// Aturan 2: Cek karakter yang diizinkan (a-z, 0-9, _, .)
	const usernameRegex = /^[a-z0-9_.]+$/;
	if (!usernameRegex.test(username)) {
		return json(
			{ error: 'Username can only contain lowercase letters(a-z), numbers(0-9), underscores(_), and periods(.).' },
			{ status: 400 }
		);
	}

	// --- VALIDASI SELESAI ---

	try {
		// Cek apakah username sudah ada yang pakai
		const existing = (await query('SELECT id FROM users WHERE username = ?', [
			username
		])) as RowDataPacket[];

		if (existing.length > 0) {
			return json({ error: 'Username is already taken' }, { status: 409 });
		}

		// Update username untuk user yang sedang login
		await query('UPDATE users SET username = ? WHERE uid = ?', [username, session.user.id]);

		return json({ success: true });
	} catch (err) {
		console.error('Update profile error:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}