import { json } from '@sveltejs/kit';
import { query } from '$lib/server/database'; // <-- Import the correct 'query' function
import type { RowDataPacket } from 'mysql2';

export async function GET({ locals: { getSession } }) {
	const session = await getSession();

	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Use the 'query' helper to get all boards owned by the logged-in user
		const boards = await query(
			'SELECT * FROM boards WHERE owner_id = ?',
			[session.user.id]
		);
		
		return json(boards);
	} catch (error) {
		console.error('Failed to fetch boards:', error);
		return json({ error: 'Database connection failed' }, { status: 500 });
	}
}