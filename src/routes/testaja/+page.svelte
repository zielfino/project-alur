<script lang="ts">
    import Board from "$lib/Kanban/Board.svelte";
	
	type Column = { id: number; name: string; cards: any[]; };

    let { data } = $props();
    let board = $state(data.board);

    async function handleBoardUpdated(newColumnsData: Column[], info: any) {
        board.columns = newColumnsData;
        console.log('Info object received:', info);
        
        if (info.type === 'column') {
            const columnIds = newColumnsData.map(c => c.id);
            console.log("ACTION: Update column order ->", columnIds);
            // const columnIds = newColumnsData.map((c) => c.id);
            // console.log("ACTION: Update column order ->", columnIds);

            try {
                await fetch("/api/boards/columns/move", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items: columnIds }),
                });
            } catch (err) {
                console.error('Failed to update column order', err);
                // Optionally reload or rollback UI
            }
        } else if (info?.type === 'card') {
            const { cardId, oldColumnId, newColumnId } = info;
            
            // Find columns from the passed snapshot (newColumnsData)
            const newColumn = newColumnsData.find((col) => col.id === newColumnId);
            const oldColumn = newColumnsData.find((col) => col.id === oldColumnId);

            if (!newColumn || !oldColumn) {
                console.warn("Missing column data for move", { oldColumnId, newColumnId });
                return;
            }

            console.log("ACTION: Update card order:", { cardId, newColumnId, oldColumnId });
            
            // await fetch('/api/boards/cards/move', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         card_id,
            //         new_column_id,
            //         items_in_new_column: newColumn.cards.map(c => c.id),
            //         items_in_old_column: oldColumn.cards.map(c => c.id)
            //     })
            // });

            try {
                console.log('NEW OLD NEWS:', newColumn.cards.map((c) => c.id), oldColumn.cards.map((c) => c.id), newColumnId);
                const res = await fetch("/api/boards/cards/move", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        card_id: cardId,
                        new_column_id: newColumnId,
                        items_in_new_column: newColumn.cards.map((c) => c.id),
                        items_in_old_column: oldColumn.cards.map((c) => c.id),
                    }),
                });

                if (!res.ok) {
                    throw new Error('Server returned ' + res.status);
                }

                // success: DB updated
                console.log('Server move succeeded for card', cardId);
            } catch (err) {
                console.error('Failed to move card on server:', err);
                // Optional: refetch board from server to reconcile desync
                // const fresh = await (await fetch('/path/to/load')).json(); board.columns = fresh.columns;
            }
        }
    }
</script>
<section>
    <Board columns={board.columns} onFinalUpdate={handleBoardUpdated}/>
</section>