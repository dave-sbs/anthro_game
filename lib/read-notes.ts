import type { NotesStore } from '@/types/game';
import { STORAGE_KEY_NOTES } from '@/lib/game-data';

const NOTES_UPDATED_EVENT = 'campus-notes-updated';

export function readNotesFromLocalStorage(): NotesStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTES);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as NotesStore;
  } catch {
    return {};
  }
}

/** Subscribe to same-tab commits and cross-tab `localStorage` updates for notes. */
export function subscribeCampusNotesCommitted(onChanged: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const fn = (): void => onChanged();
  const onStorage = (e: StorageEvent): void => {
    if (e.key === STORAGE_KEY_NOTES || e.key === null) fn();
  };
  window.addEventListener(NOTES_UPDATED_EVENT, fn);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(NOTES_UPDATED_EVENT, fn);
    window.removeEventListener('storage', onStorage);
  };
}

/** Call after updating `anthro-campus-notes-v1` in this tab so the stories view can subscribe. */
export function notifyCampusNotesCommitted(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(NOTES_UPDATED_EVENT));
}
