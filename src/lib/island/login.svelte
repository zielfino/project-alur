// src\lib\island\login.svelte
<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let isSigningUp = $state(false)

	async function handleEmailLogin() {
		console.log('--- LOGIN FRONTEND: Login button clicked. Sending data to API... ---');
		const response = await fetch('/api/auth/signin', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password })
		});

		if (response.ok) {
			await invalidateAll();
			await goto('/');
		} else {
			const result = await response.json();
			alert('Error logging in: ' + result.message);
		}
	}

	async function handleEmailSignup() {
		// CHECKPOINT SIGNUP 1 (Frontend): Tombol signup diklik.
		console.log('--- SIGNUP FRONTEND: Signup button clicked. Sending data to API... ---');

		// Mengirim data form ke API endpoint yang baru kita buat.
		const response = await fetch('/api/auth/signup', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, email, password })
		});

		// Menerima respons dari API.
		const result = await response.json();

		if (response.ok) {
			// Jika API mengembalikan sukses, tampilkan pesannya.
			console.log('--- SIGNUP FRONTEND: SUCCESS - API returned success ---');
			alert(result.message);
		} else {
			// Jika API mengembalikan error, tampilkan pesannya.
			console.error('--- SIGNUP FRONTEND: FAILED - API returned an error:', result.error, '---');
			alert('Error signing up: ' + result.error);
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
	<button onclick={handleEmailSignup}>Sign Up</button>
	<p>Already have an account? <button onclick={() => (isSigningUp = false)}>Sign In</button></p>
{:else}
	<button onclick={handleEmailLogin}>Sign In</button>
	<p>Don't have an account? <button onclick={() => (isSigningUp = true)}>Sign Up</button></p>
{/if}

<hr />

<!-- <button on:click={handleGoogleLogin}>Sign in with Google</button> -->
<a  href="/api/google">Sign in with Google</a>