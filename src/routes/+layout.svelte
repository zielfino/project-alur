<!-- +layout.svelte -->
<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { sessionStore } from '$lib/stores/sessionStore';

	let { children } = $props();

	onMount(() => {
		// Get the initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			sessionStore.set(session);
		});

		// Listen for auth changes and update the store
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
			sessionStore.set(session);
		});

		return () => subscription.unsubscribe();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<section>
	{@render children?.()}
</section>
