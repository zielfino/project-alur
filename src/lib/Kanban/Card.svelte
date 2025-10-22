<script lang="ts">
	import Icon from "@iconify/svelte";
	import { isLoading } from "$lib/stores/loading";
	import { showEditCardModal, selectedCard, isEdit  } from '$lib/stores/uiStore';

	type Card = { id: number; title: string; description: string; deadline: string; priority: number; column_id: number };
	let { card, userRole } = $props();

	// ====================
	// 		FUNCTION
	// ====================	
	function openEditCardModal(card: Card) {
		$selectedCard = { ...card };
		$showEditCardModal = true;
		$isEdit = false
	}
</script>

<div class="cursor-default relative bg-white p-3 pb-2.5 border-slate-900/30 border hover:bg-slate-100 rounded-md w-full text-left text-sm">
	<!-- Title -->
	<button onclick={() => openEditCardModal(card)} class="font-semibold text-slate-800 w-full text-left cursor-pointer group">
		<div class="flex"><div class="line-clamp-1">{$isLoading.CardEdit[card.id] ? 'Saving...' : card.title}</div><Icon icon="mingcute:pencil-fill" class="ml-1 hidden group-hover:block text-sm min-w-fit" /></div>
	</button>
	<!-- Description -->
	{#if card.description}
		<p class="mt-1 line-clamp-2 text-slate-600 whitespace-pre-wrap">{card.description}</p>
	{/if}

	<!-- Bottom Utility -->
	{#if card.priority || card.deadline}
		<div class="mt-2 flex justify-between items-center text-slate-500">
			<div>
				{#if card.deadline}
					<span class="flex items-center gap-1 text-xs
					{new Date(card.deadline) < new Date() && card.deadline && card.column_state !== 3 ? 'text-red-400 font-semibold border-b-1' : 'text-slate-600'}">
						<Icon icon="solar:calendar-outline" class="text-sm" />
						{new Date(card.deadline).toLocaleDateString('id-ID', {
							day: '2-digit',
							month: 'short',
							year: 'numeric'
						})}
					</span>
				{/if}
			</div>
			<div class="flex justify-center items-center space-x-2">
				{#if card.priority}
					<div class=" rounded-full text-xs font-semibold flex justify-center items-center h-[24px] px-3 whitespace-nowrap
					{card.priority > 3 ? 'bg-red-100 text-red-700' : 
					card.priority < 3 ? 'bg-green-200 text-green-800' : 
					'bg-yellow-100 text-yellow-700'}">
						{
						card.priority === 5 ? 'Urgent' : 
						card.priority === 4 ? 'Priority' :  
						card.priority === 3 ? 'Regular' :  
						card.priority === 2 ? 'Optional ' : 'Later'}
					</div> 
				{/if}
			</div>
		</div>
	{/if}

	<!-- Deadline Missed Ping -->
	{#if new Date(card.deadline) < new Date() && card.deadline && card.column_state !== 3}
		<span class="absolute -top-1 -right-1 flex size-3">
			<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-800 opacity-75"></span>
			<span class="relative inline-flex size-3 rounded-full bg-red-400"></span>
		</span>
	{/if}
</div>