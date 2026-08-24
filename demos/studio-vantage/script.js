import * as THREE from "three";

/* ---------- Custom cursor ---------- */
(function () {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  var dot = document.getElementById("cursorDot");
  if (!dot) return;
  window.addEventListener("mousemove", function (e) {
    dot.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px) translate(-50%,-50%)";
  });
  document.querySelectorAll("[data-hover], a, .flip-card").forEach(function (el) {
    el.addEventListener("mouseenter", function () { dot.classList.add("is-active"); });
    el.addEventListener("mouseleave", function () { dot.classList.remove("is-active"); });
  });
})();

/* ---------- Scroll reveal ---------- */
(function () {
  var simple = document.querySelectorAll("[data-reveal]");
  var threeD = document.querySelectorAll("[data-reveal-3d]");

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from(simple, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out",
      delay: 0.1
    });
    threeD.forEach(function (el) {
      gsap.from(el, {
        opacity: 0,
        rotateX: -14,
        y: 30,
        transformPerspective: 1000,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });
  } else {
    var all = Array.prototype.slice.call(simple).concat(Array.prototype.slice.call(threeD));
    all.forEach(function (el) { el.classList.add("reveal-init"); });
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
      all.forEach(function (el) { io.observe(el); });
    } else {
      all.forEach(function (el) { el.classList.add("is-visible"); });
    }
  }
})();

/* ---------- Hero wireframe grid (Three.js) ---------- */
(function () {
  var canvas = document.getElementById("heroCanvas");
  var heroSection = document.querySelector(".hero");
  if (!canvas || !heroSection || !THREE) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, heroSection.clientWidth / heroSection.clientHeight, 0.1, 100);
  camera.position.set(0, 2.4, 6.5);
  camera.lookAt(0, 0, 0);

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(heroSection.clientWidth, heroSection.clientHeight);

  var grid = new THREE.GridHelper(30, 30, 0xff5a1f, 0x3a3a3f);
  grid.position.y = -1.2;
  scene.add(grid);

  var cubeGroup = new THREE.Group();
  var cubePositions = [
    [-2.4, 0.4, -1],
    [2.6, -0.2, -2],
    [0.6, 1.1, -3]
  ];
  cubePositions.forEach(function (pos, i) {
    var geo = new THREE.BoxGeometry(0.6 + i * 0.15, 0.6 + i * 0.15, 0.6 + i * 0.15);
    var edges = new THREE.EdgesGeometry(geo);
    var mat = new THREE.LineBasicMaterial({ color: i === 1 ? 0xff5a1f : 0xe7e3db, transparent: true, opacity: 0.5 });
    var lines = new THREE.LineSegments(edges, mat);
    lines.position.set(pos[0], pos[1], pos[2]);
    cubeGroup.add(lines);
  });
  scene.add(cubeGroup);

  function onResize() {
    var w = heroSection.clientWidth;
    var h = heroSection.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener("resize", onResize);
  if ("ResizeObserver" in window) new ResizeObserver(onResize).observe(heroSection);

  var visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; }).observe(heroSection);
  }

  var clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    if (!visible) return;
    var t = clock.getElapsedTime();
    var spin = reduceMotion ? 0.05 : 1;
    grid.rotation.y = t * 0.03 * spin;
    cubeGroup.children.forEach(function (mesh, i) {
      mesh.rotation.x = t * (0.15 + i * 0.05) * spin;
      mesh.rotation.y = t * (0.2 + i * 0.04) * spin;
    });
    renderer.render(scene, camera);
  }
  animate();
})();
