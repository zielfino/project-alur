<script lang="ts">
	import Icon from "@iconify/svelte";
	import { createEventDispatcher } from "svelte";
	import { isLoading } from "$lib/stores/loading";

	type Card = { id: number; title: string; description: string; deadline: string; priority: number; column_id: number };

	const dispatch = createEventDispatcher();
	let { card } = $props();


	// ===============
	// 		MODAL
	// ===============

	let showEditCardModal = $state(false);
	let selectedCard = $state<Card | null>(null);

		
		
	// ====================
	// 		FUNCTION
	// ====================	

	// Modal Show
	function openEditCardModal(card: Card) {
		selectedCard = { ...card };
		showEditCardModal = true;
	}

	// Update Card Dispatch
	function handleUpdateCard() {
		dispatch("update", { updatedCard: selectedCard });
		showEditCardModal = false;
		console.log($isLoading.CardEdit)
	}

	// Delete Card Dispatch
	function handleDeleteCard(id: number) {
		dispatch("delete", { id });
	}
</script>

<div class="card">
	<button onclick={() => openEditCardModal(card)} class="w-full bg-white rounded-md shadow p-3 text-left hover:bg-slate-50 text-sm">
		<p class="font-medium text-slate-800">{$isLoading.CardEdit[card.id] ? 'Saving...' : card.title}</p>
		
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

{#if showEditCardModal && selectedCard}
    <div class="absolute w-1/2 h-1/2 top-0 right-0 bg-red-50">
        <div class="bg-red-400">
			<h2>Edit Card</h2>
			<form onsubmit={handleUpdateCard} class="flex flex-col gap-4">
				<div>
					<div>Title</div>
					<input type="text" bind:value={selectedCard.title} required class="w-full border rounded p-2" />
				</div>
				<div>
					<div>Description</div>
					<textarea bind:value={selectedCard.description} class="w-full border rounded p-2"></textarea>
				</div>
				<div>
					<div>Deadline</div>
					<input type="date" bind:value={selectedCard.deadline} class="w-full border rounded p-2" />
				</div>
				<div>
					<div>Priority</div>
					<select bind:value={selectedCard.priority} class="w-full border rounded p-2">
						<option value={1}>1 (Low)</option>
						<option value={2}>2</option>
						<option value={3}>3 (Medium)</option>
						<option value={4}>4</option>
						<option value={5}>5 (High)</option>
					</select>
				</div>
				
				<div class="flex justify-between items-center mt-4">
					<button type="button" class="text-red-500 hover:underline" onclick={() => handleDeleteCard(card.id)}>
						{$isLoading.CardRemove[card.id] ? 'Saving...' : 'Delete Card'}
					</button>
					
					<button type="submit" class="bg-blue-500 text-white rounded p-2">{$isLoading.CardEdit[card.id] ? 'Saving...' : 'Save Changes'}</button>
				</div>
			</form>
		</div>
	</div>
{/if}