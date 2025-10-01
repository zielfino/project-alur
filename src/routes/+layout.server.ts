// src/routes/+layout.server.ts (atau src/routes/+layout.server.ts tergantung struktur)
import type { LayoutServerLoad } from './$types';
import { getPool } from '$lib/server/database';

export const load: LayoutServerLoad = async ({ locals: { getSession } }) => {
  const session = await getSession();
	console.log('--- LAYOUT LOAD: Session received from hook:', !!session, '---');
  let profile = null;

  if (session) {
		console.log('--- LAYOUT LOAD: Session found, attempting to connect to MySQL... ---');
    try {
      const pool = getPool();

      // Ambil user metadata dari supabase session (session.user)
      const supaUser = session.user;
      // Upsert ke DB agar selalu sinkron (idempotent)
      const name =
        supaUser.user_metadata?.full_name ||
        supaUser.user_metadata?.name ||
        supaUser.email?.split('@')[0] ||
        null;
      const avatar_url =
        supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture || null;

      await pool.execute(
  		`INSERT INTO users (uid, email, name, avatar_url)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           email = VALUES(email),
           name = VALUES(name),
           avatar_url = VALUES(avatar_url),
           updated_at = CURRENT_TIMESTAMP`,
        [supaUser.id, supaUser.email, name, avatar_url]
      );

      // Lalu fetch profile (bila perlu)
      const [rows] = await pool.execute(
  		'SELECT uid, username, name, email, avatar_url FROM users WHERE uid = ?',
        [supaUser.id]
      );
      profile = (rows as any)[0] || null;
			console.log('--- LAYOUT LOAD: MySQL profile fetched successfully! ---');
    } catch (error) {
			console.error('--- LAYOUT LOAD: MYSQL CONNECTION FAILED ---', error);
    }
  }

  return { session, profile };
};
