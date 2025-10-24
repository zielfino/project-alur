<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { goto, invalidateAll } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabaseClient';
	import '../app.css';
	import ErrorNotification from '$lib/component/ErrorNotification.svelte';
	

	// runes pattern
	let { data, children } = $props();

	// This listener's ONLY job is to detect auth changes and reload the data.
	onMount(() => {
		console.log('--- CHECKPOINT 8: Layout mounted. Setting up auth listener... ---');
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log('--- CHECKPOINT 9: Auth state changed! Event:', event, '---');

        	if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
				// The user's status has changed. Tell SvelteKit to re-run all `load` functions.
				console.log('--- INFO: SIGNED_IN detected. Calling invalidateAll()... ---');
				await invalidateAll();
			}
			if (event === 'SIGNED_OUT') {
				goto('/login');
			}
		});
		return () => subscription.unsubscribe();
	});

	// This effect's ONLY job is to look at the data and decide where the user should be.
	$effect(() => {
        console.log('--- EFFECT: Running check...', { hasSession: !!data.session, hasProfile: !!data.profile });

		if (data.session && !data.profile) {
			console.log('--- EFFECT: Session exists, but no profile. Calling /api/sync-user... ---');
			fetch('/api/sync-user', { method: 'POST' })
				.then(res => {
					console.log('--- SYNC API RESPONSE STATUS:', res.status, '---');
					if (res.ok) {
						// Sync berhasil, sekarang muat ulang semua data untuk mendapatkan profil baru
						console.log('--- SYNC API SUCCESS: Reloading data with invalidateAll()... ---');
						invalidateAll();
					} else {
                        console.error('--- SYNC API FAILED: API returned an error. ---');
                    }
				})
				.catch(err => {
					console.error('--- SYNC API FETCH FAILED:', err, '---');
				});
		}
		
		console.log('--- CHECKPOINT 10: Effect is running. Checking data...', {
			hasSession: !!data.session,
			hasProfile: !!data.profile,
			username: data.profile?.username
		});
		
		// This is a special check for a brand new user.
		if (data.session && !data.profile) {
			console.log('--- CHECKPOINT 11: Session found but no profile yet. Calling invalidateAll() to refetch... ---');
			// The server-side callback must have just finished.
			// The profile just needs a moment to be created by the sync. Let's trigger a reload of data.
			invalidateAll();
		}

		// This is the check for an existing user who needs to create a username.
		if (data.session && data.profile?.username === null && $page.route.id !== '/set-username') {
			console.log('--- CHECKPOINT 12: Profile found but username is null. Redirecting to /set-username... ---');
			goto('/set-username');
		}
	});

	// function lockScroll() {
	// 	document.body.style.overflow = 'hidden';
	// 	document.body.style.touchAction = 'none';
    // }

    // function unlockScroll() {
	// 	document.body.style.overflow = '';
	// 	document.body.style.touchAction = '';
    // }

	
	import ConfirmModal from '$lib/component/ConfirmModal.svelte';
	import IsLoading from '$lib/component/isLoading.svelte';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Caveat:wght@400..700&family=Coming+Soon&family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Outfit:wght@100..900&display=swap" rel="stylesheet">
</svelte:head>

<section>
	<ErrorNotification />
	{@render children?.()}
	<IsLoading/>
	<ConfirmModal />
</section>
