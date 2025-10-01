<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
    
    // Ambil data dari load function di layout server
	let { data } = $props();

	let username = $state('');
	let error = $state<string | null>(null);
	let loading = $state(false);

	async function handleSubmit() {
        // ... fungsi handleSubmit Anda tetap sama ...
		loading = true;
		error = null;

		const response = await fetch('/api/profile', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username })
		});

		if (response.ok) {
			await invalidateAll();
			await goto('/');
		} else {
			const result = await response.json();
			error = result.error || 'Something went wrong.';
		}

		loading = false;
	}
</script>

<h1>Complete Your Profile</h1>

{#if !data.profile?.username}
    <p>Please choose a unique username to continue.</p>

    <form onsubmit={handleSubmit}>
        <label for="username">Username</label>
        <input id="username" type="text" bind:value={username} required />
        
        <button type="submit" disabled={loading}>
            {#if loading}Saving...{:else}Save Profile{/if}
        </button>
    </form>

    {#if error}
        <p style="color: red;">{error}</p>
    {/if}
{:else}
    <p>Your username is already set to: <strong>@{data.profile.username}</strong></p>
    <p>It cannot be changed. <a href="/">Go to your dashboard.</a></p>
{/if}