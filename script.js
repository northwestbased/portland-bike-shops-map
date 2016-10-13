$("input[type='submit']").click(function() {
    var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + $("input[type='text']").val() + " portland";
    $.get(url, function(data) {
        my_location = data.results[0].geometry.location;
        var marker = new google.maps.Marker({
            position: my_location,
            map: map,
            title: "Your Location",
            icon: "blue_icon.png"
        });
        map.panTo(my_location);
        closest_bike_shop = bike_shops[0];
        closest_distance = undefined;

        for (var i = 1; i < bike_shops.length; ++i) {
            var bike_shop = bike_shops[i];
            delta_lat = my_location.lat - bike_shop.location.lat
            delta_long = Math.abs(my_location.lng) - Math.abs(bike_shop.location.lng);
            distance = Math.sqrt(delta_lat * delta_lat + delta_long * delta_long)
            if (closest_distance == undefined || distance < closest_distance) {
                closest_distance = distance;
                closest_bike_shop = bike_shop;
            }
        }
        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay = new google.maps.DirectionsRenderer;
        directionsDisplay.setMap(map);
        directionsDisplay.setOptions({
            suppressMarkers: true
        });
        directionsService.route({
            origin: my_location,
            destination: closest_bike_shop.location,
            travelMode: 'BICYCLING'
        }, function(response, status) {
            directionsDisplay.setDirections(response);
        });
    });

    $("#map").animate({
        opacity: 1
    }, 1000);
    $("#map").css("pointer-events", "all");
    $("#start").fadeOut(800);
});

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
    var info_window = new google.maps.InfoWindow();

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 45.52,
            lng: -122.681944
        },
        zoom: 15
    });

    var markers = [];
    for (var i = 0; i < bike_shops.length; ++i) {
        var data = bike_shops[i];
        var marker = new google.maps.Marker({
            position: data["location"],
            map: map,
            title: data["name"]
        });
        (function(marker, data) {
            google.maps.event.addListener(marker, 'click', function(event) {
                var html_content = "<div class='title'><a target='_blank' href='" + data["website"] + "'>" + data["name"] + "</a></div>" +
                    "<div class='address'>" + data["address"] + "</div><div class='number'>" + data["number"] + "</div>";
                info_window.setContent(html_content);
                info_window.open(map, marker);
            });
        })(marker, data);
    }
}