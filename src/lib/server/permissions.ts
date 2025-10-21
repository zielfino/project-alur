// src/lib/server/permissions.ts
import { getPool } from '$lib/server/database';
import type { RowDataPacket } from 'mysql2';

export type PermissionLevel = 1 | 2 | 3;

export interface PermissionInfo {
	isOwner: boolean;
	role: PermissionLevel | null; // null = not a member
}

/**
 * Ambil informasi permission untuk user di suatu board.
 * - Mengembalikan null kalau board tidak ditemukan.
 * - Kalau board ada, mengembalikan { isOwner, role }.
 *
 * @param userUid uid user (string)
 * @param boardId id board (number)
 */
export async function getPermissionInfo(userUid: string, boardId: number): Promise<PermissionInfo | null> {
	const pool = getPool();
	const [rows] = (await pool.query<RowDataPacket[]>(
		`
		SELECT b.owner_uid, bm.role
		FROM boards b
		LEFT JOIN board_members bm ON b.id = bm.board_id AND bm.user_uid = ?
		WHERE b.id = ?
		`,
		[userUid, boardId]
	)) as any;

	// board not found
	if (!Array.isArray(rows) || rows.length === 0) return null;

	const { owner_uid, role } = rows[0];
	const isOwner = owner_uid === userUid;
	// role bisa undefined/null bila bukan anggota — kita representasikan sebagai null
	const roleValue = role == null ? null : (role as PermissionLevel);

	return { isOwner, role: roleValue };
}

/**
 * Cek apakah permissionInfo cukup untuk required level.
 * - Owner => selalu true
 * - Kalau role === null => false (bukan anggota)
 * - Lainnya => role >= requiredLevel
 *
 * @param info hasil dari getPermissionInfo()
 * @param requiredLevel minimal level yg dibutuhkan (1|2|3)
 */
export function canPerform(info: PermissionInfo | null, requiredLevel: PermissionLevel): boolean {
	if (!info) return false; // board not found atau tidak ada info
	if (info.isOwner) return true;
	if (info.role == null) return false;
	return info.role >= requiredLevel;
}

/**
 * Convenience wrapper: langsung cek dari DB apakah user memiliki akses minimal.
 * Mengembalikan true/false — tidak melempar error.
 *
 * @param userUid
 * @param boardId
 * @param requiredLevel
 */
export async function userPermission(userUid: string, boardId: number, requiredLevel: PermissionLevel): Promise<boolean> {
	const info = await getPermissionInfo(userUid, boardId);
	return canPerform(info, requiredLevel);
}
