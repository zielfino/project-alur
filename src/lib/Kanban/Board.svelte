<script lang="ts">
	import { flip } from 'svelte/animate';
    import { dndzone } from 'svelte-dnd-action';
	import Column from "$lib/Kanban/Column.svelte";
	
	const flipDurationMs = 300;
	let { columns, onFinalUpdate } = $props();
 
    function handleDndConsiderColumns(e: CustomEvent) {
        columns = e.detail.items;
    }

    function handleDndFinalizeColumns(e: CustomEvent) {
        onFinalUpdate(e.detail.items);
    }

	async function handleItemFinalize(columnIdx: number, newCards: any[], info: any, targetColumnId: number) {
		const updatedColumns = [...columns];
		updatedColumns[columnIdx].cards = newCards;
		onFinalUpdate(updatedColumns);
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
            onDrop={(newCards, info) => handleItemFinalize(idx, newCards, info, column.id)} />
        </div>
    {/each}
</section>