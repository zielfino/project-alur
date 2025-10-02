// src/routes/api/sync-user/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPool } from '$lib/server/database';

export const POST: RequestHandler = async ({ locals }) => {
    try {
        // locals.supabase harus sudah ada via hooks.server.ts
        const supabase = locals.supabase;
        if (!supabase) return json({ ok: false, error: 'No supabase client' }, { status: 500 });

        // Ambil session / user di server side
        const {
        data: { user },
        error: userErr
        } = await supabase.auth.getUser();

        if (userErr) {
        console.error('supabase getUser error', userErr);
        return json({ ok: false, error: 'Failed to get supabase user' }, { status: 401 });
        }
        if (!user) return json({ ok: false, error: 'No authenticated user' }, { status: 401 });

        const uid = user.id;
        const email = user.email || null;
        const name =
        user.app_metadata?.name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.user_metadata?.preferred_username ||
        email?.split('@')[0] ||
        null;
        const avatar_url =
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        user.user_metadata?.avatar ||
        null;

        const pool = getPool();
        await pool.execute(
        `INSERT INTO users (uid, email, name, avatar_url)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            email = VALUES(email),
            name = COALESCE(users.name, VALUES(name)),
            avatar_url = COALESCE(users.avatar_url, VALUES(avatar_url)),
            updated_at = CURRENT_TIMESTAMP`,
        [uid, email, name, avatar_url]
        );

        return json({ ok: true });
    } catch (err) {
        console.error('sync-user error', err);
        return json({ ok: false, error: 'Internal server error' }, { status: 500 });
    }
};
