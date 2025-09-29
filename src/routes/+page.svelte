<!-- +page.svelte -->
<script lang="ts">
    import Dashboard from '$lib/island/dashboard.svelte';
    import Landing from '$lib/island/landing.svelte';
    import { sessionStore } from '$lib/stores/sessionStore';
</script>

{#if $sessionStore}
    <Dashboard />
{:else}
    <Landing />
{/if}
