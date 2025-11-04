<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { autosize } from '$lib/actions/autosize.js';
	import DashboardNav from '$lib/island/dashboardNav.svelte';
	import { isConfirm } from '$lib/stores/confirmStore.js';
	import { pushError } from '$lib/stores/errorNotification';
	import { isLoading } from '$lib/stores/loading';
	import { showAddCardModal, activeColumnId, showEditCardModal, selectedCard, isEdit, selectedCardWithFormat, showAddColumnModal, showEditColumnModal, sidebar, sidebarIsHovered, navOpen } from "$lib/stores/uiStore";
	import Icon from '@iconify/svelte';
	import { onDestroy, onMount } from 'svelte';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { quadOut } from 'svelte/easing';
	import { preventDefault } from 'svelte/legacy';
	import { fade, fly } from 'svelte/transition';

	let { data } = $props();
	let { board, userRole } = data;

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

	// =====================================================================================================
	//
	//		KANVBAN FUNCT			KANVBAN FUNCT			KANVBAN FUNCT			KANVBAN FUNCT
	// 
	// =====================================================================================================
	
	let localBoard = $state(board);
	let dragDisabled = $state(true);
	const flipDurationMs = 200;
	
	function handleColumnConsider(event: CustomEvent) {
		const newColumns = event.detail.items;
		localBoard.columns = newColumns;
	}

	async function handleColumnFinalize(event: CustomEvent) {
		const newColumns = event.detail.items;
		localBoard.columns = newColumns;
		dragDisabled = true;

		// Update ke server
		try {
			const columnIds = newColumns.map((c) => c.id);

			const response = await fetch("/api/boards/columns/move", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ items: columnIds }),
			});

			if (!response.ok) {
				const data = await response.json().catch(() => ({}));
				pushError(response.status, data.message || "Failed to move columns.");
			}
		} catch (err) {
			pushError(0, "Network error occurred.");
		}
	}

	// simpan kolom asal saat drag dimulai
	let activeColumnIdCard: number | null = null;

	function handleCardConsider(event: CustomEvent, columnId: number) {
		const newCards = event.detail.items;

		// Simpan kolom asal sementara
		activeColumnIdCard = columnId;

		// Update posisi card (preview)
		localBoard.columns = localBoard.columns.map((col) =>
			col.id === columnId ? { ...col, cards: newCards } : col
		);
	}

	async function handleCardFinalize(event: CustomEvent, newColumnId: number) {
		const newCards = event.detail.items;
		const info = event.detail.info;
		const cardId = info?.id;

		if (!cardId) return;

		// Ambil kolom asal dari handleCardConsider
		const oldColumnId = activeColumnIdCard;
		activeColumnIdCard = null; // reset setelah dipakai

		if (!oldColumnId) {
			// pushError(400, "Could not determine source column for card move.");
			return;
		}

		// Update state lokal (optimistic UI)
		localBoard.columns = localBoard.columns.map((col) =>
			col.id === newColumnId ? { ...col, cards: newCards } : col
		);

		// Ambil referensi kolom baru dan lama untuk sync ke server
		const newColumn = localBoard.columns.find((c) => c.id === newColumnId);
		const oldColumn = localBoard.columns.find((c) => c.id === oldColumnId);

		if (!newColumn || !oldColumn) {
			pushError(400, "Invalid column data for card move.");
			return;
		}

		try {
			const payload = {
				card_id: cardId,
				new_column_id: newColumnId,
				items_in_new_column: newColumn.cards.map((c) => c.id),
				items_in_old_column: oldColumn.cards.map((c) => c.id),
			};

			const response = await fetch("/api/boards/cards/move", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const data = await response.json().catch(() => ({}));
				pushError(response.status, data.message || "Failed to move card.");
				return;
			}
		} catch {
			pushError(0, "Network error occurred.");
		}
	}

	function startDrag() {
		console.log('startdrag');
		dragDisabled = false;
	}
	function stopDrag() {
		console.log('stopdrag');
		dragDisabled = true;
	}

	function startDragCard() {
		console.log('startdrag');
		dragDisabled = false;

		// tambahkan listener global sementara
		window.addEventListener('pointerup', handleGlobalPointerUp);
	}

	function handleGlobalPointerUp() {
		console.log('stopdrag (global)');
		dragDisabled = true;

		// hapus listener setelah dipakai
		window.removeEventListener('pointerup', handleGlobalPointerUp);
	}


	// =====================================================================================================
	//
	//		MENU FUNCTION			MENU FUNCTION			MENU FUNCTION			MENU FUNCTION
	// 
	// =====================================================================================================
	const showMenu = $state({
		column: false,
		card: false,
		close() {
			this.column = false;
			this.card = false;
		}
	});

	afterNavigate(() => {
		showMenu.close();
	});

	$effect(() => {
		if ($sidebarIsHovered) {
			showMenu.close();
		} else {
			showMenu.close();
		}
		if ($navOpen) {
			showMenu.close();
		} else {
			showMenu.close();
		}
	});

	let pos = $state({ x: 0, y: 0 })
	let currentColumnId: number | null = $state(null);
	let currentCardId: number | null = $state(null);
	let currentColumnName: string | null = $state(null);
	let currentCardName: string | null = $state(null);

	function columnRightClick(e: MouseEvent, columnId: number, columnName: string, columnState: number, columnSubtext: string) {
		if (userRole < 3) return
		showMenu.close()
		e.preventDefault();
		e.stopPropagation();

		currentColumnId = columnId
		currentColumnName = columnName
		newColumnName = columnName
		newColumnState = columnState
		newColumnSubtext = columnSubtext
		// console.log('Right click column:', columnId);

		pos = { x: e.clientX, y: e.clientY };
		showMenu.column = true;
		e.preventDefault();
		e.stopPropagation();
	}

	function cardRightClick(e: MouseEvent, card: any) {
		if (userRole < 2) return
		console.log("clicked")
		showMenu.close()
		e.preventDefault();
		e.stopPropagation();

		$selectedCard = { ...card };
		currentCardId = card.id
		currentCardName = card.title
		
		pos = { x: e.clientX, y: e.clientY };
		showMenu.card = true;

		// console.log('Right click card:', card.id);
	}

	function closeMenu() {
		showMenu.close();
	}

	

	// =====================================================================================================
	//
	//		MODAL FUNCTION			MODAL FUNCTION			MODAL FUNCTION			MODAL FUNCTION
	// 
	// =====================================================================================================
	function openAddCardModal(columnId: number) {
		showMenu.close();
		$activeColumnId = columnId;
		$showAddCardModal = true;
		console.log({activeColumnId}, {showAddCardModal})
	}
	function openEditCardModal(card: Card) {
		showMenu.close();
		$selectedCard = { ...card };
		$showEditCardModal = true;
		$isEdit = false
	}
	function openAddColumnModal() {
		showMenu.close();
		$showAddColumnModal = !$showAddColumnModal
		newColumnName = ''
		newColumnSubtext = ''
		newColumnState = 1
	}

	

	// =====================================================================================================
	//
	//		CRUD FUNCTION			CRUD FUNCTION			CRUD FUNCTION			CRUD FUNCTION
	// 
	// =====================================================================================================

	let newCardTitle = $state('');
	let newCardDescription = $state('');
	let newCardDeadline: string | null = $state('');
	let newCardPriority = $state<number | null>(null);
	
	// CREATE CARD
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
				// Cari kolom target
				const columnIndex = board.columns.findIndex((c) => c.id === $activeColumnId);
				if (columnIndex !== -1) {
					// Update localBoard (UI state)
					localBoard.columns = localBoard.columns.map((col) =>
						col.id === $activeColumnId
							? { ...col, cards: [...col.cards, card] }
							: col
					);
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

	// EDIT CARD
	async function handleUpdateCard() {
		if (!$selectedCard) return;
		if (!$selectedCard.title || $selectedCard.title.trim() === "") { $selectedCard.title = "Judul"; }

		isLoading.start("CardEdit", $selectedCard.id);

		try {
			const response = await fetch("/api/boards/cards", {
				method: "PUT",
				body: JSON.stringify($selectedCard),
			});

			if (response.ok) {
				localBoard.columns = localBoard.columns.map((col) => ({
					...col,
					cards: col.cards.map((c) =>
						c.id === $selectedCard.id ? $selectedCard : c
					),
				}));
			} else {
				const data = await response.json().catch(() => ({}));
				pushError(response.status, data.message || 'Failed to update card.');
			}
		} catch (err) {
			console.error('Error updating card:', err);
			pushError(500, 'Unexpected error while updating card.');
			isLoading.stop("CardEdit", $selectedCard.id);
		} finally {
			$showEditCardModal = false;
			isLoading.stop("CardEdit", $selectedCard.id);
		}
	}

	// DELTE CARD
	async function handleDeleteCard(cardId: number) {
		showMenu.close()
		if (!board) return;
		if (!(await isConfirm(`Are you sure you want to delete ${currentCardName ? `"${currentCardName}"` : 'this card'}?`))) return;
		// if (!confirm("Are you sure you want to delete this card?")) return;

		isLoading.start("CardRemove", cardId);

		try {
			const response = await fetch("/api/boards/cards", {
				method: "DELETE",
				body: JSON.stringify({ id: cardId }),
			});

			if (response.ok) {
				localBoard.columns = localBoard.columns.map((col) => ({
					...col,
					cards: col.cards.filter((c) => c.id !== cardId),
				}));
			} else {
				const data = await response.json().catch(() => ({}));
				pushError(response.status, data.message || 'Failed to delete card.');
			}
		} catch (err) {
			console.error('Error deleting card:', err);
			pushError(500, 'Unexpected error while deleting card.');
			isLoading.stop("CardRemove", cardId);
		} finally {
			$showEditCardModal = false;
			isLoading.stop("CardRemove", cardId);
		}
	}

	

	// =====================================================================================================
	//
	//		COLUMN FUNCTION			COLUMN FUNCTION			COLUMN FUNCTION			COLUMN FUNCTION
	// 
	// =====================================================================================================

	let newColumnName = $state('');
	let newColumnSubtext = $state('');
	let newColumnState = $state(1);
	
	// ADD COLUMN
	async function handleAddColumn() {
		if (!localBoard || !newColumnName) return;
		isLoading.start('BoardAdd')

		const response = await fetch('/api/boards/columns', {
			method: 'POST',
			body: JSON.stringify({ name: newColumnName, board_id: board.id, subtext: newColumnSubtext, state: newColumnState })
		});

		if (response.ok) {
			const result = await response.json();
			const newColumn = result.column; // Ambil langsung object kolom-nya

			const updatedColumns = [...localBoard.columns, newColumn];
			updatedColumns.sort((a, b) => a.state - b.state || a.position - b.position);
			localBoard.columns = updatedColumns;

			newColumnName = '';
			newColumnSubtext = '';
			$showAddColumnModal = false;
			isLoading.stop('BoardAdd')
		} else {
			const result = await response.json();
			pushError(result.error, result.message);
			isLoading.stop('BoardAdd')
		}
	}

	// DELETE COLUMN
	async function handleDeleteColumn(columnId: number) {
		showMenu.close()
		if (!(await isConfirm(`Are you sure you want to delete ${currentColumnName ? `"${currentColumnName}"` : 'this column'}?`))) return;

		isLoading.start('ColumnRemove')
		
		try {
			const response = await fetch('/api/boards/columns', {
				method: 'DELETE',
				body: JSON.stringify({ column_id: columnId }),
			});

			if (!response.ok) {
				const result = await response.json();
				pushError(result.error, result.message);
				isLoading.stop('ColumnRemove')
				showMenu.close();
			}

			localBoard.columns = localBoard.columns.filter((col) => col.id !== columnId);
			isLoading.stop('ColumnRemove');
			showMenu.close();

		} catch (err) {
			pushError(500, 'Unexpected error while adding card.');
			isLoading.stop('ColumnRemove')
			showMenu.close();
		}
	}
	
	// EDIT COLUMN
	async function handleEditColumn(e: Event) {
		columnEditName = false
		columnEditSubtext = false
		e.preventDefault?.();
		if (!localBoard || !currentColumnId) return;
		isLoading.start('BoardEdit');

		try {
			const payload = {
				column_id: currentColumnId,
				name: newColumnName,
				subtext: newColumnSubtext,
				state: Number(newColumnState)
			};

			const response = await fetch('/api/boards/columns', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const result = await response.json();
			if (!response.ok) {
				pushError(result.error || 'server', result.message || 'Failed to update column');
				isLoading.stop('BoardEdit');
				return;
			}

			// update local board
			const updatedColumns = localBoard.columns.map((col) =>
				col.id === currentColumnId ? { ...col, ...payload } : col
			);


			// DI DISABLE SEMENTARA KARENA SORT TERLALU RUMIT, DAN DEADLINE DI DEPAN MATA
			// updatedColumns.sort((a, b) => a.state - b.state || a.position - b.position);


			localBoard.columns = updatedColumns;

			$showEditColumnModal = false;
		} catch (err: any) {
			pushError(500, 'Unexpected error while adding card.');
		} finally {
			isLoading.stop('BoardEdit');
		}
	}

	// =====================================================================================================
	//
	//		HELPER FUNCTION			HELPER FUNCTION			HELPER FUNCTION			HELPER FUNCTION
	// 
	// =====================================================================================================
	
	let columnEditName = $state(false)
	let columnEditSubtext = $state(false)

	function handleTextareaKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleUpdateCard();
		}
	}
	onMount(() => {
		function handleScroll() {
			if (showMenu.column) showMenu.close();
		}

		// Dengarkan semua scroll dari seluruh dokumen (termasuk nested div)
		document.addEventListener('scroll', handleScroll, { capture: true });

		onDestroy(() => {
			document.removeEventListener('scroll', handleScroll, { capture: true });
		});
	});
	
	let isTablet = $state(false);
	let isPortrait = $state(true);
	let statusPerm = $state(true);

	function checkWidth() {
		isTablet = window.matchMedia("(min-width: 700px)").matches;
		isPortrait = window.matchMedia("(orientation: portrait)").matches;
	}

	onMount(() => {
		checkWidth();
		window.addEventListener("resize", checkWidth);
		window.addEventListener("orientationchange", checkWidth);
		return () => {
			window.removeEventListener("resize", checkWidth);
			window.removeEventListener("orientationchange", checkWidth);
		};
	});

	$effect(() => {
		localBoard = data.board;
		userRole = data.userRole;
	});
</script>


<main class="flex dashboard">
	<!-- <div class="fixed bg-red-500 right-0">{userRole}</div> -->
	 
	{#if localBoard.owner_username !== data.profile?.username && statusPerm}
		<div class="fixed w-full flex justify-center z-30 px-2 text-xs tablet:text-sm">
			<div class="bg-gray-100 ring-1 ring-gray-300 rounded-lg mt-17 tablet:mt-4 flex z-10 gap-4 max-w-[300px] phone:max-w-[500px]">
				<div class="pl-4 py-3">Currenly on <b>@{board.owner_username}</b> boards. With <b>{data.userRole === 3 ? 'Manager' : data.userRole === 2 ? 'Editor' : 'Viewer'}</b> Permissions.</div>
				<button onclick={() => statusPerm = false} class="p-3 aspect-square rounded-full cursor-pointer hover:rotate-90 duration-500 ease-out">
					<Icon icon="mingcute:close-fill" class="text-lg"/>
				</button>
			</div>
		</div>	
	{/if}
	<DashboardNav data={data}/>
	<section class="boards w-full flex-1 overflow-hidden flex flex-col relative justify-center {!isPortrait || isTablet ? 'pl-2' : 'pt-16'}">
		{#if localBoard.owner_username !== data.profile?.username}
			<div class="h-16 phone:h-8"></div>
		{/if}
		<div class="flex space-x-2 pl-8 pt-8 pb-2 w-full">
			<!-- <button onclick={() => openAddColumnModal()}
			class="bg-sky-500 text-white hover:bg-sky-400 disabled:bg-sky-400 cursor-pointer h-[40px] font-semibold rounded-md px-3">
				<div class="flex justify-center items-center space-x-2"><Icon icon="mingcute:add-fill"/><div>Add Column</div></div>
			</button> -->
			<h2 class="agerrh2">{localBoard.name}</h2>
		</div>
		<div class="pb-6 min-h-[500px]">
			<!--  	
					========================================================================================================
							BOARD		BOARD		BOARD		BOARD		BOARD		BOARD		BOARD		BOARD
					========================================================================================================
			-->		
			<section onclick={closeMenu} tabindex="-1" role="button" onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') closeMenu(); }} class="flex flex-col justify-center items-center tablet:items-start gap-4 p-2 tablet:pr-4">
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
							transformDraggedElement: (el) => {el.style.opacity = "0.6";},
							dropTargetStyle: {
								outline: '2px dashed #3b82f6',
								backgroundColor: 'rgba(147,197,253,0.2)',
								borderRadius: '0.5rem',
								minHeight: '2.5rem',
							}
						}}
						onconsider={handleColumnConsider}
						onfinalize={handleColumnFinalize}
						class="flex flex-col tablet:flex-row gap-4 overflow-x-auto p-2 w-full min-h-[500px] max-tablet:max-w-[500px]"
					>
						{#each localBoard.columns as column (column.id)}
						<div animate:flip={{ duration: flipDurationMs }}>
							<div oncontextmenu={(e) => columnRightClick(e, column.id, column.name, column.state, column.subtext)} onclick={closeMenu} tabindex="-1" role="button" onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') closeMenu(); }} class="p-2 border border-gray-300 rounded-xl bg-white w-full max-w-128 min-w-64 tablet:w-[350px] min-h-32">
								<div class="flex justify-between items-center mb-2 ml-1">
									<!-- NAME -->
									<div class="pl-1 py-2 flex space-x-2 w-full text-start">
										<div class="">
											<div class="h-3 w-3 mt-2 rounded-full {column.state === 1 ? 'bg-gray-500' : column.state === 2 ? 'bg-sky-500' : column.state === 3 ? 'bg-emerald-500' : ''}"></div>
										</div>
										<!-- <pre>{JSON.stringify(column, null, 2)}</pre> -->
										{#if userRole >= 3}
											<div class="flex flex-col text-start w-full [&>*]:transition-none [&>*]:duration-0">
												{#if columnEditName && currentColumnId === column.id}
													<form onsubmit={handleEditColumn}>
														<input maxlength="22" type="text" bind:value={newColumnName} class="text-xl font-bold font-outfit select-none cursor-text line-clamp-1 text-start max-w-[230px]" autofocus/>
													</form>
												{:else}
													<button onclick={() => {columnEditName = false; columnEditName = true; currentColumnId = column.id; newColumnName = column.name; newColumnSubtext = column.subtext; newColumnState = column.state}} class="text-xl font-bold font-outfit select-none cursor-text line-clamp-1 text-start">{column.name}</button>	
												{/if}
												{#if column.subtext}
													{#if columnEditSubtext && currentColumnId === column.id}
														<form onsubmit={handleEditColumn} class="max-w-[230px]">
															<input maxlength="40" type="text" bind:value={newColumnSubtext} class="font-semibold opacity-50 text-xs select-none cursor-text line-clamp-1 text-start w-full" autofocus/>
														</form>
													{:else}
														<button onclick={() => {columnEditSubtext = false; columnEditSubtext = true; currentColumnId = column.id; newColumnName = column.name; newColumnSubtext = column.subtext; newColumnState = column.state}} class="font-semibold opacity-50 text-xs select-none cursor-text line-clamp-1 text-start">{column.subtext || 'Subtitle di bawah main title'}</button>
													{/if}
												{/if}
											</div>
										{:else}
											<div class="flex flex-col text-start w-full [&>*]:transition-none [&>*]:duration-0">
												<div class="text-xl font-bold font-outfit select-none line-clamp-1 text-start">{column.name}</div>	
												{#if column.subtext}
													<div class="font-semibold opacity-50 text-xs select-none line-clamp-1 text-start">{column.subtext || 'Subtitle di bawah main title'}</div>
												{/if}
											</div>
										{/if}
									</div>
			
									<div class="flex [&>*]:transition-none [&>*]:duration-0">
										<!-- ADD CARD -->
										{#if userRole >= 2}
											<button onclick={() => openAddCardModal(column.id)} class="min-h-6 min-w-6 mr-2 flex opacity-40 justify-center items-center text-2xl rounded cursor-pointer touch-none">
												<Icon icon="mingcute:add-fill" />
											</button>
										{/if}
			
										<!-- HANDLE -->
										{#if userRole >= 3}
											<button tabindex="-1" onclick={(e) => e.stopPropagation()} 
												class="min-h-6 min-w-6 px-1 flex opacity-40 justify-center items-center text-3xl rounded cursor-grab touch-none"
												onpointerdown={startDrag}
												onpointerup={stopDrag}
											>
												<Icon icon="mingcute:dots-fill" />
											</button>
										{/if}
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
									class="flex flex-col gap-2 min-h-32 max-h-106 overflow-y-auto tablet:max-h-full rounded-md overflow-hidden tablet:w-full [&>*]:transition-none [&>*]:duration-0
									{column.cards.length ? '' : 'flex justify-center items-center'}"
								>	
									{#if column.cards.length }
										{#each column.cards as card (card.id)}
											<div class="p-2 bg-gray-100 rounded-md w-full text-start" animate:flip={{ duration: flipDurationMs }}>
												<div class="flex justify-between">
													<button tabindex="-1" oncontextmenu={(e) => {cardRightClick(e, card)}} onclick={() => openEditCardModal(card)} class="flex items-center text-start w-full cursor-pointer">
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
														<div class="line-clamp-1 font-semibold text-sm flex items-center justify-center ml-1.5">
															<p class="line-clamp-1">{card.title}</p>
														</div>
													</button>
													{#if userRole >= 2}
														<button tabindex="-1" onclick={(e) => e.stopPropagation()}
															class="min-h-6 min-w-6 flex opacity-70 justify-center items-center text-xl rounded cursor-grab touch-none"
															onpointerdown={startDragCard}
														>
															<Icon icon="mingcute:dots-fill" />
														</button>
													{/if}
												</div>
												<button tabindex="-1" oncontextmenu={(e) => {cardRightClick(e, card)}} onclick={() => openEditCardModal(card)} class="text-start w-full cursor-pointer">
													{#if card.description}
														<p class="line-clamp-2 text-slate-600 whitespace-pre-wrap my-3 pl-2 pr-3">{card.description}</p>
													{/if}

													<!-- Bottom Utility -->
													{#if card.deadline}
														<div class="flex items-center space-x-2 mt-2 pb-1 pl-1.5">
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
												</button>
											</div>
										{/each}
									{:else}
										<div class="font-semibold opacity-50 uppercase tracking-wide w-full text-center select-none">
											No Tasks
										</div>
									{/if}
								</div>
							</div>
						</div>
						{/each}
						{#if userRole >= 3}
							<button onclick={() => openAddColumnModal()} class="p-2 border border-gray-300 rounded-xl bg-white w-full max-w-128 min-w-64 tablet:w-[350px] min-h-32 h-min flex justify-center items-center font-semibold tracking-wide uppercase cursor-pointer hover:bg-gray-200">
								<div class="flex items-center justify-center opacity-50"><Icon icon="mingcute:add-fill" class="text-base mr-2 select-none" /> add state</div>
							</button>
						{/if}
					</div>
				{:else}						
					{#if userRole >= 3}
						<div class="p-2">
							<button onclick={() => openAddColumnModal()} class="p-2 m1 border border-gray-300 rounded-xl bg-white w-full max-w-128 min-w-64 flex-shrink-0 min-h-32 flex justify-center items-center font-semibold tracking-wide uppercase cursor-pointer hover:bg-gray-200">
								<div class="flex items-center justify-center opacity-50"><Icon icon="mingcute:add-fill" class="text-base mr-2 select-none" /> add state</div>
							</button>
						</div>
					{:else}
						<div class="p-2">
							<div class="p-2 m1 border border-gray-300 rounded-xl bg-white w-full max-w-128 min-w-64 flex-shrink-0 min-h-32 flex justify-center items-center font-semibold tracking-wide uppercase cursor-pointer hover:bg-gray-200">
								<div class="flex items-center justify-center opacity-50"><Icon icon="mingcute:empty-box-fill" class="text-base mr-2 select-none" /> No State</div>
							</div>
						</div>
					{/if}

				{/if}
			</section>
		</div>
	</section>
</main>


		

<!-- 
	====================================================================================================
		COLUMN CONTEXMENU		COLUMN CONTEXMENU		COLUMN CONTEXMENU		COLUMN CONTEXMENU
	====================================================================================================
-->				
{#if showMenu.column}
	<div
		class="fixed z-50 p-2 border border-gray-300 rounded-xl bg-white w-40 drop-shadow-lg"
		style="top:{pos.y}px; left:{pos.x}px;"
	>
		<button onclick={() => {$showEditColumnModal = !$showEditColumnModal; showMenu.column = !showMenu.column}} class="block w-full text-left px-4 py-2 hover:bg-gray-200 cursor-pointer rounded-md">Edit</button>
		<button onclick={() => handleDeleteColumn(currentColumnId)} class="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer rounded-md">Delete</button>
	</div>
{/if}

<!-- 
	====================================================================================================
		CARD CONTEXMENU		CARD CONTEXMENU		CARD CONTEXMENU		CARD CONTEXMENU
	====================================================================================================
-->				
{#if showMenu.card}
	<div
		class="fixed z-50 p-2 border border-gray-300 rounded-xl bg-white w-40 drop-shadow-lg"
		style="top:{pos.y}px; left:{pos.x}px;"
	>
		<button onclick={() => {$showEditCardModal = !$showEditCardModal; showMenu.card = !showMenu.card}} class="block w-full text-left px-4 py-2 hover:bg-gray-200 cursor-pointer rounded-md">Edit</button>
		<button onclick={() => handleDeleteCard(currentCardId)} class="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer rounded-md">Delete</button>
	</div>
{/if}

<!-- 
	====================================================================================================
		COLUMN ADD MODAL		COLUMN ADD MODAL		COLUMN ADD MODAL		COLUMN ADD MODAL
	====================================================================================================
-->
{#if $showAddColumnModal}
	<section onclick={() => $showAddColumnModal=!$showAddColumnModal} transition:fade={{duration: 200, easing: quadOut}} class="bgbackdrop flex justify-center items-center p-4 hiddenpiece">
		<form onclick={(e) => e.preventDefault()}  transition:fly={{duration: 200,y: 50}} onsubmit={handleAddColumn} class="bg-white min-w-84 min-h-84 w-full max-w-96 rounded-xl flex-col flex justify-between p-3">
			<div class="">
				<div class="flex justify-between mb-3">
					<h3 class="font-semibold text-lg">Add Column</h3>
					<button type="button" onclick={() => $showAddColumnModal = !$showAddColumnModal} class="text-xl aspect-square w-7 rounded-full flex justify-center items-center cursor-pointer">
						<Icon icon="mingcute:close-fill"/>
					</button>
				</div>
				<div class="mb-2">
					<label for="column-title">Title</label>
					<input id="column-title" type="text" bind:value={newColumnName} maxlength="25" required class="w-full border rounded-md border-gray-300 p-2" />
				</div>
				<div class="mb-2">
					<label for="column-subtitle">Subtext</label>
					<input id="column-subtitle" type="text" bind:value={newColumnSubtext} maxlength="40" class="w-full border rounded-md border-gray-300 p-2" />
				</div>
				<div class="mb-2">
					<div>State</div>
					<select id="column-state" bind:value={newColumnState} class="w-full border rounded-md border-gray-300 p-2">
						<option value={1}>Not Started</option>
						<option value={2}>In Progress</option>
						<option value={3}>Finished</option>
					</select>
				</div>
			</div>
			<div class="flex justify-between mt-2">
				<button type="submit" class="bg-sky-500 text-white hover:bg-sky-400 disabled:bg-sky-400 cursor-pointer h-[40px] w-full font-semibold rounded-md">
					Add Column
				</button>
			</div>
		</form>
	</section>
{/if}

<!-- 
	====================================================================================================
		COLUMN EDIT MODAL		COLUMN EDIT MODAL		COLUMN EDIT MODAL		COLUMN EDIT MODAL
	====================================================================================================
-->
{#if $showEditColumnModal}
	<section onclick={() => $showEditColumnModal=!$showEditColumnModal}  transition:fade={{duration: 200, easing: quadOut}} class="bgbackdrop flex justify-center items-center p-4 hiddenpiece">
		<form onclick={(e) => e.preventDefault()}  transition:fly={{duration: 200,y: 50}} onsubmit={handleEditColumn} class="bg-white min-w-84 min-h-84 w-full max-w-96 rounded-xl flex-col flex justify-between p-3">
			<div class="">
				<div class="flex justify-between mb-3">
					<h3 class="font-semibold text-lg">Edit Column</h3>
					<button type="button" onclick={() => $showEditColumnModal = !$showEditColumnModal} class="text-xl aspect-square w-7 rounded-full flex justify-center items-center cursor-pointer">
						<Icon icon="mingcute:close-fill"/>
					</button>
				</div>
				<div class="mb-2">
					<label for="column-title">Title</label>
					<input id="column-title" type="text" bind:value={newColumnName} maxlength="25" required class="w-full border rounded-md border-gray-300 p-2" />
				</div>
				<div class="mb-2">
					<label for="column-subtext">Subtext</label>
					<input id="column-subtext" type="text" bind:value={newColumnSubtext} maxlength="40" class="w-full border rounded-md border-gray-300 p-2" />
				</div>
				<div class="mb-2">
					<div>State</div>
					<select id="column-state" bind:value={newColumnState} class="w-full border rounded-md border-gray-300 p-2">
						<option value={1}>Not Started</option>
						<option value={2}>In Progress</option>
						<option value={3}>Finished</option>
					</select>
				</div>
			</div>
			<div class="flex justify-between mt-2">
				<button type="submit" class="bg-sky-500 text-white hover:bg-sky-400 disabled:bg-sky-400 cursor-pointer h-[40px] w-full font-semibold rounded-md">
					Save
				</button>
			</div>
		</form>
	</section>
{/if}

<!-- 
	====================================================================================================
		CARD ADD MODAL			CARD ADD MODAL			CARD ADD MODAL			CARD ADD MODAL
	====================================================================================================
-->
{#if $showAddCardModal}
	<section onclick={() => $showAddCardModal=!$showAddCardModal} transition:fade={{duration: 200, easing: quadOut}} class="bgbackdrop flex justify-center items-center p-4 hiddenpiece">
		<form onclick={(e) => e.preventDefault()}  transition:fly={{duration: 200,y: 50}} onsubmit={handleAddCard} class="bg-white min-w-84 min-h-84 w-full max-w-96 rounded-xl flex-col flex justify-between p-3">
			<div class="">
				<div class="flex justify-between mb-3">
					<h3 class="font-semibold text-lg">Add Card</h3>
					<button type="button" onclick={() => $showAddCardModal = !$showAddCardModal} class="text-xl aspect-square w-7 rounded-full flex justify-center items-center cursor-pointer">
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
							<input class="w-full h-[36px] rounded-s-md p-2 font-semibold cursor-pointer border border-gray-300 border-e-0" 
							type="date" bind:value={newCardDeadline	} />
							<button type="button" class="cursor-pointer border border-gray-300 border-s-0 text-gray-800 hover:bg-gray-200 aspect-square h-[36px] rounded-e-lg flex justify-center items-center" onclick={() => {newCardDeadline	 = null;}}>
								<Icon icon="mingcute:delete-back-line" class="text-xl" />
							</button>
						</div>
					</div>
					<div class="flex-1">
						<div>Priority</div>
						<div class="flex">
							<div class="w-full rounded-s-md">
								<select bind:value={newCardPriority} class="w-full p-2 cursor-pointer font-semibold h-[36px] border border-gray-300 border-e-0 pr-2 rounded-s-lg">
									<option class="bg-white text-black" value={1}>Later</option>
									<option class="bg-white text-black" value={2}>Optional</option>
									<option class="bg-white text-black" value={3}>Regular</option>
									<option class="bg-white text-black" value={4}>Priority</option>
									<option class="bg-white text-black" value={5}>Urgent</option>
								</select>
							</div>
							<button type="button" class="cursor-pointer text-gray-800 hover:bg-gray-200 aspect-square h-[36px] border border-gray-300 border-s-0 rounded-e-lg flex justify-center items-center" onclick={() => {newCardPriority = null;}}>
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

<!-- 
	====================================================================================================
		CARD EDIT MODAL			CARD EDIT MODAL			CARD EDIT MODAL			CARD EDIT MODAL
	====================================================================================================
-->
{#if $showEditCardModal && $selectedCard?.id}
	<section onclick={() => $showEditCardModal=!$showEditCardModal} transition:fade={{duration: 200, easing: quadOut}} class="bgbackdrop flex !justify-end items-center p-4 pr-0 hiddenpiece">
        <div onclick={(e) => e.preventDefault()} class="bg-white relative p-4 rounded-s-xl min-w-[300px] w-full max-w-[500px] h-[95%]" transition:fly={{duration: 200, x: 300, easing: quadOut }} >
				
			<section class="flex justify-between w-full h-fit">
				<div class="space-x-2 flex h-[28px]">           
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
				<button onclick={() => $showEditCardModal=!$showEditCardModal} class="aspect-square rounded-full cursor-pointer hover:rotate-90 duration-500 ease-out">
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
					<div class="px-4 flex justify-between items-center">
                        <textarea bind:value={$selectedCard.title} placeholder="Judul" use:autosize rows="1" required onkeydown={handleTextareaKeydown}
                        class="text-[24px] font-outfit mb-1 tracking-wide font-semibold w-full bg-transparent border-none focus:ring-0 resize-none overflow-hidden animate-pulse-agerr hover:animate-none focus:animate-none">{$selectedCard.title}</textarea>
                    </div>
                    <textarea bind:value={$selectedCard.description} placeholder="Ketik Disini"use:autosize rows="15" 
                    class="px-4 w-full agerrp my-4 text-justify animate-pulse-agerr hover:animate-none focus:animate-none resize-none h-[80%]"></textarea>
					<div transition:fly={{ y: 12, duration: 150, opacity: 0 }} class="grid grid-cols-2 gap-2 absolute bottom-16 w-[calc(100%-32px)]">
                        <div>
                            <div class="flex justify-between"><div>Deadline</div></div>
                            <div class="flex justify-center items-center">
                                <input class="w-full h-[36px] rounded-s-md p-2 font-semibold cursor-pointer border border-gray-300 border-e-0" 
								type="date" bind:value={$selectedCardWithFormat.deadlineFormatted}/>
								<button type="button" class="cursor-pointer text-gray-800 hover:bg-gray-200 aspect-square h-[36px] border border-gray-300 border-s-0 rounded-e-lg flex justify-center items-center" onclick={() => {$selectedCard.deadline = null;}}>
									<Icon icon="mingcute:delete-back-line" class="text-xl" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <div>Priority</div>
                            <div class="flex">
                                <div class="w-full cursor-pointer font-semibold h-[36px] border border-gray-300 border-e-0 pr-2 rounded-s-lg">
                                    <select bind:value={$selectedCard.priority} class="w-full p-2 cursor-pointer font-semibold">
                                        <option class="bg-white text-black" value={1}>Later</option>
                                        <option class="bg-white text-black" value={2}>Optional</option>
                                        <option class="bg-white text-black" value={3}>Regular</option>
                                        <option class="bg-white text-black" value={4}>Priority</option>
                                        <option class="bg-white text-black" value={5}>Urgent</option>
                                    </select>
                                </div>
								<button type="button" class="cursor-pointer text-gray-800 hover:bg-gray-200 aspect-square h-[36px] border border-gray-300 border-s-0 rounded-e-lg flex justify-center items-center" onclick={() => {$selectedCard.priority = null;}}>
									<Icon icon="mingcute:delete-back-line" class="text-xl" />
								</button>
                            </div>
                        </div>
					</div>
				
                    <button transition:fly={{ y: 12, duration: 150, opacity: 0 }} disabled={$isLoading.CardEdit[$selectedCard.id]} type="submit" class="absolute bottom-4 right-4 bg-sky-500 text-white hover:bg-sky-400 disabled:bg-sky-400 cursor-pointer h-[40px] w-[96px] font-semibold rounded-md flex justify-center items-center">Save</button>
				</form>
                <div class="h-[20%]"></div>
			{/if}
            <section class="flex flex-row space-x-2 absolute bottom-4 left-4">
				{#if data.userRole >= 2}
					<button class="bg-rose-500 text-white hover:bg-rose-400 disabled:bg-rose-400 w-[116px] cursor-pointer h-[40px] font-semibold rounded-md flex justify-center items-center" onclick={() => handleDeleteCard($selectedCard.id)}>
						{#if $isLoading.CardRemove[$selectedCard.id]}
							<Icon icon="mingcute:loading-fill" class="text-xl animate-spin" />
						{:else}
							Delete Card
						{/if}
					</button>
					<button class="bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer h-[40px] w-[72px] font-semibold rounded-md mr-2"  onclick={() => $isEdit=!$isEdit}>
						{$isEdit ? 'Back' : 'Edit'}
					</button>
				{/if}
                {#if $selectedCard.deadline && !$isEdit}
                    <div transition:fly={{ y: 12, duration: 150, opacity: 0 }}>
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
			{#if !$isEdit}
				<div transition:fly={{ y: 12, duration: 150, opacity: 0 }} class="absolute bottom-4 right-4 max-phone:hidden">
					<button class="bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer h-[40px] w-[72px] font-semibold rounded-md" onclick={() => $showEditCardModal=!$showEditCardModal}>
						Cancel
					</button>
				</div>
			{/if}
		</div>
    </section>
{/if}