/**
 * TargetCursor — адаптация под статический сайт (GSAP с CDN, без React).
 * Параметры как в примере: spinDuration 2, hideDefaultCursor, parallaxOn, hoverDuration 0.2
 */
(function () {
  if (typeof gsap === "undefined") return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  function isMobile() {
    var touch = "ontouchstart" in window || (navigator.maxTouchPoints || 0) > 0;
    var small = window.innerWidth <= 768;
    var ua = (navigator.userAgent || navigator.vendor || "").toLowerCase();
    var re = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    return (touch && small) || re.test(ua);
  }

  if (isMobile()) return;

  var opts = {
    targetSelector:
      ".btn, .logo, .nav a, .card, .tag, .hero__figure, .review, .qa-item, .faq-item summary, .step, .tc-nav, .tc-dot",
    spinDuration: 2,
    hideDefaultCursor: true,
    hoverDuration: 0.2,
    parallaxOn: true,
  };

  var borderWidth = 3;
  var cornerSize = 12;

  var cursorEl = document.createElement("div");
  cursorEl.className = "target-cursor-wrapper";
  cursorEl.setAttribute("aria-hidden", "true");
  cursorEl.innerHTML =
    '<div class="target-cursor-dot"></div>' +
    '<div class="target-cursor-corner corner-tl"></div>' +
    '<div class="target-cursor-corner corner-tr"></div>' +
    '<div class="target-cursor-corner corner-br"></div>' +
    '<div class="target-cursor-corner corner-bl"></div>';
  document.body.appendChild(cursorEl);

  var dotEl = cursorEl.querySelector(".target-cursor-dot");
  var corners = cursorEl.querySelectorAll(".target-cursor-corner");

  var spinTl = null;
  var activeTarget = null;
  var currentLeaveHandler = null;
  var resumeTimeout = null;
  var targetCornerPositions = null;
  var activeStrength = { current: 0 };
  var strengthTween = null;

  function moveCursor(x, y) {
    gsap.to(cursorEl, {
      x: x,
      y: y,
      duration: 0.1,
      ease: "power3.out",
    });
  }

  function createSpinTimeline() {
    if (spinTl) spinTl.kill();
    spinTl = gsap
      .timeline({ repeat: -1 })
      .to(cursorEl, { rotation: "+=360", duration: opts.spinDuration, ease: "none" });
  }

  gsap.set(cursorEl, {
    xPercent: -50,
    yPercent: -50,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  createSpinTimeline();

  function tickerFn() {
    if (!targetCornerPositions || !corners.length) return;
    var strength = activeStrength.current;
    if (strength === 0) return;

    var cursorX = gsap.getProperty(cursorEl, "x");
    var cursorY = gsap.getProperty(cursorEl, "y");

    corners.forEach(function (corner, i) {
      var currentX = gsap.getProperty(corner, "x");
      var currentY = gsap.getProperty(corner, "y");
      var targetX = targetCornerPositions[i].x - cursorX;
      var targetY = targetCornerPositions[i].y - cursorY;
      var finalX = currentX + (targetX - currentX) * strength;
      var finalY = currentY + (targetY - currentY) * strength;
      var duration = strength >= 0.99 ? (opts.parallaxOn ? 0.2 : 0) : 0.05;

      gsap.to(corner, {
        x: finalX,
        y: finalY,
        duration: duration,
        ease: duration === 0 ? "none" : "power1.out",
        overwrite: "auto",
      });
    });
  }

  function cleanupTarget(target) {
    if (currentLeaveHandler && target) {
      target.removeEventListener("mouseleave", currentLeaveHandler);
    }
    currentLeaveHandler = null;
  }

  function moveHandler(e) {
    moveCursor(e.clientX, e.clientY);
  }

  function scrollHandler() {
    if (!activeTarget) return;
    var mouseX = gsap.getProperty(cursorEl, "x");
    var mouseY = gsap.getProperty(cursorEl, "y");
    var under = document.elementFromPoint(mouseX, mouseY);
    var sel = opts.targetSelector;
    var still =
      under &&
      (under === activeTarget ||
        (under.closest && under.closest(sel) === activeTarget));
    if (!still && currentLeaveHandler) {
      currentLeaveHandler();
    }
  }

  function mouseDownHandler() {
    if (!dotEl) return;
    gsap.to(dotEl, { scale: 0.7, duration: 0.3 });
    gsap.to(cursorEl, { scale: 0.9, duration: 0.2 });
  }

  function mouseUpHandler() {
    if (!dotEl) return;
    gsap.to(dotEl, { scale: 1, duration: 0.3 });
    gsap.to(cursorEl, { scale: 1, duration: 0.2 });
  }

  function enterHandler(e) {
    var direct = e.target;
    var all = [];
    var cur = direct;
    var sel = opts.targetSelector;
    while (cur && cur !== document.body) {
      try {
        if (cur.matches && cur.matches(sel)) all.push(cur);
      } catch (err) {
        break;
      }
      cur = cur.parentElement;
    }
    var target = all[0] || null;
    if (!target) return;
    if (activeTarget === target) return;

    gsap.ticker.remove(tickerFn);
    if (activeTarget) cleanupTarget(activeTarget);
    if (resumeTimeout) {
      clearTimeout(resumeTimeout);
      resumeTimeout = null;
    }

    activeTarget = target;
    corners.forEach(function (corner) {
      gsap.killTweensOf(corner);
    });

    gsap.killTweensOf(cursorEl, "rotation");
    if (spinTl) spinTl.pause();
    gsap.set(cursorEl, { rotation: 0 });

    var rect = target.getBoundingClientRect();
    var cursorX = gsap.getProperty(cursorEl, "x");
    var cursorY = gsap.getProperty(cursorEl, "y");

    targetCornerPositions = [
      { x: rect.left - borderWidth, y: rect.top - borderWidth },
      {
        x: rect.right + borderWidth - cornerSize,
        y: rect.top - borderWidth,
      },
      {
        x: rect.right + borderWidth - cornerSize,
        y: rect.bottom + borderWidth - cornerSize,
      },
      {
        x: rect.left - borderWidth,
        y: rect.bottom + borderWidth - cornerSize,
      },
    ];

    gsap.ticker.add(tickerFn);

    if (strengthTween) strengthTween.kill();
    activeStrength.current = 0;
    strengthTween = gsap.to(activeStrength, {
      current: 1,
      duration: opts.hoverDuration,
      ease: "power2.out",
    });

    corners.forEach(function (corner, i) {
      gsap.to(corner, {
        x: targetCornerPositions[i].x - cursorX,
        y: targetCornerPositions[i].y - cursorY,
        duration: 0.2,
        ease: "power2.out",
      });
    });

    function leaveHandler() {
      gsap.ticker.remove(tickerFn);
      targetCornerPositions = null;
      if (strengthTween) strengthTween.kill();
      gsap.set(activeStrength, { current: 0, overwrite: true });
      activeTarget = null;

      gsap.killTweensOf(corners);
      var positions = [
        { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
        { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
        { x: cornerSize * 0.5, y: cornerSize * 0.5 },
        { x: -cornerSize * 1.5, y: cornerSize * 0.5 },
      ];
      var tl = gsap.timeline();
      corners.forEach(function (corner, index) {
        tl.to(
          corner,
          {
            x: positions[index].x,
            y: positions[index].y,
            duration: 0.3,
            ease: "power3.out",
          },
          0
        );
      });

      resumeTimeout = setTimeout(function () {
        if (!activeTarget && cursorEl && spinTl) {
          var currentRotation = gsap.getProperty(cursorEl, "rotation");
          var normalizedRotation = currentRotation % 360;
          spinTl.kill();
          spinTl = gsap
            .timeline({ repeat: -1 })
            .to(cursorEl, {
              rotation: "+=360",
              duration: opts.spinDuration,
              ease: "none",
            });
          gsap.to(cursorEl, {
            rotation: normalizedRotation + 360,
            duration: opts.spinDuration * (1 - normalizedRotation / 360),
            ease: "none",
            onComplete: function () {
              if (spinTl) spinTl.restart();
            },
          });
        }
        resumeTimeout = null;
      }, 50);

      cleanupTarget(target);
    }

    currentLeaveHandler = leaveHandler;
    target.addEventListener("mouseleave", leaveHandler);
  }

  var originalCursor = document.body.style.cursor;
  if (opts.hideDefaultCursor) {
    document.body.style.cursor = "none";
  }

  window.addEventListener("mousemove", moveHandler);
  window.addEventListener("mouseover", enterHandler, { passive: true });
  window.addEventListener("scroll", scrollHandler, { passive: true });
  window.addEventListener("mousedown", mouseDownHandler);
  window.addEventListener("mouseup", mouseUpHandler);

  window.addEventListener(
    "beforeunload",
    function () {
      gsap.ticker.remove(tickerFn);
      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("mouseover", enterHandler);
      window.removeEventListener("scroll", scrollHandler);
      window.removeEventListener("mousedown", mouseDownHandler);
      window.removeEventListener("mouseup", mouseUpHandler);
      if (activeTarget) cleanupTarget(activeTarget);
      if (spinTl) spinTl.kill();
      document.body.style.cursor = originalCursor;
      if (cursorEl.parentNode) cursorEl.parentNode.removeChild(cursorEl);
    },
    { once: true }
  );
})();
