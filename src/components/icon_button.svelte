<script>
  import { createEventDispatcher } from 'svelte';

  // export let label = "Click Me"; // default label for the button
  export let iconSvg = ""; // default SVG content, can be overridden with prop

  // Properties for the button
  export let label = "";

  // Create an event dispatcher instance
  const dispatch = createEventDispatcher();

  // Function to handle the button click
  function handleClick() {
    dispatch('click'); // Emit the "click" event
  }
</script>

<div class="container">
  <button on:click={handleClick}>
      {@html iconSvg}
      <!-- {label} -->
  </button>
</div>


<style>
  .container {
    display: flex;
    align-items: center;
    justify-content: center;
    /* height: auto; Ensure it doesn't stretch */
    max-height:35px;
  }

  button {
    display: flex;
    align-items: center;
    gap: 10px; 
    padding: 5px 10px;  /* Reduced padding for small gap around content */
    background-color: #CEF4DE; 
    color: blue; 
    border: none;
    cursor: pointer;
    border-radius: 5px;  
    transition: background-color 0.3s ease;
    max-width: fit-content;  /* Makes width just a bit bigger than its content */
    width: auto; /* Ensure it doesn't stretch */
  }
  
  button:hover {
    background-color: #555; 
  }

  .icon {
    width: 24px; 
    height: 24px;
    stroke: blue; 
  }

  button:hover .icon {
    stroke: #333; 
    fill: black; 
  }
</style>

<!-- use like this -->
<!-- <Button 
label="My Label" 
iconSvg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="...your path data here..."></svg>' /> -->
