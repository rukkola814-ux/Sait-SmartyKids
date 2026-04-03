/**
 * Карусель отзывов: стопка из 3 карточек, свайп (как |offset| > 100), стрелки, точки.
 */
(function () {
  var root = document.querySelector("[data-reviews-carousel]");
  if (!root) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var testimonials = [
    {
      id: 1,
      name: "Дмитрий, папа Алены и Юлии",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=faces",
      description:
        "«С удовольствием ходим в этот центр, уже не первый год. Редкий случай, когда преподаватели действительно заинтересованы в занятиях и получают от них удовольствие. Дети это чувствуют и посещают занятия с энтузиазмом, раскрываются на них.»",
    },
    {
      id: 2,
      name: "Александр, папа Даниила",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=faces",
      description:
        "«Прекрасный центр. Небольшой, но очень уютный центр. Ребёнок ходит с удовольствием, и это самое главное. Педагоги заинтересованы дать максимум знаний. Нам нравится атмосфера центра.»",
    },
    {
      id: 3,
      name: "Елена, мама Софии",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=faces",
      description:
        "«Нам важно, чтобы дочь не перегорала от занятий. Здесь бережный подход и понятная обратная связь — видим, как она стала увереннее.»",
    },
  ];

  var n = testimonials.length;
  var currentIndex = 0;
  var exitX = 0;
  var dragX = 0;
  var stageEl;
  var dotsEl;

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function escapeAttr(s) {
    return String(s).replace(/"/g, "&quot;");
  }

  function idx(k) {
    return (currentIndex + k + n) % n;
  }

  function transformFor(stackPos, exit, drag) {
    var isCurrent = stackPos === 0;
    var isPrev = stackPos === 1;
    var isNext = stackPos === 2;
    var y = isCurrent ? 0 : isPrev ? 8 : 16;
    var scale = isCurrent ? 1 : 0.95;
    var op = isCurrent ? 1 : isPrev ? 0.62 : 0.34;
    var rot = isCurrent ? (exit + drag) / 20 : isPrev ? -2 : -4;
    var tx = isCurrent ? exit + drag : 0;
    return {
      transform:
        "translateX(" +
        tx +
        "px) translateY(" +
        y +
        "px) scale(" +
        scale +
        ") rotate(" +
        rot +
        "deg)",
      opacity: String(op),
    };
  }

  function applyTransforms() {
    if (!stageEl) return;
    var cards = stageEl.querySelectorAll(".tc-card");
    for (var s = 0; s < 3; s++) {
      if (!cards[s]) continue;
      var t = transformFor(s, exitX, dragX);
      cards[s].style.transform = t.transform;
      cards[s].style.opacity = t.opacity;
    }
  }

  function renderCards() {
    if (!stageEl) return;
    stageEl.innerHTML = "";
    for (var stackPos = 0; stackPos < 3; stackPos++) {
      var ti = idx(stackPos);
      var t = testimonials[ti];
      var isCurrent = stackPos === 0;
      var z = isCurrent ? 3 : stackPos === 1 ? 2 : 1;
      var card = document.createElement("article");
      card.className = "tc-card" + (isCurrent ? " tc-card--current" : "");
      card.dataset.testimonialId = String(t.id);
      card.style.zIndex = String(z);
      var tr = transformFor(stackPos, exitX, dragX);
      card.style.transform = tr.transform;
      card.style.opacity = tr.opacity;
      card.style.transition = isCurrent ? "transform 0.2s ease, opacity 0.2s ease" : "";

      if (isCurrent) {
        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "group");
      }

      var arrows = isCurrent
        ? '<div class="tc-arrows">' +
          '<button type="button" class="tc-nav tc-nav--prev" aria-label="Предыдущий отзыв">&larr;</button>' +
          '<button type="button" class="tc-nav tc-nav--next" aria-label="Следующий отзыв">&rarr;</button>' +
          "</div>"
        : "";

      card.innerHTML =
        arrows +
        '<div class="tc-card__body">' +
        '<img class="tc-card__avatar" src="' +
        escapeAttr(t.avatar) +
        '" alt="" width="64" height="64" loading="lazy" decoding="async">' +
        '<h3 class="tc-card__name">' +
        escapeHtml(t.name) +
        "</h3>" +
        '<p class="tc-card__text">' +
        escapeHtml(t.description) +
        "</p>" +
        "</div>";

      if (isCurrent && !reduced) {
        card.addEventListener("pointerdown", onPointerDown);
      }

      stageEl.appendChild(card);
    }

    var prevBtn = stageEl.querySelector(".tc-nav--prev");
    var nextBtn = stageEl.querySelector(".tc-nav--next");
    if (prevBtn)
      prevBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        go(-1);
      });
    if (nextBtn)
      nextBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        go(1);
      });

    var live = stageEl.querySelector(".tc-card--current .tc-card__text");
    if (live) root.setAttribute("aria-label", "Отзывы родителей. " + (live.textContent || "").slice(0, 100) + "…");
  }

  function go(delta) {
    currentIndex = (currentIndex + delta + n) % n;
    exitX = 0;
    dragX = 0;
    renderCards();
    updateDots();
  }

  function onPointerDown(e) {
    if (e.button !== 0) return;
    var card = e.currentTarget;
    card.setPointerCapture(e.pointerId);
    dragX = 0;
    var startX = e.clientX;
    card.classList.add("tc-card--dragging");
    card.style.transition = "none";

    function move(ev) {
      dragX = ev.clientX - startX;
      applyTransforms();
    }

    function up(ev) {
      try {
        card.releasePointerCapture(ev.pointerId);
      } catch (err) {}
      card.classList.remove("tc-card--dragging");
      card.style.transition = "";
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerup", up);
      card.removeEventListener("pointercancel", up);

      if (Math.abs(dragX) > 100) {
        exitX = dragX;
        dragX = 0;
        applyTransforms();
        window.setTimeout(function () {
          currentIndex = (currentIndex + 1) % n;
          exitX = 0;
          renderCards();
          updateDots();
        }, 200);
      } else {
        dragX = 0;
        exitX = 0;
        renderCards();
      }
    }

    card.addEventListener("pointermove", move);
    card.addEventListener("pointerup", up);
    card.addEventListener("pointercancel", up);
  }

  function updateDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = "";
    testimonials.forEach(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "tc-dot" + (i === currentIndex ? " is-active" : "");
      b.setAttribute("aria-label", "Показать отзыв " + (i + 1));
      b.addEventListener("click", function () {
        currentIndex = i;
        exitX = 0;
        dragX = 0;
        renderCards();
        updateDots();
      });
      dotsEl.appendChild(b);
    });
  }

  if (reduced) {
    root.innerHTML =
      '<ul class="tc-list">' +
      testimonials
        .map(function (t) {
          return (
            "<li class=\"tc-list__item\"><blockquote><p>" +
            escapeHtml(t.description) +
            "</p><footer>— " +
            escapeHtml(t.name) +
            "</footer></blockquote></li>"
          );
        })
        .join("") +
      "</ul>";
    return;
  }

  root.innerHTML =
    '<p class="tc-hint">Листайте стрелками или перетащите верхнюю карточку</p>' +
    '<div class="tc-viewport">' +
    '<div class="tc-stage"></div>' +
    "</div>" +
    '<div class="tc-dots" role="tablist" aria-label="Выбор отзыва"></div>';

  stageEl = root.querySelector(".tc-stage");
  dotsEl = root.querySelector(".tc-dots");
  renderCards();
  updateDots();
})();
