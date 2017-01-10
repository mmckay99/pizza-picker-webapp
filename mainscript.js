//sets up charts to be responsive
Chart.defaults.global.responsive = true;

// Note: try and use the same keywords for multiple restaurants!
var globalRestaurantData = [];

// Global variable defenitions
var imagesStillToLoad = 0;

var numberOfRestaurantsToFinishPieChoices = 5;

var pizzaChartContext;
var thePieChart;
var filterDistance = 0;
var tableOfKeywords = {};
var keywordsChosenSoFar = [];

// This is set to include all restaurants initially. It is
// a list of indices to elements in "globalRestaurantData".
var currentOptions = [];

var pizzaPieChartOptions = {
  animationSteps: 25,
  animationEasing: "easeInOutCubic",

  //this causes the tooltip to be shown permanently which is what we want.
  onAnimationComplete: function () {
    this.showTooltip(this.segments, true);
  },

  tooltipEvents: [],
  showTooltips: true,

  labelColor: 'white',
  labelFontSize: '16',
};

// This function should reset the entire page.
function resetChoicesAndPizzaPicker() {
  imagesStillToLoad = 0;
  keywordsChosenSoFar = [];

  $("#pizza-chart").show();
  $("#pizza-chart-container").show();

  // Now set up currentOptions to include all restaurants.
  currentOptions = [];
  var numberOfRestaurants = globalRestaurantData.length;
  for (var restaurantIndex = 0; restaurantIndex < numberOfRestaurants; ++restaurantIndex) {
    currentOptions.push(restaurantIndex);
  }

  update();
}

// This function updates the results list.
function updateResultsList() {
  $("#results-area-title").html("<span class=\"badge\">" + currentOptions.length + "</span> restaurants/takeaways match your search");

  //emptying the body of the table
  $("#results-table-body").html("");

  // Iterate over the current options that have been chosen and append them
  // to the table.
  var numberOfCurrentOptions = currentOptions.length;
  for (var currentOptionIndex = 0; currentOptionIndex < numberOfCurrentOptions;
    ++currentOptionIndex) {
    var restaurantIndex = currentOptions[currentOptionIndex];
    var currentRestaurantName = globalRestaurantData[restaurantIndex].name;
    var restaurantData = globalRestaurantData[restaurantIndex];

    var distanceString = (restaurantData.hasOwnProperty("distance") ? restaurantData.distance : "-");
    var priceString = "";//Array(restaurantData.price).join("\u2605"); /* \u2605 */
    var starsString = ""; //Array(restaurantData.stars).join("\u00A3"); /* \u00A3 */
    var typeString = "";

    if (distanceString != "-") {
      distanceString = Math.round(distanceString * 100) / 100;
    }
    for (var i = 0; i < restaurantData.rating ; i++) {
      priceString = priceString.concat("\u2605"); //Array(restaurantData.price).join("\u2605"); /* \u2605 */
    }
    for (var i = 0; i < restaurantData.price; i++) {
      starsString = starsString.concat("\u00A3");
    }
    if (restaurantData.Takeaway == "T") typeString = "Takeaway";
    if (restaurantData.Takeaway == "R") typeString = "Restaurant";
    if (restaurantData.Takeaway == "RT") typeString = "Restaurant/Takeaway ";
    var imageName = "family.jpg";
    if (keywordsChosenSoFar.length > 0) imageName = keywordsChosenSoFar[keywordsChosenSoFar.length - 1].concat(".jpg");
    if (distanceString==="-"){
    $("#results-table-body").append("<tr><td>"
      + typeString + "</td><td>"
      + priceString
      + "</td><td>"
      + starsString
      + "</td><td>"
      + "<a target=\"_blank\" href=" + "./restaurant_page.html?restaurant_name="
      + currentRestaurantName.replace(/\s/g, "+") + "&image_name=" + imageName + ">" + currentRestaurantName
      + "</td><td>" + distanceString + "</td>"
      + "</tr>");
    }
    if (distanceString!="-"){
    $("#results-table-body").append("<tr><td>"
      + typeString + "</td><td>"
      + priceString
      + "</td><td>"
      + starsString
      + "</td><td>"
      + "<a href=" + "./restaurant_page.html?restaurant_name="
      + currentRestaurantName.replace(/\s/g, "+") + "&image_name=" + imageName + ">" + currentRestaurantName
      + "</td><td>" + distanceString + " miles </td>"
      + "</tr>");
    }
  }
}

function updateBreadcrumbs() {
  var breadcrumbList = [""].concat(keywordsChosenSoFar); //we put an empty string here because in the css we add a glyphicon
  $("#breadcrumbs-area").html(('<li><a  class="breadcrumbs-link" href="#">' + breadcrumbList.join('</a></li><li><a class="breadcrumbs-link" href="#pie-scroll-point">')) + '</a></li>');
}
// This function creates or updates the
// pie chart in the global variable "thePieChart"
// with data in pieData.
function updatePizzaChart(pieData) {
  // For each segment, try and load an image that will
  // match the label of that segment.
  var numberOfSegments = pieData.length;
  imagesStillToLoad = numberOfSegments;

  for (var segmentIndex = 0; segmentIndex < numberOfSegments; ++segmentIndex) {
    var segmentName = pieData[segmentIndex].label;

    // This creates a function which loads an image, then puts it
    // into the pie chart, then updates the pie chart if this is the last image
    // to be drawn (uses global variable imagesStillToLoad).
    makeImageLoaderFunction = function (imageObject, data, index) {
      return function () {
        --imagesStillToLoad;

        // Create a pattern with this image.
        var pattern = pizzaChartContext.createPattern(imageObject, "repeat");
        data[index].color = pattern;

        if (imagesStillToLoad < 1) {
          // This was the last image to load- now we can draw the chart!
          if (thePieChart !== undefined) {
            // We only destroy the chart when we can immediately
            // re-draw it, no point destroying it, waiting for all the images
            // to load (while the user stares at a blank canvas), then re-drawing.
            thePieChart.destroy();
          }

          thePieChart = new Chart(pizzaChartContext).Pie(data, pizzaPieChartOptions);
        }
      };
    };

    var imageObject = new Image();

    imageObject.onerror = function () {
      alert("Error: couldn't load image " + this.src + ".");
      return;
    };

    imageObject.onload = makeImageLoaderFunction(imageObject, pieData, segmentIndex);
    imageObject.src = "images/segments/" + segmentName + ".jpg";
  }
}

// This function takes in a list of restaurant names (optionsList),
// and uses globalRestaurantData to generate a table of occurrences
// of keywords for those restaurants. It won't include keywords in the table
// which are in "keywordsToExclude".
function getTableOfCommonKeywords(optionsList, keywordsToExclude) {
  var table = {};
  var optionsListLength = optionsList.length;

  for (var i = 0; i < optionsListLength; ++i) {

    // If there is restaurant data for this restaurant...
    var restaurantIndex = optionsList[i];
    if (restaurantIndex > globalRestaurantData.length || restaurantIndex < 0) {
      alert("currentOptions contains element " + restaurantIndex + " but that is not a valid index.");
    }

    if (restaurantIndex === undefined) {
      alert("Somehow restaurant index is undefined...");
      continue;
    }

    var restaurantName = globalRestaurantData[restaurantIndex].name;

    // Now loop through the keywords for this restaurant.
    var keywordsLength = globalRestaurantData[restaurantIndex].keywords.length;
    for (var j = 0; j < keywordsLength; ++j) {
      var keyword = globalRestaurantData[restaurantIndex].keywords[j];

      // Skip this keyword if it's one we should exclude.
      if (keywordsToExclude.indexOf(keyword) > -1) {
        continue;
      }

      // Count keyword.
      if (table.hasOwnProperty(keyword)) {
        table[keyword] = table[keyword] + 1;
      } else {
        table[keyword] = 1;
      }
    }
  }
  return table;
}

// This function looks at the list of restaurants in optionsList,
// and then removes any which *don't* contain a keyword "keyword".
function removeAllRestaurantsNotContainingKeyword(optionsList, keyword) {
  var optionsListLength = optionsList.length;

  // Loop goes backwards through list as we are deleting elements.
  for (var i = optionsListLength - 1; i >= 0; --i) {
    var restaurantIndex = optionsList[i];
    var thisRestaurantData = globalRestaurantData[restaurantIndex];
    var restaurantContainsKeyword = (thisRestaurantData.keywords.indexOf(keyword) > -1);

    if (!restaurantContainsKeyword) {
      optionsList.splice(i, 1);
    }
  }
}

// This function takes a keyword occurrences table and chooses
// the top few items, to then create some pie segments for,
// ready to be displayed in a pie chart.
function makePizzaPieChartData(keywordTable) {
  var pieData = [];

  // First, find out the top 3-5 keywords.
  // Or do we want just 8 segments of the pie?
  var maxPieSegments = 8;
  var minPieSegments = 2;
  var pieSegments = Math.floor(Math.random() * (maxPieSegments - minPieSegments) + minPieSegments);

  // Choose the top "pieSegments" keywords.
  // First, create a list from the keyword table.
  var sortableList = [];
  for (var keyword in keywordTable) {
    sortableList.push([keyword, keywordTable[keyword]]);
  }
  sortableList.sort(function (a, b) { return b[1] - a[1] });

  // Crop "pieSegments" if we only have, say, 3 keywords left, to 3.
  if (pieSegments > sortableList.length) {
    pieSegments = sortableList.length;
  }

  // Now we have a sorted list of keywords, choose the first "pieSegments".
  var topKeywords = sortableList.slice(0, pieSegments);

  for (var i = 0; i < pieSegments; ++i) {
    var newPieSegment = { "value": topKeywords[i][1], "label": topKeywords[i][0] };
    pieData.push(newPieSegment);
  }

  return pieData;
}

// General Idea for the algorithm
//
// Maintain a list of "current options", restaurants the user may want to go to. Initially all restaurants.
//
// 1. Make a giant table of keywords that contains all keywords from current options, with how many times they appear.
// 2. Every iteration, show the 3-5 most common keywords in the pizza chart.
// 3. If the user chooses a keyword, currentOptions = [option in currentOptions where keywords includes <chosen_keywords>].
// 4. Goto 1

function update() {
  tableOfKeywords = getTableOfCommonKeywords(currentOptions, keywordsChosenSoFar);

  updateResultsList();

  // If there are only less than a few remaining options, or no keywords, hide the pizza chart
  // and maximise the list of results.
  if (currentOptions.length < numberOfRestaurantsToFinishPieChoices || Object.keys(tableOfKeywords).length < 1) {
    // Use jQuery to fade out and slide the pizza picker section so it dissapears.

    $("#pizza-chart").fadeOut(400);
    $("#pizza-chart-container").slideUp("slow");

  } else {

    if (!($("pizza-chart").is(":visible"))) {
      // If the pizza chart isn't visible, show both the chart and container.
      $("#pizza-chart").show();
      $("#pizza-chart-container").show();
    }

    // There are enough restaurants in the current list of options
    // to allow the user to keep using the pizza pie to choose keywords.
    pieData = makePizzaPieChartData(tableOfKeywords);

    updateBreadcrumbs();
    updatePizzaChart(pieData);
  }
}

function distanceBetweenLatLongs(lat1, lon1, lat2, lon2) {
  var radlat1 = Math.PI * lat1 / 180;
  var radlat2 = Math.PI * lat2 / 180;
  var radlon1 = Math.PI * lon1 / 180;
  var radlon2 = Math.PI * lon2 / 180;
  var theta = lon1 - lon2;
  var radtheta = Math.PI * theta / 180;
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515;

  return dist;
}

// This function recalculates distance data in "restaurantData" for all restaurants
// in "forRestaurantsByIndex", based on "location".
function recalculateDistancesAndFilter(forRestaurantsByIndex, restaurantData, location) {
  var numberOfRestaurantsFor = forRestaurantsByIndex.length;

  // Iterate in reverse over "forRestaurantsByIndex" as we are deleting items from the list.
  for (var restaurantChoiceIndex = numberOfRestaurantsFor - 1;
    restaurantChoiceIndex >= 0 ; --restaurantChoiceIndex) {
    var restaurantIndex = forRestaurantsByIndex[restaurantChoiceIndex];
    var thisRestaurantData = restaurantData[restaurantIndex];

    // Just continue if this restaurant has no location data.
    if (!thisRestaurantData.hasOwnProperty("lat")) {
      continue;
    }

    console.log(location.lat + " <-> " + location.lon);

    // Calculate the distance between the given location and this place.
    var distance = distanceBetweenLatLongs(thisRestaurantData.lat, thisRestaurantData.lon,
      location.lat, location.lon);

    // Quick fix for if the distance comes out as NaN
    if (!isNaN(distance)) {
      // If the calculated distance is greater than the filter distance,
      // remove this restaurant from the "forRestaurantsByIndex" list.
      if (distance > filterDistance) {
        forRestaurantsByIndex.splice(restaurantChoiceIndex, 1);
        continue;
      }

      thisRestaurantData.distance = distance;
    }
  }
}

// Sets up "globalRestaurantData" by reading in restaurants.csv
function getGlobalRestaurantDataFromFileThenUpdate() {
    // Set globalRestaurantData to be the objects read in from the CSV file.

    globalRestaurantData = $.csv.toObjects(restaurantStringData);

    // Now go through each restaurant and split the keywords from a
    // string of words seperated by spaces into an array of word strings.
    var numberOfRestaurants = globalRestaurantData.length;
    for (var restaurantIndex = 0; restaurantIndex < numberOfRestaurants;
      ++restaurantIndex) {
      var thisRestaurantData = globalRestaurantData[restaurantIndex];

      // If there is no keyword data then there is nothing we can do.
      if (thisRestaurantData.keywordData !== undefined) {
        var keywordArray = thisRestaurantData.keywordData.split(" ");

        // Remove any empty keywords.
        var numberOfKeywords = keywordArray.length;
        for (var keywordIndex = 0; keywordIndex < numberOfKeywords; ++keywordIndex) {
          var keywordName = keywordArray[keywordIndex];
          if (keywordName == "") {
            keywordArray.splice(keywordIndex, 1);
          }
        }

        thisRestaurantData.keywords = keywordArray;
        delete thisRestaurantData.keywordData;
      }
    }

    // Now load the pizza picker.
    resetChoicesAndPizzaPicker();
}

$(function () {

  $('#logo-image').click(function () {
    location.reload();
  });

  //setting up the distance slider here.
  $('#distance').bootstrapSlider({
    formatter: function (value) {
      filterDistance = value;
      return value + " miles";
    }
  });

  //initialising the tooltip for the postcode
  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
  });

  // Setting up the pie now that it is considered "visible"
  pizzaChartContext = $("#pizza-chart")[0].getContext("2d");

  // Setting up the results table to be sortable via the stupid table library
  $("#results-table").stupidtable();

  getGlobalRestaurantDataFromFileThenUpdate();

  $("#logo-image-link").on("click", "a,img", function (e) {
    resetChoicesAndPizzaPicker();
  });

  $("#postcode-search").on("click", function (e) {
    console.log("postcode search clicked!");

    // What we want to do is filter out all of the restaurants if they are further away than distance.
    // Also, insert a new column into the table that's "distance from the user".

    // TODO: read the postcode from the input form.
    var postcode = $("#search").val();

    // Use Google maps to convert our postcode into a lat/lon.
    var googleMapsApiCallUrl = "http://maps.googleapis.com/maps/api/geocode/json?address=" + postcode + "&sensor=false";
    $.getJSON(googleMapsApiCallUrl, function (data) {
      if (data.status != "OK") {
        $('#alert').show();
        //alert("Invalid postcode. Please re-enter" + postcode);
        return;
      }
      else $('#alert').hide();

      var userLocation = { "lat": 0, "lon": 0 };

      userLocation.lat = data.results[0].geometry.location.lat;
      userLocation.lon = data.results[0].geometry.location.lng;

      recalculateDistancesAndFilter(currentOptions, globalRestaurantData, userLocation);

      update();
    });
  });

  // When the breadcrumb is clicked, we basically slice the keywordsChosenSoFarList,
  // reset currentOptions to include all restaurants, then quickly reprocess each keyword,
  // as if the user was clicking them one by one.
  $("#breadcrumbs-area").on("click", "a", function () {
    var gotoBreadcrumb = $(this).text();

    keywordsChosenSoFar = keywordsChosenSoFar.slice(0, keywordsChosenSoFar.indexOf(gotoBreadcrumb) + 1);

    // Make currentOptions include all restaurants...
    currentOptions = [];
    for (var key in globalRestaurantData) {
      if (globalRestaurantData.hasOwnProperty(key)) {
        currentOptions.push(key);
      }
    }

    // Now repeatedly remove all restaurants not containing the already
    // specified keywords.
    var numberOfBreadcrumbs = keywordsChosenSoFar.length;
    for (var breadcrumbIndex = 0; breadcrumbIndex < numberOfBreadcrumbs; ++breadcrumbIndex) {
      removeAllRestaurantsNotContainingKeyword(currentOptions, keywordsChosenSoFar[breadcrumbIndex]);
    }

    update();
  });

  $("#pizza-chart").click(function (e) {
    var activePoints = thePieChart.getSegmentsAtEvent(e);

    console.log(activePoints);

    // The user has clicked some pies. We are only really interested in
    // the first one they click. I'm not sure how they could click two
    // at once.
    pointClick = activePoints[0];

    var choiceKeyword = pointClick.label;
    keywordsChosenSoFar.push(choiceKeyword);

    // Per the algorithm, shrink currentOptions by removing all
    // restaurant names where those restaurants DO NOT contain the keyword we want.
    removeAllRestaurantsNotContainingKeyword(currentOptions, choiceKeyword);

    update();
  });
});
