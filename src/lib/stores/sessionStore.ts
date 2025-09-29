import { writable } from 'svelte/store';
import type { Session } from '@supabase/supabase-js';

export const sessionStore = writable<Session | null>(null);