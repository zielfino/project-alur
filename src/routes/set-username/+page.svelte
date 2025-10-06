<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Icon from '@iconify/svelte';
    
	let { data } = $props();

	let username = $state('');
	let error = $state<string | null>(null);
	let loading = $state(false);

	async function handleSubmit() {
		loading = true;
		error = null;

		const response = await fetch('/api/profile/setusername', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username })
		});

		if (response.ok) {
			await invalidateAll();
			await goto('/');
		} else {
			const result = await response.json();
			error = result.error || 'Something went wrong.';
		}

		loading = false;
	}

	
    let usernameInput: HTMLInputElement | null = $state(null);
</script>


<div class="w-full h-dvh flex flex-col justify-center items-center">
	{#if !data.profile?.username}
		<h2 class="agerrh2">Complete Your Profile</h2>
		<p class="agerrh5 text-slate-500">Please choose a unique username to continue.</p>

		<!-- <form onsubmit={handleSubmit}> -->
			
			<form onsubmit={handleSubmit} class="relative group flex select-none">
				<button tabindex="-1" type="button" onclick={() => { if (usernameInput) usernameInput.focus(); }} class="agerrh5 absolute top-[1.5px] left-[2.55px] duration-300 ease-in-out
				{username !== '' ? '' : ' lableinput'}">@username</button>
				<div class="button text-[14px] font-outfit leading-none tracking-wide font-semibold bg-slate-200 py-2 px-3 rounded-lg w-[230px] flex items-center mt-5">
					<Icon icon="fa7-solid:user" class="mr-2" />
					<span class="{username === '' ? 'hidden' : ''}">@</span><input maxlength="25" type="text" bind:this={usernameInput} bind:value={username} class="w-full h-full" />
				</div>
				<button type="submit" disabled={loading} class="ml-2 mt-5 px-3 text-sm font-semibold font-outfit tracking-wide whitespace-nowrap agerrbggradient rounded-lg cursor-pointer">
					{#if loading}Saving...{:else}Save Profile{/if}
				</button>
			</form>
			<!-- <label for="username">Username</label>
			<input id="username" type="text" bind:value={username} required /> -->
			
		<!-- </form> -->

		{#if error}
			<p class="absolute text-red-500 z-50 agerrh4 max-w-[300px] text-center translate-y-24">{error}</p>
		{/if}
	{:else}
		<div class="px-2 flex flex-col items-center justify-center">
			<p class="agerrh4 text-center">Your username is already set to: <strong>@{data.profile.username}</strong></p>
			<p class="agerrh4 text-center">It cannot be changed.</p>
			<button onclick={() => goto('/')} class="agerrborder shadow-md bg-slate-900 w-full max-w-[300px] mt-4 rounded-xl hover:bg-slate-600 focus-visible:bg-slate-600 py-4 text-base text-white font-semibold font-outfit tracking-wider cursor-pointer">Back to Dashboard</button>
		</div>
	{/if}
</div>