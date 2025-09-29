<script lang="ts">
    import { supabase } from '$lib/supabaseClient';

    let email = '';
    let password = '';

    // Function for signing in with Google
    async function handleGoogleLogin() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) console.error('Error logging in with Google:', error);
    }

    // Function for signing in with Email
    async function handleEmailLogin() {
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) {
            alert('Error logging in: ' + error.message);
        } else {
            // If login is successful, go to the dashboard
            window.location.href = '/';
        }
    }

    async function handleEmailSignup() {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            alert('Error signing up: ' + error.message);
        } else {
            alert('Signup successful! Please check your email to verify your account.');
        }
    }
</script>

<input type="email" bind:value={email} placeholder="Email" />
<input type="password" bind:value={password} placeholder="Password" />

<div class="flex justify-center items-center flex-col [&>*]:bg-red-300 [&>*]:m-1">
    <button on:click={handleEmailLogin}>Sign in with Email</button>
    <button on:click={handleEmailSignup}>Sign Up</button>
    <button on:click={handleGoogleLogin}>Sign in with Google</button>
</div>