/*
* Makes the initial call to load the restaurant data JSON when the page finishes loading.
*/

function loadScript() {
  $.ajax({
  url: 'rest_data',
  dataType: 'text',
  success: function(data) {
    var rests = JSON.parse(data);
    make_rests_map(rests);
  }
});

}

window.onload = loadScript;

/*
 * Initializes a Google map of the Berkeley area and takes a JSON of restaurant data as collected from Factual
 * and adds pins to the Berkeley map. Clicking a pin loads tweets about the specific restaurant into the sidebar.
 */

function make_rests_map(rests) {
    
  var mapOptions = {
    zoom: 13,
    center: new google.maps.LatLng(37.8717, -122.2728),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }

  var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);


  console.log("setting up markers");
  var markers = [];
  for (var i = 0; i < rests.length; i++) {
     rest = rests[i];
     var latlng = new google.maps.LatLng(rest.latitude, rest.longitude);
     var marker = new google.maps.Marker({
         position: latlng,
         title: rest.name,
         rest_id: rest.factual_id
         });
     markers.push(marker);
     marker.setMap(map);

     google.maps.event.addListener(marker, 'click', function() {
        click_pin(this.rest_id);
     });
  }
  console.log("finished markers");
  //var markerCluster = new MarkerClusterer(map, markers); 

}

/*
 * Handles the AJAX request to retrieve a restaurant's most recent tweets when a pin is selected.
 */
function click_pin(rest_id) {
    console.log("Id was " + rest_id);
    $.ajax({
        url: "get_tweets",
        data: {"rest_id": rest_id},
        dataType: "json",
        success: function(data) {
            update_tweets(data);
        }
    });
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




