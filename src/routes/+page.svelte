<script>
  import Layout from "../components/layout.svelte"
  import InputAiCall from "../components/input_ai_call.svelte";
  import BubbleGraph from "../components/bubble_graph.svelte";
  import Markdown_editor_svelte from "../components/Markdown_editor.svelte";
  import { isOutline } from "../support/store.js";
  import { fade } from 'svelte/transition';
  import Resizeable from "../components/resizeable.svelte";  // It seems you imported this twice (with different casings), ensure to remove the unnecessary import
</script>

<style>
  .dual-layout {
    display: flex;
    justify-content: space-between;
  }


  /* Media Query for medium screens or smaller */
  @media (max-width: 768px) {
    .dual-layout {
      flex-direction: column;
    }


  }
</style>

<Layout>
  <InputAiCall />
  
  <div class={$isOutline ? "dual-layout" : "single-layout"} transition:fade>
    <BubbleGraph />
    {#if $isOutline}
    <Resizeable>
      <Markdown_editor_svelte />
      </Resizeable>
    {/if}
  </div>
</Layout>
