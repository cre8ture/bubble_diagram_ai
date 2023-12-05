  //Variables to set up SVG container
  var width = 400,
  height = 350;

//We initialise the force layout object here
var force = d3.layout.force()
  .size([width, height])
  .charge(-400)
  .linkDistance(40)
  .on("tick", tick);

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);

//Create a "g" container element and create selections to reference throughout
var link = svg.append("g").selectAll(".link");
var node = svg.append("g").selectAll(".node");

var update = function(){

  //Create an UPDATE selection by joining data with "link" element selection
  link = link.data(graphData.links, function(d){ return d.id});

  //Access ENTER selection (hangs off UPDATE selection)
  //This represents newly added data that dont have DOM elements
  //so we create and add a "line" element for each of these data
  link
      .enter().append("line")
      .attr("class", "link");

  //Access EXIT selection (hangs off UPDATE selection)
  //This represents DOM elements for which there is now no corresponding data element
  //so we remove these from DOM
  link
      .exit().remove();

  //same update pattern for nodes
  node = node.data(graphData.nodes);

  node.
  enter().append("circle")
      .attr("class", "node")
      .attr("r", 12)
      .on("dblclick", dblclick)
      .call(drag);

  node.exit().remove();

  force
      .start();

};

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}

function dblclick(d) {
  d3.select(this).classed("fixed", d.fixed = false);
}

function dragstart(d) {
  d3.select(this).classed("fixed", d.fixed = true);
}

function init(){

  var data1 = {
      "nodes": [
          {
              "id":0,
              "name": 0,
              "group": 1,
              "size": 10
          },
          {
              "id":1,
              "name": 1,
              "group": 1,
              "size": 10
          },
          {
              "id":2,
              "name": 2,
              "group": 1,
              "size": 20
          },
          {
              "id":3,
              "name": 3,
              "group": 1,
              "size": 30
          }
      ],
      "links": [
          {
              "source": 0, "target": 1, "value":1, "id":0
          },
          {
              "source": 0, "target": 2, "value":1, "id":1
          },
          {
              "source": 0, "target": 3, "value":1, "id":2
          }
      ]

  };

  graphData = data1;
  drag = force.drag()
      .on("dragstart", dragstart);

  force.links(graphData.links);
  force.nodes(graphData.nodes);

  update()
}

init();

d3.select("#update1").on("click", function() {

  //randomly select a (currently existing) node that our new node will link to
  var sourceNodeId = Math.floor(Math.random() * (graphData.nodes.length-1));

  //if there are n nodes currently (before we add a new one, below) then
  //the new target node will be the (n+1)th node with an id of n (zero-indexing)
  var newNodeId = graphData.nodes.length;

  // if there are currently n links (before we add a new one, below) then
  // the new link will have an id of n (first link has an id of 0)
  var linkId = graphData.links.length;

  graphData.links.push({
      "source": sourceNodeId , "target": newNodeId, "value": 1, "id": linkId
  });

  graphData.nodes.push({
      "id": newNodeId,
      "name": newNodeId,
      "group": 1,
      "size": 30
  });

  update()

});
