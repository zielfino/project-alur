<script lang="ts">
	import { invalidateAll } from '$app/navigation'; // <-- 1. Impor invalidateAll

	async function handleLogout() {
		// Panggil endpoint API logout kita
		await fetch('/api/logout', {
			method: 'POST'
		});

		// 2. Beri tahu SvelteKit untuk memuat ulang semua datanya
		await invalidateAll();

		// Browser akan diarahkan oleh respons dari server,
		// tapi invalidateAll memastikan UI langsung update.
	}
</script>

<button on:click={handleLogout} class="agerrbggradient agerrborder px-3 py-2">
	Logout
</button>