<script lang="ts">
	import Icon from "@iconify/svelte";
	import Sidebar from "./sidebar.svelte";
	let { data } = $props();


    import { onMount } from 'svelte';

    // Definisikan tipe data untuk sebuah board
    type Board = {
        id: number;
        owner_uid: string;
        name: string;
        slug: string;
        created_at: string;
    };

	let showCreateModal = $state(false);
	let newBoardName = $state('');
    let boards = $state<Board[]>([]);
    let loading = $state(true);
    let error = $state<string | null>(null);

    let nameValidationError = $state<string | null>(null);
	let apiError = $state<string | null>(null);
        
    // onMount berjalan saat komponen pertama kali ditampilkan
    onMount(async () => {
        try {
            // Panggil API yang sudah kita siapkan
            const response = await fetch('/api/boards');
            if (!response.ok) {
                throw new Error('Failed to load your boards.');
            }
            boards = await response.json();
        } catch (e: any) {
            error = e.message;
        } finally {
            loading = false;
        }
    });


    $effect(() => {
		// Aturan validasi: hanya boleh huruf, angka, dan spasi
		const nameRegex = /^[a-zA-Z0-9 ]*$/;
		if (newBoardName && !nameRegex.test(newBoardName)) {
			nameValidationError = 'Name can only contain letters, numbers, and spaces.';
		} else {
			nameValidationError = null; // Hapus pesan error jika sudah valid
		}
	});

	async function handleCreateBoard() {
		if (!newBoardName || nameValidationError) return; // Jangan kirim jika tidak valid
		loading = true;
		apiError = null; // Reset error API setiap kali submit

		const response = await fetch('/api/boards', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: newBoardName })
		});

		if (response.ok) {
			const newBoard = await response.json();
			boards = [...boards, newBoard];
            showCreateModal = false;
			newBoardName = '';
		} else {
			// --- PERBAIKAN: Tidak lagi menggunakan alert() ---
			const result = await response.json();
			apiError = result.error || 'Failed to create board.';
		}
		loading = false;
	}

	let showEditBoardModal = $state(false);
	let selectedBoard = $state<Board | null>(null);
	let editingBoardName = $state('');

	// function openEditBoardModal(board: Board) {
	// 	selectedBoard = board;
	// 	editingBoardName = board.name;
	// 	showEditBoardModal = true;
	// }

	async function handleUpdateBoard() {
		if (!selectedBoard || !editingBoardName) return;

		const response = await fetch('/api/boards', {
			method: 'PUT',
			body: JSON.stringify({ board_id: selectedBoard.id, name: editingBoardName })
		});

		if (response.ok) {
			const { newName, newSlug } = await response.json();
			// Update UI secara reaktif
			boards = boards.map(b => 
				b.id === selectedBoard.id ? { ...b, name: newName, slug: newSlug } : b
			);
			showEditBoardModal = false;
		} else {
			alert('Failed to update board.');
		}
	}

	async function handleDeleteBoard() {
		if (!selectedBoard) return;
		if (!confirm(`Are you sure you want to delete the board "${selectedBoard.name}"? This action cannot be undone.`)) return;
		
		const response = await fetch('/api/boards', {
			method: 'DELETE',
			body: JSON.stringify({ board_id: selectedBoard.id })
		});

		if (response.ok) {
			boards = boards.filter(b => b.id !== selectedBoard.id);
			showEditBoardModal = false;
		} else {
			alert('Failed to delete board.');
		}
	}
    
	type Member = { user_uid: string; username: string; avatar_url: string; role: number };
	
	// --- BARU: State untuk manajemen anggota ---
	let members = $state<Member[]>([]);
	let newMemberUsername = $state('');
	let newMemberRole = $state(1); 

	async function openEditBoardModal(board: Board) {
		selectedBoard = board;
		editingBoardName = board.name;
		showEditBoardModal = true;
		members = []; // Kosongkan daftar anggota lama

		// Ambil daftar anggota saat modal dibuka
		const response = await fetch(`/api/boards/members?board_id=${board.id}`);
		if (response.ok) {
			members = await response.json();
		}
	}

	// --- BARU: Fungsi untuk mengundang anggota ---
	async function handleInviteMember() {
		if (!newMemberUsername || !selectedBoard) return;
		
		if (newMemberUsername === data.profile?.username) {
			alert("You can't invite yourself.");
			return;
		}

		const response = await fetch('/api/boards/members', {
			method: 'POST',
			body: JSON.stringify({
				usernameToInvite: newMemberUsername,
				board_id: selectedBoard.id,
				role: newMemberRole
			})
		});

		if (response.ok) {
			// Untuk simplicity, kita fetch ulang daftar anggota untuk menampilkan yang baru
			const res = await fetch(`/api/boards/members?board_id=${selectedBoard.id}`);
			members = await res.json();
			newMemberUsername = '';
		} else {
			const result = await response.json();
			alert(`Error Invite: ${result.error}`);
		}
	}

	async function handleRemoveMember(userUidToRemove: string) {
		if (!selectedBoard) return;
		if (!confirm(`Are you sure you want to remove this member?`)) return;

		const response = await fetch('/api/boards/members', {
			method: 'DELETE',
			body: JSON.stringify({
				board_id: selectedBoard.id,
				user_uid_to_remove: userUidToRemove
			})
		});
		console.log('test:',members)

		if (response.ok) {
			members = members.filter(m => m.user_uid !== userUidToRemove);
		} else {
			alert('Failed to remove member.');
		}
	}
</script>

<main class="flex">
    <Sidebar data={data} />
    <section class="p-4 w-full">
        <div class="bg-red-400 w-full h-full rounded-xl">
            <h1>Welcome to your Dashboard</h1>




        <!-- BOARDDSS -->
        <!-- <h1>Your Boards</h1> -->

        <!-- <button onclick={() => (showCreateModal = true)}>+ Create New Board</button> -->
		<!-- {#if showCreateModal}
            <div class="absolute top-0 right-0">
				<h2>Create a new board</h2>
				<form onsubmit={handleCreateBoard}>
					<label for="board-name">Board Name</label>
					<input id="board-name" type="text" bind:value={newBoardName} required />

					{#if nameValidationError}
						<p style="color: red; font-size: 12px;">{nameValidationError}</p>
					{/if}

					<button type="submit" disabled={loading || !!nameValidationError}>
						{#if loading}Creating...{:else}Create Board{/if}
					</button>

					{#if apiError}
						<p style="color: red; margin-top: 10px;">{apiError}</p>
					{/if}
				</form>
			</div>
        {/if} -->

        <!-- {#if loading}
            <p>Loading your boards...</p>
        {:else if error}
            <p style="color: red;">{error}</p>
        {:else}
            <div class="boards-grid">
                {#each boards as board}
                    <div class="board-card group">
                        <a href={`/${data.profile?.username}/${board.slug}`} class="flex-1">
                            <h3>{board.name}</h3>
                        </a>
                        <button onclick={() => openEditBoardModal(board)} class="p-2 rounded hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Icon icon="mdi:dots-horizontal" />
                        </button>
                    </div>
                {:else}
                    <p>You haven't created any boards yet.</p>
                {/each}
            </div>
        {/if} -->
        </div>
    </section>
</main>

{#if showEditBoardModal && selectedBoard}
    <div class="absolute w-1/2 h-1/2 top-0 right-0 bg-red-50">
        <div class="bg-red-400">
			<h2>Edit Board</h2>
			<form onsubmit={handleUpdateBoard}>
				<label for="board-name">Board Name</label>
				<input id="board-name" type="text" bind:value={editingBoardName} required />
				<button type="submit">Save Changes</button>
			</form>
			<hr class="my-4" />

			<h3>Members</h3>
			
			<div class="member-list">
				{#each members as member}
					<div class="member-item">
						<span>@{member.username} (Role: {member.role})</span>
						<button class="remove-button" onclick={() => handleRemoveMember(member.user_uid)}>
							Remove {member.user_uid}
						</button>
					</div>
				{/each}
			</div>

			<form onsubmit={handleInviteMember} class="invite-form">
				<input type="text" bind:value={newMemberUsername} placeholder="Enter username to invite" />
				<select bind:value={newMemberRole}>
					<option value={1}>Viewer (Read-only)</option>
					<option value={2}>Editor (Read/Edit)</option>
					<option value={3}>Admin (Read/Edit/Delete)</option>
				</select>
				<button type="submit">Invite</button>
			</form>
			<hr class="my-4" />
			<div class="danger-zone">
				<h3>Delete Board</h3>
				<p>This action is permanent.</p>
				<button class="delete-button" onclick={handleDeleteBoard}>Delete this board</button>
			</div>
		</div>
	</div>
{/if}