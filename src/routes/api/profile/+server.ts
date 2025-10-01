import { json } from '@sveltejs/kit';
import { query } from '$lib/server/database';
import type { RowDataPacket } from 'mysql2';

export async function POST({ request, locals: { getSession } }) {
	const session = await getSession();

	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
    
    // Tahap baru: Ambil profil yang ada terlebih dahulu
    const [profileRows] = (await query('SELECT username FROM users WHERE uid = ?', [
        session.user.id
    ])) as RowDataPacket[][];

    const profile = profileRows[0];
    
    // PENGECEKAN PENTING: Jika username sudah ada, tolak perubahan.
    if (profile && profile.username) {
        return json({ error: 'Username is already set and cannot be changed.' }, { status: 403 }); // 403 Forbidden
    }

	const { username } = await request.json();

    // ... sisa kode Anda untuk validasi dan update tetap sama ...
	if (!username || username.length < 3) {
		return json({ error: 'Username must be at least 3 characters' }, { status: 400 });
	}

	try {
		const existing = (await query('SELECT id FROM users WHERE username = ?', [
			username
		])) as RowDataPacket[];

		if (existing.length > 0) {
			return json({ error: 'Username is already taken' }, { status: 409 });
		}

		await query('UPDATE users SET username = ? WHERE uid = ?', [username, session.user.id]);

		return json({ success: true });
	} catch (err) {
		console.error('Update profile error:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}