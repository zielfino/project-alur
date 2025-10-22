<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import Card from "$lib/Kanban/Card.svelte";
	import { showAddCardModal, activeColumnId } from '$lib/stores/uiStore';
	import Icon from '@iconify/svelte';
	import { pushError } from '$lib/stores/errorNotification';

	const flipDurationMs = 150;
	// export let column: any;
	// export let onDrop: (event: { columnId: number; items: any[]; info?: any }) => void;
	let { column = $bindable(), onDrop, userRole } = $props<{
		userRole: number;
		column: any;
		onDrop: (event: { columnId: number; items: any[]; info?: any }) => void;
	}>();

	function handleDndConsiderCards(e: CustomEvent) {
		// onDrop({ columnId: column.id, items: e.detail.items, info: e.detail.info });
		column.cards = e.detail.items;
	}

	function handleDndFinalizeCards(e: CustomEvent) {
		onDrop({ columnId: column.id, items: e.detail.items, info: e.detail.info });
	}

	let editingColumnId = $state<number | null>(null);
	let editingColumnName = $state('');

	function startEditingColumn() {
		editingColumnId = column.id;
		editingColumnName = column.name;
	}

	function cancelEditingColumn() {
		editingColumnId = null;
		editingColumnName = '';
	}

	async function handleUpdateColumnName() {
		if (!editingColumnName.trim()) return;

		const response = await fetch('/api/boards/columns', {
			method: 'PUT',
			body: JSON.stringify({ name: editingColumnName, column_id: column.id }),
		});

		if (response.ok) {
			onDrop({
				columnId: column.id,
				items: column.cards,
				info: { type: 'rename-column', columnId: column.id, newName: editingColumnName },
			});
			cancelEditingColumn();
		} else {
			const result = await response.json();
			pushError(result.error, result.message);
		}
	}

	async function handleDeleteColumn() {
		if (!confirm('Are you sure?')) return;

		const response = await fetch('/api/boards/columns', {
			method: 'DELETE',
			body: JSON.stringify({ column_id: column.id }),
		});

		if (response.ok) {
			onDrop({
				columnId: column.id,
				items: [],
				info: { type: 'delete-column', columnId: column.id },
			});
		} else {
			const result = await response.json();
			pushError(result.error, result.message);
		}
	}

	// let showAddCardModal = $state(false);
	// let activeColumnId = $state<number | null>(null);

	function openAddCardModal(columnId: number) {
		$activeColumnId = columnId;
		$showAddCardModal = true;
		console.log({activeColumnId}, {showAddCardModal})
	}
	
	let isDndDisabled = $state(false);
	$effect(() => {
		isDndDisabled = userRole < 2;
	});
</script>

<div class="h-[600px] w-full flex flex-col justify-between ring-1 ring-gray-300 bg-gray-100 rounded-lg overflow-hidden">
	<div class="flex justify-between items-center p-3
	{column.state === 3 ? 'bg-emerald-200' : 
	column.state === 2 ? 'bg-sky-200' : 
	column.state === 1 ? 'bg-gray-200' : 'bg-red-200'}">
		{#if editingColumnId === column.id && userRole >= 3}
			<form onsubmit={handleUpdateColumnName} class="w-full flex justify-between group">
				<input
					type="text"
					bind:value={editingColumnName}
					class="font-semibold text-gray-700 w-full group-focus-within:animate-pulse-agerr"
					onblur={cancelEditingColumn}
					autofocus
				/>
				<button type="button" onclick={cancelEditingColumn} class="aspect-square rounded-full cursor-pointer group-focus-within:animate-pulse-agerr">
					<Icon icon="mingcute:close-fill" class="text-lg"/>
				</button>
			</form>
		{:else}
			<div class="flex w-full justify-between">
				<button class="w-full text-left {userRole >= 3 ? 'cursor-pointer' : 'cursor-default'}" disabled={!(userRole >= 3)} onclick={startEditingColumn}>
					<h2 class="font-semibold text-gray-700">{column.name}</h2>
				</button>
				{#if userRole >= 3}
					<button onclick={handleDeleteColumn} class="aspect-square rounded-full cursor-pointer hover:rotate-90 duration-500 ease-out">
						<Icon icon="mingcute:close-fill" class="text-lg"/>
					</button>
				{/if}
			</div>
		{/if}
		
	</div>

	<div
		class="h-[calc(100%-48px)] space-y-2 pt-2 overflow-y-auto overflow-x-hidden flex justify-start items-center flex-col bg-gray-100
		{userRole >= 2 ? '' : 'mb-2' }"
		use:dndzone={{ items: column.cards, flipDurationMs, dragDisabled: isDndDisabled }}
		onconsider={handleDndConsiderCards}
		onfinalize={handleDndFinalizeCards}
	>
		{#each column.cards as card (card.id)}
			<div class="w-[calc(100%-16px)]" animate:flip="{{ duration: flipDurationMs }}">
				<Card userRole={userRole} card={card} />
			</div>
		{/each}
		<div class="h-[30px]"></div>
	</div>
	{#if userRole >= 2}
		<div class="bg-gray-100 rounded-b-lg p-2">
			<button
				class="text-gray-900 hover:bg-gray-300 p-2 cursor-pointer bg-gray-200 rounded-md w-full"
				onclick={() => openAddCardModal(column.id)}
			>
				+ Add a card
			</button>
		</div>
	{/if}
	
</div>
