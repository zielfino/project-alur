<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone, TRIGGERS } from 'svelte-dnd-action';
	import Card from "$lib/Kanban/Card.svelte";
	import { createEventDispatcher } from "svelte";
	import { showEditCardModal } from '$lib/stores/uiStore';

	const dispatch = createEventDispatcher();
	const flipDurationMs = 150;
	let { column, onDrop } = $props();

	function handleDndConsiderCards(e: CustomEvent) {
    	const { items: newItems } = e.detail;
		onDrop({ columnId: column.id, items: newItems, info: e.detail.info });
	}

	function handleDndFinalizeCards(e: CustomEvent) {
    	onDrop({ items: e.detail.items, info: e.detail.info });
	}

	
	type Column = { id: number; name: string; state: number; position: number; cards: Card[] };

	let editingColumnId = $state<number | null>(null);
	let editingColumnName = $state('');

	function startEditingColumn(column: Column) {
		editingColumnId = column.id;
		editingColumnName = column.name;
	}

	function cancelEditingColumn() {
		editingColumnId = null;
		editingColumnName = '';
	}

	async function handleUpdateColumnName() {
		if (!editingColumnId || !editingColumnName) return;
		const response = await fetch('/api/boards/columns', {
			method: 'PUT',
			body: JSON.stringify({ name: editingColumnName, column_id: editingColumnId })
		});
		if (response.ok) {
		// 	column.name = editingColumnName;
			dispatch('updateColumnName', { columnId: editingColumnId, newName: editingColumnName });
			cancelEditingColumn();
		} else {
			alert('Failed to update column name.');
		}
	}

	async function handleDeleteColumn(columnId: number) {
		if (!confirm('Are you sure?')) return;
		const response = await fetch('/api/boards/columns', {
			method: 'DELETE',
			body: JSON.stringify({ column_id: columnId })
		});
		if (response.ok) {
			// column = column.filter((c) => c.id !== columnId);
			dispatch('deleteColumn', { columnId });
		} else {
			alert('Failed to delete column.');
		}
	}
</script>

<div class='h-[90dvh] w-full bg-sky-100 flex flex-col justify-between py-2 rounded-lg'>
 	<!-- <div class="column-title">
		{column.name}
	</div> -->
	<div class="flex justify-between items-center p-3">
		<!-- Kode Anda untuk edit inline sudah benar -->
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
			<button class="w-full text-left" onclick={() => startEditingColumn(column)}>
				<h2 class="font-semibold text-slate-700">{column.name}</h2>
			</button>
		{/if}
		<button
			onclick={() => handleDeleteColumn(column.id)}
			class="text-slate-500 hover:text-red-500 ml-2"
		>
			&times;
		</button>
	</div>
	<div class="h-[calc(100%-48px)] space-y-2 pt-2 overflow-y-auto overflow-x-hidden flex justify-start items-center flex-col"
    use:dndzone={{ items: column.cards, flipDurationMs }}
    onconsider={handleDndConsiderCards}
    onfinalize={handleDndFinalizeCards}
	>
        {#each column.cards as card (card.id)}
           <div class="w-[calc(100%-16px)]" animate:flip="{{duration: flipDurationMs}}">
                <Card card={card} />
            </div>
        {/each}
		<div class="h-[30px]"></div>
    </div>
</div>
