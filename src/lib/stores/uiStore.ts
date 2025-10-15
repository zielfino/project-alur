import { writable } from 'svelte/store';

export const isLoginModalOpen = writable(false);
export const isSigningUpMode = writable(false);
export const sidebar = writable(false);
export const sidebarIsHovered = writable(false);
export const showEditCardModal = writable(false);
export const isEdit = writable(false);


export type Card = {
	id: number;
	title: string;
	description: string;
	deadline: string;
	priority: number;
	column_id: number;
};

export const selectedCard = writable<Card | null>(null);