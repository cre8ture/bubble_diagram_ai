<script>
    import { fade } from "svelte/transition";
    import * as d3 from "d3";
    import {saveToLocalStorage, getFromLocalStorage, getMultipleKeysFromLocalStorage} from "../support/useLocalStorage"
    import { afterUpdate, onMount } from "svelte";
    // Import the useChat function from the 'ai/svelte' module
    import { useCompletion } from "ai/svelte";
    import { completionStore } from "../support/store"; // Modify the path as per your file structure
    import { isOutline } from "../support/store.js";
    import { outline } from "../support/store.js";
    import { nodeDataDblClicked } from "../support/store.js";
    import { openAIIsLoading } from "../support/store.js";
    import { completedOutline } from "../support/store.js";
    import { newNodeData } from "../support/store.js";
    import { isGraph } from "../support/store.js";
    import { isDeleteNode } from "../support/store.js";
    import { toast } from "@zerodevx/svelte-toast";
    import { isNodeUpdate } from "../support/store.js";
    import { currentJsonToSave } from "../support/store.js";
    import { isLoadNewGraph } from "../support/store.js";

    


    import Spinner from "./spinner.svelte";

    let endpoint = "/api/bubble_graph";
    let isNewConcept = false;

    // let selectedNode = $nodeDataDblClicked
    let newNodeFromeUser = "";
    let currentJson = [
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
        {
            source: "Software Engineer",
            target: "Agile Methodologies",
            value: 1,
        },
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
        { source: "Agile Methodologies", target: "Kanban", value: 0.7 },
    ];
    // Initialize outside the function to accumulate data across calls.

    // Global state to keep track of data across chunks.
    // let previousBuffer = '';
    // let currentBuffer = '';
    onMount(() => {
        currentJson = getFromLocalStorage("current_ai_graph");
    })


    let processBuffer = "";
    let jsonStartInit = 0;
    // let jsonStart = 0;

    // let jsonEnd = null;
    const regex = /{[^}]*}/;
    let updatingANode = false;
    let nodeToReplace = "";
    // let nodeToExpand = ''

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

    // The match() method searches a string for a match against a regular expression,
    // and returns an array of information or null on a mismatch.
    function handleCharacter(chunk) {
        if (chunk.length < 10) {
            jsonStartInit = 0;
        }
        processBuffer = chunk.substring(jsonStartInit);
        // console.log("processBuffer", jsonStartInit, processBuffer)
        const matches = processBuffer.match(regex);
        // console.log("matches", matches)
        if (matches && matches[0]) {
            jsonStartInit = chunk.lastIndexOf("}") + 1;
            const jsonNode = parseJSONString("[" + matches[0] + "]");
            if (jsonNode.length > 0) {
                return jsonNode;
            }
        }
    }

    function parseJSONString(inputString) {
        var jsonObject = [];
        const regex = /{[^}]*"source"[^}]*"target"[^}]*"value"[^}]*}/g;

        const matches = inputString.match(regex);
        // console.log("matches", matches)
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

                let sanitizedString = parseJSONString(completion);
                currentJson = sanitizedString;

                isNewConcept = false;
            } else if (nodeToUpdate) {
                try {
                    const newUnsanitizedGraph = completion;
                    let sanitizedString = parseJSONString(newUnsanitizedGraph);
                    // newNodeData.set(sanitizedString);
                    currentJson = sanitizedString;
                    saveToLocalStorage("current_ai_graph", sanitizedString);
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                }
                isNewConcept = false;
                updatingANode = false;
                nodeToUpdate = false;
                newNodeData.set("");
            } else if ($isNodeUpdate) {
                try {
                    const newUnsanitizedGraph = completion;
                    let sanitizedString = parseJSONString(newUnsanitizedGraph);
                    // newNodeData.set(sanitizedString);
                    saveToLocalStorage("current_ai_graph", sanitizedString);

                    currentJson = sanitizedString;
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                }
                isNewConcept = false;
                nodeToUpdate = false;
                newNodeData.set("");
                isNodeUpdate.set(false);
            } else {
                completedOutline.set(completion); // make outline
            }

            // if(isNewConcept || nodeToUpdate)
            count = 0;
            jsonStartInit = 0;
            isNewConcept = false;
            nodeToUpdate = false;
            updatingANode = false;
            // currentJson = completion

            console.log(
                "isNewConcept, nodeToUpdate",
                isNewConcept,
                nodeToUpdate,
                updatingANode
            );
            let sanitizedString = parseJSONString(completion);
            saveToLocalStorage("current_ai_graph", sanitizedString);
        },
        onError: (err) => {
            //   toast.error(err.message);
            openAIIsLoading.set(false); // Move this outside the if-else block
            console.log(err);
            isNewConcept = false;

            //   }
        },
    });
    // console.log("isLoading", $isLoading)

    function handleConcept() {
        console.log("I am building new concept!!!!", concept);
        jsonStartInit = 0;

        endpoint = "/api/bubble_graph";
        isNewConcept = true;
        isOutline.set(false);
        // newNodeData.set("");

        // nodeDataDblClicked.set('')
        complete(concept);
        var count = 0;
        completionStore.set(true);

        // This could be a Svelte store subscription or another method of handling a streaming input.
        completion.subscribe((value) => {
            // console.log("value", value)
            let result = handleCharacter(value);

            // console.log("result", concept, jsonStartInit, count, result)

            // if (result && count === 0) {
            //     // currently turned off. make === 0 to turn on
            //     console.log("FIRST");
            //      completionStore.set(true);

            //     // const svg = d3.select("svg");
            //     // svg.selectAll("*").remove();
            // }
            // // } else
             if (result) {
                newNodeData.set(result);
                console.log("SECOND", result);
            }
            if (result) {
                count++;
            }
        });

        concept = "";
    }

    async function handleGraphUpdate() {
        jsonStartInit = 0;

        // nodeToUpdate = true;
        nodeToUpdate = true;

        complete(newNodeFromeUser);
        console.log("newNodeFromeUser", $nodeDataDblClicked);
        var count = 0;
        // This could be a Svelte store subscription or another method of handling a streaming input.
        completion.subscribe((value) => {
            let result = handleCharacter(value);

            if (count === 0) {
                // currently turned off. make === 0 to turn on
                // completionStore.set(currentJson);
                isGraph.set(true);
                newNodeData.set(currentJson);
                count++;
            }
            if (result) {
                console.log("res", result);
                isGraph.set(false);
                newNodeData.set(result);
                count++;
                // saveToLocalStorage("current_ai_graph", currentJson);
            }
        });
    }

    async function handleExpandNode() {
        jsonStartInit = 0;

        // nodeToUpdate = true;
        nodeToUpdate = true;

        complete($nodeDataDblClicked);
        console.log("newNodeFromeUser", $nodeDataDblClicked);
        var count = 0;
        // This could be a Svelte store subscription or another method of handling a streaming input.
        completion.subscribe((value) => {
            let result = handleCharacter(value);

            if (count === 0) {
                // currently turned off. make === 0 to turn on
                // completionStore.set(currentJson);
                isGraph.set(true);
                newNodeData.set(currentJson);
                count++;
            } else if (result) {
                // console.log("res", result);
                isGraph.set(false);
                if (count === 1 && result[0].source !== $nodeDataDblClicked) {
                    result.push({
                        source: $nodeDataDblClicked,
                        target: result[0].source,
                    });
                }
                newNodeData.set(result);
                count++;
                // saveToLocalStorage("current_ai_graph", currentJson);
            }
        });
    }

    async function handleNodeUpdate() {
        // jsonStartInit = 0;

        isNodeUpdate.set(true);
        complete($nodeDataDblClicked);
    }

    function deleteNodeInJson(nodeName, jsonObject) {
        // Filter the jsonObject to only include items that don't match the specified nodeName
        return jsonObject.filter(function (item) {
            return item.source !== nodeName && item.target !== nodeName;
        });
    }

    function handleDeleteNode() {
        currentJson = deleteNodeInJson($nodeDataDblClicked, currentJson);
        console.log("deleted!");
        isDeleteNode.set(true);
        toast.push("Success!", {
            theme: {
                "--toastColor": "mintcream",
                "--toastBackground": "rgba(72,187,120,0.9)",
                "--toastBarBackground": "#2F855A",
            },
        });
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
            concept = "";
        }
    }

    $: {
        if($isLoadNewGraph){
            // isGraph.set(true) // remove current graph
        completionStore.set(true);

            console.log("NEW GRAPH", $currentJsonToSave); 
        newNodeData.set($currentJsonToSave)} // set loaded graph
        currentJson = $currentJsonToSave
    // isGraph.set(false) // remove current graph

    isLoadNewGraph.set(false);


    }

    afterUpdate(() => {
        currentJsonToSave.set(currentJson);
        saveToLocalStorage('current_ai_graph', currentJson);
    });
</script>

<div class="form-container" transition:fade={{ duration: 300 }}>
    <h1>AI Diagram Maker</h1>
    {#if $isLoading}
        <Spinner />
    {/if}
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
            {#if !$isLoading}
                <div class="input-group">
                    <input
                        bind:value={newNodeFromeUser}
                        placeholder="Add a new node"
                    />
                    <button class="submit-btn" on:click={handleGraphUpdate}
                        >Submit</button
                    >
                </div>

                {#if $nodeDataDblClicked}
                    <div class="nodeSelected">
                        <label for="name"
                            >Node: <strong>{$nodeDataDblClicked}</strong></label
                        >

                        <div class="input-group">
                            <input
                                bind:value={nodeToReplace}
                                placeholder="Change this node to a new node"
                            />
                            <button
                                class="submit-btn"
                                on:click={handleNodeUpdate}>Submit</button
                            >
                        </div>

                        <div class="input-group-del-exp-buttons">
                            <button
                                class="submit-btn-del-exp"
                                on:click={handleExpandNode}>Expand Node</button
                            >
                            <button
                                class="submit-btn-del-exp"
                                on:click={handleDeleteNode}>Delete Node</button
                            >
                        </div>
                    </div>
                {/if}
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
    .submit-btn,
    .submit-btn-del-exp {
        background-color: #e0e0e0; /* light gray */
        color: #000; /* black text */
        padding: 10px 15px;
        border: none;
        /* border: solid 1px black; */
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .outline-btn:hover,
    .download-btn:hover,
    .submit-btn:hover,
    .submit-btn-del-exp:hover {
        background-color: #b0b0b0; /* darker gray on hover */
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
