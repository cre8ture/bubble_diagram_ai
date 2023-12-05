<!-- https://observablehq.com/@tom/force-directed-graph-experiment -->
<!-- https://observablehq.com/@tom/growing-a-tree -->
<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3'
    let links, nodes, svg;
    // import Layout from "./layout.svelte";

  
    onMount(() => {
      d3.dsv(",", "/board_games.csv", function(d) {
        return {
    source: d.source,
    target: d.target,
    value: +d.value
  }
}).then(function(data) {

  var links = data;

  var nodes = {};
 // compute the distinct nodes from the links.
links.forEach(function(link) {

    link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});

    link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
});

var nodeDegrees = {};

links.forEach(function(link) {
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

  var width = 1200,
      height = 700;

  var force = d3.forceSimulation()
.nodes(Object.values(nodes))

      .force("link", d3.forceLink(links).distance(100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force("charge", d3.forceManyBody().strength(-250))
      .alphaTarget(1)
      .on("tick", tick);

   svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

      // Add your GT username to the top right corner
svg.append("text")
    .attr("id", "credit")
    .attr("x", width - 10) // Align to the right edge
    .attr("y", 10) // Align to the top edge
    .attr("text-anchor", "end") // Set the text anchor to end (right-aligned)
    .text("kkleinbard3"); // Replace "kkleinbard3" with your GT username

//   // add the links
//   var path = svg.append("g")
//       .selectAll("path")
//     //   path.style("fill", "none")

//       .data(links)
//       .enter()
//       .append("path")
//       .attr("class", function(d) { return "link " + d.type; })
//       .style("stroke-width", function(d) {
//     // set the stroke width based on the "value" field
//     if (d.value === 0) {
//       return "4px"; // thick
//     } else {
//       return "2px"; // default width
//     }
//   })
//   .style("stroke", function(d) {
//     // set the stroke color based on the "value" field
//     if (d.value === 0) {
//       return "gray"; // gray similar edges
//     } else {
//       return "green"; //
//     }
//   })
//   .style("stroke-dasharray", function(d) {
//     // set the stroke dash array based on the "value" field
//     if (d.value === 0) {
//       return "none"; // solid line for similar edges
//     } else {
//       return "4 2"; // dashed line for different edges
//     }
//   });

// add the links
var path = svg.append("g")
    .selectAll("path")
    .data(links)
    .enter()
    .append("path")
    .attr("class", function(d) { return "link " + d.type; })
    .style("stroke-width", "2px")  // always thin
    .style("stroke", "lightblue")  // always light blue
    .style("stroke-dasharray", "4 2");  // if you always want dashed lines; remove this if not

 

  var colorScale = d3.scaleSequential() .interpolator(d3.interpolate("#fde0dd", "#c51b8a"));
  // define the nodes
  var node = svg.selectAll(".node")
      .data(force.nodes())
      .enter().append("g")
      .attr("class", "node")
      .call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended));

    
    node.on("dblclick", doubleClicked);



// KAI Define the scale function for node sizes
var nodeSizeScale = d3.scaleLinear()
  .domain([0, d3.max(Object.values(nodeDegrees))]) // Range of node degrees
  .range([10, 30]); // Range of node sizes

  // add the nodes
//   node.append("circle")
//       .attr("id", function(d){
//          return (d.name.replace(/\s+/g,'').toLowerCase());
//       })
//       .attr("r", 5)
//       .attr("r", function(d) {
//     return nodeSizeScale(nodeDegrees[d.name]);
//   }).style("fill", function(d) { return colorScale(nodeDegrees[d.name]); });

node.append("circle")
    .attr("id", function(d) {
        return (d.name.replace(/\s+/g,'').toLowerCase());
    })
    .attr("r", function(d) {
        return nodeSizeScale(nodeDegrees[d.name]);
    })
    .style("fill", function(d) {
        d.color = colorScale(nodeDegrees[d.name]); // Store the color in the 'color' property
        return d.color;
    });


    //  KAI add titles
node.append("text") // create a new <text> element
    .attr("class", "text") // set the class attribute to "text"
    .attr("x", 12) // set the x attribute to 12 (horizontal position relative to the node)
    .attr("y", -12) // set the y attribute to -12 (vertical position relative to the node, moving above the node)
    .attr("dy", "0.35em") // set the dy attribute to 0.35em (vertical offset for the text position)
    .text(function(d) { return d.name; }); // set the text content of the <text> element based on the "name" property of the data

  // add the curvy lines

  function tick() {
      path.attr("d", function(d) {

          var dx = d.target.x - d.source.x,
              dy = d.target.y - d.source.y,
              dr = Math.sqrt(dx * dx + dy * dy);
            //   if (dr < 30) {  // adjust this threshold as needed
    return "M" +
        d.source.x + "," +
        d.source.y + "L" +
        d.target.x + "," +
        d.target.y;
// } 
// else {
//     return "M" +
//         d.source.x + "," +
//         d.source.y + "A" +
//         dr + "," + dr + " 0 0,0 " +
//         d.target.x + "," +
//         d.target.y;
// }   

      });

      node.attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")"; 
      });
  };
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
    d3.select(this).select("circle").style("fill", null);
}


function doubleClicked(d) {
    // console.log("DOUBLE", d);
    if (d.fixed) {
      d.fx = null; // Release the fixed x-coordinate of  node
      d.fy = null; // Release the fixed y-coordinate of  node
      d.fixed = false; // Unpin the node
      d3.select(this).select("circle").style("fill", d.color); // Remove  color styling node
    } 
    // else {
    //   d.fx = d.x; // Set the fixed x-coordinate of the node to its current x-coordinate
    //   d.fy = d.y; // Set the fixed y-coordinate of the node to its current y-coordinate
    //   d.fixed = true; // Pin the node
    //   d3.select(this).select("circle").style("fill", "green"); // Apply a different color to the pinned node
    // }
  }

}).catch(function(error) {
  console.log(error);
})
    })
  
    //... All your other functions, e.g. tick, dragstarted, dragged, etc. ...
  </script>
  
  <style>
    path.link {
      fill: none;
      stroke: #666;
      stroke-width: 1.5px;
    }
  
    circle {
      fill: #ccc;
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
  <svg bind:this={svg} width="1200" height="700">
    <!-- Your SVG elements would be rendered here -->
  </svg>
  