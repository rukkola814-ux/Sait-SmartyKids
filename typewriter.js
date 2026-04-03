/**
 * Эффект печати для главного заголовка (адаптация TextType / GSAP-курсора на ванильный JS + CSS).
 */
(function () {
  var root = document.getElementById("hero-typewriter");
  if (!root) return;

  var cursor = document.getElementById("hero-typewriter-cursor");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var texts = [
    "Гармоничное развитие ребёнка без перегрузок",
    "Осознанное развитие в мини-группах 4–6",
    "Язык, интеллект и творчество — без перегрузок",
  ];

  var typingSpeed = 55;
  var pauseDuration = 2300;
  var deletingSpeed = 40;
  var initialDelay = 500;
  var loop = true;
  var cursorChar = "_";

  if (cursor) cursor.textContent = cursorChar;

  if (reduced) {
    root.textContent = texts[0];
    if (cursor) cursor.hidden = true;
    return;
  }

  var currentIndex = 0;
  var charIndex = 0;
  var isDeleting = false;
  var displayed = "";

  function schedule(fn, ms) {
    return window.setTimeout(fn, ms);
  }

  function step() {
    var full = texts[currentIndex];

    if (isDeleting) {
      if (displayed.length === 0) {
        isDeleting = false;
        if (!loop && currentIndex === texts.length - 1) {
          if (cursor) cursor.classList.add("text-type__cursor--hidden");
          return;
        }
        currentIndex = loop ? (currentIndex + 1) % texts.length : currentIndex + 1;
        if (!loop && currentIndex >= texts.length) {
          if (cursor) cursor.classList.add("text-type__cursor--hidden");
          return;
        }
        charIndex = 0;
        schedule(step, pauseDuration);
        return;
      }
      displayed = displayed.slice(0, -1);
      root.textContent = displayed;
      schedule(step, deletingSpeed);
      return;
    }

    if (charIndex < full.length) {
      displayed = full.slice(0, charIndex + 1);
      root.textContent = displayed;
      charIndex++;
      schedule(step, typingSpeed);
      return;
    }

    schedule(function () {
      isDeleting = true;
      step();
    }, pauseDuration);
  }

  schedule(step, initialDelay);
})();
