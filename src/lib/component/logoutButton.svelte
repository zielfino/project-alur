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
   	import { sidebar, sidebarIsHovered as isHovered } from '$lib/stores/uiStore';
	import Icon from '@iconify/svelte';
</script>

<button on:click={handleLogout} class="bg-red-500 hover:bg-red-400 text-white font-semibold font-outfit tracking-wider rounded-lg h-[40px] cursor-pointer flex justify-center-safe items-center-safe
{$sidebar || $isHovered ? 'w-full space-x-2' : 'w-10 group-hover:w-40 group-hover:space-x-2'}">
		<div class="w-[18px] {$sidebar ? '' : 'pl-3 group-hover:pl-0'}"><Icon icon="fa7-solid:sign-out-alt" class="inline-block text-lg" /></div>
		<div class="{$sidebar ? '' : 'opacity-0 group-hover:opacity-100'}">Logout</div>
</button>