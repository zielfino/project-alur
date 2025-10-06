<script lang="ts">
	import Sidebar from "./sidebar.svelte";
	let { data } = $props();
</script>

<main class="flex">
    <Sidebar data={data} />
    <section class="p-4 w-full">
        <div class="bg-red-400 w-full h-full rounded-xl">
            <h1>Welcome to your Dashboard</h1>
        </div>
    </section>
</main>