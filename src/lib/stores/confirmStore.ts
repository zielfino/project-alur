import { writable } from 'svelte/store';

export const confirmState = writable<{
    message: string | null;
    resolve: ((v: boolean) => void) | null;
}>({
    message: null,
    resolve: null
});

export function isConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
        confirmState.set({ message, resolve });
    });
}

export function confirmResponse(result: boolean) {
    confirmState.update((state) => {
        state.resolve?.(result);
        return { message: null, resolve: null };
    });
}
