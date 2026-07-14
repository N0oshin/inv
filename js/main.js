(function () {
  "use strict";

  var overlay = document.getElementById("envelope-overlay");
  var envelope = document.getElementById("envelope");
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

    setTimeout(function () {
      overlay.classList.add("opened");
      document.body.classList.remove("locked");
    }, 1900);
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
})();
