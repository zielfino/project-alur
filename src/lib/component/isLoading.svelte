<script lang="ts">
	import { isAnyLoading } from '$lib/stores/loading';
	import { fade } from 'svelte/transition';

</script>
{#if $isAnyLoading}
    <div transition:fade={{duration: 150}}
        class="fixed inset-0 z-[500] bg-black/20 backdrop-blur-sm
            flex items-center justify-center cursor-wait
            transition-opacity duration-300 opacity-100
            pointer-events-auto select-none"
    >
        <div class="h-10 w-10 border-4 border-white/60 border-t-transparent rounded-full animate-spin"></div>
    </div>
{/if}