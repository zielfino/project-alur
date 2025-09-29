import { json } from '@sveltejs/kit';
import mysql from 'mysql2/promise';

// Import your secret database credentials from the private environment
import { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } from '$env/static/private';

// This function runs when your frontend calls GET /api/boards
export async function GET() {
	const connectionConfig = {
		host: DB_HOST,
		user: DB_USER,
		password: DB_PASSWORD,
		database: DB_DATABASE
	};

	try {
		// Create a connection to the database
		const connection = await mysql.createConnection(connectionConfig);

		// Run a query to get all boards
		const [rows] = await connection.execute('SELECT * FROM boards');

		// Close the connection
		await connection.end();

		// Send the data back to the frontend as JSON
		return json(rows);
	} catch (error) {
		console.error('Failed to connect to the database:', error);
		// Return an error response
		return json({ error: 'Database connection failed' }, { status: 500 });
	}
}