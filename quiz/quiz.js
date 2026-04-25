(function () {
  var questions = [
    {
      question: "Что ребёнку нравится больше?",
      options: [
        { text: "Считать, решать задачи", type: "A" },
        { text: "Придумывать, фантазировать", type: "B" },
        { text: "Общаться, играть с другими", type: "C" },
      ],
    },
    {
      question: "Как он решает сложную задачу?",
      options: [
        { text: "Ищет логику, пробует варианты", type: "A" },
        { text: "Делает по-своему, нестандартно", type: "B" },
        { text: "Просит помощи или обсуждает", type: "C" },
      ],
    },
    {
      question: "Что даётся легче?",
      options: [
        { text: "Цифры и правила", type: "A" },
        { text: "Рисование, истории", type: "B" },
        { text: "Командные игры", type: "C" },
      ],
    },
    {
      question: "Как ведёт себя на занятиях?",
      options: [
        { text: "Сосредоточен, внимателен", type: "A" },
        { text: "Быстро теряет интерес", type: "B" },
        { text: "Активный, общительный", type: "C" },
      ],
    },
    {
      question: "Что чаще выбирает?",
      options: [
        { text: "Конструктор / задачи", type: "A" },
        { text: "Творчество", type: "B" },
        { text: "Игры с людьми", type: "C" },
      ],
    },
  ];

  var results = {
    A: {
      title: "Логик",
      description:
        "У вашего ребёнка выражено логическое мышление. Он хорошо справляется с задачами и анализом. Важно развивать гибкость мышления и поддерживать интерес к обучению.",
    },
    B: {
      title: "Творец",
      description:
        "Ребёнок мыслит нестандартно и креативно. Важно направить этот потенциал, чтобы он не терял интерес к обучению и мог реализовать свои идеи.",
    },
    C: {
      title: "Коммуникатор",
      description:
        "Ребёнок развивается через общение и взаимодействие. Важно создать среду, где это станет его сильной стороной.",
    },
  };

  var root = null;
  var questionContainer = null;
  var resultContainer = null;
  var progressFill = null;
  var progressText = null;
  var quizTitle = null;
  var quizSubtitle = null;
  var resultTitleEl = null;
  var resultDescEl = null;

  var currentQuestionIndex = 0;
  var answers = { A: 0, B: 0, C: 0 };
  var boundClick = false;

  function showQuestion(index) {
    var question = questions[index];
    if (!questionContainer) return;
    questionContainer.innerHTML =
      '<h2 class="fade-in">' +
      question.question +
      "</h2>" +
      '<div class="options">' +
      question.options
        .map(function (option) {
          return (
            '<div class="option-card" data-type="' +
            option.type +
            '">' +
            option.text +
            "</div>"
          );
        })
        .join("") +
      "</div>";
    updateProgress();
  }

  function selectOption(element) {
    var type = element.getAttribute("data-type");
    if (!type) return;
    answers[type]++;

    element.classList.add("selected");

    setTimeout(function () {
      currentQuestionIndex++;
      if (currentQuestionIndex < questions.length) {
        showQuestion(currentQuestionIndex);
      } else {
        showResult();
      }
    }, 1000);
  }

  function updateProgress() {
    if (!progressFill || !progressText) return;
    var progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressFill.style.width = progress + "%";
    progressText.textContent =
      currentQuestionIndex + 1 + "/" + questions.length;
  }

  function showResult() {
    var maxType = Object.keys(answers).reduce(function (a, b) {
      return answers[a] > answers[b] ? a : b;
    });
    var result = results[maxType];

    if (resultTitleEl) resultTitleEl.textContent = result.title;
    if (resultDescEl) resultDescEl.textContent = result.description;

    if (questionContainer) questionContainer.style.display = "none";
    if (resultContainer) {
      resultContainer.style.display = "block";
      resultContainer.classList.add("fade-in");
    }
    if (quizTitle) quizTitle.style.display = "none";
    if (quizSubtitle) quizSubtitle.style.display = "none";
  }

  function resetQuiz() {
    currentQuestionIndex = 0;
    answers = { A: 0, B: 0, C: 0 };

    if (resultContainer) {
      resultContainer.style.display = "none";
      resultContainer.classList.remove("fade-in");
    }
    if (questionContainer) questionContainer.style.display = "block";

    if (quizTitle) quizTitle.style.display = "block";
    if (quizSubtitle) quizSubtitle.style.display = "block";

    showQuestion(0);
  }

  function onQuestionClick(e) {
    var card = e.target.closest(".option-card");
    if (!card || card.classList.contains("selected")) return;
    selectOption(card);
  }

  function bind() {
    if (!questionContainer || boundClick) return;
    questionContainer.addEventListener("click", onQuestionClick);
    boundClick = true;

    var retryBtn = root.querySelector("[data-strengths-quiz-retry]");
    if (retryBtn) {
      retryBtn.addEventListener("click", function () {
        resetQuiz();
      });
    }

    var ctaBtn = root.querySelector("[data-strengths-quiz-cta]");
    if (ctaBtn) {
      ctaBtn.addEventListener("click", function () {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: "smartykids-open-diagnostic" }, "*");
          return;
        }
        if (typeof window.strengthsQuizCloseModal === "function") {
          window.strengthsQuizCloseModal();
        }
        var ctaLink = document.querySelector("#cta a.btn.btn--primary.btn--large");
        if (ctaLink) {
          ctaLink.click();
        } else {
          window.location.hash = "cta";
        }
      });
    }
  }

  function init(el) {
    root = el;
    questionContainer = document.getElementById("strengths-quiz-question-container");
    resultContainer = document.getElementById("strengths-quiz-result-container");
    progressFill = document.getElementById("strengths-quiz-progress-fill");
    progressText = document.getElementById("strengths-quiz-progress-text");
    quizTitle = document.getElementById("strengths-quiz-title");
    quizSubtitle = document.getElementById("strengths-quiz-subtitle");
    resultTitleEl = document.getElementById("strengths-quiz-result-title");
    resultDescEl = document.getElementById("strengths-quiz-result-description");

    if (!questionContainer || !progressFill) return;

    bind();
    resetQuiz();
  }

  window.strengthsQuizReset = resetQuiz;

  function noopClose() {}

  function onDocClickOpen(e) {
    var t = e.target;
    if (!t || typeof t.closest !== "function") return;
    var opener = t.closest("[data-open-strengths-quiz]");
    if (!opener) return;
    e.preventDefault();
    if (typeof window.strengthsQuizOpenModal === "function") {
      window.strengthsQuizOpenModal();
    }
  }

  function onDocKeydown(e) {
    if (e.key !== "Escape") return;
    var modal = document.getElementById("strengths-quiz-modal");
    if (!modal || modal.hasAttribute("hidden")) return;
    if (typeof window.strengthsQuizCloseModal === "function") {
      window.strengthsQuizCloseModal();
    }
  }

  function setupModalAndOpeners() {
    if (window.__strengthsQuizUiBound) return;
    window.__strengthsQuizUiBound = true;

    var modal = document.getElementById("strengths-quiz-modal");
    if (!modal) {
      window.strengthsQuizCloseModal = noopClose;
      window.strengthsQuizOpenModal = noopClose;
      return;
    }

    var lastFocus = null;

    function openModal() {
      lastFocus = document.activeElement;
      modal.removeAttribute("hidden");
      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("strengths-quiz-modal-open");
      if (typeof window.strengthsQuizReset === "function") {
        window.strengthsQuizReset();
      }
      var closeBtn = modal.querySelector(".strengths-quiz-modal__close");
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      modal.setAttribute("hidden", "");
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("strengths-quiz-modal-open");
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    }

    window.strengthsQuizCloseModal = closeModal;
    window.strengthsQuizOpenModal = openModal;

    document.addEventListener("click", onDocClickOpen, false);

    var closeNodes = modal.querySelectorAll("[data-strengths-quiz-close]");
    for (var i = 0; i < closeNodes.length; i++) {
      closeNodes[i].addEventListener("click", closeModal);
    }

    document.addEventListener("keydown", onDocKeydown, false);
  }

  function boot() {
    var el = document.getElementById("strengths-quiz-root");
    if (el) init(el);
    setupModalAndOpeners();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
