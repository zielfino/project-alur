<script lang="ts">
	import profile from '$lib/assets/profile.png';

	// import { $state } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';

	// 1. Get SvelteKit's special 'fetch' from the props.
	// This 'fetch' automatically includes your login cookie.
	let { data } = $props();

	// Use the name from the server as the starting value
	let name = $state(data.profile?.name || '');

	let message = $state<string | null>(null);
	// let loading.name = $state(false);
	let loading = $state({ name: false, password: false, avatar: false });

	let newName = $state('');
	
	async function handleNameUpdate(event: Event) {
		event.preventDefault();
		loading.name = true;
		message = null;

		// Kirim nilai dari 'newName', bukan dari 'name' lama
		const response = await fetch('/api/profile/rename', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: newName }) // <-- Perubahan di sini
		});

		if (response.ok) {
			message = 'Name updated successfully!';
			newName = ''; // Kosongkan input setelah berhasil
			await invalidateAll();
		} else {
			const result = await response.json();
			message = result.error || 'Error updating name.';
		}
		loading.name = false;
	}







// async function handleAvatarUpload(event: Event) {
//     const target = event.target as HTMLInputElement;
//     const file = target.files?.[0];
//     if (!file) return;

//     loading.avatar = true;
//     message = null;

//     const formData = new FormData();
//     formData.append('avatar', file);

//     try {
//         // Kirim file langsung ke API SvelteKit Anda
//         const response = await fetch('/api/profile/upload-avatar', {
//             method: 'POST',
//             body: formData
//         });

//         if (!response.ok) {
//             const result = await response.json();
//             throw new Error(result.error || 'Upload failed');
//         }

//         message = 'Avatar updated successfully!';
//         await invalidateAll();
//     } catch (error: any) {
//         message = 'Error uploading avatar: ' + error.message;
//     } finally {
//         loading.avatar = false;
//     }
// }

	let previewUrl = $state('');

	async function handleAvatarUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		// --- BAGIAN BARU: BUAT URL PRATINJAU ---
		// Buat URL lokal sementara untuk file yang baru dipilih
		previewUrl = URL.createObjectURL(file);
		// --- AKHIR BAGIAN BARU ---

		loading.avatar = true;
		message = null;

		// ... sisa kode upload Anda tetap sama ...
		const formData = new FormData();
		formData.append('avatar', file);

		try {
			const response = await fetch('/api/profile/upload-avatar', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const result = await response.json();
				throw new Error(result.error || 'Upload failed');
			}

			message = 'Avatar updated successfully!';
			await invalidateAll(); // Refresh data, yang akan memperbarui data.profile.avatar_url
		} catch (error: any) {
			message = 'Error uploading avatar: ' + error.message;
			previewUrl = ''; // Hapus pratinjau jika upload gagal
		} finally {
			loading.avatar = false;
		}
	}
		
		onMount(() => {
			console.log('Current profile data:',  data.profile?.avatar_url);
		});



















	import { supabase } from '$lib/supabaseClient';
	import Sidebar from '$lib/island/sidebar.svelte';
	import Icon from '@iconify/svelte';
	import LogoutButton from '$lib/component/logoutButton.svelte';
	// State untuk semua form di halaman ini
	let oldPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	// --- Fungsi untuk pengguna EMAIL (mengubah password) ---
	async function handlePasswordUpdate() {
		loading.password = true;
		message = null;

		// Validasi Anda tetap di sini
		if (newPassword !== confirmPassword) { /* ... */ }
		// ... (verifikasi password lama Anda juga tetap di sini) ...

		// Panggil API di sisi server untuk mengubah password
		const response = await fetch('/api/profile/password', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ newPassword })
		});

		if (response.ok) {
			message = 'Password updated successfully!';
			oldPassword = '';
			newPassword = '';
			confirmPassword = '';
		} else {
			const result = await response.json();
			message = 'Error updating password: ' + (result.message || 'Please try again.');
		}
		loading.password = false;
	}

	// --- Fungsi untuk pengguna GOOGLE (membuat password) ---
	async function handlePasswordCreate() {
		loading.password = true;
		message = null;

		if (newPassword !== confirmPassword) {
			message = 'Error: Passwords do not match.';
			loading.password = false;
			return;
		}

		// Panggil endpoint API yang sama dengan yang digunakan untuk 'change password'
		const response = await fetch('/api/profile/password', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ newPassword })
		});

		const result = await response.json();

		if (response.ok) {
			message = 'Password created successfully! You can now log in with your email.';
			newPassword = '';
			confirmPassword = '';
			await invalidateAll();
		} else {
			message = 'Error creating password: ' + (result.message || 'Please try again.');
		}
		loading.password = false;
	}









    // import { $state } from 'svelte';
	// import { goto } from '$app/navigation';
    
    let showDeleteModal = $state(false);
    let confirmUsername = $state('');

	async function handleDeleteAccount() {
		// Panggil API delete Anda
		const response = await fetch('/api/auth/delete', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ confirmUsername })
		});

		if (response.ok) {
			alert('Your account has been successfully deleted.');

			try {
				// Coba untuk membersihkan sesi di klien.
				// Kita tahu ini kemungkinan akan gagal, dan itu tidak masalah.
				await supabase.auth.signOut();
			} catch (error) {
				// Abaikan saja error dari signOut, karena kita memang mengharapkan ini terjadi.
				console.warn('Expected signOut error after user deletion:', error);
			} finally {
				// BAGIAN INI AKAN SELALU DIJALANKAN
				// Pastikan pengguna selalu diarahkan ke halaman login.
				await invalidateAll(); // Refresh data untuk memastikan semuanya bersih
				await goto('/');
			}
		} else {
			// ... (kode error handling Anda)
		}
	}

	







	// import { goto, invalidateAll } from '$app/navigation'; // <-- 1. Impor invalidateAll

	async function handleLogout() {
		// Panggil endpoint API logout kita
		const response = await fetch('/api/auth/logout', {
			method: 'POST'
		});

		// 2. Beri tahu SvelteKit untuk memuat ulang semua datanya

		if (response.ok) {
			await invalidateAll();
			await goto('/login');
		} else {
			const result = await response.json();
			alert('Error logging in: ' + result.message);
			// await goto('/login');
		}

		// Browser akan diarahkan oleh respons dari server,
		// tapi invalidateAll memastikan UI langsung update.
	}
   	import { sidebar, sidebarIsHovered as isHovered } from '$lib/stores/uiStore';





















    let fileInput: HTMLInputElement | null = $state(null);
    let nameInput: HTMLInputElement | null = $state(null);
    let oldPasswordInput: HTMLInputElement | null = $state(null);
    let newPasswordInput: HTMLInputElement | null = $state(null);
    let confirmPasswordInput: HTMLInputElement | null = $state(null);
</script>
<main class="flex">
    <Sidebar data={data} />
    <section class="p-4 w-full">
			
		<div class="col-span-9 w-full max-h-full rounded-xl p-8">
			{#if message}
				<p class="agerrp">{message}</p>
			{/if}
			<h2 class="agerrh2">Edit Your Profile</h2>

			<!-- Name -->
			<div class="my-6">
				<div class="flex items-center space-x-4">
					<form onsubmit={handleNameUpdate} class="flex">
						<div class="flex justify-center items-center aspect-square relative border-2 border-white ring-3 ring-sky-400 rounded-full">
							<button onclick={() => { if (fileInput) fileInput.click(); }} aria-label="img" class="absolute w-full h-full rounded-full bg-slate-900/70 cursor-pointer opacity-0 hover:opacity-100 flex items-center justify-center">
								<div class="text-white text-center flex flex-col items-center">
									<Icon icon="fa7-solid:edit" class="inline-block text-lg mb-1" />
									<!-- <div class="text-[12px] font-outfit leading-none mb-1 tracking-wide font-semibold">Change</div> -->
								</div>
							</button>
							<img src={ previewUrl || data.profile?.avatar_url || profile} width="50px" class="rounded-full" alt="">
						</div>
						<input type="file" bind:this={fileInput} onchange={handleAvatarUpload} accept="image/png, image/jpeg" disabled={loading.avatar} class="hidden" />
					</form>
					<div>
						<form onsubmit={handleNameUpdate} class="flex items-center relative">
							<div class="text-[16px] font-outfit leading-none tracking-wide font-semibold rounded-lg flex items-center relative h-min">
								{#if newName === ''}
									<button type="button" onclick={() => { if (nameInput) nameInput.focus(); }} class="absolute cursor-pointer text-[16px]">
										{data.profile?.name || 'Your Name'}
										<div class="absolute -top-2 -right-5 flex justify-center items-center">
											<Icon icon="fa7-solid:edit"/>
										</div>
									</button>
								{/if}
								<input maxlength="25" type="text" bind:this={nameInput} bind:value={newName} class="w-full text-[16px]"/>
							</div>
							{#if newName !== ''}
								<button type="submit" disabled={loading.name} class="cursor-pointer aspect-square w-8 absolute -right-10 flex items-center justify-center rounded-md bg-sky-500 hover:bg-sky-400 text-white">
									{#if loading.name}<Icon class="text-2xl" icon="line-md:loading-loop"/>{:else}<Icon icon="fa7-solid:save"/>{/if}
								</button>
							{/if}
						</form>
						<div class="agerrh5 text-slate-400">@{data.profile?.username || 'username'}</div>
					</div>
				</div>
				<div class="mt-4 font-outfit">
					<span>Your email : <strong>{data.profile?.email || 'youremail@mail.com'}</strong></span>
				</div>
			</div>

			<!-- Profile -->
			<div class="my-6">


			</div>


			<div>
				<!-- <h2>Change Profile Picture</h2>
				<img src={ previewUrl || data.profile?.avatar_url || profile} width="200px" height="20px" class="rounded-full" alt="">
				<input type="file" onchange={handleAvatarUpload} accept="image/png, image/jpeg" disabled={loading.avatar} /> -->
				{#if loading.avatar}
					<p>Uploading...</p>
				{/if}
			</div>

			<hr class="my-4" />

			{#if data.session?.user?.app_metadata?.providers.includes('email') || data.profile?.has_password}
				<form onsubmit={handlePasswordUpdate}>
					<h2>Change Password</h2>
					
					{#if data.session?.user?.app_metadata?.providers.includes('email')}
						<!-- <input type="password" bind:value={oldPassword} placeholder="Current Password" required /> -->
						<div class="relative group w-full max-w-[300px]">
							<button type="button" tabindex="-1" onclick={() => { if (oldPasswordInput) oldPasswordInput.focus(); }} class="agerrh5 absolute -top-4.5 duration-300 ease-in-out
							{oldPassword !== '' ? '' : ' text-slate-400 translate-y-[calc(2.2em-2px)] translate-x-[calc(1em-2px)]'}">Old Password</button>
							<div class="button bg-slate-200 py-2 px-3 rounded-lg w-full flex items-center gap-2 mt-5">
								<input type="text" bind:this={oldPasswordInput} bind:value={oldPassword} class="w-full h-full" />
							</div>
						</div>
					{/if}
					
					<div class="relative group w-full max-w-[300px]">
						<button type="button" tabindex="-1" onclick={() => { if (newPasswordInput) newPasswordInput.focus(); }} class="agerrh5 absolute -top-4.5 duration-300 ease-in-out
						{newPassword !== '' ? '' : ' text-slate-400 translate-y-[calc(2.2em-2px)] translate-x-[calc(1em-2px)]'}">New Password</button>
						<div class="button bg-slate-200 py-2 px-3 rounded-lg w-full flex items-center gap-2 mt-5">
							<input type="text" bind:this={newPasswordInput} bind:value={newPassword} class="w-full h-full" />
						</div>
					</div>
					<div class="relative group w-full max-w-[300px]">
						<button type="button" tabindex="-1" onclick={() => { if (confirmPasswordInput) confirmPasswordInput.focus(); }} class="agerrh5 absolute -top-4.5 duration-300 ease-in-out
						{confirmPassword !== '' ? '' : ' text-slate-400 translate-y-[calc(2.2em-2px)] translate-x-[calc(1em-2px)]'}">Confirm Password</button>
						<div class="button bg-slate-200 py-2 px-3 rounded-lg w-full flex items-center gap-2 mt-5">
							<input type="text" bind:this={confirmPasswordInput} bind:value={confirmPassword} class="w-full h-full" />
						</div>
					</div>
					<!-- <input type="password" bind:value={newPassword} placeholder="New Password" required minlength="6" />
					<input type="password" bind:value={confirmPassword} placeholder="Confirm New Password" required /> -->
					<!-- <button type="submit" disabled={loading.password}>
						{#if loading.password}Saving...{:else}Change Password{/if}
					</button> -->
					<button
					class="px-3 py-2 mt-4 rounded-xl border-2 text-white font-semibold tracking-wide bg-sky-500 cursor-pointer hover:opacity-50"
					type="submit" disabled={loading.password}
					>
						{#if loading.password}Saving...{:else}Change{/if}
					</button>
				</form>
			{:else}
				<form onsubmit={handlePasswordCreate}>
					<h2>Create a Password</h2>
					<p>You currently log in with Google. Create a password to also be able to log in with your email.</p>
					<input type="password" bind:value={newPassword} placeholder="New Password" required minlength="6" />
					<input type="password" bind:value={confirmPassword} placeholder="Confirm New Password" required />
					<button type="submit" disabled={loading.password}>
						{#if loading.password}Saving...{:else}Create Password{/if}
					</button>
				</form>
			{/if}
			<hr class="my-4"/>

			<div class="danger-zone">
				<h3 class="agerrh3">Danger Zone</h3>
				<p class="agerrp">Deleting your account is permanent and cannot be undone.</p>
				<button class="bg-red-400 mt-4 text-white px-3 py-2 font-semibold rounded-md cursor-pointer hover:bg-red-200" onclick={() => showDeleteModal = true}>
					Delete My Account
				</button>
			</div>


			{#if showDeleteModal}
				<div class="fixed w-full h-full bg-zinc-900/50 backdrop-blur-sm top-0 left-0 flex justify-center items-center">
					<div class="bg-white w-[500px] p-4 rounded-lg">
						<h3 class="agerrh3">Are you absolutely sure?</h3>
						<hr class="my-4">	
						<p class="agerrp">This action is irreversible. To confirm, please type your username: <strong>{data.profile?.username || 'username'}</strong></p>

						<input class="bg-slate-200 w-full mt-4 mb-8 py-2 px-3 rounded-md" type="text" bind:value={confirmUsername} placeholder={data.profile?.username || 'username'} />
						
						<div class="flex space-x-2 float-end text-white font-semibold">
							<button
							class="px-3 py-2 rounded-sm ring-2 bg-red-500/70 ring-red-500 cursor-pointer hover:opacity-50"
							disabled={confirmUsername !== data.profile?.username}
							onclick={handleDeleteAccount}
							>
								I understand, delete my account
							</button>
							<button class="px-3 py-2 rounded-sm ring-2 bg-slate-900 ring-slate-900 cursor-pointer hover:bg-slate-700" onclick={() => showDeleteModal = false}>Cancel</button>
						</div>
					</div>
				</div>
			{/if}
			<button onclick={handleLogout} class="bg-red-400 hover:bg-red-300 mt-4 text-white font-semibold font-outfit tracking-wider rounded-lg h-[40px] cursor-pointer flex justify-center-safe items-center-safe w-fit px-4">
					<Icon icon="fa7-solid:sign-out-alt" class="inline-block text-lg mr-2" />
					Logout
			</button>
		</div>
    </section>
</main>
