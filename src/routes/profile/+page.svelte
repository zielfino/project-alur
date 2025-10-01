<script lang="ts">
	// import { $state } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	// 1. Get SvelteKit's special 'fetch' from the props.
	// This 'fetch' automatically includes your login cookie.
	let { data } = $props();

	// Use the name from the server as the starting value
	let name = $state(data.profile?.name || '');

	let message = $state<string | null>(null);
	let loading = $state(false);

	async function handleNameUpdate(event: Event) {
		event.preventDefault();
		loading = true;
		message = null;

		// 2. Use the special 'fetch' for your API call.
		const response = await fetch('/api/profile/edit/name', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name })
		});

		if (response.ok) {
			message = 'Name updated successfully!';
			// Reload all data to get the new name from the database
			await invalidateAll();
		} else {
			const result = await response.json();
			message = result.error || 'Error updating name.';
		}
		loading = false;
	}
</script>

<h1>Edit Your Profile</h1>

{#if message}
	<p>{message}</p>
{/if}

<form onsubmit={handleNameUpdate}>
	<h2>Change Name</h2>
	<label for="name">Name:</label>
	<input id="name" type="text" bind:value={name} />
	<button disabled={loading}>
		{#if loading}Saving...{:else}Save Name{/if}
	</button>
</form>