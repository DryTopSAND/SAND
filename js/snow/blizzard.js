var c = document.getElementById('canvas'), 
    canvas = c.getContext("2d");

var w = c.width = window.innerWidth - 20,
    h = c.height = window.innerHeight;

$(function() {
    
    var snow, arr = [];
    var num = 600, tsc = 1, sp = 1;
    var sc = 1.3, t = 0, mv = 20, min = 1;

    Snowy(false);
    requestAnimFrame();
    
    function Snowy() {
        arr = [];
        for (var i = 0; i < num; ++i) {
            snow = new Flake();
            snow.y = Math.random() * (h + 50);
            snow.x = Math.random() * w;
            snow.t = Math.random() * (Math.PI * 2);
            snow.sz = (100 / (10 + (Math.random() * 100))) * sc;
            snow.sp = (Math.pow(snow.sz * .6, 2) * .15) * sp;
            snow.sp = snow.sp < min ? min : snow.sp;
            arr.push(snow);
        }
    }
    
    function requestAnimFrame() {
        window.requestAnimationFrame(requestAnimFrame);
        canvas.clearRect(0, 0, w, h);
        //canvas.fillStyle = 'hsla(242, 95%, 3%, 1)';
        //canvas.fillRect(0, 0, w, h);
        canvas.fill();
        for (var i = 0; i < arr.length; ++i) {
            f = arr[i];
            f.t += .05;
            f.t = f.t >= Math.PI * 2 ? 0 : f.t;
            f.y += f.sp;
            f.x += Math.sin(f.t * tsc) * (f.sz * .3);
            if (f.y > h + 50) f.y = -10 - Math.random() * mv;
            if (f.x > w + mv) f.x = - mv;
            if (f.x < - mv) f.x = w + mv;
            f.draw();
        }
    }
    
    function Flake() {
        this.draw = function() {
            this.g = canvas.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.sz);
            this.g.addColorStop(0, 'hsla(255,255%,255%,1)');
            this.g.addColorStop(1, 'hsla(255,255%,255%,0)');
            canvas.moveTo(this.x, this.y);
            canvas.fillStyle = this.g;
            canvas.beginPath();
            canvas.arc(this.x, this.y, this.sz, 0, Math.PI * 2, true);
            canvas.fill();
        }
    }
    
    // setup event handlers
    $(window).on('resize', resizeCanvas);
    $('body').on('DOMSubtreeModified', function() {
        resizeCanvas(false);
    });

    // resize canvas on window change
    function resizeCanvas() {
		var c = document.getElementById('canvas'),
            canvas = c.getContext("2d");
        w = c.width = window.innerWidth - 20, 
        h = c.height = window.innerHeight;
        Snowy();
    };  
});

