<script lang="ts">
	import Icon from '@iconify/svelte';
	// Definisikan tipe data Anda di satu tempat agar bersih
	type Card = { id: number; title: string; description: string; deadline: string; priority: number; column_id: number };
	type Column = { id: number; name: string; state: number; position: number; cards: Card[] };
	type Board = { id: number; name: string; columns: Column[] };

	let { data } = $props();

	// 1. Buat state lokal yang reaktif dari data server
	let board = $state<Board | null>(data.board);

	// 2. Gunakan $effect untuk menjaga state lokal tetap sinkron jika data dari server berubah
	$effect(() => {
		board = data.board;
	});

	// --- State untuk UI ---
	let apiError = $state<string | null>(null);

	// --- State untuk Kolom ---
	let showAddColumnInput = $state(false);
	let newColumnName = $state('');
	let newColumnState = $state(1);
	let editingColumnId = $state<number | null>(null);
	let editingColumnName = $state('');

	// --- State untuk Kartu ---
	let showAddCardModal = $state(false);
	let showEditCardModal = $state(false);
	let activeColumnId = $state<number | null>(null);
	let selectedCard = $state<Card | null>(null);
	// State untuk form kartu baru
	let newCardTitle = $state('');
	let newCardDescription = $state('');
	let newCardDeadline = $state('');
	let newCardPriority = $state(3);
	
	// --- FUNGSI-FUNGSI ---

	// Fungsi untuk Kolom
	async function handleAddColumn() {
		if (!board || !newColumnName) return;
		apiError = null;
		const response = await fetch('/api/boards/columns', {
			method: 'POST',
			body: JSON.stringify({ name: newColumnName, board_id: board.id, state: newColumnState })
		});
		if (response.ok) {
			const newColumn = await response.json();
			const updatedColumns = [...board.columns, newColumn];
			updatedColumns.sort((a, b) => a.state - b.state || a.position - b.position);
			board.columns = updatedColumns;
			newColumnName = '';
			showAddColumnInput = false;
		} else {
			const result = await response.json();
			apiError = result.error || 'Failed to add column.';
		}
	}

	function startEditingColumn(column: Column) {
		editingColumnId = column.id;
		editingColumnName = column.name;
	}

	function cancelEditingColumn() {
		editingColumnId = null;
		editingColumnName = '';
	}

	async function handleUpdateColumnName() {
		if (!editingColumnId || !editingColumnName || !board) return;
		const response = await fetch('/api/boards/columns', {
			method: 'PUT',
			body: JSON.stringify({ name: editingColumnName, column_id: editingColumnId })
		});
		if (response.ok) {
			board.columns = board.columns.map((column) =>
				column.id === editingColumnId ? { ...column, name: editingColumnName } : column
			);
			cancelEditingColumn();
		} else {
			alert('Failed to update column name.');
		}
	}

	async function handleDeleteColumn(columnId: number) {
		if (!board || !confirm('Are you sure?')) return;
		const response = await fetch('/api/boards/columns', {
			method: 'DELETE',
			body: JSON.stringify({ column_id: columnId })
		});
		if (response.ok) {
			board.columns = board.columns.filter((c) => c.id !== columnId);
		} else {
			alert('Failed to delete column.');
		}
	}

	// Fungsi untuk Kartu
	function openAddCardModal(columnId: number) {
		activeColumnId = columnId;
		showAddCardModal = true;
	}

	function openEditCardModal(card: Card) {
		selectedCard = { ...card };
		showEditCardModal = true;
	}
	
	async function handleAddCard() {
		if (!newCardTitle || !activeColumnId || !board) return;
		const response = await fetch('/api/cards', {
			method: 'POST',
			body: JSON.stringify({
				title: newCardTitle,
				column_id: activeColumnId,
				description: newCardDescription,
				deadline: newCardDeadline || null,
				priority: newCardPriority
			})
		});
		if (response.ok) {
			const newCard = await response.json();
			const columnIndex = board.columns.findIndex((c) => c.id === activeColumnId);
			if (columnIndex !== -1) {
				// Ini adalah update yang reaktif
				board.columns[columnIndex].cards = [...board.columns[columnIndex].cards, newCard];
			}
			newCardTitle = '';
			newCardDescription = '';
			newCardDeadline = '';
			newCardPriority = 3;
			showAddCardModal = false;
		} else {
			alert('Failed to add card.');
		}
	}

	async function handleUpdateCard() {
		if (!selectedCard || !board) return;
		const response = await fetch('/api/cards', { method: 'PUT', body: JSON.stringify(selectedCard) });
		if (response.ok) {
			board.columns = board.columns.map((col) => ({
				...col,
				cards: col.cards.map((c) => (c.id === selectedCard!.id ? selectedCard! : c))
			}));
			showEditCardModal = false;
		} else {
			alert('Failed to update card.');
		}
	}

	async function handleDeleteCard() {
		if (!selectedCard || !board) return;
		if (!confirm('Are you sure you want to delete this card?')) return;
		const response = await fetch('/api/cards', {
			method: 'DELETE',
			body: JSON.stringify({ id: selectedCard.id })
		});
		if (response.ok) {
			board.columns = board.columns.map((col) => ({
				...col,
				cards: col.cards.filter((c) => c.id !== selectedCard!.id)
			}));
			showEditCardModal = false;
		} else {
			alert('Failed to delete card.');
		}
	}
</script>

<div class="p-4 md:p-8 h-screen flex flex-col bg-slate-50">
	<!-- Gunakan 'board' (state lokal) di sini, bukan 'data.board' -->
	{#if board}
		<header class="mb-4">
			<h1 class="text-3xl font-bold text-slate-800">{board.name}</h1>
		</header>

		<main class="flex-1 flex gap-4 overflow-x-auto pb-4">
			<!-- Arahkan #each ke state lokal -->
			{#each board.columns as column (column.id)}
				<div
					class="rounded-lg w-72 flex-shrink-0 flex flex-col {column.state === 1
						? 'bg-gray-200'
						: column.state === 2
						? 'bg-sky-200'
						: 'bg-emerald-200'}"
				>
					<div class="flex justify-between items-center p-3">
						<!-- Kode Anda untuk edit inline sudah benar -->
						{#if editingColumnId === column.id}
							<form onsubmit={handleUpdateColumnName} class="w-full">
								<input
									type="text"
									bind:value={editingColumnName}
									class="font-semibold text-slate-700 p-1 rounded w-full"
									onblur={cancelEditingColumn}
									autofocus
								/>
							</form>
						{:else}
							<button class="w-full text-left" onclick={() => startEditingColumn(column)}>
								<h2 class="font-semibold text-slate-700">{column.name}</h2>
							</button>
						{/if}
						<button
							onclick={() => handleDeleteColumn(column.id)}
							class="text-slate-500 hover:text-red-500 ml-2"
						>
							&times;
						</button>
					</div>

					<div class="flex-1 overflow-y-auto p-2 space-y-2">
                        {#each column.cards as card (card.id)}
							<button onclick={() => openEditCardModal(card)} class="w-full bg-white rounded-md shadow p-3 text-left hover:bg-slate-50 text-sm">
								<p class="font-medium text-slate-800">{card.title}</p>
								
                                {#if card.description}
									<p class="mt-1 text-slate-600">{card.description}</p>
								{/if}

								<div class="mt-2 flex justify-between items-center text-slate-500">
									{#if card.deadline}
										<span class="flex items-center gap-1">
											<Icon icon="solar:calendar-outline" class="w-4 h-4" />
											{new Date(card.deadline).toLocaleDateString('id-ID')}
										</span>
									{/if}
									{#if card.priority}
										<span class="px-2 py-0.5 rounded-full text-xs font-semibold
											{card.priority > 3 ? 'bg-red-100 text-red-700' : card.priority < 3 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
											Priority: {card.priority}
										</span>
									{/if}
								</div>
							</button>
						{/each}
					</div>

					<button
						class="text-slate-500 hover:bg-slate-300 p-2 m-2 rounded-md"
						onclick={() => openAddCardModal(column.id)}
					>
						+ Add a card
					</button>
				</div>
			{/each}

            <div class="bg-slate-100 rounded-lg w-72 flex-shrink-0 p-2 self-start">
				{#if showAddColumnInput}
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
						<div class="mt-2 space-x-2">
							<button type="submit" class="bg-blue-500 text-white px-3 py-1 rounded-md">Add Column</button>
							<button type="button" onclick={() => (showAddColumnInput = false)}>Cancel</button>
						</div>
						{#if apiError}
							<p class="text-red-500 text-sm mt-2">{apiError}</p>
						{/if}
					</form>
				{:else}
					<button class="w-full text-left text-slate-600 p-2 hover:bg-slate-200 rounded" onclick={() => showAddColumnInput = true}>
						+ Add another column
					</button>
				{/if}
			</div>
		</main>
	{:else}
		<p>Board not found.</p>
	{/if}
</div>

{#if showAddCardModal}
    <div class="absolute w-1/2 h-1/2 top-0 left-0 bg-red-50">
        <div class="bg-red-400">
            <h2>Add a new card</h2>
			<form onsubmit={handleAddCard} class="flex flex-col gap-4">
				<div>
					<label for="card-title">Card Title</label>
					<input id="card-title" type="text" bind:value={newCardTitle} required class="w-full border rounded p-2" />
				</div>
				<div>
					<label for="card-desc">Description</label>
					<textarea id="card-desc" bind:value={newCardDescription} class="w-full border rounded p-2" />
				</div>
				<div>
					<label for="card-deadline">Deadline</label>
					<input id="card-deadline" type="date" bind:value={newCardDeadline} class="w-full border rounded p-2" />
				</div>
				<div>
					<label for="card-priority">Priority (1=Low, 5=High)</label>
					<select id="card-priority" bind:value={newCardPriority} class="w-full border rounded p-2">
						<option value={1}>1</option>
						<option value={2}>2</option>
						<option value={3}>3 (Medium)</option>
						<option value={4}>4</option>
						<option value={5}>5</option>
					</select>
				</div>
				<button type="submit" class="bg-blue-500 text-white rounded p-2">Add Card</button>
			</form>
        </div>
    </div>
{/if}

{#if showEditCardModal && selectedCard}
    <div class="absolute w-1/2 h-1/2 top-0 right-0 bg-red-50">
        <div class="bg-red-400">
			<h2>Edit Card</h2>
			<form onsubmit={handleUpdateCard} class="flex flex-col gap-4">
				<div>
					<div>Title</div>
					<input type="text" bind:value={selectedCard.title} required class="w-full border rounded p-2" />
				</div>
				<div>
					<div>Description</div>
					<textarea bind:value={selectedCard.description} class="w-full border rounded p-2" />
				</div>
				<div>
					<div>Deadline</div>
					<input type="date" bind:value={selectedCard.deadline} class="w-full border rounded p-2" />
				</div>
				<div>
					<div>Priority</div>
					<select bind:value={selectedCard.priority} class="w-full border rounded p-2">
						<option value={1}>1 (Low)</option>
						<option value={2}>2</option>
						<option value={3}>3 (Medium)</option>
						<option value={4}>4</option>
						<option value={5}>5 (High)</option>
					</select>
				</div>
				
				<div class="flex justify-between items-center mt-4">
					<button type="button" class="text-red-500 hover:underline" onclick={handleDeleteCard}>
						Delete Card
					</button>
					
					<button type="submit" class="bg-blue-500 text-white rounded p-2">Save Changes</button>
				</div>
			</form>
		</div>
	</div>
{/if}