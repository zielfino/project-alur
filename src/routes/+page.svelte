<script lang="ts">
    import Dashboard from '$lib/island/dashboard.svelte';
    import Landing from '$lib/island/landing.svelte';

	let { data } = $props();
    console.log('--- Page Data:', data);
</script>

<main class="min-w-full min-h-[100dvh] overscroll-auto">
	{#if data.profile}
		<Dashboard />
	{:else}
		<Landing />
	{/if}
</main>