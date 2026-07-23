(function () {
  "use strict";

  var overlay = document.getElementById("envelope-overlay");
  var seal = document.getElementById("waxSeal");

  document.body.classList.add("locked");

  function openInvitation() {
    if (overlay.classList.contains("opening")) return;

    seal.classList.add("breaking");
    seal.disabled = true;
    overlay.classList.add("opening");

    setTimeout(function () {
      overlay.classList.add("opened");
      document.body.classList.remove("locked");
    }, 350);
  }

  overlay.addEventListener("click", openInvitation);

  // ================= RSVP form: submit without leaving the page =================
  var rsvpForm = document.getElementById("rsvpForm");
  if (rsvpForm) {
    rsvpForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var submitBtn = rsvpForm.querySelector(".submit-btn");
      if (submitBtn) submitBtn.disabled = true;

      var body = new URLSearchParams(new FormData(rsvpForm)).toString();

      fetch(rsvpForm.action || window.location.pathname, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body
      }).catch(function (err) {
        console.warn("RSVP submission request failed:", err);
      }).finally(function () {
        rsvpForm.hidden = true;
        var intro = document.getElementById("rsvpIntro");
        if (intro) intro.hidden = true;
        var thanks = document.getElementById("rsvpThanks");
        if (thanks) thanks.hidden = false;
      });
    });
  }

  // Scroll-reveal for content sections
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  // ================= Ambient garden layer: butterflies + petals =================
  var fxLayer = document.getElementById("fx-layer");
  if (fxLayer) {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    window.addEventListener("resize", function () {
      vw = window.innerWidth;
      vh = window.innerHeight;
    });

    var butterflyDefs = [
      { lane: 0.08, amp: 24, freq: 0.0021, phase: 0.0,  speed: 0.55, color: "var(--blush-deep)" },
      { lane: 0.5,  amp: 46, freq: 0.0016, phase: 2.1,  speed: 0.82, color: "var(--gold)" },
      { lane: 0.92, amp: 22, freq: 0.0024, phase: 4.2,  speed: 0.68, color: "var(--sage)" }
    ];

    var butterflies = butterflyDefs.map(function (def) {
      var el = document.createElement("div");
      el.className = "butterfly";
      el.style.color = def.color;
      el.innerHTML = '<svg viewBox="0 0 60 40"><use href="#motif-butterfly"></use></svg>';
      fxLayer.appendChild(el);
      return { def: def, el: el, x: 0, y: 0, lastTrailY: null };
    });

    var wrap = vh + 220;

    function positionButterflies() {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      butterflies.forEach(function (b) {
        var travel = (scrollY * b.def.speed + b.def.phase * 300) % wrap;
        var y = travel - 110;
        var x = b.def.lane * vw + Math.sin(scrollY * b.def.freq + b.def.phase) * b.def.amp;
        var prevX = b.x, prevY = b.y;
        b.x = x; b.y = y;
        var tilt = Math.cos(scrollY * b.def.freq + b.def.phase) * 18;
        b.el.style.transform = "translate(" + x + "px, " + y + "px) rotate(" + tilt + "deg)";

        if (b.lastTrailY === null || Math.abs(scrollY - b.lastScrollY) > 14) {
          spawnGlitter(x, y);
          b.lastTrailY = y;
          b.lastScrollY = scrollY;
        }
      });
    }

    function spawnGlitter(x, y) {
      var dot = document.createElement("span");
      dot.className = "glitter";
      dot.style.transform = "translate(" + (x + 14) + "px, " + (y + 22) + "px)";
      fxLayer.appendChild(dot);
      requestAnimationFrame(function () {
        dot.style.left = (x + 14) + "px";
        dot.style.top = (y + 22) + "px";
        dot.style.transform = "translate(-50%, -50%) scale(1)";
        setTimeout(function () { dot.classList.add("fade"); }, 40);
      });
      setTimeout(function () {
        if (dot.parentNode) dot.parentNode.removeChild(dot);
      }, 800);
    }

    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          positionButterflies();
          ticking = false;
        });
      }
    }, { passive: true });

    positionButterflies();

    // Occasional falling petals for a dreamy touch
    function spawnPetal() {
      var petal = document.createElement("div");
      petal.className = "petal";
      var startX = Math.random() * vw;
      var drift = (Math.random() - 0.5) * 160;
      var duration = 7 + Math.random() * 5;
      petal.style.left = startX + "px";
      petal.style.setProperty("--drift", drift + "px");
      petal.style.animationDuration = duration + "s";
      petal.style.opacity = String(0.6 + Math.random() * 0.3);
      fxLayer.appendChild(petal);
      petal.addEventListener("animationend", function () {
        if (petal.parentNode) petal.parentNode.removeChild(petal);
      });
    }

    function schedulePetal() {
      var delay = 3500 + Math.random() * 4500;
      setTimeout(function () {
        spawnPetal();
        schedulePetal();
      }, delay);
    }
    schedulePetal();
  }

  // ================= RSVP countdown =================
  var countdown = document.getElementById("countdown");
  if (countdown) {
    var weddingDate = new Date(countdown.dataset.wedding).getTime();
    var cdDays = document.getElementById("cdDays");
    var cdHours = document.getElementById("cdHours");
    var cdMins = document.getElementById("cdMins");
    var cdSecs = document.getElementById("cdSecs");

    function pad(n) { return String(n).padStart(2, "0"); }

    function tickCountdown() {
      var diff = weddingDate - Date.now();
      if (diff <= 0) {
        cdDays.textContent = "00";
        cdHours.textContent = "00";
        cdMins.textContent = "00";
        cdSecs.textContent = "00";
        clearInterval(countdownTimer);
        return;
      }
      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff % 86400000) / 3600000);
      var mins = Math.floor((diff % 3600000) / 60000);
      var secs = Math.floor((diff % 60000) / 1000);
      cdDays.textContent = pad(days);
      cdHours.textContent = pad(hours);
      cdMins.textContent = pad(mins);
      cdSecs.textContent = pad(secs);
    }

    tickCountdown();
    var countdownTimer = setInterval(tickCountdown, 1000);
  }
})();
