import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { query } from '$lib/server/database';
import { withLock } from '$lib/server/lock';

export async function POST({ request, locals: { getSession } }) {
	const session = await getSession();
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const formData = await request.formData();
	const file = formData.get('avatar') as File;

	if (!file) return json({ error: 'No file uploaded' }, { status: 400 });

	// Buat admin client Supabase yang bisa melewati RLS
	const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

	const filePath = `${session.user.id}/${Date.now()}-${file.name}`;

	const lockKey = `${session.user.id}:picture`;

	return await withLock(lockKey, async () => {
		try {
			// Upload file ke Supabase Storage menggunakan admin client
			const { error: uploadError } = await supabaseAdmin.storage
				.from('avatars')
				.upload(filePath, file);
			if (uploadError) throw uploadError;
	
			// Dapatkan URL publiknya
			const { data } = supabaseAdmin.storage.from('avatars').getPublicUrl(filePath);
			const publicUrl = data.publicUrl;
	
			// Simpan URL ke database MySQL Anda
			await query('UPDATE users SET avatar_url = ? WHERE uid = ?', [publicUrl, session.user.id]);
	
			return json({ avatar_url: publicUrl });
		} catch (error) {
			console.error('Upload failed:', error);
			return json({ error: 'Upload process failed' }, { status: 500 });
		}
	});
}