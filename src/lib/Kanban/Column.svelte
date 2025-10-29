<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import Card from "$lib/Kanban/Card.svelte";
	import { showAddCardModal, activeColumnId, dragDisabled } from '$lib/stores/uiStore';
	import Icon from '@iconify/svelte';
	import { pushError } from '$lib/stores/errorNotification';
	import { isLoading } from '$lib/stores/loading';
	import { isConfirm } from '$lib/stores/confirmStore';
	import { onMount } from 'svelte';

	const flipDurationMs = 150;
	// export let column: any;
	// export let onDrop: (event: { columnId: number; items: any[]; info?: any }) => void;
	let { column = $bindable(), onDrop, userRole } = $props<{
		userRole: number;
		column: any;
		onDrop: (event: { columnId: number; items: any[]; info?: any }) => void;
	}>();

	function handleDndConsiderCards(e: CustomEvent) {
		// onDrop({ columnId: column.id, items: e.detail.items, info: e.detail.info });
		column.cards = e.detail.items;
	}

	function handleDndFinalizeCards(e: CustomEvent) {
		onDrop({ columnId: column.id, items: e.detail.items, info: e.detail.info });
	}

	let editingColumnId = $state<number | null>(null);
	let editingColumnName = $state('');

	function startEditingColumn() {
		editingColumnId = column.id;
		editingColumnName = column.name;
	}

	function cancelEditingColumn() {
		editingColumnId = null;
		editingColumnName = '';
	}

	async function handleUpdateColumnName() {
		if (!editingColumnName.trim()) return;

		isLoading.start('ColumnEdit')

		
		try {
			const response = await fetch('/api/boards/columns', {
				method: 'PUT',
				body: JSON.stringify({ name: editingColumnName, column_id: column.id }),
			});

			if (response.ok) {
				onDrop({
					columnId: column.id,
					items: column.cards,
					info: { type: 'rename-column', columnId: column.id, newName: editingColumnName },
				});
				cancelEditingColumn();
				isLoading.stop('ColumnEdit')
			} else {
				const result = await response.json();
				pushError(result.error, result.message);
				isLoading.stop('ColumnEdit')
			}
		} catch (err) {
			console.error('Error creating card:', err);
			pushError(500, 'Unexpected error while adding card.');
			isLoading.stop('ColumnEdit')
		}
	}

	async function handleDeleteColumn() {
		// if (!confirm('Are you sure?')) return;
		if (!(await isConfirm("Are you sure you want to delete this column?"))) return;

		isLoading.start('ColumnRemove')
		
		try {

			const response = await fetch('/api/boards/columns', {
				method: 'DELETE',
				body: JSON.stringify({ column_id: column.id }),
			});

			if (response.ok) {
				onDrop({
					columnId: column.id,
					items: [],
					info: { type: 'delete-column', columnId: column.id },
				});
				isLoading.stop('ColumnRemove')
			} else {
				const result = await response.json();
				pushError(result.error, result.message);
				isLoading.stop('ColumnRemove')
			}

		} catch (err) {
			console.error('Error creating card:', err);
			pushError(500, 'Unexpected error while adding card.');
			isLoading.stop('ColumnRemove')
		}
	}

	// let showAddCardModal = $state(false);
	// let activeColumnId = $state<number | null>(null);

	function openAddCardModal(columnId: number) {
		$activeColumnId = columnId;
		$showAddCardModal = true;
		console.log({activeColumnId}, {showAddCardModal})
	}
	
	let isDndDisabled = $state(false);
	$effect(() => {
		isDndDisabled = userRole < 2;
	});

	
	let isTablet = $state(false);
	let isPortrait = $state(true);

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
</script>

<div class="h-[300px] tablet:h-[600px] w-full flex tablet:flex-col justify-between ring-1 ring-gray-300 bg-gray-100 rounded-lg overflow-hidden">
	<div class="flex justify-between items-center max-tablet:[writing-mode:vertical-lr] max-tablet:h-full
	{ !isPortrait || isTablet ? 'p-3' : 'p-1.5'}
	{column.state === 3 ? 'bg-emerald-200' : 
	column.state === 2 ? 'bg-sky-200' : 
	column.state === 1 ? 'bg-gray-200' : 'bg-red-200'}"
	>
		{#if editingColumnId === column.id && userRole >= 3}
			<form onsubmit={handleUpdateColumnName} class="w-full flex justify-between group h-full">
				<input
					type="text"
					bind:value={editingColumnName}
					class="font-semibold text-gray-700 w-full group-focus-within:animate-pulse-agerr"
					onblur={cancelEditingColumn}
					autofocus
				/>
				<button type="button" onclick={cancelEditingColumn} class="aspect-square rounded-full cursor-pointer group-focus-within:animate-pulse-agerr">
					<Icon icon="mingcute:close-fill" class="text-lg"/>
				</button>
			</form>
		{:else}
			<div class="flex w-full justify-between h-full">
				<button class="w-full text-left {userRole >= 3 ? 'cursor-pointer' : 'cursor-default'}" disabled={!(userRole >= 3)} onclick={startEditingColumn}>
					<h2 class="font-semibold text-gray-700 { !isPortrait || isTablet ? '' : 'mt-3'}">{column.name}</h2>
				</button>
				<div class="flex items-center justify-center">
					{#if userRole >= 2 && (isPortrait || !isTablet)}
						<div class="mb-1.5">
							<button onclick={() => openAddCardModal(column.id)} class="aspect-square cursor-pointer hover:rotate-90 duration-500 ease-out bg-slate-800/10 p-2 rounded-md">
								<Icon icon="mingcute:close-fill" class="text-lg rotate-45"/>
							</button>
						</div>
					{/if}
					{#if userRole >= 3}
						<button onclick={handleDeleteColumn} class="aspect-square rounded-full cursor-pointer hover:rotate-90 duration-500 ease-out { !isPortrait || isTablet ? '' : 'bg-slate-800/10 p-2 rounded-md'}">
							<Icon icon="mingcute:close-fill" class="text-lg"/>
						</button>
					{/if}
				</div>
			</div>
		{/if}
		
	</div>

	<div
		class="h-[calc(100%-48px)] w-full space-y-2 pt-2 overflow-y-auto overflow-x-hidden flex justify-start items-center flex-col bg-gray-100
		{userRole >= 2 ? '' : 'mb-2' }"
		use:dndzone={{ items: column.cards, flipDurationMs, dragDisabled: isDndDisabled }}
		onconsider={handleDndConsiderCards}
		onfinalize={handleDndFinalizeCards}
	>
		{#each column.cards as card (card.id)}
			<div class="w-[calc(100%-16px)]" animate:flip="{{ duration: flipDurationMs }}">
				<Card userRole={userRole} card={card} />
			</div>
		{/each}
		<div class="h-[30px]"></div>
	</div>
	{#if userRole >= 2 && (!isPortrait || isTablet)}
		<div class="bg-gray-100 rounded-b-lg p-2">
			<button
				class="text-gray-900 hover:bg-gray-300 p-2 cursor-pointer bg-gray-200 rounded-md w-full"
				onclick={() => openAddCardModal(column.id)}
			>
				+ Add a card
			</button>
		</div>
	{/if}
	
</div>
