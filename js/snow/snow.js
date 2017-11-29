var canvas, ctx, W, H, iH;
var origSpeed = 33;
var angle = 0;
var particles;
var prevTime;
var mp; // max particles

// Snowflake code via http://thecodeplayer.com/walkthrough/html5-canvas-snow-effect
$(document).ready(function() {
    
  // canvas init
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  resizeCanvas();

  // create the snowflake particles
  initParticles();

  // main drawing method
  function draw(currentTime) {
      
    // update the time interval
    if (!prevTime) prevTime = currentTime;
    var timeDiff = currentTime - prevTime;
    prevTime = currentTime;
    
    ctx.clearRect(0, 0, W, H);

    // draw the particles
    for (var i = 0; i < mp; i++) {
        var p = particles[i];
        this.g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        this.g.addColorStop(0, 'hsla(255,255%,255%,1)');
        this.g.addColorStop(1, 'hsla(255,255%,255%,0.5)');
        ctx.moveTo(p.x, p.y);
        ctx.fillStyle = this.g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
        ctx.fill();
    }
    
    // move the particles
    update(timeDiff / origSpeed);

    window.requestAnimationFrame(draw);
  }

  // Function to move the snowflakes
  // step is the time elapsed since the last update / the original speed from setInterval
  function update(step) {
      
    // angle will be an ongoing incremental flag. Sin and Cos functions will be applied to it to create vertical and horizontal movements of the flakes
    angle += 0.01;
    
    for (var i = 0; i < mp; i++) {
        
      var p = particles[i];
      
      // Updating X and Y coordinates
      // We will add 1 to the cos function to prevent negative values which will lead flakes to move upwards
      // Every particle has its own density which can be used to make the downward movement different for each flake
      // Lets make it more random by adding in the radius
      p.y += (Math.cos(angle + p.d) + 1 + p.r / 2) * step;
      p.x += (Math.sin(angle) * 2) * step;

      // Sending flakes back from the top when it exits
      // Let's make it a bit more organic and let flakes enter from the left and right also.
      if (p.x > W + 5 || p.x < -5 || p.y > iH + window.scrollY) {
        if (i % 3 > 0) // 66.67% of the flakes
        {
          particles[i] = {x: Math.random() * W, y: -10 + window.scrollY, r: p.r, d: p.d};
        }
        else {
            
          // If the flake is exiting from the right
          if (Math.sin(angle) > 0) {
              
            // Enter from the left
            particles[i] = {x: -5, y: Math.random() * iH + window.scrollY, r: p.r, d: p.d};
          }
          else {
              
            // Enter from the right
            particles[i] = {x: W + 5, y: Math.random() * iH + window.scrollY, r: p.r, d: p.d};
          }
        }
      }
    }
  }

  // start animation loop
  //setInterval(draw, origSpeed);
  window.requestAnimationFrame(draw);
});

// setup event handlers
$(window).on('resize', resizeCanvas);
$('body').on('DOMSubtreeModified', function() {
    resizeCanvas(false)
});

// resize canvas on window change
function resizeCanvas(reinit) {
  if (reinit == null) reinit = true;
  canvas.width = W = Math.min(window.innerWidth, $('body').width());
  iH = window.innerHeight;
  canvas.height = H = $(document).height();
  if (reinit) initParticles();
}

// instantiates the particles, recalled when browser size is changed
function initParticles()
{
  mp = getParticles(); // get # of particles for screen size
  //console.log('particles=' + mp);
  particles = [];
  for (var i = 0; i < mp; i++) {
    particles.push({
      x: Math.random() * W, //x-coordinate
      y: Math.random() * H, //y-coordinate
      r: Math.random() * 3.25 + 2, //radius
      d: Math.random() * mp //density
    })
  }
}

// gets the # of particles based on screen size
function getParticles()
{
    var minParticles = 25;
    var maxParticles = 60;
    
    // get browser dimensions
    var width = $(window).innerWidth();
    var height = $(window).innerHeight();
    
    var area = width * height;
    
    var smallScreen = 600000;   // ~1024x768 inner area
    var largeScreen = 1800000;  // ~1920x1080 inner area
    
    var numParticles = projection(area, smallScreen, largeScreen, minParticles, maxParticles);
    
    return Math.round(numParticles);
}


// projects a number between minNum-maxNum to minProj-maxProj
function projection(num, minNum, maxNum, minProj, maxProj)
{
    // clip number between min and max values
    if (num < minNum) num = minNum;
    if (num > maxNum) num = maxNum;
    
    var numScale = maxNum - minNum;
    var projScale = maxProj - minProj;
    
    return (num - minNum) / numScale * projScale + minProj;
}