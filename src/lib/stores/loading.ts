import { writable } from 'svelte/store';

export type LoadingState = {
	CardEdit: Record<number, boolean>;
	CardRemove: Record<number, boolean>;
	CardCreate: Record<number, boolean>;
};

const initialState: LoadingState = {
	CardEdit: {},
	CardRemove: {},
	CardCreate: {}
};

function createLoadingStore() {
	const { subscribe, update, set } = writable(initialState);

	return {
		subscribe,

		start: (key: keyof LoadingState, id: number) =>
			update(state => ({
				...state,
				[key]: { ...state[key], [id]: true }
			})),

		stop: (key: keyof LoadingState, id: number) =>
			update(state => ({
				...state,
				[key]: { ...state[key], [id]: false }
			})),

		reset: () => set(initialState)
	};
}

export const isLoading = createLoadingStore();
