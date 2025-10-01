import { redirect } from '@sveltejs/kit';

export async function GET({ locals: { supabase } }) {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: 'http://localhost:5173/auth/callback'
        }
    });

    if (error) {
        console.error('Error starting Google login:', error);
        throw redirect(303, '/login?error=oauth_error');
    }

    // Redirect user to the Google login page
    throw redirect(303, data.url);
}