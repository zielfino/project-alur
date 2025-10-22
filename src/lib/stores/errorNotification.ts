import { writable } from 'svelte/store';

interface ErrorItem {
	id: number;
	code: number;
	message: string;
}

const errors = writable<ErrorItem[]>([]);

export function pushError(code: number, message: string) {
	console.error(`Error ${code}: ${message}`);

	const id = Date.now();
	errors.update(list => [...list, { id, code, message }]);

	// Hapus setelah 1 detik
	setTimeout(() => {
		errors.update(list => list.filter(e => e.id !== id));
	}, 3000);
}

export default errors;
