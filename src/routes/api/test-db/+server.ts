import { json } from '@sveltejs/kit';
import { query } from '$lib/server/database';

export async function GET() {
	console.log('--- Starting DB Connection Test with Pool ---');

	try {
		// Jalankan query secara langsung menggunakan helper
		const result = await query(
			`INSERT INTO users (uid, email, name, username, avatar_url) 
			 VALUES (?, ?, ?, ?, ?)
			 ON DUPLICATE KEY UPDATE name = VALUES(name);`,
			[
				'test-user-id-12345',
				'test@example.com',
				'Test User',
				'testuser',
				'http://example.com/avatar.png'
			]
		);

		console.log('Insert query was successful:', result);

		return json({ success: true, message: 'Successfully inserted test user with pool!' });
	} catch (error) {
		console.error('--- DB TEST FAILED ---:', error);
		return json({ success: false, error: (error as Error).message }, { status: 500 });
	}
}