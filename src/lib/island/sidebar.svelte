<script lang="ts">
   	import { sidebar, sidebarIsHovered as isHovered } from '$lib/stores/uiStore';
    import LogoutButton from "$lib/component/logoutButton.svelte";
	import profile from '$lib/assets/profile.png';
	import { goto } from "$app/navigation";
	import Icon from '@iconify/svelte';
	let { data } = $props();
    import { fade } from 'svelte/transition';
	import { page } from '$app/stores';
    
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
            <a href="/testaja" class="text-slate-900 hover:bg-slate-200 rounded-lg h-[40px] cursor-pointer flex items-center-safe
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