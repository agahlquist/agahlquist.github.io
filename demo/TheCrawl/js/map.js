"use strict";

//IIFE containing map functionality
(function() {
    //Closure variables
    var map;
    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();
    var placesService;
    var infowindow;
    var markers = [];
    var crawlRoute = [];
    var searchRadius = 1000;
    
    //Intialize the map
    function initialize() {
        //Map options
        var mapOptions = {
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        
        //Initialize the map
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        
        //Initialize directions display
        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById('directions'));
        
        //Initialize places service
        placesService = new google.maps.places.PlacesService(map);
        
        //Starting location for map
        if(navigator.geolocation) {
            //Geolocated start
            navigator.geolocation.getCurrentPosition(function(position) {
                var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                map.setCenter(latLng);
            });
        } else {
            //Default start
            var defaultBounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(43.0900, -77.7000),
                new google.maps.LatLng(43.0800, -77.6000));
            map.fitBounds(defaultBounds);
            
            displayErrors("Geolocation is not enabled on this browser so RIT is your default location. Either enable geolocation or use a different browser to have your default location be where you currently are");
        }
        
        //Add input controls to map
        var input = (document.getElementById('pac-input'));
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        
        //Add search box to map
        var searchBox = new google.maps.places.SearchBox((input));
        
        //Event listener for input changing in search box
        google.maps.event.addListener(searchBox, 'places_changed', function() {
            //Clear markers and error messages
            clear(false);
            
            //Create a variable for place searched
            var places = searchBox.getPlaces();
            
            //If no places are found alert the user
            if(places.length == 0) displayErrors("No place by that name found. Check your spelling and try again!");
            
            //Change map location to search query
            var bounds = new google.maps.LatLngBounds();
            for(var i = 0, place; place = places[i]; i++) {
                var request = {
                    location: place.geometry.location,
                    radius: searchRadius,
                    types: ['bar']
                };
                
                infowindow = new google.maps.InfoWindow();
                placesService.nearbySearch(request, searchboxCallback);
                
                bounds.extend(place.geometry.location);
            }
            
            //Fit map within new bounds and set the zoom
            map.fitBounds(bounds);
            map.setZoom(15);
            
        });
        
        //Reset bounds after bounds change
        google.maps.event.addListener(map, 'bounds_changed', function() {
            var bounds = map.getBounds();
            searchBox.setBounds(bounds);
        });
        
        //Add event listeners for controls
        document.getElementById('clearButton').onclick = clear;
        document.getElementById('opitmizeButton').onclick = optimizeRoute;
        document.getElementById('radiusSlider').onchange = function(e) {
            document.getElementById('sliderResult').innerHTML = e.target.value/1000 + " km";
            searchRadius = e.target.value;
        };
    }
    
    //Callback function for search requests
    function searchboxCallback(results, status) {
        if(status == google.maps.places.PlacesServiceStatus.OK) {
            for(var i = 0; i < results.length; i++) addMarker(results[i]);
        } else if(status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            displayErrors("No bars were found near this location. Try increasing the search radius or choosing a different location.");
        }
    }
    
    //Add a marker on the map
    function addMarker(place) {
        //Beautiful custom icon
        var icon = {
            url: "images/icon.ico",
            scaledSize: new google.maps.Size(40, 40)
        }
        
        //Marker
        var marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            icon: icon
        });
        
        //Event listener for clicking on marker
        google.maps.event.addListener(marker, 'click', function() {
            makeInfoWindow(place);
        });
        
        //Add marker to marker array
        markers.push(marker);
    }
    
    //Make an infowindow for a marker
    function makeInfoWindow(place) {
        //Close one if it is open
        if(infowindow) infowindow.close();
        
        //Info for place details
        var detailsRequest = {
            placeId: place.place_id
        };
        
        //Do a details request
        placesService.getDetails(detailsRequest, detailsCallback);
    }
    
    //Callback function for details request
    function detailsCallback(place, status) {
        if(status == google.maps.places.PlacesServiceStatus.OK) {
            //Create the infowindow
            infowindow = new google.maps.InfoWindow({
                map: map,
                position: place.geometry.location,
                content: fillContent(place)
            });
            
            //Add an event listener for the 'Add to Route' button
            document.getElementById('markerAddButton').onclick = function() {
                //Add to the crawl route
                addToCrawl(place);
                
                //Add to start/end selectors
                if(crawlRoute > 1) {
                    for(var i = 0; i < crawlRoute.length; i++) {
                        if(place.place_id != crawlRoute[i].place_id) addOptions(place);
                    }
                } else {
                    if(document.getElementById('markerAddButton').innerHTML != "Already Added!") addOptions(place);
                }
                
                //Change button text
                document.getElementById('markerAddButton').innerHTML = "Added!";
                
                //Fade in relevant divs
                $("#directions").fadeIn(500);
                $("#routeList").fadeIn(500);
            };
            
            //Add an event listener for the 'Remove from Route' button
            document.getElementById('markerRemoveButton').onclick = function() {
                if(crawlRoute.length > 1) {
                    for(var i = 0; i < crawlRoute.length; i++) {
                        if(place.name == crawlRoute[i].name) {
                            //Remove option from start/end selector
                            removeOptions(crawlRoute[i]);
                            
                            //Get index of bar to be removed
                            var index = crawlRoute.indexOf(crawlRoute[i]);
                            if(index > -1) crawlRoute.splice(index, 1);
                            
                            
                            //Calculate the new route
                            calculateRoute(crawlRoute, false);
                        }
                    }
                    
                    document.getElementById('markerRemoveButton').innerHTML = "Removed!";
                }
            };
        }
    }
    
    //Fill in info for bar
    function fillContent(place) {
        var innerHTML = "";
        
        //Name
        innerHTML += "<h1>" + place.name + "</h1>";
        innerHTML += "<br>";
        
        //Rating
        if(place.rating != undefined) {
            innerHTML += "Rating: " + place.rating + "/5";
            innerHTML += "<br>";
        }
        
        //Address
        innerHTML += place.formatted_address;
        innerHTML += "<br>";
        
        //Phone number
        innerHTML += place.formatted_phone_number;
        innerHTML += "<br>";
        
        //Website
        if(place.website != undefined) {
            innerHTML += "<a href='" + place.website + "' target='_blank'>" + place.website + "</a>";
            innerHTML += "<br>";
        }
        
        //Buttons
        innerHTML += "<button type='button' id='markerAddButton'>Add to Route</button>";
        innerHTML += "<button type='button' id='markerRemoveButton'>Remove from Route</button>";
        
        return innerHTML;
    }
    
    //Add a bar to the route
    function addToCrawl(place) {
        //Check to see if it is already on the route
        for(var i = 0; i < crawlRoute.length; i++) {
            if(place.place_id == crawlRoute[i].place_id) {
                document.getElementById('markerAddButton').innerHTML = "Already Added!";
                return;
            }
        }
        
        //Add to the route variable
        crawlRoute.push(place);
        
        //Calculate the route
        calculateRoute(crawlRoute, false);
    }
    
    //Add bar name to start/end selectors
    function addOptions(place) {
        var startOption = document.createElement('option');
        var endOption = document.createElement('option');
        
        startOption.text = place.name;
        endOption.text = place.name;
        
        startOption.id = "'" + place.id + "'";
        endOption.id = "'" + place.id + "'";
        
        document.getElementById('startChooser').add(startOption);
        document.getElementById('endChooser').add(endOption);
    }
    
    //Remove bar name to start/end selectors
    function removeOptions(place) {
        var startOption = document.getElementById("'" + place.id + "'");
        startOption.parentNode.removeChild(startOption);
        
        var endOption = document.getElementById("'" + place.id + "'");
        endOption.parentNode.removeChild(endOption);
    }
    
    //Calculate the crawl route
    function calculateRoute(crawlRoute, optimized) {
        //Start, end, waypoints, and waypoint names variables of the route
        var start;
        var end;
        var waypoints = [];
        var waypointNames = [];
        
        //Checks if optimized or not
        if(optimized) {
            //Start variable is what is in the Starting Bar selector
            var startName = document.getElementById('startChooser').value;
            for(var i = 0; i < crawlRoute.length; i++) {
                if(crawlRoute[i].name == startName) {
                    start = crawlRoute[i];
                }
            }
            
            //End variable is what is in the Ending Bar selector
            var endName = document.getElementById('endChooser').value;
            for(var i = 0; i < crawlRoute.length; i++) {
                if(crawlRoute[i].name == endName) {
                    end = crawlRoute[i];
                }
            }
            
            //All other bars are added to the route's waypoints
            for(var i = 0; i < crawlRoute.length; i++) {
                if(crawlRoute[i].name != startName && crawlRoute[i].name != endName) {
                    waypoints.push({
                        location: crawlRoute[i].geometry.location,
                        stopover: true
                    });
                    
                    waypointNames.push(crawlRoute[i]);
                }
            }
        } else {
            //Start variable is the first bar in the route
            start = crawlRoute[0];
            
            //End variable is the last bar in the route
            end = crawlRoute[crawlRoute.length-1];
            
            //All other bars are the waypoints
            for(var i = 1; i < crawlRoute.length-1; i++) {
                waypoints.push({
                    location: crawlRoute[i].geometry.location,
                    stopover: true
                });
                
                waypointNames.push(crawlRoute[i]);
            }
        }
        
        //Directions request options
        var request = {
            origin: start.geometry.location,
            destination: end.geometry.location,
            waypoints: waypoints,
            optimizeWaypoints: optimized,
            travelMode: google.maps.TravelMode.WALKING
        };
        
        //Directions request
        directionsService.route(request, function(result, status) {
            if(status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setMap(map);
                directionsDisplay.setDirections(result);
                updateRouteList(result, start, end, waypointNames);
            }
        });
    }
    
    //Calculate route again when optimized
    function optimizeRoute() {
        calculateRoute(crawlRoute, true);
    }
    
    //Updates the route list displayed on the right
    function updateRouteList(result, start, end, waypoints) {
        var waypointOrder = result.routes[0].waypoint_order;
        var routeListHTML = "";
        
        //Start
        routeListHTML += "<div style='padding-bottom: 5px; padding-top: 5px; border-bottom: 1px solid black; border-top: 1px solid black;'>";
        routeListHTML += "<p>Start: " + start.name + "</p>";
        routeListHTML += "</div>";
        
        //Waypoints
        if(waypoints) {
            for(var i = 0; i < waypointOrder.length; i++) {
                routeListHTML += "<div style='padding-bottom: 5px; padding-top: 5px; border-bottom: 1px solid black;'>";
                routeListHTML += waypoints[waypointOrder[i]].name;
                routeListHTML += "</div>";
            }
        }
        
        //End
        routeListHTML += "<div style='padding-bottom: 5px; padding-top: 5px;'>";
        routeListHTML += "<p>End: " + end.name + "</p>";
        routeListHTML += "</div>";
        
        document.getElementById('routeList').innerHTML = routeListHTML;
    }
    
    //Display custom error messages
    function displayErrors(message) {
        document.getElementById('errors').innerHTML = "<p>" + message + "</p>";
        $("#errors").fadeIn(250);
    }
    
    //Clear the map and all other things surrounding it
    function clear(buttonClear) {
        //Close the infowindow
        if(infowindow) infowindow.close();
        
        //Clear the crawl route
        crawlRoute = [];
        
        //Clear the start/end slectors
        var startSelect = document.getElementById('startChooser');
        for(var i = startSelect.length; i >= 0; i--) startSelect.remove(i);
        var endSelect = document.getElementById('endChooser');
        for(var i = endSelect.length; i >= 0; i--) endSelect.remove(i);
        
        //If the button was not used to clear, clear the markers on the map
        if(!buttonClear) {
            for(var i = 0; i < markers.length; i++) markers[i].setMap(null);
            markers = [];
        }
        
        //Remove the directions display
        directionsDisplay.setMap(null);
        
        //Reset map zoom
        map.setZoom(15);
        
        //Fade out divs
        $("#directions").fadeOut(500);
        $("#routeList").fadeOut(500);
        $("#errors").fadeOut(50);
    }
    
    google.maps.event.addDomListener(window, 'load', initialize);
}())