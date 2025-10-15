<script lang="ts">
    import Board from "$lib/Kanban/Board.svelte";
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();
	type Column = { id: number; name: string; cards: any[]; };

    let { data } = $props();
    let board = $state(data.board);

    async function handleBoardUpdated(newColumnsData: Column[], info: any) {
        board.columns = newColumnsData;
        console.log('Info object received:', info);
        
        if (info.type === 'column') {
            const columnIds = newColumnsData.map(c => c.id);
            console.log("ACTION: Update column order ->", columnIds);
            // const columnIds = newColumnsData.map((c) => c.id);
            // console.log("ACTION: Update column order ->", columnIds);

            try {
                await fetch("/api/boards/columns/move", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items: columnIds }),
                });
            } catch (err) {
                console.error('Failed to update column order', err);
                // Optionally reload or rollback UI
            }
        } else if (info?.type === 'card') {
            const { cardId, oldColumnId, newColumnId } = info;
            
            // Find columns from the passed snapshot (newColumnsData)
            const newColumn = newColumnsData.find((col) => col.id === newColumnId);
            const oldColumn = newColumnsData.find((col) => col.id === oldColumnId);

            if (!newColumn || !oldColumn) {
                console.warn("Missing column data for move", { oldColumnId, newColumnId });
                return;
            }

            console.log("ACTION: Update card order:", { cardId, newColumnId, oldColumnId });
            
            // await fetch('/api/boards/cards/move', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         card_id,
            //         new_column_id,
            //         items_in_new_column: newColumn.cards.map(c => c.id),
            //         items_in_old_column: oldColumn.cards.map(c => c.id)
            //     })
            // });

            try {
                console.log('NEW OLD NEWS:', newColumn.cards.map((c) => c.id), oldColumn.cards.map((c) => c.id), newColumnId);
                const res = await fetch("/api/boards/cards/move", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        card_id: cardId,
                        new_column_id: newColumnId,
                        items_in_new_column: newColumn.cards.map((c) => c.id),
                        items_in_old_column: oldColumn.cards.map((c) => c.id),
                    }),
                });

                if (!res.ok) {
                    throw new Error('Server returned ' + res.status);
                }

                // success: DB updated
                console.log('Server move succeeded for card', cardId);
            } catch (err) {
                console.error('Failed to move card on server:', err);
                // Optional: refetch board from server to reconcile desync
                // const fresh = await (await fetch('/path/to/load')).json(); board.columns = fresh.columns;
            }
        }
    }


    
import { isLoading } from "$lib/stores/loading";

type Card = {
	id: number;
	title: string;
	description: string;
	deadline: string;
	priority: number;
	column_id: number;
};

// async function handleUpdateCard(updatedCard: Card) {
// 	if (!board) return;
    
// 	isLoading.start("CardEdit", updatedCard.id);

// 	try {
// 		const response = await fetch("/api/boards/cards", {
// 			method: "PUT",
// 			body: JSON.stringify(updatedCard),
// 		});

// 		if (response.ok) {
// 			board.columns = board.columns.map((col) => ({
// 				...col,
// 				cards: col.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
// 			}));
// 		} else {
// 			alert("Failed to update card");
// 		}
// 	} catch (err) {
// 		console.error(err);
// 		alert("Failed to update card");
// 	} finally {
// 	    isLoading.stop("CardEdit", updatedCard.id);
// 	}
// }
async function handleUpdateCard() {
	if (!$selectedCard) return;
    
	isLoading.start("CardEdit", $selectedCard.id);

	try {
		const response = await fetch("/api/boards/cards", {
			method: "PUT",
			body: JSON.stringify($selectedCard),
		});

		if (response.ok) {
			board.columns = board.columns.map((col) => ({
				...col,
				cards: col.cards.map((c) => (c.id === $selectedCard.id ? $selectedCard : c)),
			}));
		} else {
			alert("Failed to update card");
		}
	} catch (err) {
		console.error(err);
		alert("Failed to update card");
	} finally {
		isLoading.stop("CardEdit", $selectedCard.id);
        $showEditCardModal = false
	}
}

async function handleDeleteCard(cardId: number) {
	if (!board) return;
	if (!confirm("Are you sure you want to delete this card?")) return;

	isLoading.start("CardRemove", cardId);

	try {
		const response = await fetch("/api/boards/cards", {
			method: "DELETE",
			body: JSON.stringify({ id: cardId }),
		});

		if (response.ok) {
			board.columns = board.columns.map((col) => ({
				...col,
				cards: col.cards.filter((c) => c.id !== cardId),
			}));
		} else {
			alert("Failed to delete card");
		}
	} catch (err) {
		console.error(err);
		alert("Failed to delete card");
	} finally {
		isLoading.stop("CardRemove", cardId); 
        $showEditCardModal = false
	}
}


	import { fade, fly } from "svelte/transition";
	import { showEditCardModal, selectedCard, isEdit  } from '$lib/stores/uiStore';
	import Icon from "@iconify/svelte";
	// let isEdit = $state(false);
</script>
<section>
    <Board
    columns={board.columns} 
    onFinalUpdate={handleBoardUpdated}
	on:update={(e) => handleUpdateCard(e.detail.updatedCard)}
	on:delete={(e) => handleDeleteCard(e.detail.id)}
    />
</section>


<!-- 
===================
    EDIT MODAL
===================
-->
{#if $showEditCardModal && $selectedCard?.id}
    <div class="absolute w-full h-[100dvh] top-0 right-0 bg-zinc-900/30 flex justify-end items-center overflow-hidden cursor-default"
	transition:fade={{duration: 150}}>
        <div class="bg-white p-4 rounded-s-xl min-w-[300px] w-full max-w-[500px] h-[95%] relative"
		transition:fly={{ x: 300, duration: 300, opacity: 0 }}>
			<section class="flex justify-between w-full">
                <div class="space-x-2 flex">
                    {#if new Date($selectedCard.deadline) < new Date() }
                        <div class="rounded-full justify-center items-center flex whitespace-nowrap py-1 px-3
                        font-open-sans font-semibold text-[14px] bg-red-100 text-red-700">
                            Miss Deadline!
                        </div>
                    {/if}
                    <div class="rounded-full justify-center items-center flex whitespace-nowrap py-1 px-3
                    font-open-sans font-semibold text-[14px]
                    {$selectedCard.priority > 3 ? 'bg-red-100 text-red-700' : 
                    $selectedCard.priority < 3 ? 'bg-green-100 text-green-700' : 
                    'bg-yellow-100 text-yellow-700'}">
                        {$selectedCard.priority === 5 ? 'Urgent' : 
                        $selectedCard.priority === 4 ? 'Priority' :  
                        $selectedCard.priority === 3 ? 'Regular' :  
                        $selectedCard.priority === 2 ? 'Optional ' : 'Later'}
                    </div>
                </div>
				<button onclick={() => $showEditCardModal=false} class="aspect-square rounded-full cursor-pointer">
                    <Icon icon="mingcute:close-fill" class="text-2xl"/>
                </button>
			</section>
			{#if !$isEdit}
				<section class="p-4 h-[calc(100%-80px)] overflow-y-auto overflow-x-hidden mask-b-from-95% mask-b-to-100%">
					<div class="flex justify-between items-center">
                        <h3 class="text-[24px] font-outfit mb-1 tracking-wide font-semibold">{$selectedCard.title}</h3>
                    </div>
                    {#if $selectedCard.description}
                        <p class="agerrp my-4 text-justify">{$selectedCard.description} </p>
                    {/if}
				</section>
			{:else}
				<form onsubmit={() => handleUpdateCard()} class="flex flex-col gap-4">
					<div>
						<div>Title</div>
						<input type="text" bind:value={$selectedCard.title} required class="w-full border rounded p-2" />
					</div>
					<div>
						<div>Description</div>
						<textarea bind:value={$selectedCard.description} class="w-full border rounded p-2"></textarea>
					</div>
					<div>
						<div>Deadline</div>
						<input type="date" bind:value={$selectedCard.deadline} class="w-full border rounded p-2" />
					</div>
					<div>
						<div>Priority</div>
						<select bind:value={$selectedCard.priority} class="w-full border rounded p-2">
							<option value={1}>1 (Low)</option>
							<option value={2}>2</option>
							<option value={3}>3 (Medium)</option>
							<option value={4}>4</option>
							<option value={5}>5 (High)</option>
						</select>
					</div>
				
					<div class="flex justify-between items-center mt-4">
						
						<button type="submit" class="bg-blue-500 text-white rounded p-2">{$isLoading.CardEdit[$selectedCard.id] ? 'Saving...' : 'Save Changes'}</button>
					</div>
				</form>
			{/if}
            <section class="flex flex-row space-x-2 absolute bottom-4 left-4">
                <button class="bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer h-[40px] px-4 font-semibold rounded-md" onclick={() => handleDeleteCard($selectedCard.id)}>
                    {$isLoading.CardRemove[$selectedCard.id] ? 'Deleting...' : 'Delete Card'}
                </button>
                <button class="bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer h-[40px] w-[60px] font-semibold rounded-md"  onclick={() => $isEdit=!$isEdit}>
                    {$isEdit ? 'Back' : 'Edit'}
                </button>
                {#if $selectedCard.deadline}
                    <div>
                        <h4 class="text-[16px] font-outfit leading-none mb-1 tracking-wide">Deadline : </h4>
                        <h5 class="text-[14px] font-outfit leading-none tracking-wide font-semibold opacity-50">
                                {new Date($selectedCard.deadline).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                        </h5>
                    </div>
                {/if}
            </section>
		</div>
	</div>
{/if}