// --- Navigation ---
const toggle = document.getElementById("navToggle");
const menu = document.getElementById("navMenu");

// Toggle menu on mobile
if (toggle && menu) {
  toggle.addEventListener("click", () => {
    menu.classList.toggle("nav__menu--open");
    toggle.classList.toggle("nav__toggle--active");
  });

  document.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("nav__menu--open");
      toggle.classList.remove("nav__toggle--active");
    });
  });
}

// --- Dynamic Stats ---
/**
 * @param {number} value
 * @param {number} multiple
 */
function roundDown(value, multiple) {
  return Math.floor(value / multiple) * multiple;
}

/**
 * @param {number} total
 */
function formatDownloads(total) {
  if (total >= 1_000_000) {
    const rounded = roundDown(total, 100_000);
    const display = (rounded / 1_000_000).toFixed(1).replace(/\.0$/, "");
    return display + "M+";
  }
  const rounded = roundDown(total, 1000);
  return rounded >= 1000 ? Math.floor(rounded / 1000) + "k+" : rounded + "+";
}

/**
 * @param {number} total
 */
function formatDownloadsText(total) {
  if (total >= 1_000_000) {
    const rounded = roundDown(total, 100_000);
    const display = (rounded / 1_000_000).toFixed(1).replace(/\.0$/, "");
    return display + " " + t("downloads.million");
  }
  const rounded = roundDown(total, 1000);
  if (rounded >= 1000) {
    const value = Math.floor(rounded / 1000);
    const unit = t("downloads.thousand");
    // PT: "91 mil", EN: "91k"
    return unit === "k" ? value + unit : value + " " + unit;
  }
  return rounded.toString();
}

/**
 * @param {number} count
 * @param {number} multiple
 */
function formatRepos(count, multiple) {
  return roundDown(count, multiple) + "+";
}

/**
 * @param {string} id
 * @param {string | null} value
 */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

async function fetchStats() {
  try {
    const [userRes, orgRes, nugetRes] = await Promise.all([
      fetch("https://api.github.com/users/paulosfjunior"),
      fetch("https://api.github.com/orgs/Tooark"),
      fetch(
        "https://azuresearch-usnc.nuget.org/query?q=owner:Tooark&take=100"
      ),
    ]);

    if (userRes.ok) {
      const user = await userRes.json();
      setText("stat-repos", formatRepos(user.public_repos, 5));
    }

    if (orgRes.ok) {
      const org = await orgRes.json();
      setText("stat-tooark-repos", formatRepos(org.public_repos, 5));
    }

    if (nugetRes.ok) {
      const nuget = await nugetRes.json();
      const packages = nuget.data || [];
      const totalDownloads = packages.reduce(
        (/** @type {any} */ sum, /** @type {{ totalDownloads: any; }} */ pkg) => sum + (pkg.totalDownloads || 0),
        0
      );

      // Stats section
      setText("stat-packages", packages.length);
      setText("stat-downloads", formatDownloads(totalDownloads));

      // About text
      setText("about-downloads", formatDownloadsText(totalDownloads));

      // Project cards
      setText("tooark-packages", packages.length);
      setText("tooark-net-downloads", formatDownloads(totalDownloads));
    }
  } catch (e) {
    // Fallback silencioso — mantém valores padrão
  }
}

// --- Init ---
applyTranslations();
fetchStats();
