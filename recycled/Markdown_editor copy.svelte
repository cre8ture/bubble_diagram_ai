<script>
  import './styles/codemirror.css';
  import './styles/solarized.css';
  import { onMount, afterUpdate } from 'svelte';
  import { basicSetup } from "codemirror";
  import { EditorState } from "@codemirror/state"
  import { EditorView } from "@codemirror/view"
  import { markdown } from '@codemirror/lang-markdown';
  import {marked} from 'marked';

  let editor;
  let mdPreview = '';
  let editorState;

  // onMount(() => {
  //   const config = {
  //     state: EditorState.create({
  //       doc: "# Markdown Editor\nStart typing...",
  //       extensions: [basicSetup, markdown()]
  //     }),
  //     parent: document.querySelector("#editor"),
  //   };

  //   editor = new EditorView(config);

  //   // Listen for editor content changes
  //   editorState = editor.state;
  // });

  
  onMount(() => {
    const config = {
      state: EditorState.create({
        doc: "# Markdown Editor\nStart typing...",
        extensions: [
          basicSetup, 
          markdown(),
          EditorView.updateListener.of(e => {
            if (e.docChanged) {
              mdPreview = marked(e.state.doc.toString());
            }
          })
        ]
      }),
      parent: document.querySelector("#editor"),
    };

    editor = new EditorView(config);
  });


  // Update the Markdown preview whenever the editor content changes
  afterUpdate(() => {
    if (editorState) {
      const content = editorState.doc.toString();
      mdPreview = marked(content);
    }
  });

  async function completeMarkdown() {
    try {
      const stream = await callOpenAI(editor.state.doc.toString());
      let completion = '';

      for await (const chunk of stream) {
        completion += chunk;
      }

      editor.dispatch({
        changes: { from: editor.state.doc.length, insert: completion }
      });
    } catch (error) {
      console.error("Error fetching completion:", error);
    }
  }

  async function callOpenAI(inputText) {
    const prompt = `Create an HTML file with HTML, JavaScript, and CSS based on the following user inquiry: ${inputText}. Please only output valid HTML, CSS, and JavaScript code in one file and do not output anything that is not code.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        }),
      });

      const stream = response.body.pipeThrough(new TextDecoderStream());
      return stream;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
</script>
<style>
  /* Container class for both editor and preview */
  #markdown-editor {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: stretch;  /* To ensure they are of the same height */
  }

  /* Shared styles for both #editor and #preview */
  #editor, #preview {
    flex: 1;  /* Let them take equal width */
    max-width: calc(50% - 10px); /* Subtracting margin for precise 50% width */
    min-height: 400px;
    border-radius: 15px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    padding: 10px;
    margin: 5px;
  }

  #preview {
    overflow-y: scroll;
  }

  /* Mobile view: Stacked layout */
  @media (max-width: 768px) {
    #editor, #preview {
      max-width: 100%;
      margin: 5px 0; /* Only vertical margin */
    }
  }
</style>



<!-- <button on:click={completeMarkdown}>Complete Markdown</button> -->
<div id="markdown-editor">
<div id="editor"></div>
<div id="preview" contenteditable="true" bind:innerHTML={mdPreview}></div>
</div>
