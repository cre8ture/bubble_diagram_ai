    import { writable } from 'svelte/store';
    
    // Create a Svelte writable store with an initial value of an empty string
    export const completionStore = writable('');
    export const isOutline = writable(false);
    export const outline = writable('');
    export const nodeDataDblClicked = writable('');
    export const openAIIsLoading = writable(false);
    export const completedOutline = writable('');
    export const newNodeData = writable('');
    export const graphRawData = writable('');
    export const isGraph = writable(false) // only when we are adding a new node
    export const isDeleteNode = writable(false) // only when we are adding a new node
    export const isNodeUpdate = writable(false) // only when we are adding a new node
    export const currentSVG = writable('') // only when we are adding a new node
    export const currentJsonToSave = writable('') // only when we are adding a new node
    export const isLoadNewGraph = writable(false) // only when we are adding a new node





 





