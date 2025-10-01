// src\lib\island\login.svelte
<script lang="ts">
	import { supabase } from '$lib/supabaseClient';

	let name = '';
	let email = '';
	let password = '';
	let isSigningUp = false

    async function handleGoogleLogin() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
            redirectTo: 'http://localhost:5173/auth/callback'
            }
        });
        if (error) console.error('Error:', error.message);
    }

	async function handleEmailLogin() {
		const { error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password
		});
		if (error) {
			alert('Error logging in: ' + error.message);
		}
	}

	async function handleEmailSignup() {
		const { error } = await supabase.auth.signUp({
			email: email,
			password: password,
			options: {
				data: {
					name: name
				}
			}
		});

		if (error) {
			alert('Error signing up: ' + error.message);
		} else {
			alert('Signup successful! Please check your email to verify your account.');
		}
	}
</script>

<h1>Welcome to Alur</h1>

{#if isSigningUp}
	<h2>Sign Up</h2>
	<input type="text" bind:value={name} placeholder="Your Name" />
{/if}

<input type="email" bind:value={email} placeholder="Email" />
<input type="password" bind:value={password} placeholder="Password" />

{#if isSigningUp}
	<button on:click={handleEmailSignup}>Sign Up</button>
	<p>Already have an account? <button on:click={() => (isSigningUp = false)}>Sign In</button></p>
{:else}
	<button on:click={handleEmailLogin}>Sign In</button>
	<p>Don't have an account? <button on:click={() => (isSigningUp = true)}>Sign Up</button></p>
{/if}

<hr />

<!-- <button on:click={handleGoogleLogin}>Sign in with Google</button> -->
<a  href="/login/google">Sign in with Google</a>