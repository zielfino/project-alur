<script lang="ts">
    import { page } from '$app/stores';
</script>

<div class="error-page">
    <h1>{$page.status}</h1>

    <p>Maaf, terjadi kesalahan.</p>

    {#if $page.status === 403}
        <p>Note: {$page.error?.message}</p>
    {/if}

    <a href="/">Kembali ke Halaman Utama</a>
</div>