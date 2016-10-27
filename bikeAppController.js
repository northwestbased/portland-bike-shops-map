var bikeApp = angular.module('bikeApp', []);
bikeApp.controller('BikeCtrl', ['$scope', '$http', function (scope, http){

  scope.yourLocation = undefined;
  scope.previous_icon = undefined;

  scope.sort = function() {
  var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" +
    $("input[type='text']").val() + " portland";
    $.get(url, function(data) {

      if (scope.yourLocation != undefined)
        scope.yourLocation.setMap(null);

      my_location = data.results[0].geometry.location;
      var marker = new google.maps.Marker({
        position: my_location,
        map: scope.map,
        icon: "purple_icon.png"
      });

      scope.yourLocation = marker;

      scope.map.panTo(my_location);
      var info_window = new google.maps.InfoWindow();
      info_window.setContent("Your Location");
      info_window.open(map, marker);
      bike_shops = scope.bikeshops;
      for (var i = 0; i < bike_shops.length; ++i) {
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
      scope.bikeshops = bike_shops;
      scope.$apply();
    });
  };


  http.get('bike.json').success(function(data) {
    scope.bikeshops = data["bike-shops"];

    (function wait(){
      if(typeof google == "undefined")
        return setTimeout(wait, 100);
      for (var i = 0; i < scope.bikeshops.length; ++i) {
        var data = scope.bikeshops[i];
        scope.bikeshops[i].marker = new google.maps.Marker({
          position: data["location"],
          map: scope.map,
          title: data["name"],
          icon: "green_icon.png"
        });
        (function(bikeshop) {
          google.maps.event.addListener(bikeshop.marker, 'click',
          function(event) {
            if(scope.previous_icon != undefined)
              scope.previous_icon.setIcon("green_icon.png");
            bikeshop.marker.setIcon("blue_icon.png");
            scope.previous_icon = bikeshop.marker;
          });
        })(scope.bikeshops[i]);
      }
    }())
  });

  scope.detail_it = function(bikeshop){
    if (scope.previous_icon != undefined)
      scope.previous_icon.setIcon("green_icon.png");
    bikeshop.marker.setIcon("blue_icon.png");
    scope.previous_icon = bikeshop.marker;
    scope.map.panTo(bikeshop.location)
  };
  
  var init = function(){
    (function wait(){
      if(typeof google == "undefined")
        return setTimeout(wait, 100);
      scope.map = new google.maps.Map(document.getElementById('map'), {
        center: {
          lat: 45.5212,
          lng: -122.6271
        },
        zoom: 13
      });
    }())
    }();
  
}]);
