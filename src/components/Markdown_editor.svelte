<script>
  import "./styles/codemirror.css";
  import "./styles/solarized.css";
  import { onMount, afterUpdate } from "svelte";
  import { basicSetup } from "codemirror";
  import { EditorState } from "@codemirror/state";
  import { EditorView } from "@codemirror/view";
  import { markdown } from "@codemirror/lang-markdown";
  import { marked } from "marked";
  import IconButton from "./icon_button.svelte";
  import {outline} from "../support/store.js";
  import {openAIIsLoading} from "../support/store.js";
  import {completedOutline} from "../support/store.js";



  let editor;
  let mdPreview = "";
  let editorState;
  let initialContent = ""; // Declare initialContent here
  let apiIsLoading = ""
 let edit_number  = 0 
 let completed_outline_text = ""
  onMount(() => {
     initialContent = $outline; // Assuming outline is a Svelte store
     apiIsLoading = $openAIIsLoading;
     completed_outline_text = $completedOutline
    console.log("initialContent", initialContent);
    const config = {
      state: EditorState.create({
        doc:  initialContent, // || "# Markdown Editor\nStart typing...",
        extensions: [
          basicSetup,
          markdown(),
          EditorView.updateListener.of((e) => {
            if (e.docChanged) {
              mdPreview = marked(e.state.doc.toString());
            }
          }),
          EditorView.lineWrapping
        ],
      }),
      parent: document.querySelector("#editor"),
    };

    editor = new EditorView(config);

    editor.contentDOM.blur()
    // console.log(editor.contentDOM.blur())

    // Adding a panel to the top of the editor
    const panelNode = createPanel();
    const editorDOM = editor.dom;
    editorDOM.insertBefore(panelNode, editorDOM.firstChild);
  });

afterUpdate(() => {
  // console.log("apiIsLoading", apiIsLoading, $openAIIsLoading);
  if($openAIIsLoading){
    const newContent = $outline;
            editor.dispatch({
                changes: { from: 0, to: editor.state.doc.length, insert: newContent },
            });
  }
});



  function createPanel() {
    const panel = document.createElement("div");
    panel.className = "panel-top";

    const iconButtonContainer = document.createElement("div");

    // Directly setting the styles
iconButtonContainer.style.maxWidth = "fit-content";
iconButtonContainer.style.width = "auto";
iconButtonContainer.style.display = "flex";
iconButtonContainer.style.justifyContent = "flex-end";
panel.style.display = "flex";
panel.style.justifyContent = "flex-end";
panel.style.padding = "5px"
panel.style.marginBottom = "5px"



    panel.appendChild(iconButtonContainer);

    // Instantiate the IconButton Svelte component
    const ai_button = new IconButton({
      target: iconButtonContainer,
      props: {
        label: "My Label",
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
</svg>`,
      },
    });

    const copy_button = new IconButton({
      target: iconButtonContainer,
      props: {
        label: "My Label",
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
</svg>`,
      },
    });

    const download_button = new IconButton({
      target: iconButtonContainer,
      props: {
        label: "My Label",
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
</svg>`,
      },
    });

    const share_button = new IconButton({
      target: iconButtonContainer,
      props: {
        label: "My Label",
        iconSvg: `<svg style="width: 24px; height: 24px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" >
  <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
</svg>
`,
      },
    });

    const back_to_graph_button = new IconButton({
      target: iconButtonContainer,
      props: {
        label: "My Label",
        iconSvg: `<svg style="width: 24px; height: 24px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>
`,
      },
    });




    const svgElements = iconButtonContainer.querySelectorAll("svg");

    svgElements.forEach((svgElement) => {
      svgElement.style.width = "24px";
      svgElement.style.height = "24px";
    });


ai_button.$on("click", async () => {
    // console.log("AI Button was clicked!");

    // Get the current content of the editor.
    const currentContent = editor.state.doc.toString();

    try {
        const stream = await callOpenAI(currentContent);
        const reader = stream.getReader();
        
        while (true) {
  const { value, done } = await reader.read();
  if (done) break;

  if (value.startsWith('data: ')) {
    try {
      const jsonStr = value.substring(6); // Remove 'data: ' prefix
      const json = JSON.parse(jsonStr);

      // Check if it's a valid JSON object
      if (json && json.choices && json.choices[0] && json.choices[0].delta) {
        const content = json.choices[0].delta.content;

        // Check for cursor position. If cursor is not present, it will add the content to the end.
        let startPosition = editor.state.selection.main.head || editor.state.doc.length;

        // Append the received content to the CodeMirror editor
        editor.dispatch({
          changes: [{ from: startPosition, insert: content }],
        });
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  }
}

    } catch (error) {
        console.error('Error streaming content:', error);
    }
});

// ... (rest of the code remains unchanged)


    copy_button.$on("click", () => {
      // Your functionality for copying content goes here
      const editorContent = editor.state.doc.toString();
      navigator.clipboard.writeText(editorContent);
      console.log("Copied editor content to clipboard!");
    });

    download_button.$on("click", () => {
      // Your functionality for downloading content goes here
      const blob = new Blob([editor.state.doc.toString()], {
        type: "text/plain;charset=utf-8",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "markdown.md";
      a.click();
      console.log("Downloading editor content!");
    });

    share_button.$on("click", () => {
      // Your functionality for sharing content goes here
      const subject = encodeURIComponent(
        "Here's some content I'd like to share"
      );
      const body = encodeURIComponent(
        "This is the content you want to share..."
      ); // Replace with the actual content

      window.location.href = `mailto:?subject=${subject}&body=${body}`;

      console.log("Share Button was clicked and email client opened!");
    });
    back_to_graph_button.$on("click", () => {
      // Your functionality for downloading content goes here
      const blob = new Blob([editor.state.doc.toString()], {
        type: "text/plain;charset=utf-8",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "markdown.md";
      a.click();
      console.log("Downloading editor content!");
    });
    return panel;
  }

 
  // Update the Markdown preview whenever the editor content changes
  afterUpdate(() => {
    if (editorState) {
      const content = editorState.doc.toString();
      mdPreview = marked(content);
    }
    edit_number++
  });

  // async function completeMarkdown() {
  //   try {
  //     const stream = await callOpenAI(editor.state.doc.toString());
  //     let completion = "";

  //     for await (const chunk of stream) {
  //       completion += chunk;
  //     }

  //     editor.dispatch({
  //       changes: { from: editor.state.doc.length, insert: completion },
  //     });
  //   } catch (error) {
  //     console.error("Error fetching completion:", error);
  //   }
  // }

  async function callOpenAI(inputText) {
    
    const prompt = `complete this text: ${inputText}. Put this markdown format suitable for a GitHub README. Only use the text that's been provided to craft your response`;

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            stream: true,
          }),
        }
      );

      const stream = response.body.pipeThrough(new TextDecoderStream());
      return stream;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
</script>

<div id="markdown-editor">

  <div id="editor" />
  <div id="preview" contenteditable="false" bind:innerHTML={mdPreview} />
</div>

<style>
  #markdown-editor {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: stretch;
  margin-right: 2px;
}

/* Shared styles for both #editor and #preview */
#editor,
#preview {
  flex: 1;
  max-width: calc(50% - 10px);
  min-height: 400px;
  border-radius: 15px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  padding: 10px;
  margin: 5px;
  outline: none;
  
  white-space: pre-wrap;       /* Text will wrap when necessary */
  word-wrap: break-word;       /* Break the text at the end of the line */
  overflow-x: hidden;          /* Hide horizontal overflow */
}

svg {
  width: 24px;
  height: 24px;
}

.iconButtonContainer {
  max-width: fit-content;
  width: auto;
}

#preview {
  overflow-y: scroll;
}

@media (max-width: 768px) {
  #editor,
  #preview {
    max-width: 100%;
    margin: 5px 0;
  }
}

.panel-top {
  background-color: #f5f5f5;
  padding: 5px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

</style>
