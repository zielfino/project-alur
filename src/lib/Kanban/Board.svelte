<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import Column from "$lib/Kanban/Column.svelte";
	import { showAddColumnInput } from '$lib/stores/uiStore';

	let { board = $bindable(), onFinalUpdate } = $props<{
		board: any;
		onFinalUpdate: (cols: any[], info?: any) => void;
	}>();


	const flipDurationMs = 300;
	// let isDraggingColumn = false;

	function handleDndConsiderColumns(e: CustomEvent) {
		board.columns = e.detail.items;
	}

	function handleDndFinalizeColumns(e: CustomEvent) {
		// isDraggingColumn = false;
		onFinalUpdate(e.detail.items, { type: 'column' });
	}

	function handleItemFinalize(columnIdx: number, newCards: any[], info: any) {
		const prevColumns = board.columns.map(c => ({ ...c, cards: [...c.cards] }));

		// apply new cards to current column
		let updatedColumns = board.columns.map((col, i) =>
			i === columnIdx ? { ...col, cards: newCards } : col
		);

		// handle rename/delete event from Column
		if (info?.type === 'rename-column') {
			updatedColumns = board.columns.map(c =>
				c.id === info.columnId ? { ...c, name: info.newName } : c
			);
			return onFinalUpdate(updatedColumns, info);
		}

		if (info?.type === 'delete-column') {
			updatedColumns = board.columns.filter(c => c.id !== info.columnId);
			return onFinalUpdate(updatedColumns, info);
		}

		// handle drag-drop event
		if (!info || (info.trigger !== 'droppedIntoAnother' && info.trigger !== 'droppedIntoZone')) {
			return onFinalUpdate(updatedColumns, { type: 'column' });
		}

		const draggedCardId = info.id;
		const newColumn = updatedColumns.find(col => col.cards.some(card => card.id === draggedCardId));
		const oldColumn = prevColumns.find(col => col.cards.some(card => card.id === draggedCardId));

		if (!newColumn || !oldColumn) {
			return onFinalUpdate(updatedColumns, { type: 'column' });
		}

		onFinalUpdate(updatedColumns, {
			type: 'card',
			cardId: draggedCardId,
			oldColumnId: oldColumn.id,
			newColumnId: newColumn.id
		});
	}
	
	let apiError = $state<string | null>(null);
	let newColumnName = $state('');
	let newColumnState = $state(1);

	async function handleAddColumn() {
		if (!board || !newColumnName) return;
		apiError = null;

		const response = await fetch('/api/boards/columns', {
			method: 'POST',
			body: JSON.stringify({ name: newColumnName, board_id: board.id, state: newColumnState })
		});

		if (response.ok) {
			const result = await response.json();
			const newColumn = result.column; // Ambil langsung object kolom-nya

			const updatedColumns = [...board.columns, newColumn];
			updatedColumns.sort((a, b) => a.state - b.state || a.position - b.position);
			board.columns = updatedColumns;

			newColumnName = '';
			$showAddColumnInput = false;
		} else {
			const result = await response.json();
			apiError = result.message || result.error || 'Failed to add column.';
		}
	}
</script>

<section
	class="w-full h-[640px] ml-6 outline-none cursor-default flex overflow-x-auto overflow-y-hidden"
	use:dndzone={{ items: board.columns, flipDurationMs, type: 'column' }}
	onconsider={handleDndConsiderColumns}
	onfinalize={handleDndFinalizeColumns}
>
	{#each board.columns as column, idx (column.id)}
		<div class="h-full min-w-[300px] max-w-[300px] m-3 float-left cursor-default" animate:flip="{{ duration: flipDurationMs }}">
			<Column
				bind:column={board.columns[idx]}
				onDrop={(e) => handleItemFinalize(idx, e.items, e.info)}
			/>
		</div>
	{/each}
	<div class="bg-gray-100 w-[300px] flex-shrink-0 p-2 m-3 self-start ring-1 ring-gray-300 rounded-lg">
		{#if $showAddColumnInput}
			<form onsubmit={handleAddColumn}>
				<input
					type="text"
					bind:value={newColumnName}
					placeholder="Enter column name..."
					class="w-full p-2 rounded-md border"
				/>
				<select bind:value={newColumnState} class="w-full p-2 mt-2 rounded-md border">
					<option value={1}>Not Started</option>
					<option value={2}>In Progress</option>
					<option value={3}>Finished</option>
				</select>
				<div class="mt-2 space-x-1 font-semibold tracking-wide">
					<button type="submit" class="bg-sky-500 text-white hover:bg-sky-400 disabled:bg-sky-400 px-5 py-2 rounded-md cursor-pointer">Add</button>
					<button type="button" onclick={() => ($showAddColumnInput = false)} class="bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-300 px-5 py-2 rounded-md cursor-pointer">Cancel</button>
				</div>
				{#if apiError}
					<p class="text-red-500 text-sm mt-2">{apiError}</p>
				{/if}
			</form>
		{:else}
			<button class="text-left text-gray-900 hover:bg-gray-200 p-2 cursor-pointer bg-gray-100 rounded-md w-full" onclick={() => $showAddColumnInput = true}>
				+ Add another column
			</button>
		{/if}
	</div>
</section>
