document.addEventListener("DOMContentLoaded", () => {
  const cards = Array.from(document.querySelectorAll("[data-team-card]"));

  if (!cards.length) return;

  const mobileQuery = window.matchMedia("(max-width: 767px)");

  const setFocusableState = (root, enabled) => {
    if (!root) return;

    root.querySelectorAll("a, button").forEach((element) => {
      if (enabled) {
        element.removeAttribute("tabindex");
      } else {
        element.setAttribute("tabindex", "-1");
      }
    });
  };

  const setCardState = (card, expanded) => {
    const toggle = card.querySelector(".leadership-card-toggle");
    const front = card.querySelector(".leadership-card-front");
    const back = card.querySelector(".leadership-card-back");

    card.classList.toggle("is-flipped", expanded);

    if (toggle) {
      toggle.setAttribute("aria-expanded", String(expanded));
    }

    if (front) {
      front.setAttribute("aria-hidden", String(expanded));
      setFocusableState(front, !expanded);
    }

    if (back) {
      back.setAttribute("aria-hidden", String(!expanded));
      setFocusableState(back, expanded);
    }
  };

  const setMobileCardState = (card) => {
    const toggle = card.querySelector(".leadership-card-toggle");
    const front = card.querySelector(".leadership-card-front");
    const back = card.querySelector(".leadership-card-back");

    card.classList.remove("is-flipped");

    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }

    if (front) {
      front.setAttribute("aria-hidden", "false");
      setFocusableState(front, true);
    }

    if (back) {
      back.setAttribute("aria-hidden", "false");
      setFocusableState(back, true);
    }
  };

  const syncCardsToViewport = () => {
    cards.forEach((card) => {
      if (mobileQuery.matches) {
        setMobileCardState(card);
      } else {
        setCardState(card, false);
      }
    });
  };

  const closeOtherCards = (activeCard) => {
    cards.forEach((card) => {
      if (card !== activeCard) {
        setCardState(card, false);
      }
    });
  };

  cards.forEach((card) => {
    const toggle = card.querySelector(".leadership-card-toggle");
    const close = card.querySelector(".leadership-card-close");

    card.addEventListener("click", (event) => {
      if (mobileQuery.matches || event.target.closest("a")) return;

      const clickedToggle = event.target.closest(".leadership-card-toggle");
      const clickedClose = event.target.closest(".leadership-card-close");
      const shouldExpand = !card.classList.contains("is-flipped");

      closeOtherCards(card);
      setCardState(card, shouldExpand);

      if (clickedToggle && shouldExpand && close) {
        close.focus({ preventScroll: true });
      }

      if (clickedClose && !shouldExpand && toggle) {
        toggle.focus({ preventScroll: true });
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (mobileQuery.matches || event.key !== "Escape") return;

    const activeCard = cards.find((card) => card.classList.contains("is-flipped"));

    if (!activeCard) return;

    const toggle = activeCard.querySelector(".leadership-card-toggle");
    setCardState(activeCard, false);

    if (toggle) {
      toggle.focus({ preventScroll: true });
    }
  });

  syncCardsToViewport();

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", syncCardsToViewport);
  } else {
    mobileQuery.addListener(syncCardsToViewport);
  }
});
