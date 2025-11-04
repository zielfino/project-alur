import { redirect } from '@sveltejs/kit';

export async function GET({ locals: { supabase } }) {
    await supabase.auth.signOut();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
<<<<<<< HEAD
            redirectTo: 'https://alur.agerrstudio.com/auth/callback'
=======
            redirectTo: 'http://alur.agerrstudio.com/auth/callback'
>>>>>>> 31a734e85866bd8cdf83ca30173f9bbbcf718fc4
        }
    });

    if (error) {
        console.error('Error starting Google login:', error);
        throw redirect(303, '/login?error=oauth_error');
    }

    throw redirect(303, data.url);
}