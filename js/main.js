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
const STATS_CACHE_KEY = "stats_cache_v1";
const STATS_TTL_MS = 6 * 60 * 60 * 1000;

const FALLBACK_STATS = {
  userRepos: 22,
  orgRepos: 19,
  packages: 15,
  downloads: 108000,
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
  if (typeof d.userRepos === "number")
    setText("stat-repos", formatRepos(d.userRepos, 5));
  if (typeof d.orgRepos === "number")
    setText("stat-tooark-repos", formatRepos(d.orgRepos, 5));
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
      if (cache && cache.data) {
        applyStats(cache.data);
        return;
      }
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
      data.downloads = packages.reduce(
        (sum, pkg) => sum + (pkg.totalDownloads || 0),
        0
      );
    }

    try {
      localStorage.setItem(
        STATS_CACHE_KEY,
        JSON.stringify({ ts: Date.now(), data })
      );
    } catch (e) { }

    applyStats(data);
  } catch (e) {
    applyStats(FALLBACK_STATS);
  }
}

// ---- Year ---------------------
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear().toString();

// ---- Init ---------------------
applyTranslations();
applyStats(FALLBACK_STATS);
fetchStats();
