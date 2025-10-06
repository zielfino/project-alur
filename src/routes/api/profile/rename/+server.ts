import { json } from '@sveltejs/kit';
import { query } from '$lib/server/database';

export async function POST({ request, locals: { getSession } }) {
	// CHECKPOINT 1: Endpoint untuk edit nama dijangkau.
	console.log('CHECKPOINT EDIT PROFILE: API endpoint /api/profile/edit/name reached.');

	// Langkah 1: Verifikasi sesi pengguna.
	// Pastikan hanya pengguna yang sudah login yang bisa mengubah nama.
	const session = await getSession();
	if (!session) {
		// Jika tidak ada sesi, kirim error 'Unauthorized'.
		console.log('CHECKPOINT EDIT PROFILE: FAILED - No user session found.');
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	console.log('CHECKPOINT EDIT PROFILE: SUCCESS - Session found for user ID:', session.user.id);

	// Langkah 2: Ambil nama baru dari body request.
	const { name } = await request.json();
	console.log('CHECKPOINT EDIT PROFILE: Received new name from frontend:', name);

	// Langkah 3: Validasi input.
	// Pastikan nama yang dikirim tidak kosong dan minimal 5 karakter.
	if (!name || name.length === 0) {
		console.log('CHECKPOINT EDIT PROFILE: FAILED - Validation error (name is less than 5 chars).');
		return json({ error: 'Input Please' }, { status: 400 });
	} else if (!name || name.length < 5) {
		console.log('CHECKPOINT EDIT PROFILE: FAILED - Validation error (name is less than 5 chars).');
		return json({ error: 'Name must be at least 5 characters long' }, { status: 400 });
	} else if (name.length > 30) {
		console.log('CHECKPOINT EDIT PROFILE: FAILED - Validation error (name is more than 30 chars).');
		return json({ error: 'Name must be less than 30 characters long' }, { status: 400 });
	}
	console.log('CHECKPOINT EDIT PROFILE: SUCCESS - Validation passed.');

	try {
		// Langkah 4: Hubungkan ke database dan jalankan perintah UPDATE.
		console.log('CHECKPOINT EDIT PROFILE: Attempting to update name in MySQL...');
		await query('UPDATE users SET name = ? WHERE uid = ?', [name, session.user.id]);

		// Jika berhasil, kirim respons sukses.
		console.log('CHECKPOINT EDIT PROFILE: SUCCESS - MySQL database updated.');
		return json({ success: true, message: 'Name updated successfully.' });
	} catch (err) {
		// Jika terjadi error pada database, catat error dan kirim respons error.
		console.error('CHECKPOINT EDIT PROFILE: FAILED - Database error:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}