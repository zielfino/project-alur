<script lang="ts">
	import { fade } from 'svelte/transition';
	import errors from '$lib/stores/errorNotification';
</script>

<div class="fixed top-4 right-4 flex flex-col items-end gap-2 z-[9999]">
	{#each $errors as err (err.id)}
		<div
			in:fade={{ duration: 300 }}
			out:fade={{ duration: 300 }}
			class="bg-red-100 border-red-800 select-none border-2 text-red-800 px-3 py-2 rounded-lg text-sm font-semibold"
		>
			{err.message}
		</div>
	{/each}
</div>
