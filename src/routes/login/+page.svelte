<!-- // src\routes\login\+page.svelte -->
<script lang="ts">
	import { goto } from "$app/navigation";
	import Login from "$lib/island/login.svelte";
	
</script>

<div class="flex flex-col justify-center items-center w-full h-[100dvh]">
	<Login/>
</div>

