import { json, error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { query } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { getSession } }) => {
	// 1. Verifikasi bahwa ada pengguna yang sedang login.
	const session = await getSession();
	if (!session) {
		throw error(401, 'Unauthorized');
	}

	try {
		// 2. Buat "Admin Client" untuk Supabase yang punya wewenang menghapus.
		const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

		// 3. Hapus pengguna dari Supabase Auth terlebih dahulu.
		// Ini adalah langkah paling penting.
		const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(session.user.id);

		if (deleteAuthError) {
			// Jika gagal menghapus dari Supabase, jangan lanjutkan.
			throw error(500, 'Failed to delete user from authentication service.');
		}

		// 4. Setelah berhasil dihapus dari Supabase, hapus juga dari database MySQL.
		// Kita tidak perlu lagi memeriksa username, karena kita sudah yakin ini adalah pengguna yang benar.
		await query('DELETE FROM users WHERE uid = ?', [session.user.id]);

		// 5. Kirim respons sukses.
		return json({ success: true, message: 'Account deleted successfully.' });

	} catch (err) {
		// Menangkap semua kemungkinan error (koneksi DB, dll)
		console.error('Delete account error:', err);
		throw error(500, 'An internal error occurred while deleting the account.');
	}
};