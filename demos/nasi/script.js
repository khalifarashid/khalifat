/* NASI demo concept - Craftbyte
   Motion budget: reveal-on-scroll (hierarchy), tab swap (state change),
   activity draw (feedback), confetti on the primary CTA (feedback).
   Everything below collapses to static when the visitor prefers reduced motion. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------- reveal */
  var risers = Array.prototype.slice.call(document.querySelectorAll('[data-rise]'));

  if (!('IntersectionObserver' in window) || reduceMotion) {
    risers.forEach(function (el) { el.classList.add('is-in'); });
    var heroNow = document.querySelector('.hero');
    if (heroNow) { heroNow.classList.add('is-in'); }
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        var el = entry.target;
        var group = el.parentElement ? Array.prototype.slice.call(el.parentElement.children).filter(function (n) {
          return n.hasAttribute && n.hasAttribute('data-rise');
        }) : [];
        var index = group.indexOf(el);
        el.style.setProperty('--d', (index > 0 ? index * 80 : 0) + 'ms');
        el.classList.add('is-in');
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    risers.forEach(function (el) { revealObserver.observe(el); });

    var hero = document.querySelector('.hero');
    if (hero) {
      var heroObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            hero.classList.add('is-in');
            heroObserver.disconnect();
          }
        });
      }, { threshold: 0.2 });
      heroObserver.observe(hero);
    }
  }

  /* -------------------------------------------------- sticky header line */
  var header = document.getElementById('siteHeader');
  if (header && 'IntersectionObserver' in window) {
    var sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;';
    document.body.insertBefore(sentinel, document.body.firstChild);
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  }

  /* ------------------------------------------------------- mobile menu */
  var burger = document.getElementById('burger');
  var mobileNav = document.getElementById('mobileNav');
  if (burger && mobileNav) {
    var setMenu = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      mobileNav.hidden = !open;
    };
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    mobileNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { setMenu(false); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setMenu(false); }
    });
  }

  /* ---------------------------------------------------------- age tabs */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.age-tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.age-panel'));

  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach(function (p) {
      var on = p.id === tab.getAttribute('aria-controls');
      p.hidden = !on;
      p.classList.toggle('is-active', on);
      p.classList.remove('is-entering');
      if (on && !reduceMotion) {
        void p.offsetWidth;
        p.classList.add('is-entering');
      }
    });
    if (focus) { tab.focus(); }
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') { next = tabs[(i + 1) % tabs.length]; }
      if (e.key === 'ArrowLeft') { next = tabs[(i - 1 + tabs.length) % tabs.length]; }
      if (e.key === 'Home') { next = tabs[0]; }
      if (e.key === 'End') { next = tabs[tabs.length - 1]; }
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  /* ------------------------------------------------- activity randomiser */
  var activities = [
    { meta: '5 minutes, no mess', title: 'Sock basketball', body: 'Roll five socks into balls. A laundry basket goes on the sofa. Every step back from it doubles the points.' },
    { meta: '10 minutes, needs paper', title: 'Draw the sound', body: 'Play a song. They draw whatever the music looks like. No rules, no faces, no houses.' },
    { meta: '15 minutes, kitchen', title: 'Ice rescue', body: 'Freeze small toys in a bowl of water tonight. Tomorrow they free them with warm water and a spoon.' },
    { meta: '20 minutes, needs tape', title: 'Floor is lava, properly', body: 'Tape a path across the room. Anyone who touches the floor goes back to the start. Adults included.' },
    { meta: '5 minutes, outdoors', title: 'Shadow drawing', body: 'Stand a toy in the sun on a sheet of paper. Trace the shadow. Come back an hour later and trace it again.' },
    { meta: '10 minutes, no mess', title: 'Twenty questions in Arabic', body: 'Pick an object in the room. They ask yes or no questions. Every question they try in Arabic is worth two.' },
    { meta: '30 minutes, kitchen', title: 'Bake by weight', body: 'Give them the scale and the recipe and stand back. Reading the numbers is the whole activity.' },
    { meta: '15 minutes, needs cups', title: 'Cup tower physics', body: 'Ten paper cups. Build the tallest tower that survives a book placed on top of it.' },
    { meta: '10 minutes, needs paper', title: 'Postcard to a grandparent', body: 'One drawing, three sentences, a real stamp. Handwriting practice that arrives somewhere.' },
    { meta: '20 minutes, outdoors', title: 'Colour hunt', body: 'Find nine things outside, one for every colour on a made-up list. Photos count, picking flowers does not.' },
    { meta: '5 minutes, no mess', title: 'Story ping pong', body: 'You say one sentence, they say the next. It has to include a camel and it has to end badly.' },
    { meta: '15 minutes, needs string', title: 'Knot school', body: 'Learn one real knot from the diagram on the box. Then teach it to whoever is nearest, hands only.' }
  ];

  var spinBtn = document.getElementById('spinBtn');
  var ticket = document.getElementById('ticket');
  var ticketEmpty = document.getElementById('ticketEmpty');
  var ticketResult = document.getElementById('ticketResult');
  var lastIndex = -1;

  if (spinBtn && ticket) {
    spinBtn.addEventListener('click', function () {
      var i = lastIndex;
      while (i === lastIndex) { i = Math.floor(Math.random() * activities.length); }
      lastIndex = i;
      var pick = activities[i];

      var paint = function () {
        ticketEmpty.hidden = true;
        ticketResult.hidden = false;
        document.getElementById('ticketMeta').textContent = pick.meta;
        document.getElementById('ticketTitle').textContent = pick.title;
        document.getElementById('ticketBody').textContent = pick.body;
      };

      if (reduceMotion) { paint(); return; }

      ticket.classList.remove('is-flipping');
      void ticket.offsetWidth;
      ticket.classList.add('is-flipping');
      window.setTimeout(paint, 220);
      spinBtn.textContent = 'Give me another';
    });
  }

  /* ------------------------------------------------------------ confetti */
  var layer = document.getElementById('confettiLayer');
  var colours = ['#FF6A3D', '#FFC53D', '#2FBBE0', '#35B98B', '#F2568F'];

  function burst(x, y) {
    if (!layer || reduceMotion) { return; }
    for (var i = 0; i < 26; i++) {
      var bit = document.createElement('span');
      bit.className = 'confetti-bit';
      bit.style.left = x + 'px';
      bit.style.top = y + 'px';
      bit.style.background = colours[i % colours.length];
      layer.appendChild(bit);

      var angle = (Math.PI * 2 * i) / 26 + Math.random() * 0.5;
      var distance = 90 + Math.random() * 150;
      bit.animate([
        { transform: 'translate(-50%, -50%) rotate(0deg)', opacity: 1 },
        {
          transform: 'translate(' + (Math.cos(angle) * distance - 50) + '%, ' +
            (Math.sin(angle) * distance + 260) + '%) rotate(' + (Math.random() * 720 - 360) + 'deg)',
          opacity: 0
        }
      ], {
        duration: 900 + Math.random() * 500,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards'
      }).onfinish = function () { this.effect.target.remove(); };
    }
  }

  document.querySelectorAll('[data-confetti]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var r = el.getBoundingClientRect();
      burst(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2);
    });
  });

  /* ---------------------------------------------------------------- form */
  var form = document.getElementById('joinForm');
  var done = document.getElementById('joinDone');
  var status = document.getElementById('formStatus');
  var submit = document.getElementById('joinSubmit');

  function showError(name, message) {
    var input = form.elements[name];
    var box = form.querySelector('[data-err-for="' + name + '"]');
    input.closest('.field').classList.add('has-error');
    input.setAttribute('aria-invalid', 'true');
    box.textContent = message;
    box.hidden = false;
  }

  function clearError(name) {
    var input = form.elements[name];
    var box = form.querySelector('[data-err-for="' + name + '"]');
    input.closest('.field').classList.remove('has-error');
    input.removeAttribute('aria-invalid');
    box.hidden = true;
  }

  if (form) {
    ['parentName', 'parentEmail', 'childAge'].forEach(function (name) {
      form.elements[name].addEventListener('input', function () { clearError(name); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;

      if (!form.elements.parentName.value.trim()) {
        showError('parentName', 'We need a name for the delivery note.');
        ok = false;
      }
      var email = form.elements.parentEmail.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        showError('parentEmail', 'That email does not look right yet.');
        ok = false;
      }
      if (!form.elements.childAge.value) {
        showError('childAge', 'Pick an age so we send the right box.');
        ok = false;
      }
      if (!ok) {
        status.textContent = 'Almost there, check the fields above.';
        form.querySelector('.has-error input, .has-error select').focus();
        return;
      }

      submit.disabled = true;
      submit.textContent = 'Packing your box';
      status.textContent = '';

      window.setTimeout(function () {
        var name = form.elements.parentName.value.trim().split(' ')[0];
        var labels = { '2-4': 'little hands', '5-7': 'makers', '8-11': 'inventors' };
        var label = labels[form.elements.childAge.value] || 'first';
        document.getElementById('joinDoneMsg').textContent =
          'Thanks ' + name + '. The first ' + label + ' box ships next Tuesday.';
        form.hidden = true;
        done.hidden = false;
        var r = done.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + 80);
      }, 900);
    });

    document.getElementById('joinReset').addEventListener('click', function () {
      form.reset();
      form.hidden = false;
      done.hidden = true;
      submit.disabled = false;
      submit.textContent = 'Start a box';
      form.elements.parentName.focus();
    });
  }
})();
