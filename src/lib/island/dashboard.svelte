<script lang="ts">
    import LogoutButton from "$lib/component/logoutButton.svelte";
    import { onMount } from 'svelte';

    // type Board = { id: string; name: string };

    // let boards: Board[] = [];
    // let loading = true;
    // let error: string | null = null;

    // onMount(async () => {
    //     try {
    //         const response = await fetch('/api/boards');
    //         if (!response.ok) throw new Error('Failed to fetch boards');
    //         boards = await response.json();
    //     } catch (e) {
    //         error = (e as Error).message;
    //     } finally {
    //         loading = false;
    //     }
    // });

	// let showCreateModal = false;
	// let newBoardName = '';

	// async function handleCreateBoard() {
	// 	if (!newBoardName) return;

	// 	// Send the new board name to your API
	// 	const response = await fetch('/api/boards', {
	// 		method: 'POST',
	// 		headers: { 'Content-Type': 'application/json' },
	// 		body: JSON.stringify({ name: newBoardName })
	// 	});

	// 	if (response.ok) {
	// 		const newBoard = await response.json();
	// 		// Add the new board to the list to update the UI instantly
	// 		boards = [...boards, newBoard];
			
	// 		// Close the modal and reset the name
	// 		showCreateModal = false;
	// 		newBoardName = '';
	// 	} else {
	// 		alert('Failed to create board!');
	// 	}
	// }
</script>

<h1>Welcome to your Dashboard</h1>
<!-- <h1>Your Boards</h1>

{#if loading}
    <p>Loading boards...</p>
{:else if error}
    <p class="text-red-500">{error}</p>
{:else}
    {#each boards as board}
        <div class="board-card">
            <p>{board.name}</p>
        </div>
    {:else}
        <p>You don't have any boards yet. Create one!</p>
    {/each}
{/if}

<button on:click={() => (showCreateModal = true)}>+ Create New Board</button>

{#if showCreateModal}
  <div class="modal-backdrop">
    <div class="modal">
      <h2>Create New Board</h2>
      <input type="text" bind:value={newBoardName} placeholder="Board Name" />
      <button on:click={handleCreateBoard}>Create</button>
      <button on:click={() => (showCreateModal = false)}>Cancel</button>
    </div>
  </div>
{/if}
<br><br><br> -->
<LogoutButton />