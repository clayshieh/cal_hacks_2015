
$(document).ready(function(){
   $("#feedbackPanel").hide();
});

document.getElementById("searchButton").addEventListener("click", function(){
	console.log("searchButton");
	$("#searchButton").addClass("active");
	$("#feedbackButton").removeClass();
    $("#feedbackPanel").hide();
    $("#pathInput").show();
});

document.getElementById("feedbackButton").addEventListener("click", function(){
	console.log("feeedbackButton");
	$("#feedbackButton").addClass("active");
	$("#searchButton").removeClass();
    $("#feedbackPanel").show();
    $("#pathInput").hide();
});



				function setMapViewBounds(map){
				  var bbox = new H.geo.Rect(37.8750,-122.2600 ,37.8675, -122.2585);
				  map.setViewBounds(bbox);
				}


				function addMarkersToMap(map, lat, lng) {
				  var Marker = new H.map.Marker({lat:lat, lng:lng});
				  map.addObject(Marker);
				}


				function onResult(result) {
				  //TODO: Check if view is empty before accessing; display error message/empty return if empty
				  var locations = result.response.view[0].result;
				  addLocationsToMap(locations);
				}

				/*
				 * Boilerplate map initialization code starts below:*/
				 

				//Step 1: initialize communication with the platform
				var platform = new H.service.Platform({
				  app_id: 'JJi3EJfcCSqAXMniWrE7',
				    app_code: 'LWcyk9S8poGNtF1Kgrdh0g',
				    useCIT: true,
				    useHTTPS: true
				});
				var defaultLayers = platform.createDefaultLayers();

				//Step 2: initialize a map  - not specificing a location will give a whole world view.
				var map = new H.Map(document.getElementById('map'),
				  defaultLayers.normal.map);

				//Step 3: make the map interactive
				// MapEvents enables the event system
				// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
				var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
				var coords = [];
				var x;
				var y;
				var num_marker = 0;
				var route_counter = 0;
				var score;

				 $.ajaxSetup({async: false});
				  map.addEventListener('dbltap', function(evt) {
				      // Log 'tap' and 'mouse' events:
				      console.log(evt.type, evt.currentPointer);
				      x = evt.currentPointer.viewportX;
				      y = evt.currentPointer.viewportY;
				      var pt = map.screenToGeo(x, y);
				      console.log(pt);
				      coords.push(pt);
				      addMarkersToMap(map, pt.lat, pt.lng);
				      num_marker +=1;
				      if (num_marker ==2) {
				        calculateRouteFromAtoB(platform);
				        route_counter +=1;
				      }

				  });

				//Routing algorithm
				function calculateRouteFromAtoB (platform) {
				  var router = platform.getRoutingService(),
				    routeRequestParams = {
				      mode: 'shortest;pedestrian',
				      representation: 'display',
				      waypoint0: coords[2*route_counter].lat+","+coords[2*route_counter].lng, // St Paul's Cathedral
				      waypoint1: coords[2*route_counter+1].lat+","+coords[2*route_counter+1].lng,  // Tate Modern
				      routeattributes: 'waypoints,summary,shape,legs',
				      maneuverattributes: 'direction,action'
				    };


				  router.calculateRoute(
				    routeRequestParams,
				    onSuccess,
				    onError
				  );
				}

				function onSuccess(result) {
				  var route = result.response.route[0];
				  console.log(route);
				 /*
				  * The styling of the route response on the map is entirely under the developer's control.
				  * A representitive styling can be found the full JS + HTML code of this example
				  * in the functions below:
				  */
				  addRouteShapeToMap(route);
				  
				}

				function onError(error) {
				  alert('Ooops!');
				}

				function addRouteShapeToMap(route){
				  routeShape = route.shape;
				  var pointsArray = [];
				  routeShape.forEach(function(point) {
				    var parts = point.split(',');
				    pointsArray.push({"lat": parts[0], "lng": parts[1]});
				    });
				    createPolyline(pointsArray, 0);

				  // Add the polyline to the map
				  //map.addObject(polyline);
				  // And zoom to its bounding rectangle
				  //map.setViewBounds(polyline.getBounds(), true);
				}

				function createPolyline (pointsArray, i){
				   var strip = new H.geo.Strip();
				   var color;
				   if (i == pointsArray.length - 1) {
				   	return;
				   }
				   strip.pushLatLngAlt(pointsArray[i].lat, pointsArray[i].lng);
				   strip.pushLatLngAlt(pointsArray[i+1].lat, pointsArray[i+1].lng);
				 	console.log(strip);
				   $.post("/maps/get_slow/", {lat1:pointsArray[i].lat, lng1:pointsArray[i].lng, lat2:pointsArray[i+1].lat, lng2:pointsArray[i+1].lng})
				   .done (function (data) {
				   	console.log(data);
				   	if (data == -1) {
				   		color = "gray";
				   	} else if (data < 3) {
				   		color = "red";
				   	} else if (data <7) {
				   		color = "yellow";
				   	} else {
				   		color = "green";
				   	}
				   	drawLine(strip, color);
				   	createPolyline(pointsArray, i + 1);
				   	return;
				   });

				  
				}

				function drawLine(strip, color) {
				   var polyline = new H.map.Polyline(strip, {
				        style: {
				          lineWidth: 8,
				          strokeColor: color
				        }
				      });
				      console.log(polyline);
				      polyline.addEventListener('tap', function(evt){
				        console.log(evt.type, evt.currentPointer.type);
				        //Change color of polyline segment
				        strip = evt.target.getStrip();
				        console.log(strip);
				        var newPolyline = new H.map.Polyline(strip, {
				        style: {
				          lineWidth: 8,
				          strokeColor: 'rgba(128,0,255,0.7)'
				        }
				      });
				        var rating = prompt("How smooth is this road? Rate 1 - 10","");
				        var tempStrip = newPolyline.getStrip().Oa;
				        score = {a: [tempStrip[0], tempStrip[1]], b: [tempStrip[3], tempStrip[4]] , rating:rating};
				        map.addObject(newPolyline);
				        console.log(score);
				        map.removeObject(evt.target);
				        $.post("/maps/report/", score);
				    });
				      map.addObject(polyline);
				}

				// Create the default UI components
			


				// Now use the map as required...
				// geocode(platform);
					
//map part js code




document.getElementById('submit').addEventListener('click',function(){
	if(document.getElementById("start_add").value!="" && document.getElementById("end_add").value!=""){
		var start_add = document.getElementById("start_add").value;
		var end_add = document.getElementById("end_add").value;
		DrawMarkOnMap(start_add,platform);
		DrawMarkOnMap(end_add,platform);

	}else{
		alert("Please input valid information");
		$("#start_add").val(' ');
		$("#end_add").val(' ');
	}
});


function addLocationsToMap(locations){
  var group = new  H.map.Group(),
    position,
    i;

  // Add a marker for each location found
  for (i = 0;  i < locations.length; i += 1) {
    position = {
      lat: locations[i].location.displayPosition.latitude,
      lng: locations[i].location.displayPosition.longitude
    };

	coords.push(position);
	num_marker +=1;
    marker = new H.map.Marker(position);
    marker.label = locations[i].location.address.label;
    group.addObject(marker);
    if(num_marker==2){
    	 calculateRouteFromAtoB(platform);
		 route_counter +=1;
    }
  }

  group.addEventListener('tap', function (evt) {
    map.setCenter(evt.target.getPosition());
    openBubble(
       evt.target.getPosition(), evt.target.label);
  }, false);

  // Add the locations group to the map
  map.addObject(group);
  map.setCenter(group.getBounds().getCenter());
}

function DrawMarkOnMap(address,platform){
	var geocodingParameters = {
  	//Initialize with address from text field
	searchText:address,
 	jsonattributes : 1
	};
	geocode(platform,geocodingParameters);
}




function geocode(platform, geoparameter) {
  var geocoder = platform.getGeocodingService();
  geocoder.geocode(
    geoparameter,
    onAddressResult,
    onError
  );
}

function onAddressResult(result) {
  //TODO: Check if view is empty before accessing; display error message/empty return if empty
  if(result.response.view.length > 0){
    var locations = result.response.view[0].result;

    addLocationsToMap(locations);


  }
}
  

var ui = H.ui.UI.createDefault(map, defaultLayers);
setMapViewBounds(map);
