(function () {
  "use strict";

  var overlay = document.getElementById("envelope-overlay");
  var envelope = document.getElementById("envelope");
  var envelopeBody = document.getElementById("envelopeBody");
  var seal = document.getElementById("waxSeal");

  document.body.classList.add("locked");

  function openInvitation() {
    if (envelope.classList.contains("opening")) return;

    seal.classList.add("breaking");
    seal.disabled = true;

    setTimeout(function () {
      envelope.classList.add("opening");
      overlay.classList.add("opening");
    }, 350);

    var revealed = false;
    function reveal() {
      if (revealed) return;
      revealed = true;
      overlay.classList.add("opened");
      document.body.classList.remove("locked");
    }

    // Reveal exactly when the envelope has actually finished sliding away,
    // rather than guessing a fixed delay that can drift on slower devices.
    envelopeBody.addEventListener("transitionend", function (e) {
      if (e.propertyName === "transform") reveal();
    });
    setTimeout(reveal, 3200); // fallback in case transitionend never fires
  }

  seal.addEventListener("click", openInvitation);

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
})();
