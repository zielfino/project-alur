<script lang="ts">
	// import { $state } from 'svelte';
	import { invalidateAll } from '$app/navigation';

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
    <img src={previewUrl || data.profile?.avatar_url || '/default-avatar.png'} width="200px" class="rounded-full" alt="">
	<input type="file" onchange={handleAvatarUpload} accept="image/png, image/jpeg" disabled={loading.avatar} />
	{#if loading.avatar}
		<p>Uploading...</p>
	{/if}
</div>