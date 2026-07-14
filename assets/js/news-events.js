(function() {
  "use strict";

  const root = document.querySelector("[data-news-events-root]");
  if (!root) return;

  const DATA_URL = "assets/json/news-events.json";
  const TYPE_LABELS = {
    news: {
      empty: "No news items are available yet.",
      cta: "Read More"
    },
    event: {
      empty: "No upcoming events are available yet.",
      cta: "Learn More"
    }
  };

  const state = {
    settings: {
      newsCardsPerPage: 8,
      eventsCardsPerPage: 5
    },
    items: [],
    sections: {
      news: {
        category: "All",
        page: 1
      },
      events: {
        category: "All",
        page: 1
      }
    }
  };

  document.addEventListener("DOMContentLoaded", initializeNewsEvents);

  async function initializeNewsEvents() {
    setLoadingState();

    try {
      const response = await fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Unable to load News & Events data: ${response.status}`);
      }

      const data = await response.json();
      state.settings = {
        ...state.settings,
        ...(data.settings || {})
      };
      state.items = Array.isArray(data.items) ? data.items : [];

      renderSpotlight();
      renderSection("news");
      renderSection("events");
    } catch (error) {
      console.error(error);
      renderErrorState();
    }
  }

  function setLoadingState() {
    root.querySelectorAll("[data-results]").forEach((target) => {
      target.innerHTML = '<div class="news-events-empty"><span>Loading items...</span></div>';
    });
  }

  function renderErrorState() {
    const message = '<div class="news-events-empty news-events-empty--error"><span>News and events could not be loaded right now.</span></div>';
    const spotlight = root.querySelector("[data-spotlight]");

    if (spotlight) {
      spotlight.innerHTML = message;
    }

    root.querySelectorAll("[data-results]").forEach((target) => {
      target.innerHTML = message;
    });
  }

  function renderSpotlight() {
    const target = root.querySelector("[data-spotlight]");
    if (!target) return;

    const newsItems = getNewsItems();
    const eventItems = getUpcomingEvents();
    const spotlight =
      state.items.find((item) => item.featured) ||
      newsItems[0] ||
      eventItems[0];

    target.replaceChildren();

    if (!spotlight) {
      target.append(createEmptyState("No spotlight item is available yet."));
      return;
    }

    target.append(createSpotlightCard(spotlight));
  }

  function renderSection(sectionType) {
    const section = root.querySelector(`[data-section="${sectionType}"]`);
    if (!section) return;

    const sectionState = state.sections[sectionType];
    const allItems = sectionType === "news" ? getNewsItems() : getUpcomingEvents();
    const categories = getCategories(allItems);
    const filteredItems = filterItems(allItems, sectionState.category);
    const pageSize = getPageSize(sectionType);
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

    if (sectionState.page > totalPages) {
      sectionState.page = totalPages;
    }

    const pageItems = filteredItems.slice(
      (sectionState.page - 1) * pageSize,
      sectionState.page * pageSize
    );

    renderFilters(section, sectionType, categories);
    renderCount(section, filteredItems.length, sectionType);
    renderResults(section, sectionType, pageItems);
    renderPagination(section, sectionType, filteredItems.length, totalPages);
  }

  function renderFilters(section, sectionType, categories) {
    const target = section.querySelector("[data-filters]");
    if (!target) return;

    target.replaceChildren();

    ["All", ...categories].forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "news-events-filter";
      button.textContent = category;
      button.dataset.category = category;

      const isActive = state.sections[sectionType].category === category;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");

      button.addEventListener("click", () => {
        state.sections[sectionType].category = category;
        state.sections[sectionType].page = 1;
        renderSection(sectionType);
      });

      target.append(button);
    });
  }

  function renderCount(section, count, sectionType) {
    const target = section.querySelector("[data-count]");
    if (!target) return;

    const noun = sectionType === "news" ? "item" : "event";
    target.textContent = `${count} ${noun}${count === 1 ? "" : "s"}`;
  }

  function renderResults(section, sectionType, items) {
    const target = section.querySelector("[data-results]");
    if (!target) return;

    target.replaceChildren();

    if (items.length === 0) {
      const labelType = sectionType === "news" ? "news" : "event";
      target.append(createEmptyState(TYPE_LABELS[labelType].empty));
      return;
    }

    items.forEach((item) => {
      target.append(sectionType === "news" ? createNewsCard(item) : createEventCard(item));
    });
  }

  function renderPagination(section, sectionType, itemCount, totalPages) {
    const target = section.querySelector("[data-pagination]");
    if (!target) return;

    target.replaceChildren();

    if (itemCount === 0) {
      target.hidden = true;
      return;
    }

    target.hidden = false;

    const page = state.sections[sectionType].page;
    target.append(createPaginationButton(sectionType, page - 1, "Previous", "bi-chevron-left", page === 1));

    for (let index = 1; index <= totalPages; index += 1) {
      const button = createPaginationButton(sectionType, index, String(index), null, false);
      if (index === page) {
        button.setAttribute("aria-current", "page");
        button.classList.add("is-active");
      }
      target.append(button);
    }

    target.append(createPaginationButton(sectionType, page + 1, "Next", "bi-chevron-right", page === totalPages));

    const label = document.createElement("span");
    label.className = "news-events-page-status";
    label.textContent = `Page ${page} of ${totalPages}`;
    target.append(label);
  }

  function createPaginationButton(sectionType, page, label, iconClass, disabled) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "news-events-page-button";
    button.disabled = disabled;

    if (iconClass) {
      const icon = document.createElement("i");
      icon.className = `bi ${iconClass}`;
      icon.setAttribute("aria-hidden", "true");
      button.append(icon);
      button.setAttribute("aria-label", label);
    } else {
      button.textContent = label;
    }

    button.addEventListener("click", () => {
      if (button.disabled) return;
      state.sections[sectionType].page = page;
      renderSection(sectionType);
    });

    return button;
  }

  function createSpotlightCard(item) {
    const article = document.createElement("article");
    article.className = "news-events-spotlight-card";

    const imageWrap = createImageWrap(item, "news-events-spotlight-image", item.type === "event" ? "top-left" : "top-right");
    const content = document.createElement("div");
    content.className = "news-events-spotlight-content";

    content.append(createMeta(item));

    const title = document.createElement("h3");
    title.textContent = item.title || "Untitled item";
    content.append(title);

    if (item.summary) {
      const summary = document.createElement("p");
      summary.textContent = item.summary;
      content.append(summary);
    }

    const cta = createCta(item, item.type === "event" ? TYPE_LABELS.event.cta : TYPE_LABELS.news.cta);
    if (cta) content.append(cta);

    article.append(imageWrap, content);
    return article;
  }

  function createNewsCard(item) {
    const article = document.createElement("article");
    article.className = "news-card";

    article.append(createImageWrap(item, "news-card-image", "top-right"));

    const body = document.createElement("div");
    body.className = "news-card-body";
    body.append(createMeta(item));

    const title = document.createElement("h3");
    title.textContent = item.title || "Untitled news item";
    body.append(title);

    if (item.summary) {
      const summary = document.createElement("p");
      summary.textContent = item.summary;
      body.append(summary);
    }

    const cta = createCta(item, TYPE_LABELS.news.cta);
    if (cta) body.append(cta);

    article.append(body);
    return article;
  }

  function createEventCard(item) {
    const article = document.createElement("article");
    article.className = "event-card";

    article.append(createImageWrap(item, "event-card-image", "top-left"));

    const body = document.createElement("div");
    body.className = "event-card-body";
    body.append(createMeta(item));

    const title = document.createElement("h3");
    title.textContent = item.title || "Untitled event";
    body.append(title);

    if (item.summary) {
      const summary = document.createElement("p");
      summary.textContent = item.summary;
      body.append(summary);
    }

    const cta = createCta(item, TYPE_LABELS.event.cta);
    if (cta) body.append(cta);

    article.append(body);
    return article;
  }

  function createImageWrap(item, className, badgePosition) {
    const wrap = document.createElement("div");
    wrap.className = `${className} news-events-image-wrap`;

    if (item.image) {
      const image = document.createElement("img");
      image.src = item.image;
      image.alt = item.imageAlt || "";
      image.loading = "lazy";
      wrap.append(image);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "news-events-image-placeholder";
      placeholder.setAttribute("aria-hidden", "true");
      wrap.append(placeholder);
    }

    const badge = document.createElement("span");
    badge.className = `news-events-badge news-events-badge--${badgePosition}`;
    badge.textContent = item.category || "Update";
    wrap.append(badge);

    return wrap;
  }

  function createMeta(item) {
    const meta = document.createElement("p");
    meta.className = "news-events-date";
    meta.textContent = formatDateRange(item.date, item.endDate);
    return meta;
  }

  function createCta(item, label) {
    if (!item.url) return null;

    const link = document.createElement("a");
    link.className = "news-events-cta";
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = label;

    const icon = document.createElement("i");
    icon.className = "bi bi-arrow-right";
    icon.setAttribute("aria-hidden", "true");
    link.append(" ", icon);

    return link;
  }

  function createEmptyState(message) {
    const empty = document.createElement("div");
    empty.className = "news-events-empty";

    const text = document.createElement("span");
    text.textContent = message;
    empty.append(text);

    return empty;
  }

  function getNewsItems() {
    return state.items
      .filter((item) => item.type === "news")
      .sort((a, b) => compareDatesDescending(a.date, b.date));
  }

  function getUpcomingEvents() {
    const today = getToday();

    return state.items
      .filter((item) => item.type === "event")
      .filter((item) => {
        const startsAt = parseLocalDate(item.date);
        const endsAt = parseLocalDate(item.endDate) || startsAt;
        return endsAt && endsAt >= today;
      })
      .sort((a, b) => compareDatesAscending(a.date, b.date));
  }

  function filterItems(items, category) {
    if (category === "All") return items;
    return items.filter((item) => item.category === category);
  }

  function getCategories(items) {
    return Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }

  function getPageSize(sectionType) {
    const setting = sectionType === "news" ? state.settings.newsCardsPerPage : state.settings.eventsCardsPerPage;
    const parsed = Number.parseInt(setting, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : (sectionType === "news" ? 8 : 5);
  }

  function compareDatesDescending(a, b) {
    return (parseLocalDate(b)?.getTime() || 0) - (parseLocalDate(a)?.getTime() || 0);
  }

  function compareDatesAscending(a, b) {
    return (parseLocalDate(a)?.getTime() || 0) - (parseLocalDate(b)?.getTime() || 0);
  }

  function parseLocalDate(value) {
    if (!value) return null;
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function getToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function formatDateRange(startValue, endValue) {
    const start = parseLocalDate(startValue);
    const end = parseLocalDate(endValue);

    if (!start) return "Date to be announced";
    if (!end || start.getTime() === end.getTime()) return formatDate(start);
    return `${formatDate(start)} - ${formatDate(end)}`;
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(date);
  }
})();
