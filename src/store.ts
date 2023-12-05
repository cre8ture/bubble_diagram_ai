import { writable } from 'svelte/store';

export const theme = writable('light'); // Default theme is 'light'
export const editorInstance = writable(null);