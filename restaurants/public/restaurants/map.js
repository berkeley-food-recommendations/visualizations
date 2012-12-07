var RADIUS_DEFAULT = 7;
var view = "DEFAULT";
var rest_ids = {};
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
      .attr("class", function(d){return add_and_return_id(d);})
      .style("fill", function(d){return color(d);})
      .on("click", select_this_restaurant);

    feat.transition()
      .attr("r", RADIUS_DEFAULT)
      .duration(1000)
      .delay(300);
      
  }
  function add_and_return_id(rest) {
    var id = "rest_" + rest.properties.factual_id.split("-").join("");
    rest_ids[rest.properties.name] = id;
    return id;
  }

  function get_id_by_name(name) {
    return rest_ids[name];
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
  

  function select_this_restaurant() {
    select_restaurant(this);
  }

  function select_restaurant(rest) {
    var new_selected = d3.select(rest);
    if (view == "POPULARITY") {
      new_selected.transition().style("fill-opacity", .8);
      if (selected != null) {
        selected.transition().style("fill-opacity", .4)
        .each("end", function() {
          selected = new_selected;
        });
      } else {
        selected = new_selected;
      }
    } else { 
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
      pop.classed("selected", false);
      pop.classed("unselected", true);
      reset_radius();

    } else {
      var con = d3.select("#connections");
      pop.classed("selected", true);
      pop.classed("unselected", false);
      con.classed("selected", false);
      con.classed("unselected", true);
      view = "POPULARITY";
      popularity_sort();
    }
  }
  function popularity_sort() {
    var summary = "<p><h2>Welcome to Popularity!</h2><br />";
    summary += "A restaurant is popular if it has a lot of mentions. Check out"
    summary += " some of Berkeley's most popular restaurants here!";
    
    d3.select("#summary").html(summary);
    d3.select("#tweets").html("");
    

    $.ajax({
        url: "rest_counts",
        dataType: "json",
        success: function(data) {
            display_popularity(data);
        }
    });
    /*var all_restaurants = d3.selectAll("circle")[0];
    for (var i=0; i < all_restaurants.length; i++) {
      var restaurant = d3.select(all_restaurants[i]).data()[0].properties;
      var key = restaurant.name;
      var pop_index = RADIUS_DEFAULT;
      if (restaurant.pop_index != null) {
        pop_index = restaurant.pop_index;
        d3.select(all_restaurants[i])
        .transition().attr("r", pop_index).duration(2000);
      } else { 
        get_tweets(key, "COUNT", all_restaurants[i]);
      }
    }*/

  }

  var pop_index = d3.scale.linear().domain([0, 1, 2000]).range([0, 7, 75]);

  function display_popularity(counts) {


    for (var rest in counts) {
      var obj = d3.select("." + rest_ids[rest]);
      var popularity = counts[rest];
      // if (popularity == 0) { 
      //   pop_index = 0;
      // }

      obj.style("fill-opacity", .4)
      .transition().attr("r", pop_index(popularity)).duration(3000);
    }
  }

  /*function count_tweets(popularity, obj) { 
    obj = d3.select(obj);
    // if (popularity == 0) { 
    //   pop_index = 0;
    // }

    obj.style("fill-opacity", .4)
    .transition().attr("r", pop_index(popularity))
    .duration(2000);
  }*/

  function reset_radius() { 
    var all_restaurants = d3.selectAll("circle")[0];
    for (var i=0; i < all_restaurants.length; i++) {
      d3.select(all_restaurants[i]).transition().attr("r", RADIUS_DEFAULT).duration(2000);
    }
    view = "DEFAULT";
  }

  function display_connections(coordinates, data) {


    var arc = d3.geo.greatArc()
      .source(function(d) { return d.source; })
      .target(function(d) { return d.target; });

    var arcs = svg.append("g").attr("id", "arcs"); 
    //var path = d3.geo.path().projection(project); 

    var links = []; 

    for (var item in data) { 
      var id = get_id_by_name(item);
      if (id != null) {
        var rest = d3.select("." + id);
        rest.style("opacity", .4).transition().attr("r", data[item] * 10 + RADIUS_DEFAULT).duration(2000);
        links.push({ 
          source: coordinates, 
          target: rest.data()[0].geometry.coordinates
        }); 
      }
    }

    arcs.selectAll("path.arc") 
        .data(links) 
        .attr("class", "arc")
        .enter().append("svg:path") 
        .attr("d", function(d) { 
          return circle(arc(d)); }); 
          
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
  if (tweets != null) {
    var tweets_div = d3.select('#tweets');
    tweets_div.classed("hide", false);
    tweets_div.classed("show", true);
    tweets_div.html('');
    new_tweets = "";
    for (var i = 0; i < tweets.length; i++) {
        tweet = "<div class='tweet'>" + tweets[i].text + "</div>"
        new_tweets += tweet;
    }
    tweets_div.html(new_tweets);
  }
}

/*
 * Processes the instagram data fetched for a particular restaurant.
 */
function update_instas(data) {
  if (data != null) {
    var insta_div = d3.select('#instas');
    insta_div.classed("hide", false);
    insta_div.classed("show", true);
    insta_div.html('');
    instas = ""
    for (var i = 0; i < data.length; i++) {
      var caption = data[i].caption;
      if (caption == "None") {
        caption = "";
      }
      insta = "<div class='insta'><img src='" + data[i].url + "' /><br /><div class='caption'><p>"
      + caption + "<br /> - @" + data[i].username + "</p></div></div>";
      //also data[i].username is available
      instas += insta;
    }
    insta_div.html(instas);
  } else { 
    instas.classed("hide", true);
    instas.classed("show", false);
  }
}

function connections() {
  d3.selectAll("circle").on("click", find_connections);
  var insta_div = d3.select("#insta_div");
  insta_div.classed("hide", true);
  insta_div.classed("show", false);
  reset_radius();
  var summary = "<p><h2>Welcome to Connections!</h2><br />";
  summary += "A restaurant has a connection with another restaurant if at least one";
  summary += "person has tweeted/instagramed both. The bigger the node, the more mutual";
  summary += "mentions between the two restaurants! Click on a restaurant to start.";
  d3.select("#summary").html(summary);
  d3.select("#tweets").html("");
  var con = d3.select("#connections");
  var pop = d3.select("#popularity");
    if (view == "CONNECTIONS") {
      con.classed("selected", false);
      con.classed("unselected", true);
      reset_radius();
    } else {
      con.classed("selected", true);
      con.classed("unselected", false);
      pop.classed("selected", false);
      pop.classed("unselected", true);
      view == "CONNECTIONS";
    }

}

function find_connections() {
  var rest_data = d3.select(this).data()[0];
  select_restaurant(this);
    $.ajax( {
        url: "rests_in_common",
        data: {"rest_name": rest_data.properties.name},
        dataType: "json",
        success: function(data) {
          display_connections(rest_data.geometry.coordinates, data);
        }
    });
}

function search(name) {
  console.warn(name);
}

  // enable onclicks
  d3.select("#popularity").on("click", popularity);
  d3.select("#connections").on("click", connections);

});



