<script lang="ts">
   	import { sidebar } from '$lib/stores/uiStore';
    import LogoutButton from "$lib/component/logoutButton.svelte";
	import profile from '$lib/assets/profile.png';
	import { goto } from "$app/navigation";
	import Icon from '@iconify/svelte';
	let { data } = $props();
    
    let isHovered = $state(false);
    let sidebarnav: HTMLElement | null = $state(null);
</script>

<section class="h-[100dvh] py-4">
    <section role="complementary" bind:this={sidebarnav} onmouseenter={() => isHovered = true} onmouseleave={() => isHovered = false} class="group rounded-e-2xl flex flex-col justify-between overflow-hidden h-full p-4 bg-slate-200 ease-out
    {$sidebar || isHovered ? 'w-48' : 'w-18 hover:w-48'}">
        <!-- TOP SIDEBAR -->
        <div class="flex flex-col ">
            <div class="flex items-center hover:underline rounded-full cursor-pointer
            {$sidebar || isHovered ? 'gap-2' : 'gap-4'}">
                <img src={data.profile?.avatar_url || profile} width="40px" height="40px" class="rounded-full" alt="">
                <div class=" line-clamp-1 font-medium text-slate-900 font-outfit text-base {$sidebar || isHovered ? 'opacity-100' : 'opacity-0'}">{ data.profile?.name || 'User'   }</div>
            </div>
            <div class="border-t-2 border-zinc-300 my-4"></div>
            <div class="space-y-2 text-slate-900 font-outfit text-base font-medium flex flex-col">

                <!-- Collapse -->
                <div class="flex items-center ring rounded-full cursor-pointer hover:bg-slate-300
                {$sidebar || isHovered ? 'pl-5' : ''}">
                    <div class="min-w-10 aspect-square flex justify-center items-center">
                        <Icon icon="fa7-solid:angle-double-left" class="inline-block text-lg duration-400 ease-in-out
                        {$sidebar || isHovered ? 'rotate-0' : 'rotate-180'}" />
                    </div> 
                    <div class="{$sidebar || isHovered ? 'opacity-100' : 'opacity-0'}" >Collapse</div> 
                </div>

                <!-- Search -->
                <div class="flex items-center
                {$sidebar || isHovered ? 'gap-2' : 'gap-4'}">
                    <div class="min-w-10 aspect-square flex justify-center items-center ring rounded-full cursor-pointer hover:bg-slate-300">
                        <Icon icon="fa7-solid:magnifying-glass" class="inline-block text-lg" />
                    </div> 
                    <input type="text" class="{$sidebar || isHovered ? 'opacity-100' : 'opacity-0'}" placeholder="Search" /> 
                </div>
            </div>
            <div class="border-t-2 border-zinc-300 mt-4 mb-1"></div>
        </div>


        <!-- BOARDS -->
        <div class="flex flex-col h-full overflow-y-scroll justify-start overflow-scroll-hidden mask-t-from-96% mask-t-to-100% mask-b-from-90% mask-b-to-100%">
            <div class="w-full h-3 bg-blue-700 opacity-0">,</div>
            <button class="text-slate-900 hover:bg-slate-300 rounded-lg h-[40px] cursor-pointer flex items-center-safe
            {$sidebar || isHovered ? 'w-40 space-x-4 pl-2' : 'w-1'}">
                    <div class="w-[18px] {$sidebar || isHovered ? '' : 'pl-2'}"><Icon icon="material-symbols:dashboard-outline-rounded" class="inline-block text-2xl" /></div>
                    <div class="line-clamp-1 {$sidebar || isHovered ? '' : 'opacity-0'}">Dashboard</div>
            </button>
            <button class="text-slate-900 hover:bg-slate-300 rounded-lg h-[40px] cursor-pointer flex items-center-safe
            {$sidebar || isHovered ? 'w-40 space-x-4 pl-2' : 'w-1'}">
                    <div class="w-[18px] {$sidebar || isHovered ? '' : 'pl-2'}"><Icon icon="material-symbols:leaderboard-outline-rounded" class="rotate-180 inline-block text-2xl" /></div>
                    <div class="line-clamp-1 {$sidebar || isHovered ? '' : 'opacity-0'}">Job Tracker</div>
            </button>
            <button class="text-slate-900 hover:bg-slate-300 rounded-lg h-[40px] cursor-pointer flex items-center-safe
            {$sidebar || isHovered ? 'w-40 space-x-4 pl-2' : 'w-1'}">
                    <div class="w-[18px] {$sidebar || isHovered ? '' : 'pl-2'}"><Icon icon="material-symbols:checklist-rounded" class="inline-block text-2xl" /></div>
                    <div class="line-clamp-1 {$sidebar || isHovered ? '' : 'opacity-0'}">Task Manager</div>
            </button>
            <button class="text-slate-900 hover:bg-slate-300 rounded-lg h-[40px] cursor-pointer flex items-center-safe
            {$sidebar || isHovered ? 'w-40 space-x-4 pl-2' : 'w-1'}">
                    <div class="w-[18px] {$sidebar || isHovered ? '' : 'pl-2'}"><Icon icon="material-symbols:attach-money-rounded" class="inline-block text-2xl" /></div>
                    <div class="line-clamp-1 {$sidebar || isHovered ? '' : 'opacity-0'}">Money </div>
            </button>
        </div>


        <!-- BOTTOM SIDERBAR -->
        <div class="w-full space-y-2">
            <div class="border-t-2 border-zinc-300 mt-1"></div>
            <button onclick={() => goto('/profile')} class="text-slate-900 hover:bg-slate-300 font-semibold font-outfit tracking-wider rounded-lg h-[40px] cursor-pointer flex justify-center-safe items-center-safe
            {$sidebar || isHovered ? 'w-40 space-x-2' : 'w-1'}">
                    <div class="w-[18px] {$sidebar || isHovered ? '' : 'pl-3'}"><Icon icon="fa7-solid:gear" class="inline-block text-lg duration-400 ease-in-out
                        {$sidebar || isHovered ? 'rotate-0' : 'rotate-180'}" /></div>
                    <div class="{$sidebar || isHovered ? '' : 'opacity-0'}">Settings</div>
            </button>
            <LogoutButton />
        </div>
    </section>
</section>