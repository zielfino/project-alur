<script lang="ts">
   	import { sidebar, sidebarIsHovered as isHovered } from '$lib/stores/uiStore';
    import LogoutButton from "$lib/component/logoutButton.svelte";
	import profile from '$lib/assets/profile.png';
	import { goto } from "$app/navigation";
	import Icon from '@iconify/svelte';
	let { data } = $props();
    import { fade } from 'svelte/transition';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
    
    let currentpage = $page.url.pathname;
    // let isHovered = $state(false);
    let sidebarnav: HTMLElement | null = $state(null);
    let searchInput: HTMLInputElement | null = $state(null);
    let isMouseLeave = $state(true)

    function handleMouseEnter() {
        isMouseLeave = false
        isHovered.set(true);
    }

    function handleMouseLeave() {
        isMouseLeave = true
        if (searchInput && searchInput.value === '') {
            isHovered.set(false);
            isMouseLeave = true
        }
    }

    function handeSeatchInput() {
        if (searchInput && searchInput.value !== '' && isMouseLeave === true) {
            isHovered.set(true)
            console.log('isi luar')
        } else if (searchInput && searchInput.value === '' && isMouseLeave === false) {
            isHovered.set(true)
            console.log('kosong dalem')
        } else if (searchInput && searchInput.value === '' && isMouseLeave === true) {
            isHovered.set(false)
            console.log('kosong luar')
        }
    }

    
	import { boardLoading, showEditBoardModal } from '$lib/stores/uiStore';

    type Board = {
        id: number;
        owner_uid: string;
        name: string;
        slug: string;
        created_at: string;
    };
	type Member = { user_uid: string; username: string; avatar_url: string; role: number };

	let members = $state<Member[]>([]);
	let newMemberUsername = $state('');
	let newMemberRole = $state(1); 

    // let loading = $state(true);
    let error = $state<string | null>(null);
    let boards = $state<Board[]>([]);

	// let $showEditBoardModal = $state(false);
	let selectedBoard = $state<Board | null>(null);
	let editingBoardName = $state('');

    
	async function openEditBoardModal(board: Board) {
		selectedBoard = board;
		editingBoardName = board.name;
		$showEditBoardModal = true;
		members = []; // Kosongkan daftar anggota lama

		// Ambil daftar anggota saat modal dibuka
		const response = await fetch(`/api/boards/members?board_id=${board.id}`);
		if (response.ok) {
			members = await response.json();
		}
	}

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
			$showEditBoardModal = false;
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
			$showEditBoardModal = false;
		} else {
			alert('Failed to delete board.');
		}
	}

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

    
	let newBoardName = $state('');
    let nameValidationError = $state<string | null>(null);
	let apiError = $state<string | null>(null);
	let showCreateModal = $state(false);

	async function handleCreateBoard() {
		if (!newBoardName || nameValidationError) return; // Jangan kirim jika tidak valid
		$boardLoading = true;
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
		$boardLoading = false;
	}
    
    onMount(async () => {
        try {
            const response = await fetch('/api/boards');
            if (!response.ok) {
                throw new Error('Failed to load your boards.');
            }
            boards = await response.json();
        } catch (e: any) {
            error = e.message;
        } finally {
            $boardLoading = false;
        }
    });
</script>

<section class="h-[100dvh] py-4
{$sidebar ? 'min-w-64' : $isHovered ? 'min-w-48' : 'min-w-18'}">
    <section role="complementary" bind:this={sidebarnav} onmouseenter={() => handleMouseEnter()} onmouseleave={() => handleMouseLeave()} class="group rounded-e-2xl flex flex-col justify-between overflow-hidden h-[calc(100%-32px)] p-4 ease-out fixed
    {$sidebar ? 'w-64 bg-gray-100 ring ring-slate-300' : $isHovered ? 'w-48 bg-gray-100 ring ring-slate-300' : 'w-18 bg-gray-100'}">
        <!-- TOP SIDEBAR -->
        <div class="flex flex-col ">
            <div class="flex items-center
            {$sidebar || $isHovered ? 'gap-2' : 'gap-4'}">
                <img src={data.profile?.avatar_url || profile} width="40px" height="40px" class="rounded-full" alt="">
                <div>
                    <div class=" line-clamp-1 font-medium text-slate-900 font-outfit leading-5 text-base {$sidebar || $isHovered ? 'opacity-100' : 'opacity-0'}">{ data.profile?.name || 'User'   }</div>
                    <div class="agerrh5 text-slate-400">@{data.profile?.username || 'username'}</div>
                </div>

            </div>
            <div class="border-t-2 border-zinc-300 my-4"></div>
            <div class="space-y-3 text-slate-900 font-outfit text-base font-medium flex flex-col">

                <!-- Collapse -->
                <button onclick={() => sidebar.set(!$sidebar)} class="flex items-center ring rounded-full cursor-pointer hover:bg-slate-200
                {$sidebar ? 'pl-12' : $isHovered ? 'pl-5' : ''}">
                    <div class="min-w-10 aspect-square flex justify-center items-center">
                        <Icon icon="fa7-solid:angle-double-left" class="inline-block text-lg duration-400 ease-in-out
                        {$sidebar ? 'rotate-0' : 'rotate-180'}" />
                    </div> 
                    <div class="relative {$sidebar || $isHovered ? 'opacity-100' : 'opacity-0'}" >
                        {#if $sidebar}
                            <span
                                transition:fade={{ duration: 150 }}
                                class="absolute -top-3"
                            >Collapse</span>
                        {:else}
                            <span
                                transition:fade={{ duration: 150 }}
                                class="absolute -top-3"
                            >Expand</span>
                        {/if}
                    </div> 
                </button>
                
                <!-- Add Boards -->
                <button onclick={() => (showCreateModal = true)} class="flex items-center ring rounded-full cursor-pointer hover:bg-slate-200
                {$sidebar ? 'pl-10' : $isHovered ? 'pl-2' : ''}">
                    <div class="min-w-10 aspect-square flex justify-center items-center">
                        <Icon icon="mingcute:add-fill" class="inline-block text-lg duration-400 ease-in-out" />
                    </div> 
                    <div class="relative {$sidebar || $isHovered ? 'opacity-100' : 'opacity-0'}" >
                        <span
                            transition:fade={{ duration: 150 }}
                            class="absolute -top-3 whitespace-nowrap"
                        >Add Boards</span>
                    </div> 
                </button>

                <!-- Search -->
                <div class="flex items-center
                {$sidebar || $isHovered ? 'gap-3' : 'gap-6'}">
                    <div class="min-w-10 aspect-square flex justify-center items-center ring rounded-full cursor-pointer hover:bg-slate-200">
                        <Icon icon="fa7-solid:magnifying-glass" class="inline-block text-lg" />
                    </div> 
                    <input type="text" class="w-full {$sidebar || $isHovered ? 'opacity-100' : 'opacity-0'}" bind:this={searchInput} oninput={() => handeSeatchInput()} placeholder="Search" /> 
                </div>
            </div>
            <div class="border-t-2 border-zinc-300 mt-4 mb-1"></div>
        </div>


        <!-- BOARDS -->
        <div class="flex flex-col h-full overflow-y-scroll justify-start overflow-scroll-hidden mask-t-from-96% mask-t-to-100% mask-b-from-90% mask-b-to-100% space-y-1">
            <div class="w-full h-3 bg-blue-700 opacity-0">,</div>
            <a href="/" class="text-slate-900 hover:bg-slate-200 rounded-lg h-[40px] flex items-center-safe
            {$sidebar || $isHovered ? 'w-full space-x-4 pl-2' : 'w-full'} {currentpage === '/' ? 'bg-slate-200' : 'cursor-pointer'}" disabled={currentpage === '/'}>
                    <div class="w-[18px] {$sidebar || $isHovered ? '' : 'pl-2'}"><Icon icon="material-symbols:dashboard-outline-rounded" class="inline-block text-2xl" /></div>
                    <div class="line-clamp-1 {$sidebar || $isHovered ? '' : 'opacity-0'}">Dashboard</div>
            </a>
            <!-- <a href="/testaja" class="text-slate-900 hover:bg-slate-200 rounded-lg h-[40px] cursor-pointer flex items-center-safe
            {$sidebar || $isHovered ? 'w-full space-x-4 pl-2' : 'w-full'}">
                    <div class="w-[18px] {$sidebar || $isHovered ? '' : 'pl-2'}"><Icon icon="material-symbols:leaderboard-outline-rounded" class="rotate-180 inline-block text-2xl" /></div>
                    <div class="line-clamp-1 {$sidebar || $isHovered ? '' : 'opacity-0'}">Job Tracker</div>
            </a>
            <button class="text-slate-900 hover:bg-slate-200 rounded-lg h-[40px] cursor-pointer flex items-center-safe
            {$sidebar || $isHovered ? 'w-full space-x-4 pl-2' : 'w-full'}">
                    <div class="w-[18px] {$sidebar || $isHovered ? '' : 'pl-2'}"><Icon icon="material-symbols:checklist-rounded" class="inline-block text-2xl" /></div>
                    <div class="line-clamp-1 {$sidebar || $isHovered ? '' : 'opacity-0'}">Task Manager</div>
            </button>
            <button class="text-slate-900 hover:bg-slate-200 rounded-lg h-[40px] cursor-pointer flex items-center-safe
            {$sidebar || $isHovered ? 'w-full space-x-4 pl-2' : 'w-full'}">
                    <div class="w-[18px] {$sidebar || $isHovered ? '' : 'pl-2'}"><Icon icon="material-symbols:attach-money-rounded" class="inline-block text-2xl" /></div>
                    <div class="line-clamp-1 {$sidebar || $isHovered ? '' : 'opacity-0'}">Money </div>
            </button>
            <div class="border-t-2 border-zinc-300 mt-4 mb-1"></div> -->



            <!-- BOARDS -->
            <!-- <button class="text-slate-900 hover:bg-slate-200 rounded-lg h-[40px] cursor-pointer flex items-center-safe
            {$sidebar || $isHovered ? 'w-full space-x-4 pl-2' : 'w-full'}">
                    <div class="w-[18px] {$sidebar || $isHovered ? '' : 'pl-2'}"><Icon icon="mingcute:add-fill" class="inline-block text-2xl" /></div>
                    <div class="line-clamp-1 {$sidebar || $isHovered ? '' : 'opacity-0'}">Add Board </div>
            </button> -->
            {#if $boardLoading}
                <div class="text-slate-900 hover:bg-slate-200 rounded-lg h-[40px] cursor-pointer flex items-center-safe relative
                {$sidebar || $isHovered ? 'w-full space-x-4 pl-2' : 'w-full'}">
                    <div class="w-[18px] {$sidebar || $isHovered ? '' : 'pl-2'}"><Icon icon="material-symbols:leaderboard-outline-rounded" class="rotate-180 inline-block text-2xl" /></div>
                    <div class="line-clamp-1 {$sidebar || $isHovered ? '' : 'opacity-0'}">Loading...</div>
                </div>
            {:else if error}
                <p style="color: red;">{error}</p>
            {:else}
                <div class="boards-grid">
                    {#each boards as board}
                        <a href={`/${data.profile?.username}/${board.slug}`} disabled={`/${data.profile?.username}/${board.slug}`} class="text-slate-900 hover:bg-slate-200 rounded-lg h-[40px] cursor-pointer flex items-center-safe relative
                        {$sidebar || $isHovered ? 'w-full space-x-4 pl-2' : 'w-full'}">
                            <div class="w-[18px] {$sidebar || $isHovered ? '' : 'pl-2'}"><Icon icon="material-symbols:leaderboard-outline-rounded" class="rotate-180 inline-block text-2xl" /></div>
                            <div class="line-clamp-1 {$sidebar  ? 'w-full' : $isHovered ? 'w-1/2' : 'opacity-0'}">{board.name}</div>
                            <button onclick={(e) => { e.preventDefault(); openEditBoardModal(board); }} class="p-2 rounded hover:bg-slate-300 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity absolute right-1">
                                <Icon icon="mdi:dots-horizontal" />
                            </button>
                        </a>
                        <!-- <div class="board-card group">
                            <a href={`/${data.profile?.username}/${board.slug}`} class="flex-1">
                                <h3>{board.name}</h3>
                            </a>
                            <button onclick={() => openEditBoardModal(board)} class="p-2 rounded hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Icon icon="mdi:dots-horizontal" />
                            </button>
                        </div> -->
                    {:else}
                        <div class="text-slate-900 hover:bg-slate-200 rounded-lg h-[40px] cursor-pointer flex items-center-safe relative
                        {$sidebar || $isHovered ? 'w-full space-x-4 pl-2' : 'w-full'}">
                            <div class="w-[18px] {$sidebar || $isHovered ? '' : 'pl-2'}"><Icon icon="material-symbols:leaderboard-outline-rounded" class="rotate-180 inline-block text-2xl" /></div>
                            <div class="line-clamp-1 {$sidebar || $isHovered ? '' : 'opacity-0'}">Create Board</div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>


        <!-- BOTTOM SIDERBAR -->
        <div class="w-full space-y-2">
            <div class="border-t-2 border-zinc-300 mt-1"></div>
            <button onclick={() => goto('/profile')} class="text-slate-900 hover:bg-slate-200 font-semibold font-outfit tracking-wider rounded-lg h-[40px] cursor-pointer flex justify-center-safe items-center-safe
            {$sidebar || $isHovered ? 'w-full space-x-2' : 'w-10 group-hover:w-40 group-hover:space-x-2'} {currentpage === '/profile' ? 'bg-slate-200' : 'cursor-pointer'}" disabled={currentpage === '/profile'}>
                    <div class="w-[18px] {$sidebar || $isHovered ? '' : 'pl-3'}"><Icon icon="fa7-solid:gear" class="inline-block text-lg duration-400 ease-in-out
                        {$sidebar || $isHovered ? 'rotate-0' : 'rotate-180'}" /></div>
                    <div class="{$sidebar || $isHovered ? '' : 'opacity-0'}">Settings</div>
            </button>
            <!-- <LogoutButton /> -->
        </div>
    </section>
</section>

<!-- CREATE -->
{#if showCreateModal}
    <div class="absolute top-0 right-0">
        <h2>Create a new board</h2>
        <form onsubmit={handleCreateBoard}>
            <label for="board-name">Board Name</label>
            <input id="board-name" type="text" bind:value={newBoardName} required />

            {#if nameValidationError}
                <p style="color: red; font-size: 12px;">{nameValidationError}</p>
            {/if}

            <button type="submit" disabled={$boardLoading || !!nameValidationError}>
                {#if $boardLoading}Creating...{:else}Create Board{/if}
            </button>

            {#if apiError}
                <p style="color: red; margin-top: 10px;">{apiError}</p>
            {/if}
        </form>
    </div>
{/if}


<!-- EDIT -->
{#if $showEditBoardModal && selectedBoard}
    <div class="absolute w-1/2 h-1/2 top-0 right-0 bg-red-50 z-50">
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