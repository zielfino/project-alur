<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import Column from "$lib/Kanban/Column.svelte";
	
	const flipDurationMs = 300;
	// let { columns, onFinalUpdate } = $props();
    export let columns: any[] = [];
    export let onFinalUpdate: (cols: any[], info?: any) => void;

	// let activeColumnId: number | null = null; // ⬅️ simpan kolom sumber drag

	function handleDndConsiderColumns(e: CustomEvent) {
		columns = e.detail.items;
	}

	function handleDndFinalizeColumns(e: CustomEvent) {
		onFinalUpdate(e.detail.items, { type: 'column' });
	}

    
    /**
     * columnIdx: index of column where finalize fired (destination)
     * newCards: the new items array for that column as provided by dndzone
     * info: raw info from dndzone (contains id of dragged card in info.id and a trigger)
    */
    async function handleItemFinalize(columnIdx: number, newCards: any[], info: any) {
        // const updatedColumns = [...columns];
        // updatedColumns[columnIdx].cards = newCards;

        // hanya proses bila drag berakhir di kolom tujuan
        // if (info?.trigger !== 'droppedIntoAnother') return;

        // onFinalUpdate(updatedColumns, {
        //     type: 'card',
        //     cardId: info.id,
        //     oldColumnId: info.oldColumnId,
        //     newColumnId: info.newColumnId
        // });

        // Snapshot previous columns (deep enough to inspect .cards)
        const prevColumns = columns.map(c => ({ ...c, cards: c.cards ? [...c.cards] : [] }));
        // console.log('prevColumns:',prevColumns)

        
        // Build updated columns preview (optimistic)
        const updatedColumns = columns.map((c, idx) => {
        if (idx === columnIdx) {
            return { ...c, cards: newCards };
        }
        return { ...c };
        });

        // only react when the drop finished in another zone (avoid double processing)
        // depending on your tests you can also accept 'droppedIntoZone' for reorders within same column
        if (!info || info.trigger !== 'droppedIntoAnother') {
            // still update UI for visual reorder within same column (optional)
            // but do not send server-change for cross-column until we detect destination trigger
            columns = updatedColumns;
            return;
        }

        // Determine dragged card id and new column id
        const draggedCardId = info.id;
        const newColumn = updatedColumns.find(col => col.cards.some(card => card.id === draggedCardId));
        const newColumnId = newColumn?.id ?? null;

        // Find the old column by searching prevColumns (snapshot before mutation)
        const oldColumn = prevColumns.find(col => col.cards.some(card => card.id === draggedCardId));
        const oldColumnId = oldColumn?.id ?? null;

        if (oldColumnId === null) {
            console.warn('Could not determine source column for card', draggedCardId, info);
            // still update UI
            columns = updatedColumns;
            return;
        }

        // Update UI immediately (optimistic)
        columns = updatedColumns;

        console.log('prevColumns:',prevColumns)
        console.log('oldColumnId:',oldColumnId)
        // send parent update (onFinalUpdate will handle the API call in +page)
        onFinalUpdate(updatedColumns, {
            type: 'card',
            cardId: draggedCardId,
            oldColumnId,
            newColumnId
        });
    }
</script>
<style>
    .board {
        height: 90vh;
        width: 100%;
        padding: 0.5em;
        margin-bottom: 40px;
    }
    .column {
        height: 100%;
        width: 250px;
        padding: 0.5em;
        margin: 1em;
        float: left;
        border: 1px solid #333333;
        background-color: white;
    }
</style>

<section class="board" 
use:dndzone={{ items: columns, flipDurationMs, type: 'column' }} 
onconsider={handleDndConsiderColumns} 
onfinalize={handleDndFinalizeColumns}>
    {#each columns as column, idx (column.id)}
  		<div class="column"animate:flip="{{duration: flipDurationMs}}" >    
            <Column 
            name={column.name} 
            items={column.cards} 
            onDrop={(event) => handleItemFinalize(idx, event.items, event.info)} />
        </div>
    {/each}
</section>