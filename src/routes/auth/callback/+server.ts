// src/routes/auth/callback/+server.ts
import { redirect, error as svelteKitError } from '@sveltejs/kit';
import { getPool } from '$lib/server/database';

// 1. Fungsi 'GET' ini otomatis berjalan saat Google mengarahkan pengguna ke '/auth/callback'
export async function GET({ url, locals: { supabase } }) {
	console.log('--- CHECKPOINT 1: Callback endpoint reached ---');

	// 2. Mengambil 'code' rahasia sekali pakai yang diberikan oleh Google dari URL
	const code = url.searchParams.get('code');

	// 3. Memeriksa apakah 'code' tersebut ada
	if (code) {
		console.log('--- CHECKPOINT 2: Google code found. Exchanging for session... ---');

		// 4. Menukar 'code' dengan sesi login yang valid di server Supabase
		await supabase.auth.exchangeCodeForSession(code);
		console.log('--- CHECKPOINT 3: Session successfully created with Supabase ---');

		// 5. Setelah sesi dibuat, mengambil detail pengguna yang baru saja login
		const {
			data: { user },
			error: userErr
		} = await supabase.auth.getUser();

		// 6. Memeriksa apakah data pengguna berhasil didapatkan
		if (user) {
			console.log('--- CHECKPOINT 4: User data fetched successfully. User ID:', user.id, '---');

			try {
				// 7. Mengumpulkan dan membersihkan data profil pengguna
				const name =
					user.user_metadata?.full_name ||
					user.user_metadata?.name ||
					user.user_metadata?.preferred_username ||
					user.email?.split('@')[0] ||
					null;

				const avatar_url =
					user.user_metadata?.avatar_url ||
					user.user_metadata?.picture ||
					user.user_metadata?.avatar ||
					null;

				console.log('--- CHECKPOINT 5: Attempting to sync to MySQL... ---');

				// 8. Mengambil koneksi database dari pool
				const pool = getPool();

				// 9. Menjalankan perintah SQL untuk memasukkan atau memperbarui data pengguna di MySQL
				await pool.execute(
					`INSERT INTO users (uid, email, name, avatar_url)
					 VALUES (?, ?, ?, ?)
					 ON DUPLICATE KEY UPDATE
						 email = VALUES(email),
						 name = COALESCE(users.name, VALUES(name)),
						 avatar_url = COALESCE(users.avatar_url, VALUES(avatar_url)),
						 updated_at = CURRENT_TIMESTAMP`,
					[user.id, user.email, name, avatar_url] // Menggunakan 'id' bukan 'uid'
				);
				console.log('--- CHECKPOINT 6: MySQL sync successful! ---');
			} catch (err) {
				// Ini akan berjalan jika koneksi atau perintah SQL ke MySQL gagal
				console.error('--- MYSQL SYNC FAILED ---:', err);
				throw svelteKitError(500, 'Failed to sync user profile to database');
			}
		} else if (userErr) {
			// Ini akan berjalan jika ada error saat mengambil data pengguna dari Supabase
			console.error('--- GET USER FAILED ---:', userErr);
		}
	} else {
		console.log('--- NO GOOGLE CODE FOUND IN URL ---');
	}

	// 10. Terakhir, setelah semua proses selesai (baik berhasil maupun gagal),
	//     arahkan pengguna kembali ke halaman utama.
	console.log('--- CHECKPOINT 7: Redirecting user to homepage... ---');
	throw redirect(303, '/');
	// return new Response('Test finished. Check your server logs.');
}