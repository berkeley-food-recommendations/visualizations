var RADIUS_DEFAULT = 7;
var view = "DEFAULT";

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
      .attr("class", function(d){return d.properties.name;})
      .style("fill", function(d){return color(d);})
      .on("click", select_restaurant);

    feat.transition()
      .attr("r", RADIUS_DEFAULT)
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
    .attr("r", RADIUS_DEFAULT * 2);

    if (selected != null) {
      selected.transition().attr("r", RADIUS_DEFAULT)
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

    display_tweets_instas(p.name);
  }

  function not_empty(str) {
    if (str == null || str.empty) {
      return false;
    }
    return true;
  }

  function popularity() {
    var pop = d3.select("#popularity");
    if (view == "POPULARITY") {
      pop.classed("selected", false)
      pop.classed("unselected", true)
      reset_radius();

    } else {
      pop.classed("selected", true)
      pop.classed("unselected", false)
      popularity_sort();
    }
  }
  function popularity_sort() {
    var all_restaurants = d3.selectAll("circle")[0];
    for (var i=0; i < all_restaurants.length; i++) {
      var restaurant = d3.select(all_restaurants[i]).data()[0].properties;
      var key = restaurant.name;
      var pop_index = RADIUS_DEFAULT;
      if (restaurant.pop_index != null) {
        pop_index = restaurant.pop_index;
        d3.select(all_restaurants[i]).transition().attr("r", pop_index).duration(2000);
      } else { 
        get_tweets(key, "COUNT", all_restaurants[i]);
      }

      
      
    }
    view = "POPULARITY";
  }

  function count_tweets(popularity, obj) { 
    obj = d3.select(obj);
    var pop_index = RADIUS_DEFAULT + popularity;
    if (popularity > 5) {
      pop_index = 5 + RADIUS_DEFAULT;
    } else if (popularity == 0) { 
      pop_index = 0;
    }

    obj.data()[0].properties.pop_index = pop_index;
    obj.transition().attr("r", pop_index).duration(2000);
  }

  function reset_radius() { 
    var all_restaurants = d3.selectAll("circle")[0];
    for (var i=0; i < all_restaurants[0].length; i++) {
      all_restaurants[i].transition().attr("r", RADIUS_DEFAULT).duration(2000);
    }
    view = "DEFAULT";
  }

  function process_instagram_data(json_output) {

  }

  /*
 * Handles the AJAX request to retrieve a restaurant's most recent tweets and instagrams when a pin is selected.
 */
function display_tweets_instas(rest_id) {
    get_tweets(rest_id, "UPDATE");
    get_instas(rest_id, "UPDATE");
    
}

function get_tweets(rest_id, action, obj) {
  $.ajax({
        url: "get_tweets",
        data: {"rest_name": rest_id},
        dataType: "json",
        success: function(data) {
            handle_tweets(data, action, obj);
        }
    });
}

function get_instas(rest_id, action, obj) {
  $.ajax( {
        url: "get_instagrams",
        data: {"rest_name": rest_id},
        dataType: "json",
        success: function(data) {
            handle_instas(data, action, obj);
        }
    });
}

function handle_tweets(data, action, obj) {
  if (action == "UPDATE") {
    update_tweets(data);
  } else if (action == "COUNT") {
    count_tweets(data.length, obj);
  }
}

function handle_instas(data, action, obj) {
  if (action == "UPDATE") {
    update_instas(data);
  } else if (action == "COUNT", obj) {
    count_instas();
  }
}

/*
 * Processes the most recent tweets fetched for a particular restaurant.
 */
function update_tweets(tweets) {
    $('#tweets').html('');
    new_tweets = "";
    for (var i = 0; i < tweets.length; i++) {
        tweet = "<div class='tweet'>" + tweets[i].text + "</div>"
        new_tweets += tweet;
    }
    $('#tweets').html(new_tweets);
}

/*
 * Processes the instagram data fetched for a particular restaurant.
 */
function update_instas(data) {
    $('#instas').html('');
    instas = ""
    for (var i = 0; i < data.length; i++) {
        insta = "<div class='insta_caption'>" + data[i].caption + "<img src='" + data[i].url + "'></div>";
        //also data[i].username is available
        instas += insta;
    }
    $('#instas').html(instas);
}

function connections() {
  
}

  // enable onclicks
  d3.select("#popularity").on("click", popularity);
  d3.select("#connections").on("click", connections);

});



