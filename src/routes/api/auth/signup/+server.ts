import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { supabase } }) => {
	// CHECKPOINT SIGNUP 1: API endpoint /api/auth/signup dijangkau.
	console.log('--- SIGNUP API: Endpoint reached ---');

	// Mengambil data yang dikirim dari form di frontend.
	const { name, email, password } = await request.json();

	// Validasi dasar di server.
	if (!name || !email || !password) {
		console.log('--- SIGNUP API: FAILED - Missing fields ---');
		return json({ error: 'Name, email, and password are required.' }, { status: 400 });
	}
	console.log('--- SIGNUP API: Received data:', { name, email }, '---');

	// Memanggil fungsi signUp dari Supabase di sisi server.
	// Ini akan memicu pengiriman email konfirmasi.
	const { error } = await supabase.auth.signUp({
		email: email,
		password: password,
		options: {
			emailRedirectTo: 'http://alur.agerrstudio.com/auth/callback',
			data: {
				// Meneruskan 'name' agar bisa dibaca oleh trigger database kita.
				name: name,
            	has_password: true
			}
		}
	});

	// Jika ada error dari Supabase, kirimkan sebagai respons.
	if (error) {
		console.error('--- SIGNUP API: FAILED - Supabase error:', error.message, '---');
		return json({ error: error.message }, { status: 500 });
	}

	// Jika berhasil, kirim pesan sukses kembali ke frontend.
	console.log('--- SIGNUP API: SUCCESS - Supabase signup initiated ---');
	return json({ success: true, message: 'Signup successful! Please check your email to verify.' });
};