<script lang="ts">
	import Sidebar from "./sidebar.svelte";
	let { data } = $props();
</script>

<main class="flex">
    <Sidebar data={data} />
    <section>
        <h1>Welcome to your Dashboard</h1>
    </section>
</main>