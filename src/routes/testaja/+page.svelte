<script lang="ts">
	import { pushError } from '$lib/stores/errorNotification';
	import { isLoading } from '$lib/stores/loading';
	import { activeColumnId, showAddCardModal } from '$lib/stores/uiStore.js';
	import Icon from '@iconify/svelte';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { quadOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';

	let { data } = $props();
	let { board, userRole } = data;

	/** ---------------------------------------------
	 * TYPES
	 * --------------------------------------------- */
	type Card = {
		id: number;
		title: string;
		description: string;
		deadline: string;
		priority: number;
		column_id: number;
	};

	type Column = {
		id: number;
		name: string;
		cards: Card[];
	};
	
	let localBoard = $state(board);
	let dragDisabled = $state(true);
	const flipDurationMs = 200;

	// 🔹 DND untuk seluruh kolom
	function handleColumnConsider(event: CustomEvent) {
		const newColumns = event.detail.items;
		localBoard.columns = newColumns;
	}

	function handleColumnFinalize(event: CustomEvent) {
		const newColumns = event.detail.items;
		localBoard.columns = newColumns;
		dragDisabled = true;
	}

	// 🔹 DND untuk kartu di dalam kolom tertentu
	function handleCardConsider(event: CustomEvent, columnId: number) {
		const newCards = event.detail.items;
		localBoard.columns = localBoard.columns.map((col) =>
			col.id === columnId ? { ...col, cards: newCards } : col
		);
	}

	function handleCardFinalize(event: CustomEvent, columnId: number) {
		const newCards = event.detail.items;
		localBoard.columns = localBoard.columns.map((col) =>
			col.id === columnId ? { ...col, cards: newCards } : col
		);
		dragDisabled = true;
	}

	function startDrag() {
		dragDisabled = false;
	}
	function stopDrag() {
		dragDisabled = true;
	}

	
	let newCardTitle = $state('');
	let newCardDescription = $state('');
	let newCardDeadline = $state('');
	let newCardPriority = $state<number | null>(null);
	let deadlineAddCard = $state<string | null>(null);

	// =====================================================================================================
	//
	//		MODAL FUNCTION			MODAL FUNCTION			MODAL FUNCTION			MODAL FUNCTION
	// 
	// =====================================================================================================
	function openAddCardModal(columnId: number) {
		$activeColumnId = columnId;
		$showAddCardModal = true;
		console.log({activeColumnId}, {showAddCardModal})
	}

	

	// =====================================================================================================
	//
	//		CRUD FUNCTION			CRUD FUNCTION			CRUD FUNCTION			CRUD FUNCTION
	// 
	// =====================================================================================================
	
	// ADD CARD
	async function handleAddCard() {
		if (!newCardTitle || !$activeColumnId || !board) return;

		isLoading.start("CardEdit");
		try {
			const response = await fetch('/api/boards/cards', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: newCardTitle,
					column_id: $activeColumnId,
					description: newCardDescription,
					deadline: newCardDeadline || null,
					priority: newCardPriority
				})
			});

			if (!response.ok) {
				const data = await response.json().catch(() => ({}));
				pushError(response.status, data.message || 'Failed to add card.');
				isLoading.stop("CardEdit");
				return;
			}

			const { success, card } = await response.json();
			if (success && card) {
				const columnIndex = board.columns.findIndex((c) => c.id === $activeColumnId);
				if (columnIndex !== -1) {
					board.columns[columnIndex].cards = [...board.columns[columnIndex].cards, card];
				}

				// Reset form
				newCardTitle = '';
				newCardDescription = '';
				newCardDeadline = '';
				newCardPriority = null;

				// Tutup modal
				$showAddCardModal = false;
				isLoading.stop("CardEdit");
			} else {
				isLoading.stop("CardEdit");
				pushError(400, 'Something went wrong while adding the card.');
			}
		} catch (err) {
			isLoading.stop("CardEdit");
			console.error('Error creating card:', err);
			pushError(500, 'Unexpected error while adding card.');
		}
	}

</script>


<!--  	
		========================================================================================================
				BOARD		BOARD		BOARD		BOARD		BOARD		BOARD		BOARD		BOARD
		========================================================================================================
-->		
<section class="flex flex-col gap-4 p-2">
	<h1 class="text-xl font-semibold">{localBoard.name}</h1>
	{#if localBoard?.columns?.length}
		<!--  	
				========================================================================================================
						COLUMNS		COLUMNS		COLUMNS		COLUMNS		COLUMNS		COLUMNS		COLUMNS		COLUMNS
				========================================================================================================
		-->		
		<div
			use:dndzone={{
				items: localBoard.columns,
				type: 'columns', 
				dragDisabled,
				flipDurationMs,
				transformDraggedElement: (el) => {
					el.style.opacity = "0.6";
					el.style.outline = '2px dashed #3b82f6';
					el.style.backgroundColor = 'rgba(147,197,253,0.2)';
					el.style.borderRadius = '0.5rem';
				},
				dropTargetStyle: {
					outline: '2px dashed #3b82f6',
					backgroundColor: 'rgba(147,197,253,0.2)',
					borderRadius: '0.5rem',
					minHeight: '2.5rem',
				}
			}}
			onconsider={handleColumnConsider}
			onfinalize={handleColumnFinalize}
			class="flex flex-col gap-4 overflow-x-auto p-2"
		>
			{#each localBoard.columns as column (column.id)}
				<div
					class="p-2 border border-gray-300 rounded-xl bg-white w-full max-w-128 min-w-64 flex-shrink-0 min-h-32"
					animate:flip={{ duration: flipDurationMs }}
				>
					<div class="flex justify-between items-center mb-2 ml-1">
						<!-- NAME -->
						<div class="pl-1 py-2 flex space-x-2">
							<div class="">
								<div class="h-3 w-3 mt-2 rounded-full {column.state === 1 ? 'bg-gray-500' : column.state === 2 ? 'bg-sky-500' : column.state === 3 ? 'bg-emerald-500' : ''}"></div>
							</div>
							<div>
								<h2 class="text-xl font-bold font-outfit">{column.name}</h2>
								<p class="font-semibold opacity-50 text-xs">Subtitle di bawah main title</p>
							</div>
						</div>

						<div class="flex space-x-2">
							<!-- ADD CARD -->
							<button onclick={() => openAddCardModal(column.id)} class="min-h-6 min-w-6 flex opacity-40 justify-center items-center text-2xl rounded cursor-grab touch-none">
								<Icon icon="mingcute:add-fill" />
							</button>

							<!-- HANDLE -->
							<button tabindex="-1" onclick={(e) => e.stopPropagation()} 
								class="min-h-6 min-w-6 px-1 flex opacity-40 justify-center items-center text-3xl rounded cursor-grab touch-none"
								onpointerdown={startDrag}
								onpointerup={stopDrag}
							>
								<Icon icon="mingcute:dots-fill" />
							</button>
						</div>
					</div>



					<!--  	
							========================================================================================================
									CARDS		CARDS		CARDS		CARDS		CARDS		CARDS		CARDS		CARDS
							========================================================================================================
					-->		
					<div
						use:dndzone={{
							items: column.cards,
							type: `cards`,
							dragDisabled,
							flipDurationMs,
							transformDraggedElement: (el) => {
								el.style.opacity = "0.6";
							},
							dropTargetStyle: {
								outline: '2px dashed #3b82f6',
								backgroundColor: 'rgba(147,197,253,0.2)',
								borderRadius: '0.5rem',
								minHeight: '8rem',
							}
						}}
						onconsider={(e) => handleCardConsider(e, column.id)}
						onfinalize={(e) => handleCardFinalize(e, column.id)}
						class="flex flex-col gap-2 min-h-32 max-h-106 overflow-y-auto rounded-md overflow-hidden 
						{column.cards.length ? '' : 'flex justify-center items-center'}"
					>	
						{#if column.cards.length }
							{#each column.cards as card (card.id)}
								<div
									class="p-2 bg-gray-100 rounded-md 	w-full cursor-pointer"
									animate:flip={{ duration: flipDurationMs }}
								>
									<div class="flex justify-between">
										<div class="space-x-2 flex items-center">
											{#if card.priority}
												<div class="rounded-full text-[10px] font-semibold flex justify-center items-center h-[20px] px-2 whitespace-nowrap
												{card.priority === 5 ? 'bg-red-200 text-red-800' : 
												card.priority === 4 ? 'bg-orange-200 text-orange-800' : 
												card.priority === 3 ? 'bg-yellow-200 text-yellow-800' : 
												card.priority === 2 ? 'bg-lime-200 text-lime-800' : 
												'bg-green-200 text-green-800'}">
													{
													card.priority === 5 ? 'Urgent' : 
													card.priority === 4 ? 'Priority' :  
													card.priority === 3 ? 'Regular' :  
													card.priority === 2 ? 'Optional ' : 'Later'}
												</div> 
											{/if}
											<div class="line-clamp-1 font-semibold text-sm flex items-center justify-center">
												<p class="line-clamp-1">{card.title}</p>
											</div>
										</div>
										<button tabindex="-1" onclick={(e) => e.stopPropagation()}
											class="min-h-6 min-w-6 flex opacity-70 justify-center items-center text-xl rounded cursor-grab touch-none"
											onpointerdown={startDrag}
											onpointerup={stopDrag}
										>
											<Icon icon="mingcute:dots-fill" />
										</button>
									</div>

									{#if card.description}
										<p class="line-clamp-2 text-slate-600 whitespace-pre-wrap my-3 pl-2 pr-3">{card.description}</p>
									{/if}

									<!-- Bottom Utility -->
									{#if card.deadline}
										<div class="flex items-center space-x-2 mt-2">
											<span class="flex items-center gap-1 text-xs font-semibold w-min whitespace-nowrap
											{new Date(card.deadline) < new Date() && card.deadline && card.column_state !== 3 ? 'text-red-500 border-b-1' : 'text-slate-600'}">
												<Icon icon="solar:calendar-outline" class="text-sm" />
												{new Date(card.deadline).toLocaleDateString('id-ID', {
													day: '2-digit',
													month: 'short',
													year: 'numeric'
												})}
											</span>
											{#if new Date(card.deadline) < new Date() && card.deadline && card.column_state !== 3}
												<div class="relative flex justify-center items-center">
													<span class="absolute inline-flex h-4 w-4 animate-ping aspect-square rounded-full bg-red-500 opacity-75"></span>
													<span class="relative inline-flex size-3 rounded-full bg-red-500"></span>
												</div>
											{/if}
										</div>
									{/if}
								</div>
							{/each}
						{:else}
							<div class="font-semibold opacity-50 uppercase tracking-wide w-full text-center">
								No Tasks
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="p-2">
			<button class="p-2 m1 border border-gray-300 rounded-xl bg-white w-full max-w-128 min-w-64 flex-shrink-0 min-h-32 flex justify-center items-center font-semibold tracking-wide uppercase">
				<div class="flex opacity-50"><Icon icon="mingcute:add-line" class="text-xl mr-2" /> add state</div>
			</button>
		</div>
	{/if}
</section>

{#if $showAddCardModal}
	<section transition:fade={{duration: 300, easing: quadOut}} class="bgbackdrop flex justify-center items-center p-4 hiddenpiece">
		<form transition:fly={{y: 50}} onsubmit={handleAddCard} class="bg-white min-w-84 min-h-84 rounded-xl flex-col flex justify-between p-3">
			<div class="">
				<div class="flex justify-between mb-3">
					<h3 class="font-semibold text-lg">Add Card</h3>
					<button type="button" onclick={() => $showAddCardModal = !$showAddCardModal} class="text-xl aspect-square w-7 rounded-full flex justify-center items-center">
						<Icon icon="mingcute:close-fill"/>
					</button>
				</div>
				<div class="mb-2">
					<label for="card-title">Card Title</label>
					<input id="card-title" type="text" bind:value={newCardTitle} required class="w-full border rounded-md border-gray-300 p-2" />
				</div>
				<div class="mb-2">
					<label for="card-desc">Description</label>
					<textarea id="card-desc" bind:value={newCardDescription} rows="10" class="w-full border rounded-md border-gray-300 p-2 resize-none"></textarea>
				</div>
			</div>
			<div>
				<div class="flex justify-between space-x-2 w-full">
					<div class="flex-1">
						<div class="flex justify-between"><div>Deadline</div></div>
						<div class="flex justify-center items-center">
							<input type="date" 
							bind:value={newCardDeadline	}
							class="w-full max-w-[130px] h-[36px] rounded-s-md p-2 font-semibold cursor-pointer border border-gray-300 border-e-0" />
							<button type="button" class="cursor-pointer border border-gray-300 border-s-0 text-gray-800 hover:bg-gray-300 aspect-square h-[36px] rounded-e-lg flex justify-center items-center" onclick={() => {newCardDeadline	 = null;}}>
								<Icon icon="mingcute:delete-back-line" class="text-xl" />
							</button>
						</div>
					</div>
					<div class="flex-1">
						<div>Priority</div>
						<div class="flex">
							<div class="w-full rounded-s-md">
								<select bind:value={newCardPriority} class="w-full p-2 cursor-pointer font-semibold h-[36px] border border-gray-300 border-e-0 pr-2 rounded-s-lg">
									<option class="bg-white text-black" value={1}>1 | Later</option>
									<option class="bg-white text-black" value={2}>2 | Optional</option>
									<option class="bg-white text-black" value={3}>3 | Regular</option>
									<option class="bg-white text-black" value={4}>4 | Priority</option>
									<option class="bg-white text-black" value={5}>5 | Urgent</option>
								</select>
							</div>
							<button type="button" class="cursor-pointer text-gray-800 hover:bg-gray-300 aspect-square h-[36px] border border-gray-300 border-s-0 rounded-e-lg flex justify-center items-center" onclick={() => {newCardPriority = null;}}>
								<Icon icon="mingcute:delete-back-line" class="text-xl" />
							</button>
						</div>
					</div>
				</div>
				<div class="flex justify-between mt-2">
					<button type="submit" class="bg-sky-500 text-white hover:bg-sky-400 disabled:bg-sky-400 cursor-pointer h-[40px] w-full font-semibold rounded-md">
						Add Card
					</button>
				</div>
			</div>
		</form>
	</section>
{/if}

<style>
	section {
		min-height: 100vh;
		background: #f8fafc;
	}
</style>
