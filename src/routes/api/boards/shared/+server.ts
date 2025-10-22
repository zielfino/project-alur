import { json, error } from "@sveltejs/kit";
import { getPool } from "$lib/server/database";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals: { getSession } }) => {
	const session = await getSession();
	if (!session) throw error(401, "Unauthorized");

	const userUid = session.user.id;
	const pool = getPool();

	try {
		const [rows] = await pool.execute(
			`
			SELECT 
				b.id,
				b.owner_uid,
				b.owner_name,
				b.name,
				b.slug,
				b.created_at,
				bm.role
			FROM board_members bm
			JOIN boards b ON bm.board_id = b.id
			WHERE bm.user_uid = ?
			ORDER BY b.created_at DESC
			`,
			[userUid]
		);

		return json(rows);
	} catch (err) {
		console.error("Failed to fetch shared boards:", err);
		throw error(500, "Failed to fetch shared boards");
	}
};
