<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { completionStore } from "../support/store"; // Modify the path as per your file structure
  import { nodeDataDblClicked } from "../support/store"; // Modify the path as per your file structure
  import { newNodeData } from "../support/store"; // Modify the path as per your file structure
  import { isGraph } from "../support/store.js";
  import { isDeleteNode } from "../support/store.js";
  import {saveToLocalStorage, getFromLocalStorage, getMultipleKeysFromLocalStorage} from "../support/useLocalStorage"
  import { currentSVG } from "../support/store.js";

  let links, nodes, svg;
  let width, height;
  let count = 0;

  // To get the value from the store
  // let new_bubble_graph;
  // let hoveredNode = null
  let prev_selected_node = "";
  // let new_node_to_add = "";
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
  let path;
  let maxDegree; // = d3.max(Object.values(nodeDegrees));
  let capDegree; // = maxDegree * 0.8; // adjust this value based on your needs

  // let svgElement; // This will hold the reference to your SVG element

  const svgReference = (node) => {
    if (node) {
      // If the node (your SVG element) exists, select it with D3
      // svgElement = d3.select(node);
      currentSVG.set(d3.select(node));
      // You can perform additional D3 setup or operations here if necessary
      // currentSVG.set(svgElement);
    }
  };

  function calculateGraphDimensions() {
    // Variables to hold the extremities
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    if (typeof nodes.forEach !== "function") {
      return { width: 1200, height: 600, minX: 1000, minY: 600 };
    }
    // Assuming 'nodes' is a collection of your graph elements (like an array or node list)
    // and each node has 'x' and 'y' properties indicating their positions
    nodes?.forEach(function (node) {
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
  function updateViewBox(svg) {
    // These dimensions need to be determined by your actual content.
    var minX = dimensions.minX, // minimum x-coordinate of your graph elements
      minY = dimensions.minY, // minimum y-coordinate of your graph elements
      width = dimensions.width, // width of your graph content
      height = dimensions.height; // height of your graph content

    // Define padding around your content. These values can be adjusted as needed.
    var padding = 30; // for example, 30 units of padding

    // Adjust the bounds of the viewBox to include padding
    var paddedMinX = minX - padding;
    var paddedMinY = minY - padding;
    var paddedWidth = width + padding * 2;
    var paddedHeight = height + padding * 2;

    // console.log(minX, minY, paddedMinX, paddedMinY, paddedWidth, paddedHeight);

    // Here we're using D3's attr method to set the viewBox attribute.
    svg.attr("viewBox", 0 + " " + 0 + " " + paddedWidth + " " + paddedHeight);
  }

  function updateGraph_orig(oldNodeId, jsonData) {
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

    // console.log(nodes, links)
    // update3(nodes, links);

    // update3(nodesArray, linksArray);
    update();
  }

  function find_nodes_to_delete(oldNodeId, jsonData) {
    // First, create a set of all nodes that are connected to the node being deleted.
    let exclusiveNodes = new Set();
    let linksArray = simulation.force("link").links();

    linksArray.forEach((link) => {
      // If the link is connected to the node to delete, add the other end of the link to the set.
      if (link.source.name === oldNodeId) {
        exclusiveNodes.add(link.target.name);
      } else if (link.target.name === oldNodeId) {
        exclusiveNodes.add(link.source.name);
      }
    });

    // Now, iterate through all links and remove nodes from the set if they are connected to other nodes.
    linksArray.forEach((link) => {
      if (
        link.source.name !== oldNodeId &&
        exclusiveNodes.has(link.source.name)
      ) {
        exclusiveNodes.delete(link.source.name);
      }
      if (
        link.target.name !== oldNodeId &&
        exclusiveNodes.has(link.target.name)
      ) {
        exclusiveNodes.delete(link.target.name);
      }
    });

    // At this point, 'exclusiveNodes' contains only nodes exclusively connected to the old node.
    // Now, filter out the links. You want to remove links connecting the old node and links connecting the exclusive nodes.
    linksArray = linksArray.filter((link) => {
      return (
        link.source.name !== oldNodeId &&
        link.target.name !== oldNodeId &&
        !exclusiveNodes.has(link.source.name) &&
        !exclusiveNodes.has(link.target.name)
      );
    });

    // Also, prepare to filter out the nodes, including the old node and the exclusive nodes.
    let nodesArray = simulation.nodes().filter((node) => {
      return node.name !== oldNodeId && !exclusiveNodes.has(node.name);
    });

    const connectedNodeNames = new Set();
    linksArray.forEach((link) => {
      connectedNodeNames.add(link.source.name);
      connectedNodeNames.add(link.target.name);
    });

    // Filter nodesArray to only include nodes that still have links connected.
    nodesArray = nodesArray.filter((node) => connectedNodeNames.has(node.name));
    // Finally, update your graph with the new nodes and links.
    nodes = nodesArray;
    links = linksArray;

    // Clean the current SVG elements and redraw based on the new graph data.
    svg.selectAll("*").remove();
    deleteANode(); // Assuming this function re-initializes and draws the nodes and links.
  }

  function updateGraph(oldNodeId, jsonData) {
    // Start with empty arrays
    let nodesArray = [];
    // let linksArray = [];

    jsonData.forEach((newLink) => {
      // Add new source and target nodes
      const sourceNode = { name: newLink.source };
      nodesArray.push(sourceNode);

      const targetNode = { name: newLink.target };
      nodesArray.push(targetNode);
    });

    // No need to filter existing data

    // Call update function with only new data
    console.log("updateGrapj", nodesArray, jsonData);
    update3(nodesArray, jsonData);
  }

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
        .attr("preserveAspectRatio", "xMidYMid meet");
      // .style("width", "100%")
      // .style("height", "100%");
    }

    update2();
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
    // console.log('Node data on drag ended: ', d);
    d3.select(this).select("circle").style("fill", "green");
    nodeDataDblClicked.set(d.name);
    prev_selected_node = d.name;
  }

  function tick(path) {
    // console.log("path", path)
    path.attr("d", function (d) {
      // if (!d.source.x || !d.source.y || !d.target.x || !d.target.y) {
      //   return
      // }
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
  }

  function doubleClicked(event, d) {
    // console.log("DOUBLE", event, d);
    const clickedNode = d3.select(this).datum(); // Get the data object associated with the clicked node
    // console.log("clickedNode", clickedNode);
    // console.log("event", event, "d",d)
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

  // Assuming svg, simulation, height, width, dragstarted, dragged, and dragended are already defined above this function
  let allNodes = [];
  let allLinks = [];

  function update3(newNodesArray, newLinksArray) {
    // console.log(newNodesArray, newLinksArray)

    let linkContainer = svg.append("g").attr("class", "link-container");
    let nodeContainer = svg.append("g").attr("class", "node-container");

    // Append new nodes and links to the master lists
    newNodesArray.forEach((newNode) => {
      let existingNode = allNodes.find((n) => n.name === newNode.name);
      if (!existingNode) {
        allNodes.push(newNode);
      }
    });

    // Update links to reference the exact node objects from allNodes
    newLinksArray.forEach((link) => {
      link.source = allNodes.find((node) => node.name === link.source);
      link.target = allNodes.find((node) => node.name === link.target);
    });

    // allLinks = allLinks.concat(newLinksArray);

    // console.log("allNodes",allNodes, allLinks)

    // For new links, we just push them to the allLinks list.
    allLinks = allLinks.concat(newLinksArray);

    // Forces remain the same
    simulation
      .force(
        "link",
        d3
          .forceLink()
          .id((d) => d.name)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-600))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(15))
      // Set alpha decay to a lower value


    let link = linkContainer
      .selectAll(".link")
      .data(allLinks, (d) => d.source.name + "-" + d.target.name);

    link.exit().remove();
    link
      .enter()
      .append("line")
      .attr("class", "link")
      .style("stroke-width", "2px") // always thin
      .style("stroke", "lightblue") // always light bylue
      .style("stroke-dasharray", "4 2"); // if you always want dashed lines; remove this if not

    // Update nodes using allNodes instead of newNodesArray
    // let node = svg.selectAll(".node")
    //     .data(allNodes, d => d.name);
    let node = nodeContainer.selectAll(".node").data(allNodes, (d) => d.name);

    nodeDegrees = {};

    allLinks.forEach(function (link) {
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
    maxDegree = d3.max(Object.values(nodeDegrees));
    capDegree = maxDegree * 0.8; // adjust this value based on your needs

    // console.log("maxDegree", maxDegree);
    // console.log("capDegree", capDegree);
    colorScale = d3
      .scaleSequential()
      .domain([0, capDegree])
      .interpolator(d3.interpolate("#fde0dd", "#ea9ab2"));

    // KAI Define the scale function for node sizes
    nodeSizeScale = d3
      .scaleLinear()
      .domain([0, d3.max(Object.values(nodeDegrees))]) // Range of node degrees
      .range([10, 30]); // Range of node sizes

    let nodeEnter = node
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

    nodeEnter
      .append("circle")
      .attr("r", function (d) {
        return nodeSizeScale(nodeDegrees[d.name]);
      })
      .style("fill", function (d) {
        d.color = colorScale(nodeDegrees[d.name]); // Store the color in the 'color' property
        return d.color;
      });

    nodeEnter
      .append("text")
      .attr("x", 12)
      .attr("dy", ".35em")
      .text((d) => d.name)
      .on("dblclick", doubleClicked);

    dimensions = calculateGraphDimensions();

    updateViewBox(svg);

    // Update and restart the simulation with allNodes and allLinks
    simulation.nodes(allNodes).on("tick", ticked);
    simulation
      .force("link")
      .links(allLinks)
      .id((d) => d.name);
    simulation.alphaTarget(0.01).restart();
  }

  function ticked() {
    let link = svg
      .selectAll(".link")
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    let node = svg.selectAll(".node").attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  }

  function update2() {
    force
      .nodes(Object.values(nodes))
      .force("link", d3.forceLink(links).distance(100)) // Decreased link distance
      .force("center", d3.forceCenter(width / 2, height / 2 + 50))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force("charge", d3.forceManyBody().strength(-600)); // Increased charge strength
    // add the links
    path = svg
      .append("g")
      .selectAll("path")
      .data(links)
      .enter()
      .append("path")
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

    maxDegree = d3.max(Object.values(nodeDegrees));
    capDegree = maxDegree * 0.8; // adjust this value based on your needs

    // console.log("maxDegree", maxDegree);
    // console.log("capDegree", capDegree);
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

    node
      .append("circle")
      .attr("id", function (d) {
        // if (typeof d.name !== 'string') {
        //   return "";
        // }
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
        // if (!d.source.x || !d.source.y || !d.target.x || !d.target.y) {
        //   return
        // }
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
        if (!d.x || !d.y) {
          return;
        }
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
    node.exit().remove();
    path.exit().remove();

    force.alphaTarget(0.01).on("tick", tick).restart();
    // force.alpha(1).restart();

    simulation = force;
    color = colorScale;
    link = path;
    count++;
    dimensions = calculateGraphDimensions();
    updateViewBox(svg);
  }

  function deleteANode() {
    force
      .nodes(Object.values(nodes))
      .force("link", d3.forceLink(links).distance(100)) // Decreased link distance
      .force("center", d3.forceCenter(width / 2, height / 2 - 50))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force("charge", d3.forceManyBody().strength(-600)); // Increased charge strength
    // add the links
    path = svg
      .append("g")
      .selectAll("path")
      .data(links)
      .enter()
      .append("path")
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

    maxDegree = d3.max(Object.values(nodeDegrees));
    capDegree = maxDegree * 0.8; // adjust this value based on your needs

    // console.log("maxDegree", maxDegree);
    // console.log("capDegree", capDegree);
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

    node
      .append("circle")
      .attr("id", function (d) {
        // if (typeof d.name !== 'string') {
        //   return "";
        // }
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
        // if (!d.source.x || !d.source.y || !d.target.x || !d.target.y) {
        //   return
        // }
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
        if (!d.x || !d.y) {
          return;
        }
        return "translate(" + d.x + "," + d.y + ")";
      });
    }

    node.on("dblclick", doubleClicked);
    // Correctly identify the node and text elements that need to be removed.
    var nodeSelection = svg
      .selectAll(".node")
      .data(force.nodes(), function (d) {
        return d.name; // Assuming 'name' is your unique identifier
      });

    // The 'exit' selection contains all the nodes that no longer exist in the data.
    var nodeExit = nodeSelection.exit();

    // Remove the 'g' element (which contains both the circle and the text) for each exiting node.
    nodeExit.remove();

    // Update the links. This is crucial since the nodes have changed, and the links need to reflect that.
    var linkSelection = svg.selectAll("path").data(links, function (d) {
      // Define how to uniquely identify links here, typically using source and target information.
      return d.source.name + "-" + d.target.name; // Construct a unique identifier based on your actual data structure.
    });

    // Remove any links that are no longer in the data.
    linkSelection.exit().remove();

    node.exit().remove();
    path.exit().remove();

    force.alphaTarget(0.01).on("tick", tick).restart();
    // force.alpha(1).restart();

    simulation = force;
    color = colorScale;
    link = path;
    count++;
    dimensions = calculateGraphDimensions();
    updateViewBox(svg);
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
    ];

    const lastGraph = getFromLocalStorage("current_ai_graph")
    console.log("lastGraph", lastGraph)
    build_bubble_graph(lastGraph || jsonData);
    count += 1;
  });

  $: {
    if ($completionStore) {
      console.log("new_bubble_graph", $completionStore);
      svg.selectAll("*").remove();
      allNodes = [];
      allLinks = [];
      completionStore.set(false);
    }
  }
let prevNewNodes =''
  $: {
    // if (new_node_to_add) {
    if ($newNodeData) {
      // $nodeDataDblClicked will usually be blank
      // if(!$nodeDataDblClicked){
      console.log("new_node_to_add", $newNodeData);

      //   updateGraph("none", new_node_to_add);
      // }
if(prevNewNodes !== $newNodeData){
      updateGraph($nodeDataDblClicked, $newNodeData); // updateGraph($nodeDataDblClicked, new_node_to_add)
      prevNewNodes=$newNodeData
}
    }
  }

  $: {
    if ($isGraph) {
      svg.selectAll("*").remove();
      isGraph.set(false);
    }
  }

  $: {
    if ($isDeleteNode) {
      // console.log("isDeleteNode", $isDeleteNode, $nodeDataDblClicked)
      // deleteNodeAndUpdate($nodeDataDblClicked);
      find_nodes_to_delete($nodeDataDblClicked, []);
      isDeleteNode.set(false);
      nodeDataDblClicked.set("");
    }
  }
</script>

<svg bind:this={svg} use:svgReference width="1200" height="700">
  <!-- Your SVG elements would be rendered here -->
</svg>

<style>
  svg {
    display: block;
    margin: 0 auto;
  }

  svg {
    /* width: 100%;
    height: 100%; */
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
    /* fill: #000; */
    /* font: 10px sans-serif; */
    pointer-events: none;
    font-weight: bold;
  }
</style>
