<!-- src\lib\component\logoutButton.svelte -->
<script lang="ts">
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';

    async function handleLogout() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Error logging out:', error);
            return;
        }

        await goto('/');
        // window.location.href = '/';
    }
</script>
<button on:click={handleLogout}>
    Logout
</button>