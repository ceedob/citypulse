var express = require('express');
var request = require('request');
var parseXML = require('xml2js').parseString;

var app = express();

app.get('/', function(req, res){
  res.sendFile("./index.html",  { root: __dirname });
});

app.get('/script.js', function(req, res){
  res.sendFile("./client.js",  { root: __dirname });
});

var ttcroutes = [5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 20, 21, 22, 23, 24,
                 25, 26, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
                 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
                 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74,
                 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90,
                 91, 92, 94, 95, 96, 97, 98, 99, 100, 101, 102, 104, 105, 106,
                 107, 108, 109, 110, 111, 112, 113, 115, 116, 117, 118, 119,
                 120, 121, 122, 123, 124, 125, 126, 127, 129, 130, 131, 132,
                 133, 134, 135, 141, 142, 143, 144, 145, 160, 161, 162, 165,
                 167, 168, 169, 171, 185, 186, 188, 190, 191, 192, 195, 196,
                 198, 199, 300, 301, 302, 304, 306, 307, 312, 315, 317, 320,
                 322, 324, 325, 329, 332, 334, 335, 336, 337, 339, 341, 343,
                 352, 353, 354, 363, 365, 384, 385, 395, 396, 501, 502, 503,
                 504, 505, 506, 509, 510, 511, 512, 514];

var routeResponses = {

}

var index = Math.floor(Math.random() * ttcroutes.length);

function updateRouteData(r){
  var t = (routeResponses[r] && routeResponses[r].t) ? routeResponses[r].t : 0;
  // console.log(Date.now(), t, Date.now() - t)
  if(Date.now() - t < 30000 || !r){
    return false;
  }
  console.log("http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=ttc&r=" + r + "&t=" + t);
  request("http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=ttc&r=" + r + "&t=" + t, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
      parseXML(body, function(err, result){
        var data = {
          t : parseInt(result.body.lastTime[0].$.time),
          p: []
        }

        for( var i = 0; i < (result.body.vehicle ? result.body.vehicle.length : 0); i++){
          // console.log(result.body.vehicle[i].$);
          data.p.push(result.body.vehicle[i].$);
        }
        // console.log(data);
        routeResponses[r] = data;
      });
    }
  })
}

var i = 0;
setInterval(function(){
  while(updateRouteData(ttcroutes[Math.floor(Math.random() * ttcroutes.length) % ttcroutes.length]) == false);
}, 20000 / ttcroutes.length);

app.get('/data', function(req, res){

  var points = [];
  for (var r in routeResponses){
    var l = routeResponses[r].p.length;
    for(var i = 0; i < l; i++){
      points.push([parseInt(routeResponses[r].p[i].routeTag), parseFloat(routeResponses[r].p[i].lat), parseFloat(routeResponses[r].p[i].lon), routeResponses[r].t - parseInt(routeResponses[r].p[i].secsSinceReport) * 1000]);
    }
  }
  console.log("Number of points:", points.length)
  res.json(points);
});

app.listen(4000);
