import * as THREE from "three";

/* ---------- Year ---------- */
var yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Mobile menu ---------- */
(function () {
  var menuToggle = document.getElementById("menuToggle");
  var header = document.querySelector(".site-header");
  if (!menuToggle || !header) return;
  menuToggle.addEventListener("click", function () {
    var isOpen = header.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  document.querySelectorAll(".nav a").forEach(function (link) {
    link.addEventListener("click", function () {
      header.classList.remove("nav-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
})();

/* ---------- Scroll progress bar ---------- */
(function () {
  var bar = document.getElementById("progressBar");
  if (!bar) return;
  function update() {
    var h = document.documentElement;
    var scrolled = h.scrollTop;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + "%";
  }
  document.addEventListener("scroll", update, { passive: true });
  update();
})();

/* ---------- Custom cursor ---------- */
(function () {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  var dot = document.getElementById("cursorDot");
  var ring = document.getElementById("cursorRing");
  if (!dot || !ring) return;

  var mouseX = -100, mouseY = -100;
  var ringX = -100, ringY = -100;

  window.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = "translate(" + mouseX + "px," + mouseY + "px) translate(-50%,-50%)";
  });

  function loop() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = "translate(" + ringX + "px," + ringY + "px) translate(-50%,-50%)";
    requestAnimationFrame(loop);
  }
  loop();

  document.querySelectorAll("[data-hover], a, button, .tilt-card").forEach(function (el) {
    el.addEventListener("mouseenter", function () { ring.classList.add("is-active"); });
    el.addEventListener("mouseleave", function () { ring.classList.remove("is-active"); });
  });
})();

/* ---------- Tilt cards ---------- */
(function () {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  document.querySelectorAll(".tilt-card").forEach(function (card) {
    var bounds;
    card.addEventListener("mouseenter", function () {
      bounds = card.getBoundingClientRect();
    });
    card.addEventListener("mousemove", function (e) {
      if (!bounds) bounds = card.getBoundingClientRect();
      var px = (e.clientX - bounds.left) / bounds.width - 0.5;
      var py = (e.clientY - bounds.top) / bounds.height - 0.5;
      var rotateY = px * 10;
      var rotateX = -py * 10;
      card.style.transform =
        "perspective(800px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateY(-4px)";
    });
    card.addEventListener("mouseleave", function () {
      card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)";
    });
  });
})();

/* ---------- Scroll reveal ---------- */
(function () {
  var targets = document.querySelectorAll("[data-reveal]");
  var heroTargets = document.querySelectorAll("[data-reveal-hero]");

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(heroTargets, {
      opacity: 0,
      y: 26,
      duration: 0.9,
      stagger: 0.12,
      ease: "power2.out",
      delay: 0.15
    });

    targets.forEach(function (el) {
      gsap.from(el, {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%"
        }
      });
    });
  } else {
    // Fallback: plain IntersectionObserver reveal
    var all = Array.prototype.slice.call(targets).concat(Array.prototype.slice.call(heroTargets));
    all.forEach(function (el) { el.classList.add("reveal-init"); });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("reveal-in");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      all.forEach(function (el) { io.observe(el); });
    } else {
      all.forEach(function (el) { el.classList.add("reveal-in"); });
    }
  }
})();

/* ---------- Contact form (submits to Formspree) ---------- */
(function () {
  var form = document.getElementById("contactForm");
  var formNote = document.getElementById("formNote");
  var submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  if (!form || !formNote) return;

  var DEST_EMAIL = "ad.khalifa.khs@gmail.com";

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var originalLabel = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }
    formNote.textContent = "";

    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (response) {
        if (response.ok) {
          formNote.textContent = "Thanks! Your message was sent — I'll get back to you within 24 hours.";
          form.reset();
        } else {
          throw new Error("Formspree responded with " + response.status);
        }
      })
      .catch(function () {
        formNote.textContent =
          "Something went wrong sending that. You can also email me directly at " + DEST_EMAIL + ".";
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }
      });
  });
})();

/* ---------- Three.js hero scene ---------- */
(function () {
  var canvas = document.getElementById("heroCanvas");
  var heroSection = document.querySelector(".hero");
  if (!canvas || !heroSection || !THREE) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(
    45,
    heroSection.clientWidth / heroSection.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 7);

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(heroSection.clientWidth, heroSection.clientHeight);

  /* Lights: warm beige base + coral/violet accent rim lights */
  scene.add(new THREE.AmbientLight(0xf3ead9, 0.9));

  var keyLight = new THREE.DirectionalLight(0xffb37b, 1.1);
  keyLight.position.set(4, 4, 5);
  scene.add(keyLight);

  var rimLight = new THREE.PointLight(0x6c4bff, 6, 20);
  rimLight.position.set(-4, -2, 3);
  scene.add(rimLight);

  var rimLight2 = new THREE.PointLight(0xff5b34, 4, 20);
  rimLight2.position.set(3, -3, -2);
  scene.add(rimLight2);

  /* Main faceted crystal */
  var geometry = new THREE.IcosahedronGeometry(1.7, 1);
  var material = new THREE.MeshStandardMaterial({
    color: 0xefe0c9,
    flatShading: true,
    metalness: 0.55,
    roughness: 0.3
  });
  var crystal = new THREE.Mesh(geometry, material);
  scene.add(crystal);

  var wireGeometry = new THREE.IcosahedronGeometry(1.86, 1);
  var wireMaterial = new THREE.MeshBasicMaterial({
    color: 0xff5b34,
    wireframe: true,
    transparent: true,
    opacity: 0.35
  });
  var wireCrystal = new THREE.Mesh(wireGeometry, wireMaterial);
  scene.add(wireCrystal);

  /* Small floating satellites */
  var satellites = [];
  var satColors = [0x6c4bff, 0xc9a15a, 0xff5b34];
  var satPositions = [
    [-3.2, 1.4, -1.5],
    [3.4, -1.2, -1.2],
    [-2.6, -2, -2.4]
  ];
  satPositions.forEach(function (pos, i) {
    var g = new THREE.IcosahedronGeometry(0.28 + i * 0.05, 0);
    var m = new THREE.MeshStandardMaterial({
      color: satColors[i],
      flatShading: true,
      metalness: 0.4,
      roughness: 0.4
    });
    var mesh = new THREE.Mesh(g, m);
    mesh.position.set(pos[0], pos[1], pos[2]);
    scene.add(mesh);
    satellites.push(mesh);
  });

  var mouseX = 0, mouseY = 0;
  window.addEventListener("mousemove", function (e) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  function onResize() {
    var w = heroSection.clientWidth;
    var h = heroSection.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener("resize", onResize);
  if ("ResizeObserver" in window) {
    new ResizeObserver(onResize).observe(heroSection);
  }

  var clock = new THREE.Clock();
  var visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    }).observe(heroSection);
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!visible) return;
    var t = clock.getElapsedTime();
    var spin = reduceMotion ? 0.05 : 1;

    crystal.rotation.y = t * 0.22 * spin;
    crystal.rotation.x = Math.sin(t * 0.3) * 0.15 * spin + mouseY * 0.25;
    wireCrystal.rotation.copy(crystal.rotation);
    wireCrystal.rotation.y += 0.15;

    crystal.position.x = mouseX * 0.3;
    wireCrystal.position.x = mouseX * 0.3;

    satellites.forEach(function (sat, i) {
      sat.rotation.x = t * (0.3 + i * 0.1);
      sat.rotation.y = t * (0.4 + i * 0.08);
      sat.position.y += Math.sin(t * 0.6 + i) * 0.0025;
    });

    renderer.render(scene, camera);
  }
  animate();
})();

/* ---------- Chat assistant ---------- */
(function () {
  var fab = document.getElementById("chatFab");
  var panel = document.getElementById("chatPanel");
  var closeBtn = document.getElementById("chatClose");
  var messages = document.getElementById("chatMessages");
  var form = document.getElementById("chatForm");
  var input = document.getElementById("chatInput");
  var quick = document.getElementById("chatQuick");
  if (!fab || !panel || !form || !input || !messages) return;

  var PHONE_DISPLAY = "+971 54 777 1747";
  var WHATSAPP_LINK =
    "https://wa.me/971547771747?text=" + encodeURIComponent("Hi Khalifa, I'd like to talk about a website.");
  var CONTACT_HTML =
    "Best way to sort that out is to talk directly — message me on " +
    '<a href="' + WHATSAPP_LINK + '" target="_blank" rel="noopener">WhatsApp</a> or call ' +
    '<a href="tel:+971547771747">' + PHONE_DISPLAY + "</a>.";

  var knowledge = [
    {
      keywords: ["price", "cost", "how much", "package", "pricing", "budget", "fee", "rate"],
      answer:
        "There are 4 packages: <strong>Spark</strong> (500 AED, 1-page site), " +
        "<strong>Pulse</strong> (750 AED, up to 5 pages, most popular), " +
        "<strong>Nova</strong> (1000 AED, up to 8 pages with advanced animation), and " +
        '<strong>Genesis</strong> (custom-quoted, fully custom 3D/WebGL builds). See the full breakdown in the ' +
        '<a href="#pricing">Pricing section</a>.'
    },
    {
      keywords: ["long", "time", "delivery", "deadline", "fast", "days", "when", "duration"],
      answer:
        "Spark ships in about 3 days, Pulse in 5–7 days, and Nova in 7–10 days. Genesis projects are scoped " +
        "individually since they're fully custom, so timeline depends on scope."
    },
    {
      keywords: ["ecommerce", "e-commerce", "store", "shop", "sell", "cart", "checkout"],
      answer:
        "Yes — online stores with cart and checkout are part of the <strong>Genesis</strong> custom package, " +
        'scoped after a quick call. Check <a href="#pricing">Pricing</a> for details.'
    },
    {
      keywords: ["custom", "webgl", "three.js", "threejs", "3d", "app", "dashboard", "genesis"],
      answer:
        "Fully custom 3D/WebGL scenes, web apps, and dashboards fall under the <strong>Genesis</strong> package — " +
        "no fixed price, it's scoped and quoted after a short call about what you need."
    },
    {
      keywords: ["process", "how does it work", "steps", "work with", "start a project"],
      answer:
        "It's 4 steps: <strong>Discover</strong> (talk goals & pick a package), <strong>Design</strong> (layout preview), " +
        "<strong>Animate</strong> (build + motion + testing), <strong>Launch</strong> (site goes live with support after)."
    },
    {
      keywords: ["technology", "tech", "stack", "tools", "gsap", "framework", "built with"],
      answer:
        "This site itself is the demo — built with Three.js for the 3D scene, GSAP for scroll animation, and clean " +
        "hand-written HTML/CSS/JS. Other projects may use React depending on what fits best."
    },
    {
      keywords: ["portfolio", "work", "examples", "projects", "see"],
      answer: 'You can browse a few recent projects in the <a href="#work">Work section</a> above.'
    },
    {
      keywords: ["revision", "changes", "edit after"],
      answer:
        "Spark includes 1 revision round, Pulse includes 2, and Nova includes 2 plus a month of free support after launch."
    },
    {
      keywords: ["hi", "hello", "hey", "salam", "yo"],
      answer: "Hey! I'm Khalifa's site assistant — ask me about pricing, timelines, or what's included in each package."
    },
    {
      keywords: ["contact", "talk", "call", "whatsapp", "phone", "reach", "hire", "email", "number", "human", "real person"],
      answer: CONTACT_HTML
    }
  ];

  function hasKeyword(q, kw) {
    var escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    var re = new RegExp("(^|[^a-z0-9])" + escaped + "([^a-z0-9]|$)", "i");
    return re.test(q);
  }

  function findAnswer(text) {
    var q = text.toLowerCase();
    var best = null;
    var bestScore = 0;
    knowledge.forEach(function (entry) {
      var score = 0;
      entry.keywords.forEach(function (kw) {
        if (hasKeyword(q, kw)) score += kw.length;
      });
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    });
    if (best) return best.answer;
    return (
      "I don't have a canned answer for that one — but " + CONTACT_HTML
    );
  }

  function addMessage(html, from) {
    var el = document.createElement("div");
    el.className = "chat-msg " + from;
    el.innerHTML = html;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  var greeted = false;
  function openChat() {
    panel.hidden = false;
    fab.setAttribute("aria-expanded", "true");
    if (!greeted) {
      greeted = true;
      addMessage(
        "Hi, I'm Khalifa's assistant. Ask me anything about building a website — pricing, timelines, what's included — " +
          "or use a quick question below.",
        "bot"
      );
    }
    input.focus();
  }
  function closeChat() {
    panel.hidden = true;
    fab.setAttribute("aria-expanded", "false");
  }

  fab.addEventListener("click", function () {
    if (panel.hidden) openChat();
    else closeChat();
  });
  if (closeBtn) closeBtn.addEventListener("click", closeChat);

  function ask(text) {
    text = text.trim();
    if (!text) return;
    addMessage(escapeHtml(text), "user");
    var reply = findAnswer(text);
    setTimeout(function () {
      addMessage(reply, "bot");
    }, 350);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    ask(input.value);
    input.value = "";
  });

  if (quick) {
    quick.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        ask(btn.textContent);
      });
    });
  }
})();
