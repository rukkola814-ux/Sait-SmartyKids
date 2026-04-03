(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.06 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  var inner = document.querySelector(".hero__figure-inner");
  var hero = document.querySelector(".hero");
  if (!inner || !hero) return;

  var raf = 0;
  function parallax() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      var rect = hero.getBoundingClientRect();
      var vh = window.innerHeight || 1;
      if (rect.bottom < 0 || rect.top > vh) return;
      var t = Math.min(1, Math.max(0, 1 - rect.top / (vh * 0.85)));
      inner.style.setProperty("--hero-parallax", (t * 20).toFixed(1) + "px");
    });
  }

  window.addEventListener("scroll", parallax, { passive: true });
  parallax();
})();
