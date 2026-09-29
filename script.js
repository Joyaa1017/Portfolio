document.documentElement.classList.add("js");

var $ = function(s, c) {
  return (c || document).querySelector(s);
};
var $$ = function(s, c) {
  return [].slice.call((c || document).querySelectorAll(s));
};
var still = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Mobile menu */
var links = $("#links"),
    mb = $("#menuBtn");

mb.onclick = function() {
  var o = links.classList.toggle("open");
  mb.setAttribute("aria-expanded", o);
};

links.onclick = function(e) {
  if (e.target.tagName === "A") {
    links.classList.remove("open");
    mb.setAttribute("aria-expanded", "false");
  }
};

/* Theme toggle */
var root = document.documentElement;

try {
  var saved = localStorage.getItem("theme");
  if (saved) root.setAttribute("data-theme", saved);
} catch(e) {}

$("#theme").onclick = function() {
  var dark =
    root.getAttribute("data-theme") === "dark" ||
    (!root.getAttribute("data-theme") &&
      matchMedia("(prefers-color-scheme: dark)").matches);
  var next = dark ? "light" : "dark";
  root.setAttribute("data-theme", next);
  try {
    localStorage.setItem("theme", next);
  } catch(e) {}
};

/* Scroll progress, active navigation, back-to-top */
var secs = $$("main section[id]");
var anchors = $$(".links a");

function onScroll() {
  var h = document.documentElement;
  var max = h.scrollHeight - h.clientHeight;

  $("#progress").style.width =
    (max > 0 ? scrollY / max * 100 : 0) + "%";
  var cur = "home";

  secs.forEach(function(s) {
    if (s.offsetTop <= scrollY + 140)
      cur = s.id;
  });


  anchors.forEach(function(a) {

    a.classList.toggle(
      "active",
      a.getAttribute("href") === "#" + cur
    );

  });


  $("#top").classList.toggle(
    "show",
    scrollY > 600
  );

}


addEventListener("scroll", onScroll, {passive:true});

onScroll();


$("#top").onclick = function() {
  scrollTo({top:0});
};



/* Reveal animation + counters */

function count(el) {

  var n = +el.dataset.count;
  var t0 = null;


  if(still) {
    el.textContent = n;
    return;
  }


  (function step(t){

    t0 = t0 || t;

    var p = Math.min((t - t0) / 900, 1);

    el.textContent = Math.round(n * p);

    if(p < 1)
      requestAnimationFrame(step);

  })(performance.now());

}


var io = new IntersectionObserver(function(es){

  es.forEach(function(e){

    if(e.isIntersecting){

      e.target.classList.add("in");

      $$("[data-count]", e.target)
        .forEach(count);

      io.unobserve(e.target);

    }

  });


},{threshold:.15});


$$(".reveal").forEach(function(el){

  io.observe(el);

});



/* Typing effect */

var roles = [
  "BSIT Student",
  "Web Development Enthusiast",
  "Problem Solver",
  "Always Learning"
];

var ri = 0,
    ci = 0,
    del = false,
    tEl = $("#typed");


function type(){

  var w = roles[ri];

  tEl.textContent = w.slice(0,ci);


  if(!del && ci === w.length){

    del = true;

    return setTimeout(type,1500);

  }


  if(del && ci === 0){

    del = false;

    ri = (ri + 1) % roles.length;

  }


  ci += del ? -1 : 1;


  setTimeout(
    type,
    del ? 40 : 80
  );

}


if(still)
  tEl.textContent = roles[0];
else
  type();




/* Hero network animation */

(function(){

  var c = $("#net");

  var x = c.getContext("2d");

  var pts = [];

  var m = {
    x:-999,
    y:-999
  };

  var W,H;

  var hero = $("#home");


  function size(){

    W = c.width = hero.clientWidth;

    H = c.height = hero.clientHeight;

    pts=[];


    for(
      var i=0,
      n=Math.min(80,Math.floor(W*H/13000));
      i<n;
      i++
    ){

      pts.push({

        x:Math.random()*W,

        y:Math.random()*H,

        vx:(Math.random()-.5)*.35,

        vy:(Math.random()-.5)*.35

      });

    }

  }



  function draw(){

    x.clearRect(0,0,W,H);


    pts.forEach(function(p,i){

      p.x += p.vx;

      p.y += p.vy;


      if(p.x<0 || p.x>W)
        p.vx *= -1;


      if(p.y<0 || p.y>H)
        p.vy *= -1;



      var dx=p.x-m.x;

      var dy=p.y-m.y;

      var d=Math.hypot(dx,dy);


      if(d<120 && d>0){

        p.x += dx/d*1.5;

        p.y += dy/d*1.5;

      }



      x.fillStyle =
      "rgba(165,180,252,.75)";


      x.beginPath();

      x.arc(
        p.x,
        p.y,
        1.8,
        0,
        7
      );

      x.fill();



      for(var j=i+1;j<pts.length;j++){

        var q=pts[j];

        var e=Math.hypot(
          p.x-q.x,
          p.y-q.y
        );


        if(e<125){

          x.strokeStyle =
          "rgba(165,180,252,"+
          (.28*(1-e/125))+")";


          x.beginPath();

          x.moveTo(
            p.x,
            p.y
          );

          x.lineTo(
            q.x,
            q.y
          );

          x.stroke();

        }

      }


    });


    if(!still)
      requestAnimationFrame(draw);

  }



  hero.addEventListener(
    "pointermove",
    function(e){

      var r=c.getBoundingClientRect();

      m.x=e.clientX-r.left;

      m.y=e.clientY-r.top;

    }
  );


  hero.addEventListener(
    "pointerleave",
    function(){

      m.x=m.y=-999;

    }
  );


  addEventListener(
    "resize",
    size
  );


  size();

  draw();


})();




/* Card tilt */

function tilt(el,max){

  el.addEventListener(
    "pointermove",
    function(e){

      if(still || e.pointerType==="touch")
        return;


      var r=el.getBoundingClientRect();


      var px=(e.clientX-r.left)/r.width-.5;

      var py=(e.clientY-r.top)/r.height-.5;


      el.style.transform =
      "perspective(800px) rotateX("+
      (-py*max)+
      "deg) rotateY("+
      (px*max)+
      "deg)";

    }
  );


  el.addEventListener(
    "pointerleave",
    function(){

      el.style.transform="";

    }
  );

}


tilt($("#tilt"),6);

$$(".card").forEach(function(c){

  tilt(c,4);

});



/* Skills tabs */

var tabs = $$(".tab");


function pick(t){

  tabs.forEach(function(b){

    var on = b === t;


    b.setAttribute(
      "aria-selected",
      on
    );


    b.tabIndex = on ? 0 : -1;


    var p=$("#"+b.getAttribute("aria-controls"));


    p.classList.toggle(
      "show",
      on
    );


    if(on)

      $$(".skill",p)
      .forEach(function(s,i){

        s.style.animationDelay =
        i*60+"ms";

      });


  });


  t.focus();

}



tabs.forEach(function(t,i){

  t.onclick=function(){

    pick(t);

  };


  t.onkeydown=function(e){

    if(
      e.key==="ArrowRight" ||
      e.key==="ArrowLeft"
    )

      pick(
        tabs[(i+1)%tabs.length]
      );

  };

});



/* Project dialog */

var data={

uma:{
t:"UMA",
s:"Local Farmers E-Commerce Platform",
d:"Connects local farmers directly with consumers.",
f:[
"Product search",
"Shopping cart",
"Online purchasing",
"Direct farmer-to-consumer messaging"
]
},


vault:{
t:"Recipe Vault",
s:"Community Recipe-Sharing Platform",
d:"A community space for finding and sharing recipes.",
f:[
"Recipe discovery",
"Bookmarks",
"User discussions",
"Ratings",
"Featured popular chefs and recipes"
]
},


gis:{
t:"Where Am I?",
s:"GIS-Based Navigation System",
d:"Helps users find their way around complex institutions.",
f:[
"Digital maps",
"Building information",
"Indoor directions"
]
}

};



var dlg=$("#dlg");


$$(".more").forEach(function(b){

  b.onclick=function(){

    var p=data[b.dataset.project];


    $("#dTitle").textContent=p.t;

    $("#dSub").textContent=p.s;

    $("#dText").textContent=p.d;


    $("#dList").innerHTML =
    p.f.map(function(f){

      return '<li><svg class="ico"><use href="#i-check"/></svg>'+f+"</li>";

    }).join("");


    dlg.showModal();

  }

});



$("#dClose").onclick =
$("#dOk").onclick=function(){

  dlg.close();

};

dlg.addEventListener(
"click",
function(e){

  if(e.target===dlg)
    dlg.close();
});
$("#year").textContent =
new Date().getFullYear();