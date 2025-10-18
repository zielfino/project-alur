<script lang="ts">
    import Board from "$lib/Kanban/Board.svelte";
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();
	type Column = { id: number; name: string; cards: any[]; };

    let { data } = $props();
    let board = $state(data.board);

    async function handleBoardUpdated(newColumnsData: Column[], info: any) {
        board.columns = newColumnsData;
        console.log('Info object received:', info ?? '(no info)');
        
        if (info && info.type === 'column') {
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
    
	if (!$selectedCard.title || $selectedCard.title.trim() === "") {
		$selectedCard.title = "Judul";
	}

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
	import { showEditCardModal, selectedCard, isEdit, selectedCardWithFormat  } from '$lib/stores/uiStore';
	import Icon from "@iconify/svelte";
	// let isEdit = $state(false);
    import { autosize } from '$lib/actions/autosize';


    function handleTextareaKeydown(event: KeyboardEvent) {
		// 1. Cek apakah tombol yang ditekan adalah 'Enter' DAN 'Shift' tidak ditekan
		if (event.key === 'Enter' && !event.shiftKey) {
			// 2. Mencegah aksi default (membuat baris baru)
			event.preventDefault();
			
			// 3. Jalankan fungsi submit Anda secara manual
			handleUpdateCard();
		}
		// Jika Shift + Enter ditekan, biarkan ia membuat baris baru seperti biasa.
	}



    export function formatForInputDate(date: string | Date): string {
        if (!date) return "";
        const d = new Date(date);
        const iso = d.toISOString();
        return iso.split("T")[0]; // hasil: "2025-10-14"
    }

    export function formatForDisplay(date: string | Date): string {
        if (!date) return "";
        return new Date(date).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }


	import { showAddCardModal, activeColumnId } from '$lib/stores/uiStore';

	// let activeColumnId = $state<number | null>(null);
	let newCardTitle = $state('');
	let newCardDescription = $state('');
	let newCardDeadline = $state('');
	let newCardPriority = $state(null);
	let deadlineAddCard = $state<string | null>(null);

    async function handleAddCard() {
        console.log('added')
		if (!newCardTitle || !$activeColumnId || !board) return;
		const response = await fetch('/api/boards/cards', {
			method: 'POST',
			body: JSON.stringify({
				title: newCardTitle,
				column_id: $activeColumnId,
				description: newCardDescription,
				deadline: newCardDeadline || null,
				priority: newCardPriority
			})
		});
		if (response.ok) {
			const newCard = await response.json();
			const columnIndex = board.columns.findIndex((c) => c.id === $activeColumnId);
			if (columnIndex !== -1) {
				// Ini adalah update yang reaktif
				board.columns[columnIndex].cards = [...board.columns[columnIndex].cards, newCard];
			}
			newCardTitle = '';
			newCardDescription = '';
			newCardDeadline = '';
			newCardPriority = null;
			$showAddCardModal = false;
		} else {
			alert('Failed to add card.');
		}
	}

</script>
<section>
    <Board
    board={board} 
    onFinalUpdate={handleBoardUpdated}
    />
</section>



<!-- 
=========================
    ADD CARD MODAL
=========================
-->
{#if $showAddCardModal}
    <section class="fixed w-full h-[100dvh] top-0 right-0 bg-zinc-900/30 flex justify-center items-center overflow-hidden cursor-default backdrop-blur-xs"
	transition:fade={{duration: 150}} onclick={() => $showAddCardModal=false}>
	<!-- transition:fade={{duration: 150}}> -->
        <div class="bg-white p-4 rounded-xl min-w-[300px] w-full max-w-[500px] h-[500px] relative"
		transition:fly={{ y: 100, duration: 300, opacity: 0 }} onclick={(e) => e.stopPropagation()} >
		<!-- transition:fly={{ y: 100, duration: 300, opacity: 0 }}> -->
			<section class="flex justify-between w-full">
                <div class="space-x-2 flex">           
                    <div class="h-[28px] text-[18px] font-outfit leading-none tracking-wide font-semibold flex justify-center items-center ml-1">Add Card</div>
                </div>
				<button onclick={() => $showAddCardModal=false} class="aspect-square rounded-full cursor-pointer hover:rotate-90 duration-500 ease-out">
                    <Icon icon="mingcute:close-fill" class="text-2xl"/>
                </button>
			</section>
			<form onsubmit={handleAddCard} class="flex flex-col gap-4 overflow-y-auto overflow-x-hidden pt-2">
				<div>
					<label for="card-title">Card Title</label>
					<input id="card-title" type="text" bind:value={newCardTitle} required class="w-full border rounded p-2" />
				</div>
				<div>
					<label for="card-desc">Description</label>
					<textarea id="card-desc" bind:value={newCardDescription} rows="10" class="w-full border rounded p-2 resize-none"></textarea>
				</div>

                
                <div class="grid grid-cols-2 gap-2 absolute bottom-16 w-[calc(100%-32px)]">
                    <div>
                        <div class="flex justify-between"><div>Deadline</div></div>
                        <div class="flex justify-center items-center">
                            <input type="date" 
                            bind:value={deadlineAddCard}
                            class="w-full rounded-s-md p-2 font-semibold {deadlineAddCard === null ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : new Date(deadlineAddCard) > new Date() ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-red-100 text-red-700 hover:bg-red-200'} cursor-pointer" />
                            <button type="button" class="cursor-pointer bg-gray-200 text-gray-800 hover:bg-gray-300 aspect-square h-[36px] rounded-e-lg flex justify-center items-center" onclick={() => {deadlineAddCard = null;}}>
                                <Icon icon="mingcute:delete-back-line" class="text-xl" />
                            </button>
                        </div>
                    </div>
                    <div>
                        <div>Priority</div>
                        <div class="flex">
                            <div class="pr-2 w-full rounded-s-md
                            {!newCardPriority ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 
                            newCardPriority > 3 ? 'bg-red-100 text-red-700 hover:bg-red-200' : 
                            newCardPriority < 3 ? 'bg-green-200 text-green-800 hover:bg-emerald-300' : 
                            'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}">
                                <select bind:value={newCardPriority} class="w-full p-2 cursor-pointer font-semibold">
                                    <option class="bg-white text-black" value={1}>1 | Later</option>
                                    <option class="bg-white text-black" value={2}>2 | Optional</option>
                                    <option class="bg-white text-black" value={3}>3 | Regular</option>
                                    <option class="bg-white text-black" value={4}>4 | Priority</option>
                                    <option class="bg-white text-black" value={5}>5 | Urgent</option>
                                </select>
                            </div>
                            <button type="button" class="cursor-pointer bg-gray-200 text-gray-800 hover:bg-gray-300 aspect-square h-[36px] rounded-e-lg flex justify-center items-center" onclick={() => {newCardPriority = null;}}>
                                <Icon icon="mingcute:delete-back-line" class="text-xl" />
                            </button>
                        </div>
                    </div>
                </div>
				<!-- <button type="submit" class="bg-blue-500 text-white rounded p-2">Add Card</button> -->
                <section class="flex flex-row space-x-2 absolute bottom-4 left-4">
                    <button type="submit" class="bg-blue-200 text-blue-800 hover:bg-blue-300 cursor-pointer h-[40px] w-[468px] font-semibold rounded-md">
                        Add Card
                    </button>
                </section>
			</form>
        </div>
    </section>
{/if}


<!-- 
=========================
    EDIT CARD MODAL
=========================
-->
{#if $showEditCardModal && $selectedCard?.id}
    <section class="fixed w-full h-[100dvh] top-0 right-0 bg-zinc-900/30 flex justify-end items-center overflow-hidden cursor-default backdrop-blur-xs"
	transition:fade={{duration: 150}} onclick={() => $showEditCardModal=false}>
        <div class="bg-white p-4 rounded-s-xl min-w-[300px] w-full max-w-[500px] h-[95%] relative"
		transition:fly={{ x: 300, duration: 300, opacity: 0 }} onclick={(e) => e.stopPropagation()} >
			<section class="flex justify-between w-full">
                <div class="space-x-2 flex">           
                    {#if !$isEdit}
                        {#if $selectedCard.deadline !== null && new Date($selectedCard.deadline) < new Date() && $selectedCard.deadline }
                            <div class="rounded-full justify-center items-center flex whitespace-nowrap py-1 px-3
                            font-open-sans font-semibold text-[14px] bg-red-100 text-red-700">
                                Deadline Missed!
                            </div>
                        {/if}
                        {#if $selectedCard.priority !== null}
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
                        {/if}
                    {:else}
                        <div class="h-[28px] text-[18px] font-outfit leading-none tracking-wide font-semibold flex justify-center items-center ml-1">Edit Card</div>
                    {/if} 
                </div>
				<button onclick={() => $showEditCardModal=false} class="aspect-square rounded-full cursor-pointer hover:rotate-90 duration-500 ease-out">
                    <Icon icon="mingcute:close-fill" class="text-2xl"/>
                </button>
			</section>
			{#if !$isEdit}
				<section class="p-4 mt-2 h-[calc(100%-80px)] overflow-y-auto overflow-x-hidden mask-b-from-95% mask-b-to-100%">
					<div class="flex justify-between items-center">
                        <h3 class="text-[24px] font-outfit mb-1 tracking-wide font-semibold">{$selectedCard.title}</h3>
                    </div>
                    {#if $selectedCard.description}
                        <p class="agerrp my-4 text-justify whitespace-pre-wrap">{$selectedCard.description} </p>
                    {/if}
				</section>
			{:else}
				<form onsubmit={() => handleUpdateCard()} class="pt-4 mt-2 h-[calc(100%-80px-64px)] overflow-y-auto overflow-x-hidden">
					<!-- <div class="flex justify-between items-center">
                        <textarea bind:value={$selectedCard.title} use:autosize required 
                        class="text-[24px] font-outfit mb-1 tracking-wide font-semibold w-full">{$selectedCard.title}</textarea>
                    </div> -->
					<div class="px-4 flex justify-between items-center">
                        <textarea bind:value={$selectedCard.title} placeholder="Judul" use:autosize rows="1" required onkeydown={handleTextareaKeydown}
                        class="text-[24px] font-outfit mb-1 tracking-wide font-semibold w-full bg-transparent border-none focus:ring-0 resize-none overflow-hidden animate-pulse-agerr hover:animate-none focus:animate-none">{$selectedCard.title}</textarea>
                    </div>
                    <textarea bind:value={$selectedCard.description} placeholder="Ketik Disini" use:autosize rows="1" 
                    class="px-4 w-full agerrp my-4 text-justify animate-pulse-agerr hover:animate-none focus:animate-none resize-none"></textarea>
					<div transition:fly={{ y: 12, duration: 150, opacity: 0 }} class="grid grid-cols-2 gap-2 absolute bottom-16 w-[calc(100%-32px)]">
                        <div>
                            <div class="flex justify-between"><div>Deadline</div></div>
                            <div class="flex justify-center items-center">
                                <input type="date" 
                                bind:value={$selectedCardWithFormat.deadlineFormatted}
                                class="w-full rounded-s-md p-2 font-semibold {$selectedCard.deadline === null ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : new Date($selectedCard.deadline) > new Date() ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-red-100 text-red-700 hover:bg-red-200'} cursor-pointer" />
                                <button type="button" class="cursor-pointer bg-gray-200 text-gray-800 hover:bg-gray-300 aspect-square h-[36px] rounded-e-lg flex justify-center items-center" onclick={() => {$selectedCard.deadline = null;}}>
                                    <Icon icon="mingcute:delete-back-line" class="text-xl" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <div>Priority</div>
                            <div class="flex">
                                <div class="pr-2 w-full rounded-s-md
                                {!$selectedCard.priority ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 
                                $selectedCard.priority > 3 ? 'bg-red-100 text-red-700 hover:bg-red-200' : 
                                $selectedCard.priority < 3 ? 'bg-green-200 text-green-800 hover:bg-emerald-300' : 
                                'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}">
                                    <select bind:value={$selectedCard.priority} class="w-full p-2 cursor-pointer font-semibold">
                                        <option class="bg-white text-black" value={1}>1 | Later</option>
                                        <option class="bg-white text-black" value={2}>2 | Optional</option>
                                        <option class="bg-white text-black" value={3}>3 | Regular</option>
                                        <option class="bg-white text-black" value={4}>4 | Priority</option>
                                        <option class="bg-white text-black" value={5}>5 | Urgent</option>
                                    </select>
                                </div>
                                <button type="button" class="cursor-pointer bg-gray-200 text-gray-800 hover:bg-gray-300 aspect-square h-[36px] rounded-e-lg flex justify-center items-center" onclick={() => {$selectedCard.priority = null;}}>
                                    <Icon icon="mingcute:delete-back-line" class="text-xl" />
                                </button>
                            </div>
                        </div>
					</div>
				
                    <button transition:fly={{ y: 12, duration: 150, opacity: 0 }} disabled={$isLoading.CardEdit[$selectedCard.id]} type="submit" class="absolute bottom-4 right-4 bg-blue-200 text-blue-800 hover:bg-blue-300 disabled:bg-blue-300 cursor-pointer h-[40px] w-[96px] font-semibold rounded-md flex justify-center items-center">
                        {#if $isLoading.CardEdit[$selectedCard.id]}
                            <Icon icon="mingcute:loading-fill" class="text-xl animate-spin" />
                        {:else}
                            Save
                        {/if}
                    </button>
				</form>
                <div class="h-[20%]"></div>
			{/if}
            <section class="flex flex-row space-x-2 absolute bottom-4 left-4">
                <button class="bg-red-100 w-[116px] text-red-700 hover:bg-red-200 disabled:bg-red-200 cursor-pointer h-[40px] font-semibold rounded-md flex justify-center items-center" onclick={() => handleDeleteCard($selectedCard.id)}>
                    <!-- {$isLoading.CardRemove[$selectedCard.id] ? 'Deleting...' : 'Delete Card'} -->
                    {#if $isLoading.CardRemove[$selectedCard.id]}
                        <Icon icon="mingcute:loading-fill" class="text-xl animate-spin" />
                    {:else}
                        Delete Card
                    {/if}
                </button>
                <button class="bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer h-[40px] w-[72px] font-semibold rounded-md"  onclick={() => $isEdit=!$isEdit}>
                    {$isEdit ? 'Back' : 'Edit'}
                </button>
                {#if $selectedCard.deadline && !$isEdit}
                    <div transition:fly={{ x: -4, duration: 150, opacity: 0 }}>
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
    </section>
{/if}