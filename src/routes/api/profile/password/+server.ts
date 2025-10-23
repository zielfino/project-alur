
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/server/database';
import { withLock } from '$lib/server/lock';

export const POST: RequestHandler = async ({ request, locals: { supabase, getSession } }) => {
    // Pastikan pengguna sudah login
    const session = await getSession();
    if (!session) {
        throw error(401, 'Unauthorized');
    }

    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 8) {
        throw error(400, 'Password must be at least 8 characters');
    }

    // Jalankan updateUser dari sisi server
    const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (updateError) {
        throw error(500, updateError.message);
    }

	const lockKey = `${session.user.id}:password`;

	return await withLock(lockKey, async () => {
        try {
            await query('UPDATE users SET has_password = TRUE WHERE uid = ?', [session.user.id]);
        } catch (dbError) {
            console.error("Failed to set has_password flag:", dbError);
            // Lanjutkan saja, ini bukan error fatal
        }
    
        // Jika berhasil, kirim respons sukses
        return json({ success: true, message: 'Password action successful.' });
	});
};