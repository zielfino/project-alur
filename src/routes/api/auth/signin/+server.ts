import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { supabase } }) => {
	console.log('--- LOGIN SERVER: Received login request. ---');
	const { email, password } = await request.json();

	if (!email || !password) {
		throw error(400, 'Email and password are required.');
	}
    await supabase.auth.signOut();

	// Panggil signInWithPassword dari sisi server
	const { error: signInError } = await supabase.auth.signInWithPassword({
		email: email as string,
		password: password as string
	});
	console.log('--- LOGIN SERVER: signInWithPassword called. ---')

	if (signInError) {
		// Jika kredensial salah, kirim error 401 Unauthorized
		if (signInError.status === 400) {
			throw error(401, 'Invalid login credentials.');
		}
		console.log('--- LOGIN SERVER ERROR:', signInError.message);
		throw error(signInError.status || 500, signInError.message);
	}
	console.log('--- LOGIN SERVER: User signed in successfully. ---')
	// Jika berhasil, kirim respons sukses
	return json({ success: true });
};