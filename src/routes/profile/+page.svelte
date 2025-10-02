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

	async function handleNameUpdate(event: Event) {
		event.preventDefault();
		loading.name = true;
		message = null;

		// 2. Use the special 'fetch' for your API call.
		const response = await fetch('/api/profile/rename', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name })
		});

		if (response.ok) {
			message = 'Name updated successfully!';
			// Reload all data to get the new name from the database
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
</script>

<h1>Edit Your Profile</h1>

{#if message}
	<p>{message}</p>
{/if}

<form onsubmit={handleNameUpdate}>
	<h2>Change Name</h2>
	<label for="name">Name:</label>
	<input id="name" type="text" bind:value={name} />
	<button disabled={loading.name}>
		{#if loading.name}Saving...{:else}Save Name{/if}
	</button>
</form>


<hr />

<div>
	<h2>Change Profile Picture</h2>
    <img src={ previewUrl || data.profile?.avatar_url || profile} width="200px" height="20px" class="rounded-full" alt="">
	<input type="file" onchange={handleAvatarUpload} accept="image/png, image/jpeg" disabled={loading.avatar} />
	{#if loading.avatar}
		<p>Uploading...</p>
	{/if}
</div>

<hr />

{#if data.session?.user?.app_metadata?.providers.includes('email') || data.profile?.has_password}
	<form onsubmit={handlePasswordUpdate}>
		<h2>Change Password</h2>
		
		{#if data.session?.user?.app_metadata?.providers.includes('email')}
			<input type="password" bind:value={oldPassword} placeholder="Current Password" required />
		{/if}
		<input type="password" bind:value={newPassword} placeholder="New Password" required minlength="6" />
		<input type="password" bind:value={confirmPassword} placeholder="Confirm New Password" required />
		<button type="submit" disabled={loading.password}>
			{#if loading.password}Saving...{:else}Change Password{/if}
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

<button onclick={() => goto('/')}>Dashboard</button>