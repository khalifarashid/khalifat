(function () {
  var targets = document.querySelectorAll("[data-pop]");
  targets.forEach(function (el) { el.classList.add("pop-init"); });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = Array.prototype.indexOf.call(el.parentNode.children, el) * 60;
            setTimeout(function () {
              el.classList.add("pop-in");
            }, Math.min(delay, 300));
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add("pop-in"); });
  }
})();

/* ---------- Confetti burst on ticket select ---------- */
(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var colors = ["#ff2e88", "#f4ff3d", "#3df5ff", "#b13dff"];

  document.querySelectorAll("[data-confetti]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (reduceMotion) return;
      burst(e.clientX, e.clientY);
    });
  });

  function burst(x, y) {
    for (var i = 0; i < 18; i++) {
      var piece = document.createElement("span");
      piece.style.position = "fixed";
      piece.style.left = x + "px";
      piece.style.top = y + "px";
      piece.style.width = "8px";
      piece.style.height = "8px";
      piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      piece.style.background = colors[i % colors.length];
      piece.style.pointerEvents = "none";
      piece.style.zIndex = "500";
      document.body.appendChild(piece);

      var angle = Math.random() * Math.PI * 2;
      var distance = 60 + Math.random() * 90;
      var dx = Math.cos(angle) * distance;
      var dy = Math.sin(angle) * distance - 40;

      var anim = piece.animate(
        [
          { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
          { transform: "translate(" + dx + "px, " + dy + "px) rotate(" + (Math.random() * 360) + "deg)", opacity: 0 }
        ],
        { duration: 700 + Math.random() * 400, easing: "cubic-bezier(.2,.8,.3,1)" }
      );
      anim.onfinish = function () {
        this.effect.target.remove();
      };
    }
  }
})();
