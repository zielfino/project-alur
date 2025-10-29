<script lang="ts">
	import Icon from '@iconify/svelte';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';

	let { data } = $props();
	let { board, userRole } = data;

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
</script>

<section class="flex flex-col gap-4 p-2">
	<h1 class="text-xl font-semibold">{localBoard.name}</h1>

	{#if localBoard?.columns?.length}
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
							<div class="min-h-6 min-w-6 flex opacity-40 justify-center items-center text-lg rounded cursor-grab touch-none">
								<Icon icon="mingcute:add-fill" />
							</div>
							<div class="min-h-6 min-w-6 flex opacity-40 justify-center items-center text-2xl rounded cursor-grab touch-none"
								onpointerdown={startDrag}
								onpointerup={stopDrag}
							>
								<Icon icon="mingcute:dots-fill" />
							</div>
						</div>
					</div>

					<!-- DND untuk kartu di dalam kolom -->
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
						class="flex flex-col gap-2 min-h-32 
						{column.cards.length ? '' : 'flex justify-center items-center'}"
					>	
						{#if column.cards.length }
							{#each column.cards as card (card.id)}
								<div
									class="p-2 bg-gray-100 rounded-md flex justify-between items-center cursor-default w-full"
									animate:flip={{ duration: flipDurationMs }}
								>
									<span>{card.title}</span>
									<div
										class="min-h-6 min-w-6 flex opacity-70 justify-center items-center text-xl rounded cursor-grab touch-none"
										onpointerdown={startDrag}
										onpointerup={stopDrag}
									>
										<Icon icon="mingcute:dots-fill" />
									</div>
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

<style>
	section {
		min-height: 100vh;
		background: #f8fafc;
	}
</style>
