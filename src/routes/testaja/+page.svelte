<script lang="ts">
    import Board from "$lib/Kanban/Board.svelte";
	
	type Column = { id: number; name: string; cards: any[]; };

    let { data } = $props();
    let board = $state(data.board);

    function handleBoardUpdated(newColumnsData: Column[], info: any) {
        board.columns = newColumnsData;
        console.log('sampai sini 1', info)
        // Cek apakah yang dipindahkan adalah kartu atau kolom
        if (info.type === 'column') {
            console.log('sampai sini 2')
            const columnIds = newColumnsData.map(c => c.id);
            fetch('/api/boards/columns/move', {
                method: 'POST',
                body: JSON.stringify({ items: columnIds })
            });
        } else {
            console.log('sampai sini 3')
            fetch('/api/boards/cards/move', {
                method: 'POST',
                body: JSON.stringify({
                    card_id: info.item.id,
                    new_column_id: info.target.dataset.columnId,
                    items_in_new_column: info.items.map(c => c.id)
                })
            });
        }
    }
</script>
<section>
    <Board columns={board.columns} onFinalUpdate={handleBoardUpdated}/>
</section>