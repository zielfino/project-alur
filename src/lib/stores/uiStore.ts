import { writable } from 'svelte/store';

// Store untuk mengontrol apakah modal sedang terbuka atau tertutup
export const isLoginModalOpen = writable(false);

// Store untuk mengontrol mode modal (apakah untuk signup atau login)
export const isSigningUpMode = writable(false);