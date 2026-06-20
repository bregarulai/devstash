/* ============================================================
   DevStash Homepage Mockup — script.js
   Chaos icon animation, navbar, reveal, pricing toggle
   ============================================================ */

(function () {
  'use strict';

  // ---------- Footer year ----------
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Navbar: opacity on scroll + mobile toggle ----------
  var navbar = document.getElementById('navbar');
  var navToggle = document.getElementById('navToggle');
  var navMobile = document.getElementById('navMobile');

  function onScroll() {
    if (!navbar) return;
    if (window.scrollY > 24) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', function () {
      var open = navToggle.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navMobile.hidden = !open;
    });
    navMobile.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navMobile.hidden = true;
      });
    });
  }

  // ---------- Reveal on scroll ----------
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // ---------- Pricing toggle ----------
  var toggleBtns = Array.prototype.slice.call(document.querySelectorAll('.toggle-btn'));
  var proMonthly = document.querySelector('[data-pro-monthly]');
  var proYearly = document.querySelector('[data-pro-yearly]');
  var proPer = document.querySelector('[data-pro-per]');

  toggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var billing = btn.getAttribute('data-billing');
      toggleBtns.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
      if (billing === 'yearly') {
        if (proMonthly) proMonthly.classList.add('hidden');
        if (proYearly) proYearly.classList.remove('hidden');
        if (proPer) proPer.textContent = '/year';
      } else {
        if (proMonthly) proMonthly.classList.remove('hidden');
        if (proYearly) proYearly.classList.add('hidden');
        if (proPer) proPer.textContent = '/mo';
      }
    });
  });

  // ---------- Chaos icon animation ----------
  var stage = document.getElementById('chaosStage');
  if (!stage) return;

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var icons = Array.prototype.slice.call(stage.querySelectorAll('.chaos-icon'));

  var stageW = 0, stageH = 0;
  var mouse = { x: -9999, y: -9999, active: false };
  var REPULSE_RADIUS = 110;
  var REPULSE_STRENGTH = 0.55;

  function measure() {
    var rect = stage.getBoundingClientRect();
    stageW = rect.width;
    stageH = rect.height;
  }

  var particles = icons.map(function (icon, i) {
    var size = 58;
    var cols = 4;
    var row = Math.floor(i / cols);
    var col = i % cols;
    return {
      el: icon,
      size: size,
      x: 0, y: 0,
      vx: (Math.random() - 0.5) * 1.1,
      vy: (Math.random() - 0.5) * 1.1,
      rot: (Math.random() - 0.5) * 16,
      vrot: (Math.random() - 0.5) * 0.6,
      scale: 1,
      vscale: 0,
      phase: Math.random() * Math.PI * 2,
      homeCol: col,
      homeRow: row,
    };
  });

  function placeInitial() {
    measure();
    var pad = 10;
    var usableW = stageW - pad * 2;
    var usableH = stageH - pad * 2;
    var cols = Math.min(4, particles.length);
    var rows = Math.ceil(particles.length / cols);
    var cellW = usableW / cols;
    var cellH = usableH / rows;
    particles.forEach(function (p) {
      var cx = pad + p.homeCol * cellW + cellW / 2 + (Math.random() - 0.5) * 18;
      var cy = pad + p.homeRow * cellH + cellH / 2 + (Math.random() - 0.5) * 18;
      p.x = Math.max(pad, Math.min(stageW - p.size - pad, cx - p.size / 2));
      p.y = Math.max(pad, Math.min(stageH - p.size - pad, cy - p.size / 2));
    });
  }

  function step() {
    particles.forEach(function (p) {
      // Drift
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      p.phase += 0.04;
      p.scale = 1 + Math.sin(p.phase) * 0.06;

      // Bounce off walls
      if (p.x <= 0) { p.x = 0; p.vx = Math.abs(p.vx); }
      if (p.x + p.size >= stageW) { p.x = stageW - p.size; p.vx = -Math.abs(p.vx); }
      if (p.y <= 0) { p.y = 0; p.vy = Math.abs(p.vy); }
      if (p.y + p.size >= stageH) { p.y = stageH - p.size; p.vy = -Math.abs(p.vy); }

      // Mouse repulsion
      if (mouse.active) {
        var cx = p.x + p.size / 2;
        var cy = p.y + p.size / 2;
        var dx = cx - mouse.x;
        var dy = cy - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPULSE_RADIUS && dist > 0.001) {
          var force = (1 - dist / REPULSE_RADIUS) * REPULSE_STRENGTH;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }

      // Cap velocity to keep things calm
      var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      var maxSpeed = 2.2;
      if (speed > maxSpeed) {
        p.vx = (p.vx / speed) * maxSpeed;
        p.vy = (p.vy / speed) * maxSpeed;
      }
      // Gentle friction toward base drift
      p.vx *= 0.992;
      p.vy *= 0.992;
      if (Math.abs(p.vx) < 0.2) p.vx += (Math.random() - 0.5) * 0.05;
      if (Math.abs(p.vy) < 0.2) p.vy += (Math.random() - 0.5) * 0.05;

      // Clamp rotation range
      if (p.rot > 18 || p.rot < -18) p.vrot *= -1;

      p.el.style.transform =
        'translate(' + p.x.toFixed(2) + 'px, ' + p.y.toFixed(2) + 'px) ' +
        'rotate(' + p.rot.toFixed(2) + 'deg) scale(' + p.scale.toFixed(3) + ')';
    });
    requestAnimationFrame(step);
  }

  function onMove(e) {
    var rect = stage.getBoundingClientRect();
    var cx, cy;
    if (e.touches && e.touches[0]) {
      cx = e.touches[0].clientX;
      cy = e.touches[0].clientY;
    } else {
      cx = e.clientX;
      cy = e.clientY;
    }
    mouse.x = cx - rect.left;
    mouse.y = cy - rect.top;
    mouse.active = mouse.x >= 0 && mouse.x <= stageW && mouse.y >= 0 && mouse.y <= stageH;
  }
  function onLeave() { mouse.active = false; mouse.x = -9999; mouse.y = -9999; }

  stage.addEventListener('mousemove', onMove);
  stage.addEventListener('mouseleave', onLeave);
  stage.addEventListener('touchmove', onMove, { passive: true });
  stage.addEventListener('touchend', onLeave);

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(placeInitial, 120);
  });

  placeInitial();
  if (!prefersReduced) {
    requestAnimationFrame(step);
  } else {
    // Static layout only
    particles.forEach(function (p) {
      p.el.style.transform = 'translate(' + p.x + 'px, ' + p.y + 'px)';
    });
  }
})();
