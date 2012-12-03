var map = new L.Map("map")
    .setView(new L.LatLng(37.8717, -122.263), 15)
    .addLayer(new L.TileLayer("http://{s}.tile.cloudmade.com/1e5009f264d34383a752988047047b2c/1714/256/{z}/{x}/{y}.png"));

var svg = d3.select(map.getPanes().markerPane).append("svg"),
    g = svg.append("g");

d3.json("restaurants-geojson.json", function(collection) {
  var selected = null;
  var bounds = d3.geo.bounds(collection),
      circle = d3.geo.path().projection(project);

  var feature = g.selectAll("circle")
      .data(collection.features)
    .enter().append("circle");

  map.on("viewreset", reset);
  reset();

  // Reposition the SVG to cover the features.
  function reset() {
    var bottomLeft = project(bounds[0]),
        topRight = project(bounds[1]);

    svg .attr("width", topRight[0] - bottomLeft[0])
        .attr("height", bottomLeft[1] - topRight[1])
        .style("margin-left", bottomLeft[0] + "px")
        .style("margin-top", topRight[1] + "px");

    g   .attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");

    var feat = feature.attr("r", 0)
      .attr("cx", function(d){return project(d.geometry.coordinates)[0];})
      .attr("cy", function(d){return project(d.geometry.coordinates)[1];})
      .style("fill", function(d){return color(d);})
      .on("click", select_restaurant);

    feat.transition()
      .attr("r", 7)
      .duration(1000)
      .delay(300);
      
  }


  // Use Leaflet to implement a D3 geographic projection.
  function project(x) {
    var point = map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
    return [point.x, point.y];
  }

  function color(d) {
    // for now just random colors
    var colors = ["#70dcff", "#f576a3", "#fff770"];
    return colors[Math.floor(Math.random() * (2 - 0 + 1)) + 0];
  }
  

  function select_restaurant() {
    var new_selected = d3.select(this);
    new_selected.transition()
    .attr("r", 15);

    if (selected != null) {
      selected.transition().attr("r", 7)
      .each("end", function() {
        selected = new_selected;
      });
    } else {
      selected = new_selected;
    }
    display_restaurant_summary(new_selected.data()[0].properties);
  }

  function display_restaurant_summary(p) {
    var summary = "";
    summary += "<p>";

    if (not_empty(p.website)) {
      summary += "<a target='_blank' href='" + p.website + "'>";
      summary += "<h2>" + p.name + "</h2></a><br />";
    } else {
      summary += "<h2>" + p.name + "</h2></a><br />";
    }

    if (not_empty(p.address)) {
      summary += p.address + "<br />";
    }

    if (not_empty(p.tel)) {
      summary += p.tel + "<br />";
    }
    summary += "</p>";

    d3.select("#summary").html(summary);
  }

  function not_empty(str) {
    if (str == null || str.empty) {
      return false;
    }
    return true;
  }

});


