//The string that contains the event log
var eventLog = "";

//whether the experiment is currently running
var running = false;

//the time in milliseconds that the experiment started
var startTime = 0;

//when calculating relative things like the position of an element
//we need to do it relative to something. In this case it's just the body
//but for some reason later we may need to use something else
var mainElement = "body";


/* ---------------FUNCTIONS RELATED TO CONDUCTING THE EXPERIMENT---------------- */


//JUST A USEFUL HELPER FUNCTION
String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find, 'g'), replace);
};


//gets the number of milliseconds since the experiment was started
function getCurrentTime() {
  return (new Date()).getTime() - startTime;
}

//gets a string of the form "xcoord ycoord" which is the mouse click coordinate
//relative to the top left hand corner of some element. this is useful if we want to put
//the entire page inside some other element, however, right now it's just in body.
function getRelativeCoords(event) {
  var body = $(mainElement);
  var bodyX = body.offset().left;
  var bodyY = body.offset().top;

  return "" + String(Math.round(event.pageX-bodyX)) + " " + String(Math.round(event.pageY-bodyY));
}

//takes a string and adds a timestamp before printing it in the log.
function logEvent(eventString) {
  if(!running) { //only log the event if we're currently running the experiment.
    return;
  }

  eventString = getCurrentTime() + " " + eventString;
  eventLog = eventLog + eventString + "\n";

  $("#event-log").html(eventLog.replaceAll("\n", "<br>"));

  console.log(eventString);

}

//starts the experiment running.
function startExperiment(){
  //start the timer
  startTime = (new Date()).getTime();

  //clearing the eventlog before starting a new experiment
  eventlog = "";

  //change running to true
  running = true;

  //log an experiment started event.
  logEvent("exp_start");
}

//starts the experiment running.
function stopExperiment(){
  //log an experiment stopped event.
  logEvent("exp_stop");

  //stop the timer
  startTime = 0;

  //change running to false
  running = false;

  //re-showing the pizza picker
  $("#pizza-chart").show();
  $("#pizza-chart-container").show();

  //parse the data
  parseData();

}

//A LIST OF ALL OF THE TARGETS WHICH ARE ACCEPTABLE FOR THE USER TO HAVE CLICKED ON.
//NOTE THAT THESE IDENTIFIERS CAN'T HAVE SPACES IN THEM OTHERWISE THEY MESS UP PARSING THE EXPERIMENT OUTPUT.
var validTargets = ["#search",
                    "#postcode-search",
                    ".slider-handle",
                    ".breadcrumbs-link",
                    "ol>li:first-child>a:first-child:before",
                    "#results-table-header>th",
                    "#results-table-body>th>a",
                    "#pizza-chart",];

/*
//for some elements like nes inside canvases we need to
//give them custom sizes. for this we look them up in the custom
//areas dictionary before calculating manually.
var customAreas = {'pizza-chart': 40,};

function getArea(name) {
  //first we check if the element's id is present in custom area.
  if (name in customAreas) {
    return customAreas[name];
  }

  var elt = $('#'+name);
  var height = elt.height();
  var width = elt.width();

  return height * width;
}

//gets the mean width/height
function getMWidth(name) {
  //first we check if the element's id is present in custom area.
  if (name in customAreas) {
    return Math.sqrt(customAreas[name]);
  }

  var elt = $('#'+name);
  var height = elt.height();
  var width = elt.width();

  return (height + width)/2;
}

//get the position of the centre relative to the calculator container.
function getCentre(name) {
  var relativeY = $('#'+name).offset().top - $(mainElement).offset().top;
  var relativeX = $('#'+name).offset().left - $(mainElement).offset().left;

  return [relativeX, relativeY];
}

//gets the distance between a pair of points in the form [x, y]
function getDistanceyByPoints(p1, p2) {
  return Math.sqrt(Math.pow(p1[0]-p2[0], 2),Math.pow(p1[1]-p2[1], 2));
}

//does an approximation of fitts law.
function fitts(name1, name2) {
  if(validTargets.indexOf(name1) === -1 || validTargets.indexOf(name2) === -1) {
    return undefined;
  }
  var width2 = getMWidth(name2);

  var distance = getDistanceyByPoints(getCentre(name1), getCentre(name2));

  console.log(width2);
  console.log(distance);

  return Math.log2((distance/width2) + 1);
}

//the average fitts for the whole page
function averageFitts(targets) {
  targets = targets || validTargets;

  var fittsSum = 0.0;
  var count = 0;
  for(var i in targets) {
    for(var j in targets) {
      if(i!=j) {
        fittsSum += fitts(targets[i], targets[j]);
        count++;
      }
    }
  }

  var averageFittsValue = fittsSum/count;

  return averageFittsValue;

}
*/

/* ---------------FUNCTIONS RELATED TO PARSING THE DATA AND DISPLAYING IT IN D3---------------- */
function parseData(data){

  data = data || eventLog;

  //gets the data from the eventlog and parses it in to a list of lists.
  var dataLines = data.split("\n");
  console.log(dataLines);

  var dataLinesSplit = [];
  for(var i in dataLines) {
    dataLinesSplit.push(dataLines[i].split(" "));
  }

  /*

  //we do some general analytics on the data as a whole, such as average fitts law
  //difficulty between all of the buttons pressed.
  var fittsInput = [];
  var lastTime = 0;
  var lastTarget = "";
  for(var j in dataLinesSplit){
    console.log("j: " + j);
    //if it was a click event on a valid target.
    if(dataLinesSplit[j][1] === "click" && validTargets.indexOf(dataLinesSplit[j][4]) !== -1) {
      console.log("in here");
      var time = parseInt(dataLinesSplit[j][0]);
      var target = dataLinesSplit[j][4];

      //pushing a dict of the form {time: <timedelta>, start: <targetname>, end: <targetname>}
      fittsInput.push({"time": time-lastTime, "start": lastTarget, "end": target,});

      lastTime = time;
      lastTarget = target;
    }
  }

  console.log(fittsInput);

  //the final list of times vs fitts of the form {time: 123, fitts: difficulty rating}
  var fittsData = [];
  var allFitts = [];
  var averageFitts = 0; //might as well calculator the average fitts while iterating
  for (var k in fittsInput) {
    var input = fittsInput[k];
    var fittsResult = fitts(input.start, input.end);
    if(fittsResult === undefined) {
      continue;
    }

    fittsData.push({"time": input.time, "start": input.start, "end": input.end, "fitts": fittsResult,});
    allFitts.push(fittsResult);
  }

  //averageFitts = allFitts.reduce(function(previousValue, currentValue, index, array) {
  // return previousValue + currentValue;
  //})/allFitts.length;

  //FITTS DATA IS THE DATA WE WILL PLOT LATER
  console.log(fittsData);
  //console.log("AVERAGE FITTS: "+averageFitts);

  //drawing the fitts plot
  drawFittsScatter(fittsData);

  */


  //an array of dictionaries {x: 123, y:123, valid: true/false}
  var clickDots = [];
  for(var l in dataLinesSplit){
    //if it was a click event on a valid target.
    if(dataLinesSplit[l][1] === "click") {
      var x = parseInt(dataLinesSplit[l][2]);
      var y = parseInt(dataLinesSplit[l][3]);

      var valid = validTargets.indexOf(dataLinesSplit[l][4]) !== -1;

      clickDots.push({"x": x, "y": y, "valid": valid});
    }
  }

  //drawing the clicks on top of the calculator
  drawClickDots(clickDots);

  //we then break the list of lists in to individual tasks

  //calculating the total clicks and which of those clicks were errors
  var totalClicks = 0;
  var totalErrors = 0;
  for(var m in dataLinesSplit){
    //if it was a click event on a valid target.
    if(dataLinesSplit[m][1] === "click") {
      totalClicks+=1;
      if (validTargets.indexOf(dataLinesSplit[m][4]) == -1) {
        totalErrors+=1;
      }
    }
  }

  //calculating total time
  var startTime = 0;
  var stopTime = 0;
  for(var n in dataLinesSplit) {
    if (dataLinesSplit[n][1] === "exp_start") {
      startTime = parseInt(dataLinesSplit[n][0]);
    }
    else if (dataLinesSplit[n][1] === "exp_stop") {
      stopTime = parseInt(dataLinesSplit[n][0]);
    }
  }

  var totalTime = stopTime - startTime;


  //logging all of the information we have gathered to the display.
  $('body').append("<center><div id=\"results-log\"></div></center>");
  $("#results-log").append(eventLog.replaceAll("\n", "<br>"));
  $('#results-log').append( String("-----EXPERIMENT COMPLETE-----") + "<br>");
  $('#results-log').append("Total Time (ms): " + String(totalTime) + "<br>");
  $('#results-log').append("Total Clicks: " + String(totalClicks) + "<br>");
  $('#results-log').append("Clicks in Error: " + String(totalErrors) + "<br>");
  //$('#results-log').append("Average Fitts: " + String(averageFitts) + "<br>");


}



/* ---------------DEFINING EVENT LISTENERS IN JQUERY---------------- */
$(function(){

  //making an absolute positioned button appear in the DOM
  //we do this here so this piece of code is totally plug and play.
  $('body').append($('<span/>', {
        text: "▶", //set text 1 to 10
        id: 'play-button',
	style: "position: absolute; top: 5px; right: 10px; color: white;",
    }));

  //setting up the event listeners for capturing user input
  $(document).click(function (e){
    if(e.target.id === "play-button") {
      return;
    }

    var identifier = " ";
    var $target = $(e.target);
    console.log($target);
    for (var n in validTargets) {
      if ($target.is(validTargets[n])) {
        console.log("is " + validTargets[n]);
        identifier += validTargets[n];
        break;
      }
    }

    logEvent("click" + " " + getRelativeCoords(e) + identifier);
  });

  $(document).keydown(function (e){
    logEvent("key" + " " + e.keyCode + " " + e.target.id);
  });


  //the event listener for the start/stop button.
  $('#play-button').click(function(e) {
    console.log("play clicked");
    //change the content of the play button to a stop button.
    if(running) {
      stopExperiment();
      $('#play-button').html("▶");
    } else {
      startExperiment();
      $('#play-button').html("■");
    }
  });

  //the event listener for the parse button
  $('#parse-button').click(function(e) {
    parseData();
  });

});
