import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { supabase } }) => {
	const { email, password } = await request.json();

	if (!email || !password) {
		throw error(400, 'Email and password are required.');
	}

	// Panggil signInWithPassword dari sisi server
	const { error: signInError } = await supabase.auth.signInWithPassword({
		email: email as string,
		password: password as string
	});

	if (signInError) {
		// Jika kredensial salah, kirim error 401 Unauthorized
		if (signInError.status === 400) {
			throw error(401, 'Invalid login credentials.');
		}
		throw error(signInError.status || 500, signInError.message);
	}

	// Jika berhasil, kirim respons sukses
	return json({ success: true });
};