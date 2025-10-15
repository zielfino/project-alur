<script lang="ts">
	import Icon from "@iconify/svelte";

	let { card } = $props();

	type Card = { id: number; title: string; description: string; deadline: string; priority: number; column_id: number };

	let showEditCardModal = $state(false);
	let selectedCard = $state<Card | null>(null);



	// MODAL
	function openEditCardModal(card: Card) {
		selectedCard = { ...card };
		showEditCardModal = true;
	}
</script>

<div class="card">
	<button onclick={() => openEditCardModal(card)} class="w-full bg-white rounded-md shadow p-3 text-left hover:bg-slate-50 text-sm">
		<p class="font-medium text-slate-800">{card.title}</p>
		
		{#if card.description}
			<p class="mt-1 text-slate-600">{card.description}</p>
		{/if}

		<div class="mt-2 flex justify-between items-center text-slate-500">
			{#if card.deadline}
				<span class="flex items-center gap-1">
					<Icon icon="solar:calendar-outline" class="w-4 h-4" />
					{new Date(card.deadline).toLocaleDateString('id-ID')}
				</span>
			{/if}
			{#if card.priority}
				<span class="px-2 py-0.5 rounded-full text-xs font-semibold
					{card.priority > 3 ? 'bg-red-100 text-red-700' : card.priority < 3 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
					Priority: {card.priority}
				</span>
			{/if}
		</div>
	</button>
</div>