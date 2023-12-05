<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    onMount(() => {
        var graph = {
nodes:[
	{"id": "A", "group": 1},
	{"id": "B", "group": 2},
	{"id": "C", "group": 2},
	{"id": "D", "group": 2},
	{"id": "E", "group": 2},
	{"id": "F", "group": 3},
	{"id": "G", "group": 3},
	{"id": "H", "group": 3},
	{"id": "I", "group": 3}
],
links:[
{"source": "A", "target": "B", "value": 1},
{"source": "B", "target": "C", "value": 1},
{"source": "A", "target": "D", "value": 1},
{"source": "H", "target": "E", "value": 1},
{"source": "I", "target": "F", "value": 1},
{"source": "A", "target": "G", "value": 1},
{"source": "B", "target": "H", "value": 1},
{"source": "A", "target": "I", "value": 1},
]
};
  
      const svg = d3.select("#forceGraph"),
        width = +svg.attr("width"),
        height = +svg.attr("height");
      
      // ... [rest of your D3 code] ...
      
// var color = d3.scaleOrdinal(d3.schemeCategory20);
var colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',]  // Add as many colors as you need
var color = d3.scaleOrdinal(colors);


var simulation = d3.forceSimulation()
var simulation = d3.forceSimulation()
    .nodes(graph.nodes)
    .force("link", d3.forceLink(graph.links).id(function(d) { return d.id; }).distance(40))
//     ...

//  .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(40))
 .force("charge", d3.forceManyBody())
 .force("center", d3.forceCenter(width / 2, height / 2));

var link = svg.append("g")
  .attr("class", "links")
  .selectAll("line")
 .data(graph.links)
 .enter().append("line")
  .attr("stroke-width", function(d) { return Math.sqrt(d.value); });


// var node = svg.selectAll(".node")
//             .data(graph.nodes)
//             .enter().append("g")
// 						.attr("class", "node")
//              .call(d3.drag()
//       .on("start", dragstarted)
//       .on("drag", dragged)
//       .on("end", dragended));
						
// node.append("circle")
//   .attr("r", 5)
//   .attr("fill", function(d) { return color(d.group); });

//  node.append("text")
//  	.attr("dx", 6)
//     .text(function(d) { return d.id; });

//  simulation
//    .nodes(graph.nodes)
//    .on("tick", ticked);

//  simulation.force("link")
//    .links(graph.links);

//  function ticked() {
//    link
//     .attr("x1", function(d) { return d.source.x; })
//     .attr("y1", function(d) { return d.source.y; })
//     .attr("x2", function(d) { return d.target.x; })
//     .attr("y2", function(d) { return d.target.y; });

// node.attr("transform", function(d) {
//                 return "translate(" + d.x + "," + d.y + ")";
//             });
//    }

var node = svg.selectAll(".node")
  .data(graph.nodes)
  .enter().append("g")
  .attr("class", "node")
  .call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended));

node.append("circle")
  .attr("r", 5)
  .attr("fill", function(d) { return color(d.group); });

node.append("text")
  .attr("dx", 6)
  .text(function(d) { return d.id; });

var link = svg.append("g")
  .attr("class", "links")
  .selectAll("line")
  .data(graph.links)
  .enter().append("line")
  .attr("stroke-width", function(d) { return Math.sqrt(d.value); })
  .attr("x1", function(d) { return d.source.x; })
  .attr("y1", function(d) { return d.source.y; })
  .attr("x2", function(d) { return d.target.x; })
  .attr("y2", function(d) { return d.target.y; });

simulation
  .nodes(graph.nodes)
  .on("tick", ticked);

simulation.force("link")
  .links(graph.links);

function ticked() {
  link
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

  node.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });
}

// Rest of your code...

 function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
  }

 function dragged(d) {
   d.fx = d3.event.x;
   d.fy = d3.event.y;
 }

 function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
 }
    });
  </script>
  
  <style>
    .links line {
      stroke: #999;
      stroke-opacity: 0.6;
    }
  
    .node circle {
      stroke: #fff;
      stroke-width: 1.5px;
    }
  
    .node text {
      fill: #666;
      font-family: Helvetica;
    }
  </style>
  
  <svg id="forceGraph" width="400" height="300"></svg>
  