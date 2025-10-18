<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import Card from "$lib/Kanban/Card.svelte";
	import { showAddCardModal, activeColumnId } from '$lib/stores/uiStore';

	const flipDurationMs = 150;
	// export let column: any;
	// export let onDrop: (event: { columnId: number; items: any[]; info?: any }) => void;
	let { column, onDrop } = $props<{
		column: any;
		onDrop: (event: { columnId: number; items: any[]; info?: any }) => void;
	}>();

	function handleDndConsiderCards(e: CustomEvent) {
		onDrop({ columnId: column.id, items: e.detail.items, info: e.detail.info });
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
			alert('Failed to update column name.');
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
			alert('Failed to delete column.');
		}
	}

	// let showAddCardModal = $state(false);
	// let activeColumnId = $state<number | null>(null);

	function openAddCardModal(columnId: number) {
		$activeColumnId = columnId;
		$showAddCardModal = true;
		console.log({activeColumnId}, {showAddCardModal})
	}
</script>

<div class="h-[90dvh] w-full bg-sky-100 flex flex-col justify-between py-2 rounded-lg">
	<div class="flex justify-between items-center p-3">
		{#if editingColumnId === column.id}
			<form onsubmit={handleUpdateColumnName} class="w-full">
				<input
					type="text"
					bind:value={editingColumnName}
					class="font-semibold text-slate-700 p-1 rounded w-full"
					onblur={cancelEditingColumn}
					autofocus
				/>
			</form>
		{:else}
			<button class="w-full text-left" onclick={startEditingColumn}>
				<h2 class="font-semibold text-slate-700">{column.name}</h2>
			</button>
		{/if}

		<button
			onclick={handleDeleteColumn}
			class="text-slate-500 hover:text-red-500 ml-2"
		>
			&times;
		</button>
	</div>

	<div
		class="h-[calc(100%-48px)] space-y-2 pt-2 overflow-y-auto overflow-x-hidden flex justify-start items-center flex-col"
		use:dndzone={{ items: column.cards, flipDurationMs }}
		onconsider={handleDndConsiderCards}
		onfinalize={handleDndFinalizeCards}
	>
		{#each column.cards as card (card.id)}
			<div class="w-[calc(100%-16px)]" animate:flip="{{ duration: flipDurationMs }}">
				<Card card={card} />
			</div>
		{/each}
		<div class="h-[30px]"></div>
	</div>
	
	<button
		class="text-slate-500 hover:bg-slate-300 p-2 mt-2 mx-2 rounded-md cursor-pointer"
		onclick={() => openAddCardModal(column.id)}
	>
		+ Add a card
	</button>
</div>
