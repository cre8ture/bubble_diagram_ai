import { writable } from 'svelte/store';

// Initialize the store with default window dimensions (or placeholders if SSR)
const windowSize = writable({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
});

// Update dimensions whenever the window is resized
if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
        windowSize.set({
            width: window.innerWidth,
            height: window.innerHeight
        });
    });
}

export default windowSize;
