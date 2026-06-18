// ---- Navigation ---------------------
const toggle = document.getElementById("navToggle");
const menu = document.getElementById("navMenu");

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("nav__menu--open");
    toggle.classList.toggle("nav__toggle--active");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  document.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("nav__menu--open");
      toggle.classList.remove("nav__toggle--active");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

// --- Dynamic Stats -------------------
const STATS_CACHE_KEY = "stats_cache_v2";
const STATS_TTL_MS = 6 * 60 * 60 * 1000;

const FALLBACK_STATS = {
  userRepos: 22,
  orgRepos: 19,
  packages: 13,
  downloads: 91759,
};

function roundDown (value, multiple) {
  return Math.floor(value / multiple) * multiple;
}

function formatDownloads (total) {
  if (total >= 1_000_000) {
    const rounded = roundDown(total, 100_000);
    const display = (rounded / 1_000_000).toFixed(1).replace(/\.0$/, "");
    return display + "M+";
  }
  const rounded = roundDown(total, 1000);
  return rounded >= 1000 ? Math.floor(rounded / 1000) + "k+" : rounded + "+";
}

function formatDownloadsText (total) {
  if (total >= 1_000_000) {
    const rounded = roundDown(total, 100_000);
    const display = (rounded / 1_000_000).toFixed(1).replace(/\.0$/, "");
    return display + " " + t("downloads.million");
  }
  const rounded = roundDown(total, 1000);
  if (rounded >= 1000) {
    const value = Math.floor(rounded / 1000);
    const unit = t("downloads.thousand");
    return unit === "k" ? value + unit : value + " " + unit;
  }
  return rounded.toString();
}

function formatRepos (count, multiple) {
  return roundDown(count, multiple) + "+";
}

function setText (id, value) {
  const el = document.getElementById(id);
  if (el && value !== null && value !== undefined) {
    el.textContent = String(value);
  }
}

function applyStats (d) {
  if (typeof d.userRepos === "number") setText("stat-repos", formatRepos(d.userRepos, 5));
  if (typeof d.orgRepos === "number") setText("stat-tooark-repos", formatRepos(d.orgRepos, 5));
  if (typeof d.packages === "number") {
    setText("stat-packages", d.packages);
    setText("tooark-packages", d.packages);
  }
  if (typeof d.downloads === "number") {
    setText("stat-downloads", formatDownloads(d.downloads));
    setText("about-downloads", formatDownloadsText(d.downloads));
    setText("tooark-net-downloads", formatDownloads(d.downloads));
    setText("hero-downloads", formatDownloads(d.downloads));
  }
}

function applyStatsFromCache () {
  try {
    const raw = localStorage.getItem(STATS_CACHE_KEY);
    if (raw) {
      const cache = JSON.parse(raw);
      if (cache && cache.data) { applyStats(cache.data); return; }
    }
  } catch (e) { }
  applyStats(FALLBACK_STATS);
}

async function fetchStats () {
  try {
    const raw = localStorage.getItem(STATS_CACHE_KEY);
    if (raw) {
      const cache = JSON.parse(raw);
      if (cache && cache.ts && Date.now() - cache.ts < STATS_TTL_MS) {
        applyStats(cache.data);
        return;
      }
    }
  } catch (e) { }

  const data = {};
  try {
    const [userRes, orgRes, nugetRes] = await Promise.all([
      fetch("https://api.github.com/users/paulosfjunior"),
      fetch("https://api.github.com/orgs/Tooark"),
      fetch("https://azuresearch-usnc.nuget.org/query?q=owner:Tooark&take=100"),
    ]);

    if (userRes.ok) {
      const user = await userRes.json();
      data.userRepos = user.public_repos;
    }
    if (orgRes.ok) {
      const org = await orgRes.json();
      data.orgRepos = org.public_repos;
    }
    if (nugetRes.ok) {
      const nuget = await nugetRes.json();
      const packages = nuget.data || [];
      data.packages = packages.length;
      data.downloads = packages.reduce((sum, pkg) => sum + (pkg.totalDownloads || 0), 0);
    }

    try {
      localStorage.setItem(STATS_CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    } catch (e) { }

    applyStats(data);
  } catch (e) {
    applyStats(FALLBACK_STATS);
  }
}

// ---- Toast ---------------------
const toast = document.getElementById("toast");
let toastTimer = null;

function showToast (message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

// ---- Pix interactions ---------------------
const pixKey = document.getElementById("pixKey");
const pixKeyValue = document.getElementById("pixKeyValue");
const pixCopyBtn = document.getElementById("pixCopyBtn");

async function copyPixKey () {
  if (!pixKeyValue) return;
  const value = pixKeyValue.textContent.trim();
  try {
    await navigator.clipboard.writeText(value);
    showToast(t("sponsor.pix.copied"));
  } catch (err) {
    // Fallback para navegadores que não suportam Clipboard API
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showToast(t("sponsor.pix.copied"));
    } catch (e) {
      showToast("⚠️ " + value);
    }
    document.body.removeChild(ta);
  }
}

// Click na chave copia
if (pixKey) {
  pixKey.addEventListener("click", (e) => {
    // se clicou dentro do popover, ignora
    if (e.target.closest(".pix-popover")) return;
    copyPixKey();
  });

  // Acessibilidade: Enter/Espaço também copia
  pixKey.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      copyPixKey();
    }
  });

  // Em mobile, primeiro tap mostra QR, segundo copia
  pixKey.addEventListener("touchend", (e) => {
    if (!pixKey.classList.contains("is-active")) {
      e.preventDefault();
      pixKey.classList.add("is-active");
      setTimeout(() => pixKey.classList.remove("is-active"), 5000);
    }
  }, { passive: false });
}

// Botão dedicado de copiar
if (pixCopyBtn) {
  pixCopyBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    copyPixKey();
  });
}

// Fecha popover ao clicar fora (mobile)
document.addEventListener("click", (e) => {
  if (pixKey && !pixKey.contains(e.target)) {
    pixKey.classList.remove("is-active");
  }
});

// ---- Year ---------------------
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear().toString();

// ---- Init ---------------------
applyTranslations();
applyStats(FALLBACK_STATS);
fetchStats();
