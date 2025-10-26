import { writable, derived } from 'svelte/store';

export type LoadingState = {
	CardAdd: boolean;
	CardEdit: Record<number, boolean>;
	CardRemove: Record<number, boolean>;
	ColumnAdd: boolean;
	ColumnEdit: Record<number, boolean>;
	ColumnRemove: Record<number, boolean>;
	BoardAdd: boolean;
	BoardEdit: Record<number, boolean>;
	BoardRemove: Record<number, boolean>;
	rename: boolean;
	picture: boolean;
	password: boolean;
	createpassword: boolean;
	deleteaccount: boolean;
	logout: boolean;
	signin: boolean;
	login: boolean;
};

const initialState: LoadingState = {
	CardAdd: false,
	CardEdit: {},
	CardRemove: {},
	ColumnAdd: false,
	ColumnEdit: {},
	ColumnRemove: {},
	BoardAdd: false,
	BoardEdit: {},
	BoardRemove: {},
	rename: false,
	picture: false,
	password: false,
	createpassword: false,
	deleteaccount: false,
	logout: false,
	signin: false,
	login: false,
};

function createLoadingStore() {
	const { subscribe, update, set } = writable(initialState);

	return {
		subscribe,

		start: (key: keyof LoadingState, id?: number) =>
			update(state => {
				const current = state[key];
				if (typeof current === 'boolean') {
					return { ...state, [key]: true };
				}
				return { ...state, [key]: { ...current, [id!]: true } };
			}),

		stop: (key: keyof LoadingState, id?: number) =>
			update(state => {
				const current = state[key];
				if (typeof current === 'boolean') {
					return { ...state, [key]: false };
				}
				return { ...state, [key]: { ...current, [id!]: false } };
			}),

		reset: () => set(initialState)
	};
}

export const isLoading = createLoadingStore();

// 🧩 Derived store: true kalau ada proses loading aktif
export const isAnyLoading = derived(isLoading, ($loading) => {
	return Object.values($loading).some((category) =>
		typeof category === 'boolean'
			? category // langsung true/false
			: Object.values(category).some(v => v) // object → cek isinya
	);
});
