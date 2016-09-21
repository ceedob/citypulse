var canvas = document.createElement('canvas');

var ctx = canvas.getContext('2d');

var speed = Math.max(window.innerWidth, window.innerHeight * window.innerHeight/window.innerWidth );

var setCanvasSize = function(){
  canvas.width = speed;
  canvas.height = speed * window.innerHeight/window.innerWidth;

  document.getElementById('canvas').width = speed;
  document.getElementById('canvas').height = speed * window.innerHeight/window.innerWidth;
  // ctx.resetTransform();
  // ctx.clearRect(43.6614818, -79.501092, 1, 1);
  //
  // ctx.setTransform(1, 0, 0, 1, 0, 0);
}

setCanvasSize();

function copyIntoOnscreenCanvas(){
            var onscreenContext = document.getElementById('canvas').getContext('2d');
            var offscreenContext = canvas.getContext('2d');

            // cut the drawn rectangle
            var image = ctx.getImageData(0,0, canvas.width, canvas.height);
            // copy into visual canvas at different position
            onscreenContext.putImageData(image, 0, 0);

        }

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}


data = [];

setInterval(function(){
  fetch('/data')
  .then(function(response) {
    return response.json();
  }).then(function(d){
    data = d;
  });
}, 2500);


function getCanvasBounds(){
  if(data.length == 0) return;
  maxLat = data[0][1]
  minLat = data[0][1]
  maxLon = data[0][2]
  minLon = data[0][2]
  for(var i = 1; i < data.length; i++){
    maxLat = Math.max(maxLat, data[i][1]);
    minLat = Math.min(minLat, data[i][1]);
    maxLon = Math.max(maxLon, data[i][2]);
    minLon = Math.min(minLon, data[i][2]);
  }

  center = [43.668448, -79.406245];
  return {maxLat: center[0] + 0.046358, minLat: center[0] - 0.046358, minLon: center[1] - 0.085461, maxLon: center[1] + 0.085461};

}

function transformPoint(lat, lon){

  // lat east/west
  // lon north/south

  var b = getCanvasBounds();

  var w = b.maxLon - b.minLon;
  var h = b.maxLat - b.minLat;

  var p = {x: canvas.width / w * (lon - b.minLon) , y:  canvas.height - canvas.height / h * (lat - b.minLat)};
  // console.log(lon, '->', p.x , lat, '->', p.y);
  return p;
}

function rgba(r, g, b, a){
    if(a < 1/65563){a = 0}
    var color = "rgba("+r+", "+g+", "+b+", "+ a +")";
    // console.log(color);
    return color;
}

var h = Math.random();
ctx.fillStyle = rgba(255,255,255,1);
ctx.fillRect(0, 0, canvas.width, canvas.height);
var diff = 30;
var draw = function(){

  if(data.length == 0) return;
  var start = performance.now();

  h+= 0.001; h %= 1 ;

  rgb = hslToRgb(h, 0.4, 0.05);

  ctx.fillStyle = rgba(rgb[0], rgb[1], rgb[2], 1);
  document.body.style.backgroundColor = rgba(rgb[0], rgb[1], rgb[2], 1);

  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // var b = setCanvasBounds()



  for(var i = 0; i < data.length; i+= 1){
    // console.log(1000/ (Date.now()+1000 - data[i][3]), 1-(Date.now() - data[i][3])/30000)
    var age = Math.max(0, Date.now() - data[i][3] - 10000 )/250 % 35
    // if(age > 1000) continue;
    var opacity = 1/(1 + Math.exp(age/5 - 5));
    // var width =
    // console.log(age, opacity);
    rgb = hslToRgb((h+0.3+data[i][0]/1500) % 1, 1, 0.65);
    ctx.fillStyle = rgba(rgb[0], rgb[1], rgb[2], Math.max(0, opacity-0.05));
    ctx.beginPath();
    var p = transformPoint(data[i][1], data[i][2]);
    ctx.arc(p.x, p.y, 10-10*Math.max(0,opacity-0.1), 0, Math.PI*2, false);
    ctx.fill();
  }


  diff = performance.now() - start;
  // console.log(diff);
  window.requestAnimationFrame(copyIntoOnscreenCanvas);
}

setCanvasSize();
// draw();
setInterval(function(){
  window.requestAnimationFrame(draw);
}, 16);
// setInterval(function(){
//   window.requestAnimationFrame(function(){
//     if((1000/diff < 15 && speed > window.innerWidth / 2) || speed > window.innerWidth){
//       speed -= diff;
//       setCanvasSize();
//     } else if(diff < 16 || speed > window.innerWidth){
//       speed += 10;
//       setCanvasSize();
//     }
//     draw();
//   });
// }, 10000);
