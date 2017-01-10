var getURLParameter = function getURLParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}
var globalRestaurantData;

function getGlobalRestaurantDataFromFileThenUpdate() {
    // Set globalRestaurantData to be the objects read in from the CSV file.
     globalRestaurantData = $.csv.toObjects(restaurantStringData);

		 var newRestaurantData = {};
		for (var i in globalRestaurantData) {
		 var restName = globalRestaurantData[i].name;
			newRestaurantData[restName] = globalRestaurantData[i];
		}
		
		globalRestaurantData = newRestaurantData;

		processGlobalData();
}

function initialize() {
	getGlobalRestaurantDataFromFileThenUpdate();
	
} 

function processGlobalData() {
	var thisRestaurantData = globalRestaurantData[getURLParameter('restaurant_name').replace(/\+/g, " ")];	
	var mapCanvas = document.getElementById('map');
 	var mapOptions = {
    center: new google.maps.LatLng(thisRestaurantData.lat,thisRestaurantData.lon),
    zoom: 17,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  
	var myLatLng = new google.maps.LatLng(thisRestaurantData.lat,thisRestaurantData.lon);//{lat: thisRestaurantData.lat,lon: thisRestaurantData.lon};

  var map = new google.maps.Map(mapCanvas, mapOptions);
  
  	
  var marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    title: thisRestaurantData.name
  });

	var imageName = getURLParameter('image_name');
	if (imageName === undefined) {
		imageName = "family.jpg";	
	}
	$('#image').css("background-image", "url('images/segments/" + imageName + "')"); 

	document.getElementById('restaurant-name').innerHTML = getURLParameter('restaurant_name').replace(/\+/g, " ");

	document.getElementById('description-box').innerHTML = "Type: " +	 thisRestaurantData.type;
	var priceString = "";
  for (var i = 0; i < thisRestaurantData.price; i++) {
 		priceString = priceString.concat("\u00A3");
 	}
	document.getElementById('price').innerHTML = "Price (of 3): " + priceString;

	var starString = "";
  for (var i = 0; i < thisRestaurantData.rating; i++) {
     starString = starString.concat("\u2605");
  }
	document.getElementById('stars').innerHTML = "Rating (of 5): " + starString;

	var tagsString = "tags: ".concat(thisRestaurantData.keywordData);
	document.getElementById('tags').innerHTML = tagsString;    
}


google.maps.event.addDomListener(window, 'load', initialize);


