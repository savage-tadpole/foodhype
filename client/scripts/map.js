//////////////////////////
/// Map Initialization ///
//////////////////////////

// Creates new map
var map;
allRestaurants = {};

// List of all markers
var markers = [];

// Sets starting point for rendering to San Francisco, CA
var myLatLng = new google.maps.LatLng(37.7749300, -122.4194200);

// Uses center for starting point and zoom when page loads
var mapOptions = {
 center: myLatLng,
 zoom: 14
};

// Renders new map
map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

//////////////////////////
///       Search       ///
//////////////////////////

var searchHandler = function() {
  var places = searchBox.getPlaces();

  if (places.length === 0) {
    return;
  }

  var bounds = new google.maps.LatLngBounds();

  //window.user.setPosition(places[0].geometry.location);
 
  searchMarker = new google.maps.Marker({
    map:map,
    draggable:true,
    animation: google.maps.Animation.DROP,
    position: places[0].geometry.location,
    icon: '../images/search_marker.png'
  });

  google.maps.event.addListener(searchMarker, 'dragend', userDragHandler);

  bounds.extend(places[0].geometry.location);

  map.fitBounds(bounds);

  getRestaurants(searchMarker.getPosition().lat().toString(), searchMarker.getPosition().lng().toString());
};

// Set the default bounds for the autocomplete search results
 // This will bias the search results to the entire globe using the coordinates listed below
var defaultBounds = new google.maps.LatLngBounds(
 new google.maps.LatLng(-90, -180),
 new google.maps.LatLng(90, 180));

var options = {
 bounds: defaultBounds
};

var input = document.getElementById('pac-input');

// Create the autocomplete object
var autocomplete = new google.maps.places.Autocomplete(input, options);
map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
var infowindow = new google.maps.InfoWindow();

var searchBox = new google.maps.places.SearchBox(input);

google.maps.event.addListener(searchBox, 'places_changed', searchHandler)

var boundsChangedHandler = function(e) {
  var bounds = map.getBounds();
  searchBox.setBounds(bounds);

  if (allRestaurants.data) {
    $(document).trigger('sendData', [allRestaurants.data]);
  }
};

google.maps.event.addListener(map, 'bounds_changed', boundsChangedHandler);


//////////////////////////
/// User Geolocation   ///
//////////////////////////

// Try HTML5 geolocation
if(navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(position) {
    var pos = new google.maps.LatLng(position.coords.latitude,
                                     position.coords.longitude);

    map.setCenter(pos);

    window.user = new google.maps.Marker({
      map:map,
      draggable:true,
      animation: google.maps.Animation.DROP,
      position: pos,
      icon: '../images/person-icon.png'
    });
    google.maps.event.addListener(user, 'click', userClickHandler);
    google.maps.event.addListener(user, 'dragend', userDragHandler);

    getRestaurants(window.user.getPosition().A.toString(), window.user.getPosition().F.toString());

  }, function() {
    handleNoGeolocation(true);
  });
} else {
  // Browser doesn't support Geolocation
  handleNoGeolocation(false);
}

function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(60, 105),
    content: content,
    icon: '../images/person-icon.png'
  };
}

var userClickHandler = function() {
  if (window.user.getAnimation() != null) {
    window.user.setAnimation(null);
  } else {
    window.user.setAnimation(google.maps.Animation.BOUNCE);
  }
}

var userDragHandler = function() {
  var lat = this.getPosition().lat().toString();
  var long = this.getPosition().lng().toString();
  getRestaurants(lat, long);
}

//////////////////////////////////////////
/// Restaurant marker initialization   ///
//////////////////////////////////////////

var getRestaurants = function(lat, long) {
  //Global variable for the array of restaurant markers
  for (var i = 0, marker; marker = markers[i]; i++) {
    marker.setMap(null);
  }

  window.markers = [];
  var bounds = new google.maps.LatLngBounds();
  var jsonData = {
    'userLat': lat,
    'userLong': long
  };

  $.ajax({
    type: "POST",
    url: '/yelpresults',
    dataType: "text",
    contentType: "application/json",
    data: JSON.stringify(jsonData)
  }).done(  function(restaurantData) {
    restaurantData = JSON.parse(restaurantData);
    allRestaurants.data = restaurantData;



    var makeMarker = function(index) {
      var restaurantPosition = new google.maps.LatLng(restaurantData[index].latitude, restaurantData[index].longitude);
      var marker = new google.maps.Marker({
        map:map,
        position:restaurantPosition,
        animation: google.maps.Animation.DROP,
        icon: '../images/ball-marker.png'
      });

      // Attach restaurant data to marker object
      marker.data = restaurantData[index];

      // Push to globally accessible markers array
      window.markers.push(marker);

      bounds.extend(restaurantPosition);

      // Add clickhandler
      google.maps.event.addListener(window.markers[index], 'click', markerClickHandler);    
    };

    // Add markers to the map and push to the array.
    for(var i = 0; i < restaurantData.length; i++) {
      makeMarker(i);
    }
    map.fitBounds(bounds);
  }.bind(this)); //not sure what the bind is for... -Nick
  
  var markerClickHandler = function(e) {
    console.log(window.markers);
    for(var i = 0; i < window.markers.length; i++) {
      if(e.latLng === window.markers[i].getPosition()) {
        $(document).trigger('markerClick', [window.markers[i].data]);
      }
    }
  };
}
