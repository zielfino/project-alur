<!-- // src\lib\island\login.svelte -->
<script lang="ts">
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
   	import { isLoginModalOpen, isSigningUpMode } from '$lib/stores/uiStore';
	let name = $state('');
	let email = $state('');
	let password = $state('');
	let isSigningUp = $state(isSigningUpMode)

	async function handleEmailLogin() {
		console.log('--- LOGIN FRONTEND: Login button clicked. Sending data to API... ---');
		const response = await fetch('/api/auth/signin', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password })
		});

		if (response.ok) {
			await invalidateAll();
			await goto('/');
		} else {
			const result = await response.json();
			alert('Error logging in: ' + result.message);
		}
	}

	async function handleEmailSignup() {
		// CHECKPOINT SIGNUP 1 (Frontend): Tombol signup diklik.
		console.log('--- SIGNUP FRONTEND: Signup button clicked. Sending data to API... ---');

		// Mengirim data form ke API endpoint yang baru kita buat.
		const response = await fetch('/api/auth/signup', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, email, password })
		});

		// Menerima respons dari API.
		const result = await response.json();

		if (response.ok) {
			// Jika API mengembalikan sukses, tampilkan pesannya.
			console.log('--- SIGNUP FRONTEND: SUCCESS - API returned success ---');
			alert(result.message);
		} else {
			// Jika API mengembalikan error, tampilkan pesannya.
			console.error('--- SIGNUP FRONTEND: FAILED - API returned an error:', result.error, '---');
			alert('Error signing up: ' + result.error);
		}
	}


	
    let passwordInput: HTMLElement | null = $state(null);
    let emailInput: HTMLElement | null = $state(null);
    let nameInput: HTMLElement | null = $state(null);
</script>

<section class="w-[800px] bg-white h-[500px] agerrborder grid grid-cols-2 overflow-hidden {$page.url.pathname === '/login' ? 'w-full h-full' : ''}">
	<div class="p-4 pr-0 bg-white text-slate-900 flex flex-col items-center">
		<div class="grid grid-cols-2 gap-2 items-center mb-4 relative w-full">
			<div class="absolute h-[50px] w-[calc(50%-0.25rem)] agerrbggradient	 rounded-lg duration-200 ease-in-out {$isSigningUpMode ? 'translate-x-[calc(100%+0.5rem)]' : ''}"></div>
			<button disabled={!$isSigningUpMode} class="z-1 font-semibold font-outfit tracking-wider h-[50px] rounded-lg {!$isSigningUpMode ? 'text-white' : 'cursor-pointer text-slate-900 hover:underline focus-visible:underline'}" onclick={() => (isSigningUpMode.set(false))}>Login</button>
			<button disabled={$isSigningUpMode} class="z-1 font-semibold font-outfit tracking-wider h-[50px] rounded-lg {$isSigningUpMode ? 'text-white' : 'cursor-pointer text-slate-900 hover:underline focus-visible:underline'}" onclick={() => (isSigningUpMode.set(true))}>Sign Up</button>
		</div>
		<form class="flex flex-col gap-2.5 text-slate-800 w-[300px] h-full {$page.url.pathname === '/login' ? 'justify-center' : ''}">
			{#if $isSigningUpMode}
				<!-- <div class="flex gap-2 w-full">
					<div class="button bg-slate-200 py-2 px-3 rounded-lg w-full flex gap-2">
						<Icon icon="fa7-solid:user-large" class="inline-block" />
						<input type="text" bind:value={name} placeholder="Your Name" />
					</div>
					<div class="button bg-slate-200 py-2 px-3 rounded-lg w-full flex gap-2">
						<Icon icon="fa7-solid:user-large" class="inline-block" />
						<input type="text" bind:value={email} placeholder="Email" />
					</div>
				</div> -->
				<div onclick={() => nameInput.focus()} class="relative group">
					<h5 class="agerrh5 absolute top-0.5 left-1 duration-300 ease-in-out
					{name !== '' ? '' : ' lableinput'}">Name</h5>
					<div class="button bg-slate-200 py-2 px-3 rounded-lg w-full flex items-center gap-2 mt-5">
						<Icon icon="fa7-solid:user" class="" />
						<input type="text" bind:this={nameInput} bind:value={name} class="w-full h-full" />
					</div>
				</div>
			{/if}
			<div onclick={() => emailInput.focus()} class="relative group">
				<h5 class="agerrh5 absolute top-0.5 left-1 duration-300 ease-in-out
				{email !== '' ? '' : ' lableinput'}">Email</h5>
				<div class="button bg-slate-200 py-2 px-3 rounded-lg w-full flex items-center gap-2 mt-5">
					<Icon icon="fa7-solid:user" class="" />
					<input type="text" bind:this={emailInput} bind:value={email} class="w-full h-full" />
				</div>
			</div>
			<div onclick={() => passwordInput.focus()} class="relative group">
				<h5 class="agerrh5 absolute top-0.5 left-1 duration-300 ease-in-out
				{password !== '' ? '' : ' lableinput'}">Password</h5>
				<div class="button bg-slate-200 py-2 px-3 rounded-lg w-full flex items-center gap-2 mt-5">
					<Icon icon="fa7-solid:key" class="" />
					<input type="text" bind:this={passwordInput} bind:value={password} class="w-full h-full" />
				</div>
			</div>

		<div class="h-full my-0 {$page.url.pathname === '/login' ? 'hidden' : ''}"></div>
		
			{#if $isSigningUpMode}
				<button type="submit" class="agerrbggradient text-white tracking-wider font-semibold font-outfit text-base border border-slate-300 rounded-lg py-3 cursor-pointer focus-within:bg-sky-300
				 {$page.url.pathname === '/login' ? 'mt-4' : ''}" onclick={handleEmailSignup}>Sign Up</button>
			{:else}
				<button type="submit" class="agerrbggradient text-white tracking-wider font-semibold font-outfit text-base border border-slate-300 rounded-lg py-3 cursor-pointer focus-within:bg-sky-300
				 {$page.url.pathname === '/login' ? 'mt-4' : ''}" onclick={handleEmailLogin}>Login</button>
			{/if}
		</form>
		<div class="w-full">
			<div class="w-full flex justify-center items-center my-6">
				<div class=" flex justify-center items-center {$page.url.pathname === '/login' ? 'w-[40%] space-x-4' : 'w-[80%] space-x-2'}">
					<div class="border-t-2 border-slate-300 w-full"></div>
					<div class="whitespace-nowrap font-outfit font-semibold tracking-widest text-slate-500">or login with</div>
					<div class="border-t-2 border-slate-300 w-full"></div>
				</div>
			</div>
			<div class="gap-2 flex space-x-2 w-full justify-center my-6">
				<a  href="/api/google" class="aspect-square h-[46px] focus-visible:bg-slate-300 hover:bg-slate-300 border border-slate-300 p-2 text-[22px] rounded-full flex items-center justify-center"><Icon icon="logos:google-icon"/></a>
				<a  href="/api/google" class="aspect-square h-[46px] focus-visible:bg-slate-300 hover:bg-slate-300 border border-slate-300 p-2 text-[22px] rounded-full flex items-center justify-center"><Icon icon="logos:linkedin-icon"/></a>
				<a  href="/api/google" class="aspect-square h-[46px] focus-visible:bg-slate-300 hover:bg-slate-300 border border-slate-300 p-2 text-[22px] rounded-full flex items-center justify-center"><Icon icon="logos:discord-icon"/></a>
			</div>
			{#if $page.url.pathname === '/login'}
				<button onclick={() => goto('/')} class="agerrborder shadow-md bg-slate-900 w-full rounded-xl hover:bg-slate-600 focus-visible:bg-slate-600 py-4 text-base text-white font-semibold font-outfit tracking-wider cursor-pointer">Back to Landing</button>
			{/if}
		</div>
	</div>
	<div class="relative agerrbggradient rounded-lg m-4">
		{#if $page.url.pathname === '/'}
			<button onclick={() => isLoginModalOpen.set(false)} class="cursor-pointer text-2xl absolute top-3.5 right-4 text-white duration-300 hover:rotate-90 ease-out aspect-square w-8 flex justify-center items-center rounded-full"><Icon icon="fa7-solid:close" class="" /></button>
		{/if}
	</div>
</section>