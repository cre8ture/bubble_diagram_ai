<script>
    import { fade } from "svelte/transition";
    // Import the useChat function from the 'ai/svelte' module
    import { useCompletion } from "ai/svelte";
    import { completionStore } from "../support/store"; // Modify the path as per your file structure
    import { isOutline } from "../support/store.js";
    import { outline } from "../support/store.js";
    import { nodeDataDblClicked } from "../support/store.js";
    import { openAIIsLoading } from "../support/store.js";
    import { completedOutline } from "../support/store.js";
    import { newNodeData } from "../support/store.js";
    import { graphRawData } from "../support/store.js";

    let endpoint = "/api/bubble_graph";
    let isNewConcept = false;

    // let selectedNode = $nodeDataDblClicked
    let newNodeFromeUser = "";
    let rawGraphDataBuilder = "";

    let currentSegment = "";
    let insideSegment = false;
    let nodeJson = ''
    let braceCount = 0;
// Initialize outside the function to accumulate data across calls.

// Global state to keep track of data across chunks.
let previousBuffer = '';
let currentBuffer = '';

let processBuffer = '';
let jsonStartInit = 0;
let jsonStart = 0;

let jsonEnd = null;
const regex = /{[^}]*}/;


    // The match() method searches a string for a match against a regular expression,
    // and returns an array of information or null on a mismatch.
function handleCharacter(chunk) {
    processBuffer = chunk.substring(jsonStartInit)
    // console.log("processBuffer", processBuffer)
    const matches = processBuffer.match(regex);
    
    if (matches && matches[0]){
        
        jsonStartInit = chunk.lastIndexOf('}') + 1
        console.log(" matches[0]", matches[0])
        const jsonNode = parseJSONString('[' + matches[0] + ']')
        if(jsonNode.length > 0){
            return jsonNode
        }
    }
    
}



    function parseJSONString(inputString) {
        var jsonObject = [];
        const regex = /{[^}]*"source"[^}]*"target"[^}]*"value"[^}]*}/g;

        const matches = inputString.match(regex);
        console.log("matches", matches)
        if (matches) {
            for (const match of matches) {
                try {
                    const parsedObject = JSON.parse(match);
                    jsonObject.push(parsedObject);
                } catch (error) {
                    console.error("Error parsing JSON object:", error);
                }
            }
        }

        return jsonObject;
    }

    // Destructure the properties from the useChat function's return value
    const { complete, completion, isLoading, stop } = useCompletion({
        api: endpoint, // "/api/bubble_graph",
        onFinish: (_prompt, completion) => {
            openAIIsLoading.set(false);
            // console.log("WOOGLE openAIIsLoading", $openAIIsLoading);
            if (isNewConcept) {
                unsanitizedGraph = completion;
                // let sanitizedString = parseJSONString(completion);
                // console.log("_prompt, sanitizedString", _prompt, sanitizedString);
                try {
                      let parsedJSON = JSON.parse(sanitizedString);
                    // console.log(sanitizedString);
                    // completionStore.set(sanitizedString);  // REINITATE
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                }
                isNewConcept = false;

            } else if (nodeToUpdate) {
                try {
                    const newUnsanitizedGraph = completion;
                    let sanitizedString = parseJSONString(newUnsanitizedGraph);
                    newNodeData.set(sanitizedString);
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                }
                isNewConcept = false;
            } else {
                completedOutline.set(completion);
            }
        },
        onError: (err) => {
            //   toast.error(err.message);
            openAIIsLoading.set(false); // Move this outside the if-else block
            console.log(err);
            isNewConcept = false;

            //   }
        },
    });

    let concept = "";
    let nodeToUpdate = false;
    // let outline = ''
    let unsanitizedGraph = `
      { source: "Software Engineer", target: "Programming", value: 1 },
      { source: "Software Engineer", target: "Debugging", value: 1 },
      { source: "Software Engineer", target: "Software Design", value: 1 },
      { source: "Software Engineer", target: "Version Control", value: 1 },
      {
        source: "Software Engineer",
        target: "Continuous Integration",
        value: 1,
      },
      {
        source: "Software Engineer",
        target: "Continuous Deployment",
        value: 1,
      },
      { source: "Software Engineer", target: "Testing", value: 1 },
      { source: "Software Engineer", target: "Problem Solving", value: 1 },
      { source: "Software Engineer", target: "Collaboration", value: 1 },
      { source: "Software Engineer", target: "Code Review", value: 1 },
      { source: "Software Engineer", target: "Optimization", value: 1 },
      { source: "Software Engineer", target: "Documentation", value: 1 },
      { source: "Software Engineer", target: "Agile Methodologies", value: 1 },
      { source: "Programming", target: "Languages", value: 0.8 },
      { source: "Programming", target: "Frameworks", value: 0.7 },
      { source: "Programming", target: "Data Structures", value: 0.8 },
      { source: "Programming", target: "Algorithms", value: 0.8 },
      { source: "Software Design", target: "UML", value: 0.6 },
      { source: "Software Design", target: "Design Patterns", value: 0.7 },
      { source: "Version Control", target: "Git", value: 0.9 },
      { source: "Version Control", target: "Mercurial", value: 0.5 },
      { source: "Version Control", target: "SVN", value: 0.5 },
      { source: "Continuous Integration", target: "Jenkins", value: 0.7 },
      { source: "Continuous Integration", target: "Travis CI", value: 0.6 },
      { source: "Testing", target: "Unit Testing", value: 0.8 },
      { source: "Testing", target: "Integration Testing", value: 0.7 },
      { source: "Testing", target: "Functional Testing", value: 0.6 },
      { source: "Testing", target: "Test Driven Development", value: 0.7 },
      { source: "Optimization", target: "Performance", value: 0.7 },
      { source: "Optimization", target: "Refactoring", value: 0.6 },
      { source: "Documentation", target: "Comments", value: 0.6 },
      { source: "Documentation", target: "API Documentation", value: 0.7 },
      { source: "Agile Methodologies", target: "Scrum", value: 0.8 },
      { source: "Agile Methodologies", target: "Kanban", value: 0.7 },`;

     function handleConcept() {
        endpoint = "/api/bubble_graph";
        isNewConcept = true;
        isOutline.set(false);
        newNodeData.set('');

        // console.log(concept);
         complete(concept);
         var count = 0
        // This could be a Svelte store subscription or another method of handling a streaming input.
        completion.subscribe((value) => {

            let result = handleCharacter(value);

            if (count === 0) {
                completionStore.set(result);
            }
            else {
                newNodeData.set(result);}
            if(result){
                 count++
            }
                
        });
        

        concept = "";
    }

    async function handleGraphUpdate() {
        nodeToUpdate = true;
        complete(newNodeFromeUser);

        // GraphComponent.updateGraph($nodeDataDblClicked, await completion);
    }

    async function handleOutline() {
        // endpoint= "/api/outline"

        isOutline.set(true);

        if (unsanitizedGraph) {
            openAIIsLoading.set(true);
            // console.log("UNSANITIZED GRAPH", unsanitizedGraph, endpoint);
            complete("make_outline_320_" + unsanitizedGraph); // make_outline_320_ will tell the api to do outline
            completion.subscribe((value) => {
                outline.set(value); // Update the outline store with the new value
            });
            // isLoading.subscribe((value) => {
            //     openAIIsLoading.set(value);
            // })
            concept = "";
        }
    }
</script>

<div class="form-container" transition:fade={{ duration: 300 }}>
    <h1>AI Diagram Maker</h1>
    <div class="flex-container">
        <div class="flex-start">
            <div class="input-group">
                <input
                    bind:value={concept}
                    placeholder="Enter the concept of an idea you want to visualize"
                />
                <button on:click={handleConcept} class="submit-btn"
                    >Submit</button
                >
            </div>
            <div class="input-group">
                <button class="outline-btn" on:click={handleOutline}
                    >Turn this into an outline</button
                >
                <button class="download-btn">Download</button>
            </div>
        </div>
        <div class="flex-end">
            {#if $nodeDataDblClicked}
                <div class="nodeSelected">
                    <label for="name"
                        >Node: <strong>{$nodeDataDblClicked}</strong></label
                    >
                    <div class="input-group">
                        <input
                            bind:value={newNodeFromeUser}
                            placeholder="Enter a new name for this node"
                        />
                        <button class="submit-btn" on:click={handleGraphUpdate}
                            >Submit</button
                        >
                    </div>
                    <div class="input-group-del-exp-buttons">
                        <button class="submit-btn-del-exp">Expand Node</button>
                        <button class="submit-btn-del-exp">Delete Node</button>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .form-container {
        width: 100%;
        max-width: 600px;
        margin: 50px auto;
        padding: 20px;
        border: 1px solid #e5e5e5;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .nodeSelected {
        /* background-color: lightcoral; */
    }

    .flex-container {
        display: flex;
        justify-content: space-between;
    }

    .flex-start {
        flex: 1; /* Takes available space */
    }

    .flex-end {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .input-group {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
    }

    .input-group-del-exp-buttons {
        display: flex;
        align-items: start;
        margin-bottom: 20px;
    }

    .input-group-stack {
        display: flex;
        flex-direction: column; /* Stack vertically */
        align-items: flex-start; /* Align items to the start */
    }

    /* Rest of your CSS styles */

    .input-group:not(:last-child) {
        margin-right: 20px;
    }

    input {
        display: block;
        width: calc(100% - 100px);
        padding: 10px;
        border: 1px solid #e5e5e5;
        border-radius: 5px;
    }

    .outline-btn,
    .download-btn,
    .submit-btn {
        padding: 10px 15px;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .submit-btn {
        background-color: #aaa;
        color: #fff;
        margin-left: 10px;
    }

    .submit-btn-del-exp {
        background-color: #aaa;
        color: #fff;
        margin-right: 10px;
    }

    .outline-btn {
        background-color: transparent;
        border: 1px solid #333;
    }

    .outline-btn:hover {
        background-color: #333;
        color: #fff;
    }

    .download-btn {
        background-color: #333;
        color: #fff;
        margin-left: 10px;
    }

    .download-btn:hover {
        background-color: #555;
    }

    @media (max-width: 600px) {
        .flex-container {
            flex-direction: column;
        }

        .input-group:not(:last-child) {
            margin-right: 0;
        }
    }
</style>
