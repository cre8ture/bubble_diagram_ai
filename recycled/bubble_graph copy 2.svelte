<!-- https://observablehq.com/@tom/force-directed-graph-experiment -->
<!-- https://observablehq.com/@tom/growing-a-tree -->
<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3'
    import { completionStore } from '../support/store'; // Modify the path as per your file structure

    let links, nodes, svg;
    // import Layout from "./layout.svelte";

   // To get the value from the store
   let new_bubble_graph;

    completionStore.subscribe(value => {
        new_bubble_graph = value;
    });


    onMount(() => {


    let jsonData = [
    {source: "Software Engineer", target: "Programming", value: 1},
    {source: "Software Engineer", target: "Debugging", value: 1},
    {source: "Software Engineer", target: "Software Design", value: 1},
    {source: "Software Engineer", target: "Version Control", value: 1},
    {source: "Software Engineer", target: "Continuous Integration", value: 1},
    {source: "Software Engineer", target: "Continuous Deployment", value: 1},
    {source: "Software Engineer", target: "Testing", value: 1},
    {source: "Software Engineer", target: "Problem Solving", value: 1},
    {source: "Software Engineer", target: "Collaboration", value: 1},
    {source: "Software Engineer", target: "Code Review", value: 1},
    {source: "Software Engineer", target: "Optimization", value: 1},
    {source: "Software Engineer", target: "Documentation", value: 1},
    {source: "Software Engineer", target: "Agile Methodologies", value: 1},
    {source: "Programming", target: "Languages", value: 0.8},
    {source: "Programming", target: "Frameworks", value: 0.7},
    {source: "Programming", target: "Data Structures", value: 0.8},
    {source: "Programming", target: "Algorithms", value: 0.8},
    {source: "Software Design", target: "UML", value: 0.6},
    {source: "Software Design", target: "Design Patterns", value: 0.7},
    {source: "Version Control", target: "Git", value: 0.9},
    {source: "Version Control", target: "Mercurial", value: 0.5},
    {source: "Version Control", target: "SVN", value: 0.5},
    {source: "Continuous Integration", target: "Jenkins", value: 0.7},
    {source: "Continuous Integration", target: "Travis CI", value: 0.6},
    {source: "Testing", target: "Unit Testing", value: 0.8},
    {source: "Testing", target: "Integration Testing", value: 0.7},
    {source: "Testing", target: "Functional Testing", value: 0.6},
    {source: "Testing", target: "Test Driven Development", value: 0.7},
    {source: "Optimization", target: "Performance", value: 0.7},
    {source: "Optimization", target: "Refactoring", value: 0.6},
    {source: "Documentation", target: "Comments", value: 0.6},
    {source: "Documentation", target: "API Documentation", value: 0.7},
    {source: "Agile Methodologies", target: "Scrum", value: 0.8},
    {source: "Agile Methodologies", target: "Kanban", value: 0.7}
    // ... potentially more relationships
]


  // The rest of the code remains largely unchanged. You can use jsonData directly instead of the data variable.
  
  var links = jsonData;

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

      .force("link", d3.forceLink(links).distance(200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force("charge", d3.forceManyBody().strength(-250))
      .alphaTarget(1)
      .on("tick", tick);

//    svg = d3.select("body").append("svg")
//       .attr("width", width)
//       .attr("height", height);

svg = d3.select(svg).attr("width", width).attr("height", height);


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

 

// var colorScale = d3.scaleSequential()
//   .interpolator(d3.interpolate("#fde0dd", "#ea9ab2"));

var maxDegree = d3.max(Object.values(nodeDegrees));
var capDegree = maxDegree * 0.8; // adjust this value based on your needs

var colorScale = d3.scaleSequential()
    .domain([0, capDegree])
    .interpolator(d3.interpolate("#fde0dd", "#ea9ab2"));


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

})
  
    //... All your other functions, e.g. tick, dragstarted, dragged, etc. ...
  </script>
  
  <style>

svg {
    display: block;
    margin: 0 auto;
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
  <svg bind:this={svg} width="1200" height="700">
    <!-- Your SVG elements would be rendered here -->
  </svg>
  