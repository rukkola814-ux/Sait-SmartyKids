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

(function () {
  var form = document.querySelector("[data-cta-form]");
  if (!form || !window.fetch) return;

  var root = document.querySelector("[data-cta-form-root]");
  var successEl = root && root.querySelector("[data-cta-success]");
  var serverErrEl = root && root.querySelector("[data-cta-server-error]");
  var submitBtn = form.querySelector("[data-cta-submit]");

  function digitsOnly(s) {
    return (String(s).match(/\d/g) || []).length;
  }

  function setFieldError(id, message) {
    var input = id ? document.getElementById(id) : null;
    var errP = document.querySelector('[data-cta-error-for="' + id + '"]');
    var fieldWrap = input && input.closest(".cta-form__field");
    if (input) {
      if (input.classList.contains("cta-form__input")) {
        if (message) {
          input.classList.add("cta-form__input--error");
          input.setAttribute("aria-invalid", "true");
        } else {
          input.classList.remove("cta-form__input--error");
          input.removeAttribute("aria-invalid");
        }
      }
      if (input.type === "checkbox" && fieldWrap) {
        fieldWrap.classList.toggle("cta-form__field--error", !!message);
        if (message) input.setAttribute("aria-invalid", "true");
        else input.removeAttribute("aria-invalid");
      }
    }
    if (errP) {
      if (message) {
        errP.textContent = message;
        errP.hidden = false;
      } else {
        errP.textContent = "";
        errP.hidden = true;
      }
    }
  }

  function clearErrors() {
    ["cta-parent-name", "cta-phone", "cta-consent-pd"].forEach(function (id) {
      setFieldError(id, "");
    });
  }

  function validate() {
    clearErrors();
    var ok = true;
    var nameVal = (document.getElementById("cta-parent-name") && document.getElementById("cta-parent-name").value.trim()) || "";
    if (!nameVal) {
      setFieldError("cta-parent-name", "Укажите имя.");
      ok = false;
    }
    var phoneInput = document.getElementById("cta-phone");
    var phoneVal = phoneInput ? phoneInput.value : "";
    if (!String(phoneVal).trim()) {
      setFieldError("cta-phone", "Укажите телефон.");
      ok = false;
    } else if (digitsOnly(phoneVal) < 10) {
      setFieldError("cta-phone", "Введите номер: не меньше 10 цифр.");
      ok = false;
    }
    var consent = document.querySelector("[data-cta-consent]");
    if (!consent || !consent.checked) {
      setFieldError("cta-consent-pd", "Нужно согласие на обработку персональных данных.");
      ok = false;
    }
    return ok;
  }

  var action = form.getAttribute("action") || "";
  var ajaxUrl = action.indexOf("formsubmit.co/") !== -1
    ? action.replace("https://formsubmit.co/", "https://formsubmit.co/ajax/")
    : action;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (serverErrEl) serverErrEl.hidden = true;
    if (!validate()) return;
    if (!submitBtn) return;

    submitBtn.disabled = true;
    var fd = new FormData(form);

    fetch(ajaxUrl, {
      method: "POST",
      body: fd,
      headers: { Accept: "application/json" },
    })
      .then(function (res) {
        return res.json().then(
          function (data) {
            return { ok: res.ok, data: data };
          },
          function () {
            return { ok: res.ok, data: null };
          }
        );
      })
      .then(function (result) {
        if (result.ok) {
          form.hidden = true;
          if (successEl) successEl.hidden = false;
        } else {
          if (serverErrEl) serverErrEl.hidden = false;
        }
      })
      .catch(function () {
        if (serverErrEl) serverErrEl.hidden = false;
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  });

  ["cta-parent-name", "cta-phone"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", function () {
        setFieldError(id, "");
      });
    }
  });
  var consentEl = document.querySelector("[data-cta-consent]");
  if (consentEl) {
    consentEl.addEventListener("change", function () {
      setFieldError("cta-consent-pd", "");
    });
  }
})();
