<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import Column from "$lib/Kanban/Column.svelte";

	export let board: any;
	export let onFinalUpdate: (cols: any[], info?: any) => void;

	const flipDurationMs = 300;

	function handleDndConsiderColumns(e: CustomEvent) {
		onFinalUpdate(e.detail.items, { type: 'column' });
	}

	function handleDndFinalizeColumns(e: CustomEvent) {
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
</script>

<section
	class="board"
	use:dndzone={{ items: board.columns, flipDurationMs, type: 'column' }}
	on:consider={handleDndConsiderColumns}
	on:finalize={handleDndFinalizeColumns}
>
	{#each board.columns as column, idx (column.id)}
		<div class="column" animate:flip="{{ duration: flipDurationMs }}">
			<Column
				{column}
				onDrop={(e) => handleItemFinalize(idx, e.items, e.info)}
			/>
		</div>
	{/each}
</section>
