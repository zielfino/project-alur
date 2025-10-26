// src/routes/+layout.server.ts (atau src/routes/+layout.server.ts tergantung struktur)
import type { LayoutServerLoad } from './$types';
import { getPool } from '$lib/server/database';
import pkg from '../../package.json';

export const load: LayoutServerLoad = async ({ locals: { getSession } }) => {
	const session = await getSession();
	let profile = null;

	if (session) {
		// Tugas load function HANYA mengambil data, tidak mengubahnya.
		try {
			const pool = getPool();
			const [rows] = await pool.execute(
				'SELECT uid, username, name, email, avatar_url, has_password FROM users WHERE uid = ?',
				[session.user.id]
			);
			profile = (rows as any)[0] || null;
		} catch (error) {
			console.error('Failed to fetch user profile:', error);
		}
	}

	return { session, profile, version: pkg.version };
};