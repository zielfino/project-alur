<script lang='ts'>
	import { onMount } from "svelte";
	import Sidebar from "./sidebar.svelte";
	import Navbar from "./navbar.svelte";

	let { data } = $props();

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

	{#if !isPortrait || isTablet}
		<Sidebar data={data} />
	{:else}
		<Navbar data={data} />
	{/if}