<script lang="ts">
	let { data } = $props();
    import { onMount } from 'svelte';
	import DashboardNav from "./dashboardNav.svelte";
	// JSON.stringify(data, null, 2)
	console.log(data)
    // Definisikan tipe data untuk sebuah board
    type Board = {
        id: number;
        owner_uid: string;
        name: string;
        slug: string;
        created_at: string;
    };

	let newBoardName = $state('');
    let boards = $state<Board[]>([]);
    let loading = $state(true);
    let error = $state<string | null>(null);

    let nameValidationError = $state<string | null>(null);
        
    // onMount berjalan saat komponen pertama kali ditampilkan
    onMount(async () => {
        try {
            // Panggil API yang sudah kita siapkan
            const response = await fetch('/api/boards');
            if (!response.ok) {
                throw new Error('Failed to load your boards.');
            }
            boards = await response.json();
        } catch (e: any) {
            error = e.message;
        } finally {
            loading = false;
        }
    });


    $effect(() => {
		// Aturan validasi: hanya boleh huruf, angka, dan spasi
		const nameRegex = /^[a-zA-Z0-9 ]*$/;
		if (newBoardName && !nameRegex.test(newBoardName)) {
			nameValidationError = 'Name can only contain letters, numbers, and spaces.';
		} else {
			nameValidationError = null; // Hapus pesan error jika sudah valid
		}
	});
	
    
	let isReadPhone = $state(false);
    let isPhone = $state(false);
	let isTablet = $state(false);
	let isLaptop = $state(false);
	let isPortrait = $state(true);

	function checkWidth() {
		isReadPhone = window.matchMedia("(max-width: 500px)").matches;
        isPhone = window.matchMedia("(min-width: 500px)").matches;
		isTablet = window.matchMedia("(min-width: 700px)").matches;
		isLaptop = window.matchMedia("(min-width: 900px)").matches;
		isPortrait = window.matchMedia("(orientation: portrait)").matches;
	}

	onMount(() => {
		checkWidth();
		window.addEventListener("resize", checkWidth);
		window.addEventListener("orientationchange", checkWidth);
		return () => {
			window.removeEventListener("resize", checkWidth);
			window.removeEventListener("orientationchange", checkWidth);
		};
	});
</script>

<main class="flex dashboard">
	<DashboardNav data={data}/>

    <section class=" w-full {!isPortrait || isTablet ? 'p-4' : 'p-2 pt-16 h-screen'}">
        <div class="bg-gray-100 w-full h-full rounded-xl flex justify-center">
            <h1 class="font-bold text-3xl mt-8 font-outfit">Welcome to your Dashboard</h1>
        </div>
    </section>
</main>