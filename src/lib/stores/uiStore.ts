import { writable } from 'svelte/store';

export const isLoginModalOpen = writable(false);
export const isSigningUpMode = writable(false);
export const sidebar = writable(false);
export const sidebarIsHovered = writable(false);
export const showEditCardModal = writable(false);
export const isEdit = writable(false);
export const showAddCardModal = writable(false);
export const activeColumnId = writable<number | null>(null);

export type Card = {
	id: number;
	title: string;
	description: string;
	deadline: string;
	priority: number;
	column_id: number;
};

export const selectedCard = writable<Card | null>(null);

function toInputDateString(d?: string) {
  if (!d) return '';
  return new Date(d).toISOString().split('T')[0];
}

export const selectedCardWithFormat = {
  subscribe(run: any) {
    return selectedCard.subscribe((c) => {
      if (!c) return run(null);
      run({ ...c, deadlineFormatted: toInputDateString(c.deadline) });
    });
  },
  // set receives an object that includes deadlineFormatted; map back to selectedCard
  set(value: Card & { deadlineFormatted?: string } | null) {
    if (!value) return selectedCard.set(null);
    // if caller passed deadlineFormatted, prefer itu
    const deadline = value.deadlineFormatted ?? value.deadline ?? '';
    selectedCard.set({ ...value, deadline });
  },
  update(fn: any) {
    selectedCard.update((c) => {
      const next = fn(c ? { ...c, deadlineFormatted: toInputDateString(c.deadline) } : null);
      if (!next) return null;
      const deadline = next.deadlineFormatted ?? next.deadline ?? '';
      return { ...next, deadline };
    });
  }
};