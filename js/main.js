// ---- Navigation ---------------------
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

// --- Dynamic Stats -------------------
/**
 * Arredonda um número para baixo ao múltiplo mais próximo.
 * @param {number} value
 * @param {number} multiple
 */
function roundDown (value, multiple) {
  return Math.floor(value / multiple) * multiple;
}

/**
 * Formata o número de downloads em uma string legível, usando "k+" para milhares e "M+" para milhões.
 * @param {number} total
 */
function formatDownloads (total) {
  // Para 1 milhão ou mais, exibe em milhões com uma casa decimal (ex: "1.2M+")
  if (total >= 1_000_000) {
    const rounded = roundDown(total, 100_000);
    const display = (rounded / 1_000_000).toFixed(1).replace(/\.0$/, "");
    return display + "M+";
  }

  const rounded = roundDown(total, 1000);
  return rounded >= 1000 ? Math.floor(rounded / 1000) + "k+" : rounded + "+";
}

/**
 * Formata o texto de downloads para exibir o número com a unidade apropriada (ex: "91 mil" ou "1.2 milhão"), usando as traduções do i18n.
 * @param {number} total
 */
function formatDownloadsText (total) {
  // Para 1 milhão ou mais, exibe em milhões com a palavra traduzida (ex: "1.2 milhão" ou "1.2 million")
  if (total >= 1_000_000) {
    const rounded = roundDown(total, 100_000);
    const display = (rounded / 1_000_000).toFixed(1).replace(/\.0$/, "");
    return display + " " + t("downloads.million");
  }

  const rounded = roundDown(total, 1000);

  // Para 1 mil ou mais, exibe em milhares com a palavra traduzida (ex: "91 mil" ou "91k")
  if (rounded >= 1000) {
    const value = Math.floor(rounded / 1000);
    const unit = t("downloads.thousand");
    // PT: "91 mil", EN: "91k"
    return unit === "k" ? value + unit : value + " " + unit;
  }

  return rounded.toString();
}

/**
 * Formata o número de repositórios em uma string legível, arredondando para baixo ao múltiplo mais próximo e adicionando um "+".
 * @param {number} count
 * @param {number} multiple
 */
function formatRepos (count, multiple) {
  return roundDown(count, multiple) + "+";
}

/**
 * Atualiza o texto de um elemento específico pelo ID, se ele existir.
 * @param {string} id
 * @param {string | null} value
 */
function setText (id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ---- i18n ---------------------
/**
 * Busca as estatísticas do GitHub e NuGet, atualizando os elementos da página com os valores formatados. Em caso de falha, mantém os valores padrão.
 */
async function fetchStats () {
  try {
    const [userRes, orgRes, nugetRes] = await Promise.all([
      fetch("https://api.github.com/users/paulosfjunior"),
      fetch("https://api.github.com/orgs/Tooark"),
      fetch(
        "https://azuresearch-usnc.nuget.org/query?q=owner:Tooark&take=100"
      ),
    ]);

    // Atualiza os repositórios do usuário e da organização
    if (userRes.ok) {
      const user = await userRes.json();
      setText("stat-repos", formatRepos(user.public_repos, 5));
    }

    // Para a organização Tooark, usamos um múltiplo maior para arredondar mais (ex: 5, 10, etc.) e evitar números como "12+" ou "17+"
    if (orgRes.ok) {
      const org = await orgRes.json();
      setText("stat-tooark-repos", formatRepos(org.public_repos, 5));
    }

    // Atualiza os downloads totais dos pacotes NuGet da Tooark
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

// ---- Year ---------------------
const year = document.getElementById('year');

// Verifica se o elemento do ano existe antes de definir seu conteúdo
if (year) {
  year.textContent = new Date().getFullYear().toString();
}

// ---- Init ---------------------
applyTranslations();
fetchStats();
