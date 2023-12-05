
<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { completionStore } from "../support/store"; // Modify the path as per your file structure
  import { nodeDataDblClicked } from "../support/store"; // Modify the path as per your file structure
  import { newNodeData } from "../support/store"; // Modify the path as per your file structure

  let links, nodes, svg;
  let width, height;
  let count = 0;

  // To get the value from the store
  let new_bubble_graph;
  // let hoveredNode = null
  let prev_selected_node = "";
  let new_node_to_add = "";
  // var force;

  // these are variables for updating graph
  var simulation;
  let node;
  let color;
  let colorScale;
  var link;
  let nodeSizeScale;
  let nodeDegrees;
  let force;
  let dimensions;


  function calculateGraphDimensions() {
    // Variables to hold the extremities
    let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;

        if (typeof nodes.forEach !== 'function')
        {
         return { width: 1200, height: 600, minX:1000, minY: 600 };
        }
    // Assuming 'nodes' is a collection of your graph elements (like an array or node list)
    // and each node has 'x' and 'y' properties indicating their positions
    nodes?.forEach(function(node) {
        // Update our min and max values for x
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x);

        // Update our min and max values for y
        minY = Math.min(minY, node.y);
        maxY = Math.max(maxY, node.y);
    });

    // Now, we have the points furthest apart, so the width and height are the differences
    const width = maxX - minX;
    const height = maxY - minY;

    // Also, if you need to include the element's dimensions, consider adding them to maxX, maxY.

    // Return the calculated dimensions (you might also need minX and minY to set the viewBox properly)
    return { width, height, minX, minY };
}


// Function to update the viewBox
function updateViewBox(svg) {


  if(! svg.setAttribute)
  {
    return
  }
    // Calculate the bounds of the graph, for example:
    var minX = dimensions.minX/* minimum x-coordinate of your graph elements */,
        minY = dimensions.minY/* minimum y-coordinate of your graph elements */,
        width = dimensions.width/* width of your graph content */,
        height = dimensions.height/* height of your graph content */;

    // Set the viewBox attribute dynamically
    svg.setAttribute('viewBox', minX + ' ' + minY + ' ' + width + ' ' + height);
}

  function updateGraph(oldNodeId, jsonData) {
    const newNodes = [];
    jsonData.forEach((item) => {
      if (!newNodes.some((node) => node.name === item.source)) {
        newNodes.push({ name: item.source, group: 1 });
      }
      if (!newNodes.some((node) => node.name === item.target)) {
        newNodes.push({ name: item.target, group: 1 });
      }
    });

    let nodesArray = simulation.nodes();
    nodesArray = nodesArray.filter((n) => n.name !== oldNodeId);

    let linksArray = simulation.force("link").links();
    linksArray = linksArray.filter((link) => {
      return link.source.name !== oldNodeId && link.target.name !== oldNodeId;
    });

    newNodes.forEach((newNode) => {
      if (!nodesArray.some((node) => node.name === newNode.name)) {
        nodesArray.push(newNode);
      }
    });

    linksArray.forEach((link) => {
      if (typeof link.source === "string" || typeof link.target === "string") {
        link.source =
          nodesArray.find((node) => node.name === link.source) || link.source;
        link.target =
          nodesArray.find((node) => node.name === link.target) || link.target;
      }
    });

    jsonData.forEach((newLink) => {
      const sourceNode = nodesArray.find(
        (node) => node.name === newLink.source
      );
      const targetNode = nodesArray.find(
        (node) => node.name === newLink.target
      );
      linksArray.push({
        source: sourceNode,
        target: targetNode,
        value: newLink.value,
      });
    });

    nodes = nodesArray;
    links = linksArray;
    update2();
  }

  completionStore.subscribe((value) => {
    new_bubble_graph = value;
  });

  newNodeData.subscribe((value) => {
    new_node_to_add = value;
  });


  


  function build_bubble_graph(jsonData) {
    nodeDataDblClicked.set("");
    // The rest of the code remains largely unchanged. You can use jsonData directly instead of the data variable.
    if (!svg) return; // Exit if SVG is not defined yet
    links = jsonData;


    nodes = {};
    // compute the distinct nodes from the links.
    links.forEach(function (link) {
      link.source =
        nodes[link.source] || (nodes[link.source] = { name: link.source });

      link.target =
        nodes[link.target] || (nodes[link.target] = { name: link.target });

      link.target.fixed = false; // Add 'fixed' property and set it to false initially
      link.source.fixed = false; // Add 'fixed' property and set it to false initially
    });

    // nodeDegrees = {};

    width = 1200;
    height = 700;
    force = d3.forceSimulation();

    if (!count) {
      svg = d3
        .select(svg) //.attr("width", width).attr("height", height);}
        // svg = d3.select("body").append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("height", "100%");
    }

    update2();
  }

  function update2() {
    console.log("LINKS", links)
    force
      .nodes(Object.values(nodes))
      .force("link", d3.forceLink(links).distance(100)) // Decreased link distance
      .force("center", d3.forceCenter(width / 2, height / 2 + 50))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force("charge", d3.forceManyBody().strength(-600)); // Increased charge strength
    // add the links
    var path = svg
      .append("g")
      .selectAll("path")
      .data(links)
      .enter()
      .append("path")
      .attr("class", function (d) {
        return "link " + d.type;
      })
      .style("stroke-width", "2px") // always thin
      .style("stroke", "lightblue") // always light bylue
      .style("stroke-dasharray", "4 2"); // if you always want dashed lines; remove this if not


    nodeDegrees = {};
    
      links.forEach(function (link) {
        var sourceName = link.source.name;
        var targetName = link.target.name;

        // Increment the degree count for source node
        if (nodeDegrees[sourceName]) {
          nodeDegrees[sourceName]++;
        } else {
          nodeDegrees[sourceName] = 1;
        }

        // Increment the degree count for target node
        if (nodeDegrees[targetName]) {
          nodeDegrees[targetName]++;
        } else {
          nodeDegrees[targetName] = 1;
        }
    });

    var maxDegree = d3.max(Object.values(nodeDegrees));
    var capDegree = maxDegree * 0.8; // adjust this value based on your needs

    console.log("maxDegree", maxDegree);
    console.log("capDegree", capDegree);
    console.log(nodeDegrees)
    colorScale = d3
      .scaleSequential()
      .domain([0, capDegree])
      .interpolator(d3.interpolate("#fde0dd", "#ea9ab2"));

    // define the nodes
    node = svg
      .selectAll(".node")
      .data(force.nodes())
      .enter()
      .append("g")
      .attr("class", "node")
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // KAI Define the scale function for node sizes
    nodeSizeScale = d3
      .scaleLinear()
      .domain([0, d3.max(Object.values(nodeDegrees))]) // Range of node degrees
      .range([10, 30]); // Range of node sizes

      console.log("nodeSizeScale", nodeSizeScale);
    node
      .append("circle")
      .attr("id", function (d) {
        return d.name.replace(/\s+/g, "").toLowerCase();
      })
      .attr("r", function (d) {
        return nodeSizeScale(nodeDegrees[d.name]);
      })
      .style("fill", function (d) {
        d.color = colorScale(nodeDegrees[d.name]); // Store the color in the 'color' property
        return d.color;
      });

    //  KAI add titles
    node
      .append("text") // create a new <text> element
      .attr("class", "text") // set the class attribute to "text"
      .attr("x", 12) // set the x attribute to 12 (horizontal position relative to the node)
      .attr("y", -12) // set the y attribute to -12 (vertical position relative to the node, moving above the node)
      .attr("dy", "0.35em") // set the dy attribute to 0.35em (vertical offset for the text position)
      .text(function (d) {
        return d.name;
      }); // set the text content of the <text> element based on the "name" property of the data

    // add the curvy lines

    function tick() {
      // console.log("path", path)
      path.attr("d", function (d) {
        // var dx = d.target.x - d.source.x,
        //   dy = d.target.y - d.source.y,
        //   dr = Math.sqrt(dx * dx + dy * dy);
        //   if (dr < 30) {  // adjust this threshold as needed
        return (
          "M" +
          d.source.x +
          "," +
          d.source.y +
          "L" +
          d.target.x +
          "," +
          d.target.y
        );
      });

      node.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    }

    function dragstarted(event, d) {
      if (!event.active) force.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      d.fixed = true;
      d3.select(this).select("circle").style("fill", "red");
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) force.alphaTarget(0);
      if (!d.fixed) {
        d.fx = null;
        d.fy = null;
      }
      d3.select(this).select("circle").style("fill", "green");
      nodeDataDblClicked.set(d.name);
      prev_selected_node = d.name;
    }

    function doubleClicked(event, d) {
      // console.log("DOUBLE", event, d);
      const clickedNode = d3.select(this).datum(); // Get the data object associated with the clicked node
      // console.log("clickedNode", clickedNode);
      if (prev_selected_node === clickedNode.name) {
        nodeDataDblClicked.set("");
      }
      // nodeDataDblClicked.set(clickedNode); // Set the nodeDataDblClicked variable to the data object of the clickedNode}
      if (clickedNode.fixed) {
        clickedNode.fx = null; // Release the fixed x-coordinate of the node
        clickedNode.fy = null; // Release the fixed y-coordinate of the node
        d3.select(this).select("circle").style("fill", clickedNode.color); // Restore the original color
      } else {
        clickedNode.fx = clickedNode.x; // Set the fixed x-coordinate of the node to its current x-coordinate
        clickedNode.fy = clickedNode.y; // Set the fixed y-coordinate of the node to its current y-coordinate
        d3.select(this).select("circle").style("fill", "green"); // Apply a different color to the pinned node
      }
    }

    node.on("dblclick", doubleClicked);

    force.alphaTarget(1).on("tick", tick);
    force.alpha(1).restart();

    simulation = force;
    color = colorScale;
    link = path;
  count ++
 dimensions = calculateGraphDimensions();
 updateViewBox(svg)

  }

  onMount(() => {
    let jsonData = [
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
      { source: "Agile Methodologies", target: "Kanban", value: 0.7 },
      // ... potentially more relationships
    ];

    build_bubble_graph(jsonData);
    count += 1;

  });

  //... All your other functions, e.g. tick, dragstarted, dragged, etc. ...
  
  $: {
    if (new_bubble_graph) {
      svg.selectAll("*").remove();
      build_bubble_graph(new_bubble_graph);
    }
  }

  $: {
    if (new_node_to_add) {
      // svg.selectAll("*").remove(); 
      updateGraph($nodeDataDblClicked, new_node_to_add);
    }
  }
</script>

<svg bind:this={svg} width="1200" height="700">
  <!-- Your SVG elements would be rendered here -->
</svg>

<style>
  svg {
    display: block;
    margin: 0 auto;
  }

  svg {
    width: 100%;
    height: 100%;
  }
  path.link {
    fill: none;
    stroke: #666;
    stroke-width: 1.5px;
  }

  circle {
    fill: lightblue;
    stroke: #fff;
    stroke: black;
    stroke-width: 1.5px;
  }

  text {
    fill: #000;
    font: 10px sans-serif;
    pointer-events: none;
    font-weight: bold;
  }
</style>
