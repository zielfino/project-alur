import { writable } from 'svelte/store';

export const isLoginModalOpen = writable(false);

export const isSigningUpMode = writable(false);

export const sidebar = writable(false);
export const sidebarIsHovered = writable(false);