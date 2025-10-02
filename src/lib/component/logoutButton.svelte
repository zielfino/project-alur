<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation'; // <-- 1. Impor invalidateAll

	async function handleLogout() {
		// Panggil endpoint API logout kita
		const response = await fetch('/api/auth/logout', {
			method: 'POST'
		});

		// 2. Beri tahu SvelteKit untuk memuat ulang semua datanya

		if (response.ok) {
			await invalidateAll();
			await goto('/login');
		} else {
			const result = await response.json();
			alert('Error logging in: ' + result.message);
			// await goto('/login');
		}

		// Browser akan diarahkan oleh respons dari server,
		// tapi invalidateAll memastikan UI langsung update.
	}
</script>

<button on:click={handleLogout} class="agerrbggradient agerrborder px-3 py-2">
	Logout
</button>