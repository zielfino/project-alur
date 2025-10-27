<!-- // src\lib\island\login.svelte -->
<script lang="ts">
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
   	import { isLoginModalOpen, isSigningUpMode } from '$lib/stores/uiStore';
	import Logosvg from '$lib/assets/logosvg.svelte';
	import { isLoading } from '$lib/stores/loading';
	let name = $state('');
	let email = $state('');
	let password = $state('');
	let isSigningUp = $state(isSigningUpMode)

	async function handleEmailLogin() {
		isLoading.start('login')
		console.log('--- LOGIN FRONTEND: Login button clicked. Sending data to API... ---');
		const response = await fetch('/api/auth/signin', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password })
		});
		if (response.ok) {
			await invalidateAll();
			await goto('/');
			isLoading.stop('login')
		} else {
			const result = await response.json();
			alert('Error logging in: ' + result.message);
			isLoading.stop('login')
		}
	}

	async function handleEmailSignup() {
		isLoading.start('signin')
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
			isLoading.stop('signin')
		} else {
			// Jika API mengembalikan error, tampilkan pesannya.
			console.error('--- SIGNUP FRONTEND: FAILED - API returned an error:', result.error, '---');
			alert('Error signing up: ' + result.error);
			isLoading.stop('signin')
		}
	}


	
    let passwordInput: HTMLElement | null = $state(null);
    let emailInput: HTMLInputElement | null = $state(null);
    let nameInput: HTMLInputElement | null = $state(null);
</script>

<section class="w-[340px] tablet:w-[640px] laptop:min-w-[800px] bg-white h-[500px] overflow-hidden {$page.url.pathname === '/login' ? 'w-full h-full flex justify-center tablet:w-full' : 'grid grid-cols-2 tablet:grid-cols-4 laptop:grid-cols-5 agerrborder'}"
onclick={(e) => e.stopPropagation()} >
 	<!-- > -->
	<div class="p-4 tablet:pr-0 bg-white text-slate-900 flex flex-col items-center {$page.url.pathname === '/login' ? 'w-[500px]' : 'col-span-2'}">
		{#if $page.url.pathname === '/login'}
            <div class="w-24 mb-6 mt-2 tablet:hidden">
				<Logosvg/>
			</div>
		{/if}
		<div class="grid grid-cols-2 gap-2 items-center mb-4 relative w-full">
			<div class="absolute h-[50px] w-[calc(50%-0.25rem)] agerrbggradient	 rounded-lg duration-200 ease-in-out {$isSigningUpMode ? 'translate-x-[calc(100%+0.5rem)]' : ''}"></div>
			<button disabled={!$isSigningUpMode} class="z-1 font-semibold font-outfit tracking-wider h-[50px] rounded-lg {!$isSigningUpMode ? 'text-white' : 'cursor-pointer text-slate-900 hover:underline focus-visible:underline'}" onclick={() => (isSigningUpMode.set(false))}>Login</button>
			<button disabled={$isSigningUpMode} class="z-1 font-semibold font-outfit tracking-wider h-[50px] rounded-lg {$isSigningUpMode ? 'text-white' : 'cursor-pointer text-slate-900 hover:underline focus-visible:underline'}" onclick={() => (isSigningUpMode.set(true))}>Sign Up</button>
		</div>
		<form class="flex flex-col gap-2.5 text-slate-800 w-[300px] h-full {$page.url.pathname === '/login' ? 'justify-center' : ''}">
			{#if $isSigningUpMode}
				<div class="relative group">
					<button tabindex="-1" onclick={() => { if (nameInput) nameInput.focus(); }} class="agerrh5 pointer-events-none absolute top-0.5 left-1 duration-300 ease-in-out
					{name !== '' ? '' : ' lableinput'}">Name</button>
					<div class="button bg-slate-200 py-2 px-3 rounded-lg w-full flex items-center gap-2 mt-5">
						<Icon icon="fa7-solid:user" class="" />
						<input type="text" bind:this={nameInput} bind:value={name} class="w-full h-full" />
					</div>
				</div>
			{/if}
			<div class="relative group">
				<button tabindex="-1"  onclick={() => { if (emailInput) emailInput.focus(); }} class="agerrh5 pointer-events-none absolute top-0.5 left-1 duration-300 ease-in-out
				{email !== '' ? '' : ' lableinput'}">Email</button>
				<div class="button bg-slate-200 py-2 px-3 rounded-lg w-full flex items-center gap-2 mt-5">
					<Icon icon="fa7-solid:envelope" class="" />
					<input type="text" bind:this={emailInput} bind:value={email} class="w-full h-full" />
				</div>
			</div>
			<div class="relative group">
				<button tabindex="-1" onclick={() => { if (passwordInput) passwordInput.focus(); }} class="agerrh5 pointer-events-none absolute top-0.5 left-1 duration-300 ease-in-out
				{password !== '' ? '' : ' lableinput'}">Password</button>
				<div class="button bg-slate-200 py-2 px-3 rounded-lg w-full flex items-center gap-2 mt-5">
					<Icon icon="fa7-solid:key" class="" />
					<input type="password" bind:this={passwordInput} bind:value={password} class="w-full h-full" />
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
				<div class=" flex justify-center items-center w-[80%] space-x-2">
					<div class="border-t-2 border-slate-300 w-full"></div>
					<div class="whitespace-nowrap font-outfit font-semibold tracking-widest text-slate-500">or { $isSigningUpMode ? 'Sign Up' : 'Login' } with</div>
					<div class="border-t-2 border-slate-300 w-full"></div>
				</div>
			</div>
			<div class="gap-2 flex space-x-2 w-full justify-center my-6">
				<a  href="/api/google" class="aspect-square h-[46px] focus-visible:bg-slate-300 hover:bg-slate-300 border border-slate-300 p-2 text-[22px] rounded-full flex items-center justify-center"><Icon icon="logos:google-icon"/></a>
				<a  href="/api/linkedin" class="aspect-square h-[46px] focus-visible:bg-slate-300 hover:bg-slate-300 border border-slate-300 p-2 text-[22px] rounded-full flex items-center justify-center"><Icon icon="logos:linkedin-icon"/></a>
				<a  href="/api/discord" class="aspect-square h-[46px] focus-visible:bg-slate-300 hover:bg-slate-300 border border-slate-300 p-2 text-[22px] rounded-full flex items-center justify-center"><Icon icon="logos:discord-icon"/></a>
			</div>
			{#if $page.url.pathname === '/login'}
				<button onclick={() => goto('/')} class="agerrborder shadow-md bg-slate-900 w-full rounded-xl hover:bg-slate-600 focus-visible:bg-slate-600 py-4 text-base text-white font-semibold font-outfit tracking-wider cursor-pointer">Back to Landing</button>
			{/if}
		</div>
	</div>
	<div class="relative agerrbggradient rounded-lg m-4 duration-1000 ease-in-out max-tablet:hidden {$page.url.pathname === '/login' ? 'w-full' : 'col-span-2 laptop:col-span-3'}">
		{#if $page.url.pathname === '/'}
			<button onclick={() => isLoginModalOpen.set(false)} class="cursor-pointer text-2xl absolute top-3.5 right-4 text-white duration-300 hover:rotate-90 ease-out aspect-square w-8 flex justify-center items-center rounded-full"><Icon icon="fa7-solid:close" class="" /></button>
		{/if}
	</div>
</section>