<script>
    import { onMount } from 'svelte';

    const grabberWidth = 10;

    export let width; // Will be initialized to the parent div's width.
    export let x = 20;

    let expanding = null;
    let start = null, initial = null;
    let containerWidth; // To hold the initial width of the parent container.

    onMount(() => {
        if (width === undefined) {
            width = containerWidth;
        }
    });

    function startExpand(type, event) {
        expanding = type;
        start = event.pageX;
        initial = { x, width };
    }

    function stopExpand() {
        expanding = null;
        start = null;
        initial = null;
    }

    function expand(event) {
        if (!expanding) return;

        if (expanding == 'left') {
            const delta = start - event.pageX;
            x = initial.x - delta;
            width = initial.width + delta;
            return;
        }

        if (expanding == 'right') {
            const delta = event.pageX - start;
            width = initial.width + delta;
            return;
        }
    }
</script>

<svelte:window on:mouseup={stopExpand} />

<div bind:clientWidth={containerWidth} on:mousemove={expand} style="position: relative; width: 100%; height: 100%;">
    <div style={`left: ${x}px; width: ${width}px; height: 100%; position: relative;`}>
        <slot></slot> <!-- Slot for child content -->
        <div style={`width: ${grabberWidth}px; height: 100%; position: absolute; left: 0; top: 0; cursor: ew-resize;`} on:mousedown={startExpand.bind(null, 'left')}></div>
        <div style={`width: ${grabberWidth}px; height: 100%; position: absolute; right: 0; top: 0; cursor: ew-resize;`} on:mousedown={startExpand.bind(null, 'right')}></div>
    </div>
</div>

<style>
    /* Handle style on hover */
    div > div > div:hover {
        background-color: rgba(0,0,0,0.2);
    }
</style>
