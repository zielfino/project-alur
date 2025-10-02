// src/routes/api/auth/logout/+server.ts
import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals: { supabase } }) => {
	const { error: signOutError } = await supabase.auth.signOut();

	if (signOutError) {
		throw error(500, 'Error logging out. Please try again.');
	}

	throw redirect(303, '/login');
};
// import { json, error } from '@sveltejs/kit';
// import type { RequestHandler } from './$types';

// export const POST: RequestHandler = async ({ locals: { supabase } }) => {
// 	const { error: signOutError } = await supabase.auth.signOut();

// 	if (signOutError) {
// 		// Jika ada error, kirimkan sebagai respons
// 		throw error(500, 'Error logging out. Please try again.');
// 	}

// 	// Jika berhasil, cukup kembalikan pesan sukses.
// 	return json({ success: true });
// };