import { redirect } from '@sveltejs/kit';

export async function GET({ locals: { supabase } }) {
    await supabase.auth.signOut();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
            redirectTo: 'http://alur.agerrstudio.com/auth/callback'
        }
    });

    if (error) {
        console.error('Error starting Google login:', error);
        throw redirect(303, '/login?error=oauth_error');
    }

    throw redirect(303, data.url);
}