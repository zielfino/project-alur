<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone, TRIGGERS } from 'svelte-dnd-action';
	import Card from "$lib/Kanban/Card.svelte";
	
	const flipDurationMs = 150;
	// let { id, name, items, onDrop } = $props();
	// export let id: number;
	export let name: string;
	export let items: any[] = [];
	export let onDrop: (payload: any) => void;

	// let currentDragSourceId: number | null = null;

	function handleDndConsiderCards(e: CustomEvent) {
		// const { items: newItems, info } = e.detail;

		// if (info.trigger === 'dragStart') {
		// 	currentDragSourceId = id;
		// }

    	const { items: newItems } = e.detail;
		items = newItems;
	}

	function handleDndFinalizeCards(e: CustomEvent) {
		// const { items, info } = e.detail;

		// const enrichedInfo = {
		// 	...info,
		// 	trigger: info.trigger, // tetap kirim trigger
		// 	oldColumnId: currentDragSourceId ?? id,
		// 	newColumnId: id,
		// 	cardId: info.id,
		// 	type: 'card'
		// };

		// currentDragSourceId = null;
		// onDrop({ items, info: enrichedInfo });
    	onDrop({ items: e.detail.items, info: e.detail.info });
	}
</script>


<style>
	.wrapper {
		height: 100%;
		width: 100%;
		     /*Notice we make sure this container doesn't scroll so that the title stays on top and the dndzone inside is scrollable*/
        overflow-y: hidden;
	}
	.column-content {
        height: calc(100% - 2.5em);
        /* Notice that the scroll container needs to be the dndzone if you want dragging near the edge to trigger scrolling */
        overflow-y: scroll;
    }
    .column-title {
				height: 2.5em;
			  font-weight: bold;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
<div class='wrapper'>
 	<div class="column-title">
		{name}
	</div>
	<div class="column-content"
    use:dndzone={{ items, flipDurationMs }}
    onconsider={handleDndConsiderCards}
    onfinalize={handleDndFinalizeCards}>
        {#each items as item (item.id)}
           <div animate:flip="{{duration: flipDurationMs}}" >
                <Card title={item.title} />
            </div>
        {/each}
    </div>
</div>
