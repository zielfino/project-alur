<script lang="ts">
    import LogoutButton from "$lib/component/logoutButton.svelte";
	import profile from '$lib/assets/profile.png';
	import { goto } from "$app/navigation";
	let { data } = $props();
</script>

<h1>Welcome to your Dashboard</h1>

    <div class="flex items-center gap-2">
        <img src={data.profile?.avatar_url || profile} width="30px" height="30px" class="rounded-full" alt="">
        <div>{ data.profile?.name || 'User'   }</div>
    </div>

<LogoutButton />
<button onclick={() => goto('/profile')}>Profile</button>