<script>
  // import { spring } from "svelte/motion";
  import "./Menu.svelte.scss"; // Import the SCSS file
  import { theme } from "../store.ts";
  // import * as d3 from 'd3';
  import { currentSVG } from "../support/store.js";
  // import { theme } from "../store";  // Import your theme store
  let strokeColor;

  $: 
  {strokeColor = $theme === 'dark' ? '#ffffff' : '#000000'; 
// console.log($theme, "STROKE", strokeColor)
} // Reactive declaration to compute stroke color based on theme


  

  
  // import { editorInstance } from "../store.ts";
  // import { FontSize } from "../support/fontSize.ts";

  let editor;

  // editorInstance.subscribe((value) => {
  //   editor = value;
  // });

  function changeFont2(fontName) {
    // console.log("editor",editor, $editorInstance)
    if (editor) {
      // Use Tiptap commands to change the font
      console.log("changeFont", fontName);
      // editor.commands.setFontFamily(fontName);
      editor.chain().focus().setFontFamily(fontName).run()
    }
  }
  let fontSizeIncrementIncrease = 1; // Set the initial font size increment for increasing
let fontSizeIncrementDecrease = 1; // Set the initial font size increment for decreasing
let maxFontSize = 100; // Set the maximum font size

function adjustFontSize(adjustment) {
  if (editor) {
    const { from, to } = editor.state.selection;
    let fontSize = editor.state.doc.attrs.fontSize || 16; // Default size

    // Define the maximum font size increment per click
    const maxIncrement = 50; // Adjust this value as needed

    // Calculate the new font size based on the adjustment
    if (adjustment === 'increase') {
      fontSize += fontSizeIncrementIncrease;
      // Increase the font size increment for the next click (if needed)
      if (fontSizeIncrementIncrease < maxIncrement) {
        fontSizeIncrementIncrease++; // Increase the font size increment for increasing
      }
      // Reset the decrease font size increment
      fontSizeIncrementDecrease = 1;
    } else {
      fontSize -= fontSizeIncrementDecrease;
      // Increase the font size increment for the next click (if needed)
      if (fontSizeIncrementDecrease < maxIncrement) {
        fontSizeIncrementDecrease++; // Increase the font size increment for decreasing
      }
      // Reset the increase font size increment
      fontSizeIncrementIncrease = 1;
    }

    // Ensure the font size doesn't go below 1 or above a maximum value
    fontSize = Math.max(1, Math.min(fontSize, maxFontSize));

    // Use the custom FontSize extension's command to set the font size
    editor.commands.setFontSize(fontSize);
  }
}
function adjustSvgSize(adjustment) {
  // Check if the SVG element exists in the DOM
  if ($currentSVG.empty()) {
    console.error("No SVG element found");
    return; // Exit if there's no SVG element
  }

  // Reference to the actual SVG DOM node
  const svgElementNode = $currentSVG.node();

  // Determine the scale factor based on the type of adjustment
  const scaleFactor = adjustment === 'increase' ? 1.1 : 0.8; // Adjust these values as needed

  // Select the container of the SVG. This could be the parent element.
  // It's important that this container is the element whose size is influencing the SVG size.
  const container = $currentSVG.node().parentNode;

  // If the container is not found, we should not continue
  if (!container) {
    console.error("No container element found");
    return;
  }

  // Get the current dimensions of the container
  const containerWidth = container.clientWidth || container.getBoundingClientRect().width;
  const containerHeight = container.clientHeight || container.getBoundingClientRect().height;

  // Calculate the new dimensions based on the scale factor
  const newContainerWidth = containerWidth * scaleFactor;
  const newContainerHeight = containerHeight * scaleFactor;

  // Apply the new dimensions to the container
  container.style.width = `${newContainerWidth}px`;
  container.style.height = `${newContainerHeight}px`;

  // Optionally, if you want the SVG to "refill" the container, you could reset its width and height attributes
  svgElementNode.setAttribute('width', '100%');
  svgElementNode.setAttribute('height', '100%');
}


  let isOpen = false;
  let isClicked = false;

  function toggleMenu() {
    isOpen = !isOpen;
    isClicked = !isClicked;
  }

  function changeFont(fontName) {
    document.documentElement.style.setProperty('--main-font', fontName);
  }

  // function toggleTheme() {
  //   theme.update(value => {
  //     if (value === "light") {
  //       document.documentElement.classList.add('dark-mode');
  //       document.documentElement.style.setProperty('--main-text-color', 'white'); // setting text color to white for dark mode
  //       return "dark";
  //     } else {
  //       document.documentElement.classList.remove('dark-mode');
  //       document.documentElement.style.setProperty('--main-text-color', 'black'); // reverting text color back for light mode
  //       return "light";
  //     }
  //   });
  // }

  // This function is triggered when the user clicks a button to change the theme
  function toggleTheme() {
  const app = document.querySelector('.app');

  if (app.classList.contains('light')) {
    app.classList.replace('light', 'dark'); // A simpler way to toggle
    theme.set("dark"); // Set the theme to dark
  } else {
    app.classList.replace('dark', 'light');
    theme.set("light")
  }

  // If necessary, manually trigger a style re-calculation or re-render here.
  // This could depend on how your SVGs/D3 elements are set up.
}


</script>

<div class="menu {isOpen ? 'menu-open' : ''}">
  <div
    class="hamburger-icon"
    class:open={isClicked}
    on:click={(event) => {
      event.preventDefault(); // Prevent the button from taking focus
      toggleMenu();
    }}
    on:mouseenter={() => (isClicked = false)}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      style="width: 24px; height: 24px;"
      stroke-width="1.5"
      stroke={isOpen ? "currentColor" : strokeColor}
      class="transition-transform transform-gpu"
      class:scale-up={isOpen}
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d={isOpen
          ? "M12 19l-7-7 7-7"
          : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"}
      />
    </svg>
  </div>

  {#if isOpen}
    <div class="menu-content">

      <!-- Add your menu items here -->

      <div class="theme-toggle">
        <div class="up-down-button">
        <button class="quick-click-button button-up-down"  on:click={() => adjustSvgSize('increase')}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"
            style="width: 12px; height: 12px;"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>
        <button class="quick-click-button button-up-down" on:click={() => adjustSvgSize('decrease')}>
          
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"
          style="width: 12px; height: 12px;"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
          
        </button>
      </div>
    <label
          >Change size</label
        >
        
      </div>
      <div class="theme-toggle">
        <button on:click={() => changeFont("arial")}>A</button><label
          >Arial</label
        >
      </div>
      <div class="theme-toggle">
        <button on:click={() => changeFont("serif")}>S</button><label
          >Serif</label
        >
      </div>
      <div class="theme-toggle">
        <button on:click={() => changeFont("monospace")}>M</button>
        <label>Monospace</label>
      </div>
      <div class="theme-toggle">
        <button on:click={() => changeFont("cursive")}>C</button>
        <label>Cursive</label>
      </div>
      <hr />
      <div class="theme-toggle">
        <button class="button-icon" on:click={toggleTheme}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
            style="width: 24px; height: 24px;"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
            />
          </svg>
        </button>
        <label>Dark Mode</label>
      </div>

      <div class="theme-toggle">
        <button class="button-icon" on:click={toggleTheme}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            style="width: 24px; height: 24px;"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            />
          </svg>
        </button>
        Light Mode
      </div>
    </div>
  {/if}
</div>
