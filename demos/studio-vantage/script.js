import * as THREE from "three";

var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var finePointer = window.matchMedia("(pointer: fine)").matches;

/* ---------- Scroll reveal ---------- */
(function () {
  var targets = document.querySelectorAll("[data-reveal]");
  if (!targets.length) return;

  if (reduceMotion) {
    targets.forEach(function (el) { el.style.opacity = 1; });
    return;
  }

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    targets.forEach(function (el) {
      gsap.from(el, {
        opacity: 0,
        y: 18,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });
    return;
  }

  targets.forEach(function (el) { el.classList.add("reveal-init"); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add("is-visible"); });
  }
})();

/* ---------- Hero massing model (Three.js) ----------
   A still architectural massing rather than a spinning object: the
   camera drifts a few degrees and follows the pointer, so the scene
   reads as depth rather than as an animation demanding attention. */
(function () {
  var canvas = document.getElementById("heroCanvas");
  var heroSection = document.querySelector(".hero");
  if (!canvas || !heroSection || !THREE) return;

  var PAPER = 0xe7e3db;
  var ACCENT = 0xff5a1f;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  var world = new THREE.Group();
  world.rotation.y = -0.5;
  scene.add(world);

  // Ground plan: a quiet reference grid, not a glowing floor.
  var plan = new THREE.GridHelper(26, 26, PAPER, PAPER);
  plan.material.transparent = true;
  plan.material.opacity = 0.12;
  world.add(plan);

  // Massing blocks — a small block plan with varied heights.
  var blocks = [
    { x: -4.2, z: -1.4, w: 2.6, h: 3.4, d: 2.6, accent: false },
    { x: -0.6, z: 0.8, w: 3.0, h: 5.6, d: 3.0, accent: true },
    { x: 3.4, z: -0.4, w: 2.2, h: 2.4, d: 3.4, accent: false },
    { x: 0.4, z: -4.4, w: 4.4, h: 1.6, d: 2.2, accent: false },
    { x: -4.6, z: 3.6, w: 2.0, h: 1.2, d: 2.0, accent: false }
  ];

  blocks.forEach(function (b) {
    var geo = new THREE.BoxGeometry(b.w, b.h, b.d);
    var edges = new THREE.EdgesGeometry(geo);
    var mat = new THREE.LineBasicMaterial({
      color: b.accent ? ACCENT : PAPER,
      transparent: true,
      opacity: b.accent ? 0.85 : 0.42
    });
    var mesh = new THREE.LineSegments(edges, mat);
    mesh.position.set(b.x, b.h / 2, b.z);
    world.add(mesh);
  });

  function layout() {
    var w = heroSection.clientWidth;
    var h = heroSection.clientHeight;
    if (!w || !h) return;

    // Pull the camera back and raise it on narrow screens so the
    // massing still reads when the viewport is tall and thin.
    var narrow = w < 760;
    camera.position.set(narrow ? 11 : 9.5, narrow ? 8 : 6.4, narrow ? 15 : 13);
    camera.lookAt(0, narrow ? 1.4 : 1.1, 0);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  layout();
  window.addEventListener("resize", layout);
  if ("ResizeObserver" in window) new ResizeObserver(layout).observe(heroSection);

  var visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    }).observe(heroSection);
  }

  // Pointer parallax, heavily damped.
  var targetX = 0, targetY = 0, curX = 0, curY = 0;
  if (finePointer && !reduceMotion) {
    window.addEventListener("mousemove", function (e) {
      targetX = (e.clientX / window.innerWidth - 0.5) * 0.22;
      targetY = (e.clientY / window.innerHeight - 0.5) * 0.10;
    });
  }

  if (reduceMotion) {
    renderer.render(scene, camera);
    return;
  }

  var clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    if (!visible) return;

    var t = clock.getElapsedTime();
    curX += (targetX - curX) * 0.04;
    curY += (targetY - curY) * 0.04;

    // A slow breath of rotation so the scene is never fully static,
    // but never fast enough to pull the eye off the headline.
    world.rotation.y = -0.5 + curX + Math.sin(t * 0.06) * 0.05;
    world.rotation.x = curY * 0.5;

    renderer.render(scene, camera);
  }
  animate();
})();

/* ---------- Project card tilt ----------
   A few degrees of parallax on hover. The card never rotates far
   enough to hide its own content. */
(function () {
  if (!finePointer || reduceMotion) return;
  var MAX = 4;

  document.querySelectorAll("[data-tilt]").forEach(function (card) {
    var bounds = null;
    var raf = null;
    var tx = 0, ty = 0;

    function apply() {
      raf = null;
      card.style.transform =
        "perspective(1400px) rotateX(" + ty + "deg) rotateY(" + tx + "deg) translateZ(6px)";
    }

    card.addEventListener("mouseenter", function () {
      bounds = card.getBoundingClientRect();
    });

    card.addEventListener("mousemove", function (e) {
      if (!bounds) bounds = card.getBoundingClientRect();
      tx = ((e.clientX - bounds.left) / bounds.width - 0.5) * (MAX * 2);
      ty = (0.5 - (e.clientY - bounds.top) / bounds.height) * (MAX * 2);
      if (!raf) raf = requestAnimationFrame(apply);
    });

    card.addEventListener("mouseleave", function () {
      bounds = null;
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      card.style.transform = "";
    });
  });
})();
