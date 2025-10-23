<script lang="ts">
   	import { sidebar, sidebarIsHovered as isHovered } from '$lib/stores/uiStore';
    import LogoutButton from "$lib/component/logoutButton.svelte";
	import profile from '$lib/assets/profile.png';
	import { goto } from "$app/navigation";
	import Icon from '@iconify/svelte';
	let { data } = $props();
    import { fade, fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
    
    // let currentpage = $page.url.pathname;
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
	import { isLoading } from '$lib/stores/loading';
	import { pushError } from '$lib/stores/errorNotification';

    type Board = {
        id: number;
        owner_uid: string;
        owner_name: string;
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
    let sharedBoards = $state<Board[]>([]);

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

        isLoading.start('BoardEdit', selectedBoard.id);

        try {
            const response = await fetch('/api/boards', {
                method: 'PUT',
                body: JSON.stringify({
                    board_id: selectedBoard.id,
                    name: editingBoardName
                })
            });

            if (response.ok) {
                const { newName, newSlug } = await response.json();

                boards = boards.map(b =>
                    b.id === selectedBoard.id
                        ? { ...b, name: newName, slug: newSlug }
                        : b
                );

                // 🧩 Update juga selectedBoard biar slug-nya baru
                selectedBoard = { ...selectedBoard, name: newName, slug: newSlug };

                $showEditBoardModal = false;
            } else {
                const result = await response.json();
                pushError(response.status, result.error || 'Failed to update board.');
            }
        } catch (err) {
            console.error('Error updating board:', err);
            pushError(500, 'Unexpected error while updating board.');
        } finally {
            isLoading.stop('BoardEdit', selectedBoard.id);

            // 🔁 Pindahkan setelah selectedBoard diperbarui
            goto(`/${data.profile?.username}/${selectedBoard.slug}`);
        }
    }


    async function handleDeleteBoard() {
        if (!selectedBoard) return;
        if (
            !confirm(
                `Are you sure you want to delete the board "${selectedBoard.name}"? This action cannot be undone.`
            )
        )
            return;

        isLoading.start('BoardRemove', selectedBoard.id);

        try {
            const response = await fetch('/api/boards', {
                method: 'DELETE',
                body: JSON.stringify({ board_id: selectedBoard.id })
            });

            if (response.ok) {
                boards = boards.filter(b => b.id !== selectedBoard.id);
                $showEditBoardModal = false;
            } else {
                const result = await response.json();
                pushError(response.status, result.error || 'Failed to delete board.');
            }
        } catch (err) {
            console.error('Error deleting board:', err);
            pushError(500, 'Unexpected error while deleting board.');
        } finally {
            isLoading.stop('BoardRemove', selectedBoard.id);
            if (currentpage === `/${data.profile?.username}/${selectedBoard.slug}`) {
                goto('/');
            }
        }
    }

    async function handleInviteMember() {
        if (!newMemberUsername || !selectedBoard) return;

        if (newMemberUsername === data.profile?.username) {
            pushError(400, "You can't invite yourself.");
            return;
        }

        isLoading.start('BoardEdit', selectedBoard.id);

        try {
            const response = await fetch('/api/boards/members', {
                method: 'POST',
                body: JSON.stringify({
                    usernameToInvite: newMemberUsername,
                    board_id: selectedBoard.id,
                    role: newMemberRole
                })
            });

            if (response.ok) {
                const res = await fetch(`/api/boards/members?board_id=${selectedBoard.id}`);
                members = await res.json();
                newMemberUsername = '';
            } else {
                const result = await response.json();
                pushError(response.status, result.error || 'Failed to invite member.');
            }
        } catch (err) {
            console.error('Error inviting member:', err);
            pushError(500, 'Unexpected error while inviting member.');
        } finally {
            isLoading.stop('BoardEdit', selectedBoard.id);
        }
    }

    async function handleRemoveMember(userUidToRemove: string) {
        if (!selectedBoard) return;
        if (!confirm('Are you sure you want to remove this member?')) return;

        isLoading.start('BoardEdit', selectedBoard.id);

        try {
            const response = await fetch('/api/boards/members', {
                method: 'DELETE',
                body: JSON.stringify({
                    board_id: selectedBoard.id,
                    user_uid_to_remove: userUidToRemove
                })
            });

            if (response.ok) {
                members = members.filter(m => m.user_uid !== userUidToRemove);
            } else {
                const result = await response.json();
                pushError(response.status, result.error || 'Failed to remove member.');
            }
        } catch (err) {
            console.error('Error removing member:', err);
            pushError(500, 'Unexpected error while removing member.');
        } finally {
            isLoading.stop('BoardEdit', selectedBoard.id);
        }
    }


    
	let newBoardName = $state('');
    let nameValidationError = $state<string | null>(null);
	let apiError = $state<string | null>(null);
	let showCreateModal = $state(false);
    
    async function handleCreateBoard() {
        if (!newBoardName || nameValidationError) return;
        $boardLoading = true;

        isLoading.start('BoardAdd');

        try {
            apiError = null;

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
                const result = await response.json();
                pushError(response.status, result.error || 'Failed to create board.');
                apiError = result.error || 'Failed to create board.';
            }
        } catch (err) {
            console.error('Error creating board:', err);
            pushError(500, 'Unexpected error while creating board.');
            apiError = 'Unexpected error while creating board.';
        } finally {
            $boardLoading = false;
            isLoading.stop('BoardAdd');
        }
    }

    
    onMount(async () => {
        try {
            const response = await fetch('/api/boards');
            if (!response.ok) {
                throw new Error('Failed to load your boards.');
            }
            boards = await response.json();

            const sharedResponse = await fetch('/api/boards/shared');
            if (sharedResponse.ok) {
                sharedBoards = await sharedResponse.json();
            }
        } catch (e: any) {
            error = e.message;
        } finally {
            $boardLoading = false;
        }
    });

    let currentpage = $state($page.url.pathname);
    
	$effect(() => {
        currentpage = $page.url.pathname;
	});
</script>

<section class="h-[100dvh] py-4
{$sidebar ? 'min-w-64' : $isHovered ? 'min-w-48' : 'min-w-18'}">
    <section role="complementary" bind:this={sidebarnav} onmouseenter={() => handleMouseEnter()} onmouseleave={() => handleMouseLeave()} class="rounded-e-2xl flex flex-col justify-between overflow-hidden h-[calc(100%-32px)] p-4 ease-out fixed
    {$sidebar ? 'w-64 bg-gray-100 ring ring-slate-300' : $isHovered ? 'w-48 bg-gray-100 ring ring-slate-300' : 'w-18 bg-gray-100'}">
        <!-- TOP SIDEBAR -->
        <div class="flex flex-col ">
            <div class="flex items-center
            {$sidebar || $isHovered ? 'gap-2' : 'gap-4'}">
                <img src={data.profile?.avatar_url || profile} width="40px" height="40px" class="rounded-full aspect-square" alt="">
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
            <div class="border-t-2 border-zinc-300 mt-4 mb-2"></div>
        </div>


        <div class="flex flex-col h-full overflow-y-scroll justify-start overflow-scroll-hidden mask-t-from-96% mask-t-to-100% mask-b-from-90% mask-b-to-100% space-y-1">
            <!-- <div class="w-full h-3 bg-blue-700 opacity-0">,</div> -->

            
            <!-- DASHBOARDS -->
            <a href="/" class="text-slate-900 hover:bg-slate-200 rounded-lg h-[40px] flex items-center-safe
            {$sidebar || $isHovered ? 'w-full space-x-4 pl-2' : 'w-full'} {currentpage === '/' ? 'cursor-default bg-slate-200' : 'cursor-pointer'}" disabled={currentpage === '/'}>
                    <div class="w-[18px] {$sidebar || $isHovered ? '' : 'pl-2'}"><Icon icon="material-symbols:dashboard-outline-rounded" class="inline-block text-2xl" /></div>
                    <div class="line-clamp-1 {$sidebar || $isHovered ? '' : 'opacity-0'}">Dashboard</div>
            </a>

            
            <!-- OWN BOARDS -->
            <!-- {#if $boardLoading}
                <div class="text-slate-900 hover:bg-slate-200 rounded-lg h-[40px] cursor-pointer flex items-center-safe relative
                {$sidebar || $isHovered ? 'w-full space-x-4 pl-2' : 'w-full'}">
                    <div class="w-[18px] {$sidebar || $isHovered ? '' : 'pl-2'}"><Icon icon="material-symbols:leaderboard-outline-rounded" class="rotate-180 inline-block text-2xl" /></div>
                    <div class="line-clamp-1 {$sidebar || $isHovered ? '' : 'opacity-0'}">Loading...</div>
                </div>
            {:else if error} -->
            {#if error}
                <div class="text-slate-900 hover:bg-slate-200 rounded-lg h-[40px] cursor-pointer flex items-center-safe relative
                {$sidebar || $isHovered ? 'w-full space-x-4 pl-2' : 'w-full'}">
                    <div class="w-[18px] {$sidebar || $isHovered ? '' : 'pl-2'}"><Icon icon="material-symbols:leaderboard-outline-rounded" class="rotate-180 inline-block text-2xl" /></div>
                    <div class="line-clamp-1 {$sidebar || $isHovered ? '' : 'opacity-0'}">{error}</div>
                </div>
            {:else}
                <div class="boards-grid space-y-1">
                    {#each boards as board}
                        <a href={`/${board.owner_name || data.profile?.username}/${board.slug}`} disabled={currentpage === `/${board.owner_name || data.profile?.username}/${board.slug}`} class="text-slate-900 hover:bg-slate-200 rounded-lg h-[40px] flex items-center-safe relative group
                        {$sidebar || $isHovered ? 'w-full space-x-4 pl-2' : 'w-full'} {currentpage ===  `/${board.owner_name || data.profile?.username}/${board.slug}` ? 'cursor-default bg-slate-200' : 'cursor-pointer'}">
                            <div class="w-[18px] {$sidebar || $isHovered ? '' : 'pl-2'}"><Icon icon="material-symbols:leaderboard-outline-rounded" class="rotate-180 inline-block text-2xl" /></div>
                            <div class="line-clamp-1 {$sidebar  ? 'w-full' : $isHovered ? 'w-1/2' : 'opacity-0'}">{board.name}</div>
                            <button onclick={(e) => { e.preventDefault(); openEditBoardModal(board); }} class="p-2 rounded hover:bg-slate-300 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity absolute right-1">
                                <Icon icon="mdi:dots-horizontal" />
                            </button>
                        </a>
                    {:else}
                        <button onclick={() => showCreateModal = true} class="text-slate-900 hover:bg-slate-200 rounded-lg h-[40px] cursor-pointer flex items-center-safe relative
                        {$sidebar || $isHovered ? 'w-full space-x-4 pl-2' : 'w-full'}">
                            <div class="w-[18px] {$sidebar || $isHovered ? '' : 'pl-2'}"><Icon icon="material-symbols:leaderboard-outline-rounded" class="rotate-180 inline-block text-2xl" /></div>
                            <div class="line-clamp-1 {$sidebar || $isHovered ? '' : 'opacity-0'}">Create Board</div>
                        </button>
                    {/each}
                </div>
            {/if}


            <div class="border-t-2 border-zinc-300 my-2"></div>

            
            <!-- SHARED BOARDS -->
            <!-- {#if $boardLoading}
                <div class="text-slate-900 hover:bg-slate-200 rounded-lg h-[40px] cursor-pointer flex items-center-safe relative
                {$sidebar || $isHovered ? 'w-full space-x-4 pl-2' : 'w-full'}">
                    <div class="w-[18px] {$sidebar || $isHovered ? '' : 'pl-2'}"><Icon icon="material-symbols:leaderboard-outline-rounded" class="rotate-180 inline-block text-2xl" /></div>
                    <div class="line-clamp-1 {$sidebar || $isHovered ? '' : 'opacity-0'}">Loading...</div>
                </div>
            {:else if error} -->
            {#if error}
                <div class="text-slate-900 hover:bg-slate-200 rounded-lg h-[40px] cursor-pointer flex items-center-safe relative
                {$sidebar || $isHovered ? 'w-full space-x-4 pl-2' : 'w-full'}">
                    <div class="w-[18px] {$sidebar || $isHovered ? '' : 'pl-2'}"><Icon icon="material-symbols:leaderboard-outline-rounded" class="rotate-180 inline-block text-2xl" /></div>
                    <div class="line-clamp-1 {$sidebar || $isHovered ? '' : 'opacity-0'}">{error}</div>
                </div>
            {:else}
                <div class="boards-grid space-y-1">
                    {#each sharedBoards as board}
                        {#if board.owner_name}
                            <a href={`/${board.owner_name || data.profile?.username}/${board.slug}`} disabled={currentpage === `/${board.owner_name || data.profile?.username}/${board.slug}`} class="text-slate-900 hover:bg-slate-200 rounded-lg h-[40px] flex items-center-safe relative group
                            {$sidebar || $isHovered ? 'w-full space-x-4 pl-2' : 'w-full'} {currentpage ===  `/${board.owner_name || data.profile?.username}/${board.slug}` ? 'cursor-default bg-slate-200' : 'cursor-pointer'}">
                                <div class="w-[18px] {$sidebar || $isHovered ? '' : 'pl-2'}"><Icon icon="material-symbols:leaderboard-outline-rounded" class="rotate-180 inline-block text-2xl" /></div>
                                <div class="line-clamp-1 {$sidebar  ? 'w-full' : $isHovered ? 'w-1/2' : 'opacity-0'}">{board.name}</div>
                            </a>
                        {/if}
                    {:else}
                        <div class="text-slate-900 hover:bg-slate-200 rounded-lg h-[40px] cursor-pointer flex items-center-safe relative
                        {$sidebar || $isHovered ? 'w-full space-x-4 pl-2' : 'w-full'}">
                            <div class="w-[18px] {$sidebar || $isHovered ? '' : 'pl-2'}"><Icon icon="material-symbols:leaderboard-outline-rounded" class="rotate-180 inline-block text-2xl" /></div>
                            <div class="line-clamp-1 {$sidebar || $isHovered ? '' : 'opacity-0'}">Shared Board</div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>


        <!-- BOTTOM SIDERBAR -->
        <div class="w-full space-y-2">
            <div class="border-t-2 border-zinc-300 mt-1"></div>
            <button onclick={() => goto('/profile')} class="text-slate-900 hover:bg-slate-200 font-semibold font-outfit tracking-wider rounded-lg h-[40px] flex justify-center-safe items-center-safe
            {$sidebar || $isHovered ? 'w-full space-x-2' : 'w-10 group-hover:w-40 group-hover:space-x-2'} {currentpage === '/profile' ? 'cursor-default bg-slate-200' : 'cursor-pointer'}" disabled={currentpage === '/profile'}>
                    <div class="w-[18px] {$sidebar || $isHovered ? '' : 'pl-3'}"><Icon icon="fa7-solid:gear" class="inline-block text-lg duration-400 ease-in-out
                        {$sidebar || $isHovered ? 'rotate-0' : 'rotate-180'}" /></div>
                    <div class="{$sidebar || $isHovered ? '' : 'opacity-0'}">Settings</div>
            </button>
            <!-- <LogoutButton /> -->
        </div>
    </section>
</section>

<!-- 
=========================
    ADD BOARD MODAL
=========================
-->
{#if showCreateModal}
    <section class="z-50 fixed w-full h-[100dvh] top-0 right-0 bg-zinc-900/30 overflow-hidden cursor-default"
	transition:fade={{duration: 150}} onclick={() => showCreateModal=false}>
	<!-- transition:fade={{duration: 150}}> -->
        <div class="bg-white p-4 rounded-xl min-w-[300px] w-full max-w-[300px] h-[145px] relative translate-y-[27dvh] translate-x-4"
		transition:fly={{ y: 100, duration: 300, opacity: 0 }} onclick={(e) => e.stopPropagation()} >
		<!-- transition:fly={{ y: 100, duration: 300, opacity: 0 }}> -->
			<!-- <section class="flex justify-between w-full">
                <div class="space-x-2 flex">           
                    <div class="h-[28px] text-[18px] font-outfit leading-none tracking-wide font-semibold flex justify-center items-center ml-1">Add Board</div>
                </div>
				<button onclick={() => showCreateModal=false} class="aspect-square rounded-full cursor-pointer hover:rotate-90 duration-500 ease-out">
                    <Icon icon="mingcute:close-fill" class="text-2xl"/>
                </button>
			</section> -->
			<form onsubmit={handleCreateBoard} class="flex flex-col gap-4 overflow-y-auto overflow-x-hidden pt-2">
				<div>
					<label for="board-name">Board Name</label>
                    <input id="board-name" type="text" bind:value={newBoardName} required class="w-full border rounded p-2" maxlength="50"/>
				</div>
                
                <section class="flex flex-row space-x-2 absolute bottom-4 left-4">
                    <button type="submit" class="bg-sky-500 text-white hover:bg-sky-400 disabled:bg-sky-400 cursor-pointer h-[40px] w-[calc((300px-32px-4px)/2)] font-semibold rounded-md">
                        Add Board
                    </button>
                    <button type="button" onclick={() => showCreateModal=false} class="bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-300 cursor-pointer h-[40px] w-[calc((300px-32px-4px)/2)] font-semibold rounded-md">
                        Close
                    </button>
                </section>
			</form>
        </div>
    </section>
{/if}


<!-- 
=========================
    EDIT BOARD MODAL
=========================
-->
{#if $showEditBoardModal && selectedBoard}
    <section class="z-50 fixed w-full h-[100dvh] top-0 right-0 bg-zinc-900/30 flex justify-center items-center overflow-hidden cursor-default backdrop-blur-xs"
	transition:fade={{duration: 150}} onclick={() => $showEditBoardModal=false}>
	<!-- transition:fade={{duration: 150}}> -->
        <div class="bg-white p-4 rounded-xl min-w-[300px] w-full max-w-[400px] h-[500px] relative"
		transition:fly={{ y: 100, duration: 300, opacity: 0 }} onclick={(e) => e.stopPropagation()} >
		<!-- transition:fly={{ y: 100, duration: 300, opacity: 0 }}> -->
            
			<section class="flex justify-between w-full">
                <div class="space-x-2 flex">           
                    <div class="h-[28px] text-[18px] font-outfit leading-none tracking-wide font-semibold flex justify-center items-center ml-1">Board Settings</div>
                </div>
				<button onclick={() => $showEditBoardModal=false} class="aspect-square rounded-full cursor-pointer hover:rotate-90 duration-500 ease-out">
                    <Icon icon="mingcute:close-fill" class="text-2xl"/>
                </button>
			</section>

			<form onsubmit={handleUpdateBoard}>
				<div class="mt-2">
					<label for="board-name">Board Name</label>
                    <input id="board-name" type="text" bind:value={editingBoardName} required class="w-full border rounded-md p-2" maxlength="50"/>
				</div>
                <div class="flex justify-between w-full mt-4 absolute bottom-4">
                    <div class="flex flex-row space-x-2 left-4">
                        <button class="bg-sky-500 text-white hover:bg-sky-400 disabled:bg-sky-400 cursor-pointer h-[40px] w-[calc((300px-32px-4px)/2)] font-semibold rounded-md">
                            Update
                        </button>
                        <button type="button" onclick={() => $showEditBoardModal=false} class="bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-300 cursor-pointer h-[40px] w-[calc((300px-32px-4px)/2)] font-semibold rounded-md">
                            Cancel
                        </button>
                    </div>
                    <button type="button" onclick={handleDeleteBoard} class="bg-rose-100 text-rose-700 hover:bg-rose-200 disabled:bg-rose-200 cursor-pointer h-[40px] aspect-square font-semibold rounded-md flex justify-center items-center -translate-x-8">
                        <Icon icon="mingcute:delete-2-line" class="text-2xl"/>
                    </button>
                </div>
			</form>

			<h3 class="mt-4">Members</h3>

			<form onsubmit={handleInviteMember} class="flex w-full justify-between mb-2">
				<input type="text" bind:value={newMemberUsername} placeholder="enter @username" maxlength="50" class="w-full border rounded-md p-2 mr-2" />
                <div class="rounded-s-md w-[200px] pr-2
                {!newMemberRole ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 
                newMemberRole === 3 ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 
                newMemberRole === 1 ? 'bg-sky-200 text-sky-800 hover:bg-sky-300' : 
                'bg-emerald-200 text-emerald-800 hover:bg-emerald-300'}">
                    <select bind:value={newMemberRole} class="w-full p-2 cursor-pointer font-semibold text-center">
                        <option class="bg-white text-black" value={1}>Viewer</option>
                        <option class="bg-white text-black" value={2}>Editor</option>
                        <option class="bg-white text-black" value={3}>Manager</option>
                    </select>
                </div>
                <button type="submit" class="bg-sky-500 text-white hover:bg-sky-400 disabled:bg-sky-400 cursor-pointer h-[40px] aspect-square font-semibold rounded-e-md flex justify-center items-center">
                    <Icon icon="mingcute:user-add-line" class="text-xl"/>
                </button>
			</form>
			
			<table class="w-full">
                <tbody class="w-full">
				    {#each members as member}
                        <tr class="w-full flex text-nowrap space-x-2 items-center pb-1 mb-1 border-b-1 border-slate-300">
                            <td class="aspect-square h-10 w-10"><img src={member.avatar_url} alt="userporfile" class="h-10 rounded-full"></td>
                            <td class="line-clamp-1 min-w-[160px] text-start">@{member.username}</td>
                            <td class="text-center w-full flex justify-center items-center">
                                <div class="rounded-full w-fit px-3 py-1 font-semibold text-xs
                                {!member.role ? 'bg-gray-200 text-gray-800' : 
                                member.role === 3 ? 'bg-rose-100 text-rose-700' : 
                                member.role === 2 ? 'bg-emerald-200 text-emerald-800' : 
                                'bg-sky-200 text-sky-800'}">
                                    {member.role === 3 ? 'Manager' : member.role === 2 ? 'Editor' : 'Viewer'}
                                </div>
                            </td>
                            <!-- <td class="">{member.user_uid.split('').slice(0, 18).join('')}...</td> -->
                            <td>
                                <button onclick={() => handleRemoveMember(member.user_uid)} class="bg-rose-100 text-rose-700 hover:bg-rose-200 disabled:bg-rose-200 cursor-pointer h-[40px] aspect-square font-semibold rounded-md flex justify-center items-center">
                                    <Icon icon="mingcute:user-remove-line" class="text-xl"/>
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
			</table>
        </div>
    </section>
{/if}