<script lang="ts">
	import { confirmState, confirmResponse } from '$lib/stores/confirmStore';
	import { quadOut } from 'svelte/easing';
	import { fly, fade } from 'svelte/transition';

	let message: string | null = $state(null);

	$effect(() => {
		$confirmState;
		message = $confirmState.message;
	});
</script>

{#if message}
<div
	class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
	transition:fade={{duration: 200, easing: quadOut}}
>
	<div class="bg-white rounded-xl shadow-lg p-6 w-80" in:fly={{ y: 50 }}>
		<p class="text-slate-800 text-center mb-4 font-semibold">{message}</p>
		<div class="flex justify-center gap-4">
			<button
				onclick={() => confirmResponse(true)}
				class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md cursor-pointer w-16"
			>
				Yes
			</button>
			<button
				onclick={() => confirmResponse(false)}
				class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-slate-700 rounded-md cursor-pointer w-16"
			>
				No
			</button>
		</div>
	</div>
</div>
{/if}
