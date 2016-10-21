$("button").click(function() {
  var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" +
    $("input[type='text']").val() + " portland";

  $.get(url, function(data) {
    my_location = data.results[0].geometry.location;
    var marker = new google.maps.Marker({
      position: my_location,
      map: map,
      icon: "purple_icon.png"
    });
    map.panTo(my_location);

    var info_window = new google.maps.InfoWindow();
    info_window.setContent("Your Location");
    info_window.open(map, marker);

    for (var i = 1; i < bike_shops.length; ++i) {
      delta_lat = my_location.lat - bike_shops[i].location.lat
      delta_long = Math.abs(my_location.lng) - Math.abs(bike_shops[i].location.lng);
      distance = Math.sqrt(delta_lat * delta_lat + delta_long * delta_long)
      bike_shops[i].distance = distance;
    }
    bike_shops.sort(function(a, b) {
      var x = a.distance;
      var y = b.distance;
      if (x < y)
        return -1;
      return 1;
    });
    renderShopDetails(bike_shops.slice(0,5));
  });
});


function show_directions(start, end){
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setMap(map);
    directionsDisplay.setOptions({
      suppressMarkers: true
    });
    directionsService.route({
      origin: start,
      destination: end,
      travelMode: 'BICYCLING'
    }, function(response, status) {
      directionsDisplay.setDirections(response);
    });
}

$.getJSON("bike.json", function(json) {
  bike_shops = json["bike-shops"];
  initMap_wait();;
});

function initMap_wait() {
  if (typeof google == "undefined")
    setTimeout(initMap_wait, 500)
  else
    initMap();
}

var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 45.5212,
      lng: -122.6271
    },
    zoom: 13
  });
  initMarkers();
}

var previous_icon;

function initMarkers() {
  var markers = [];
  for (var i = 0; i < bike_shops.length; ++i) {
    var data = bike_shops[i];
    var marker = new google.maps.Marker({
      position: data["location"],
      map: map,
      title: data["name"],
      icon: "green_icon.png"
    });
    (function(marker, data) {
      google.maps.event.addListener(marker, 'click',
        function(event) {
          renderShopDetails(data);
          if (previous_icon != undefined)
            previous_icon.setIcon("green_icon.png");
          marker.setIcon("blue_icon.png");
          previous_icon = marker;
        });
    })(marker, data);
  }
}


function renderShopDetails(shops) {
  if (!Array.isArray(shops)) {
    shop = shops;
    shops = [];
    shops[0] = shop;
  }
  $("#shop_detail").html('');
  for (shop in shops) {
    shop = shops[shop];
    var html_content = 
      "<div class='title'>" + shop["name"] + "</div>"+
      "<a target=" +
      "'_blank' href='" + shop["website"] + "'>" +
      shop["website"] + "</a>" +
      "<div class='address'>" + shop["address"] +
      "</div><div class='number'>" + shop["number"] +
      "</div><div class='hr skinny'></div>";
    $("#shop_detail").append(html_content);
  }
}
