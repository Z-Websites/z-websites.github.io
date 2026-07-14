const headerLoaderScript = document.currentScript;
const headerComponentUrl = new URL(
  "../components/header.html",
  headerLoaderScript.src
);
const footerComponentUrl = new URL(
  "../components/footer.html",
  headerLoaderScript.src
);

document.addEventListener("DOMContentLoaded", async () => {
  const headerTarget = document.getElementById("site-header");
  const footerTarget = document.getElementById("site-footer");

  if (headerTarget) {
    await loadComponent(headerTarget, headerComponentUrl, "header");
    setActiveNavigation();
    initializeHeaderScroll();
    initializeMobileNavigation();
    initializeNavigationDropdowns();

    document.dispatchEvent(new CustomEvent("headerLoaded"));
  }

  if (footerTarget) {
    await loadComponent(footerTarget, footerComponentUrl, "footer");

    document.dispatchEvent(new CustomEvent("footerLoaded"));
  }
});

async function loadComponent(target, componentUrl, label) {
  try {
    const response = await fetch(componentUrl);

    if (!response.ok) {
      throw new Error(`Unable to load ${label}: ${response.status}`);
    }

    target.innerHTML = await response.text();
  } catch (error) {
    console.error(error);
  }
}

function setActiveNavigation() {
  const currentPage =
    window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll("#navmenu a").forEach((link) => {
    const [linkPath, linkHash] = link.getAttribute("href").split("#");
    const linkPage = linkPath.split("/").pop();

    if (linkPage === currentPage && !linkHash) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
}

function initializeNavigationDropdowns() {
  const dropdownToggles = document.querySelectorAll("#navmenu .toggle-dropdown");

  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const dropdown = toggle.closest(".dropdown");
      const submenu = dropdown?.querySelector(":scope > ul");

      if (!dropdown || !submenu) return;

      const expanded = toggle.getAttribute("aria-expanded") === "true";

      toggle.setAttribute("aria-expanded", String(!expanded));
      dropdown.classList.toggle("is-open", !expanded);
      submenu.classList.toggle("dropdown-active", !expanded);
    });
  });
}

function initializeHeaderScroll() {
  const header = document.querySelector("#header");

  if (!header) return;
  if (!document.body.classList.contains("index-page")) {
    document.body.classList.remove("scrolled");
    return;
  }

  const updateHeaderState = () => {
    document.body.classList.toggle("scrolled", window.scrollY > 100);
  };

  window.addEventListener("scroll", updateHeaderState);
  updateHeaderState();
}

function initializeMobileNavigation() {
  const mobileNavToggle = document.querySelector(".mobile-nav-toggle");
  const navmenu = document.querySelector("#navmenu");

  if (!mobileNavToggle || !navmenu) return;

  mobileNavToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("mobile-nav-active");

    mobileNavToggle.classList.toggle("bi-list");
    mobileNavToggle.classList.toggle("bi-x");

    if (!isOpen) {
      closeNavigationDropdowns();
    }
  });

  navmenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (!document.body.classList.contains("mobile-nav-active")) return;

      document.body.classList.remove("mobile-nav-active");
      closeNavigationDropdowns();

      mobileNavToggle.classList.add("bi-list");
      mobileNavToggle.classList.remove("bi-x");
    });
  });
}

function closeNavigationDropdowns() {
  document.querySelectorAll("#navmenu .dropdown").forEach((dropdown) => {
    const toggle = dropdown.querySelector(".toggle-dropdown");
    const submenu = dropdown.querySelector(":scope > ul");

    dropdown.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
    submenu?.classList.remove("dropdown-active");
  });
}
