<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone, TRIGGERS } from 'svelte-dnd-action';
	import Card from "$lib/Kanban/Card.svelte";
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();
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

	
	function handleCardUpdateCard(e: CustomEvent<{ updatedCard: Card }>) {
		dispatch("update", e.detail);
	}

	function handleCardDeleteCard(e: CustomEvent<{ id: number }>) {
		dispatch("delete", e.detail);
	}
</script>

<div class='wrapper'>
 	<div class="column-title">
		{name}
	</div>
	<div class="column-content"
    use:dndzone={{ items, flipDurationMs }}
    onconsider={handleDndConsiderCards}
    onfinalize={handleDndFinalizeCards}
	>
        {#each items as item (item.id)}
           <div animate:flip="{{duration: flipDurationMs}}" >
                <Card
				card={item} 
				on:update={handleCardUpdateCard}
				on:delete={handleCardDeleteCard}
				/>
            </div>
        {/each}
    </div>
</div>
