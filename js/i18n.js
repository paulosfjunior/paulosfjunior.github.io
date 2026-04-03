const translations = {
  pt: {
    "header.languageSelector": "Selecionar idioma",

    // Nav
    "nav.about": "Sobre",
    "nav.skills": "Skills",
    "nav.projects": "Projetos",
    "nav.contact": "Contato",

    // Hero
    "hero.greeting": "Olá, eu sou",
    "hero.role": "Software Developer & DevOps",
    "hero.description":
      "Desenvolvedor de software apaixonado por DevOps e ferramentas open source. Criador do",
    "hero.description.tooark":
      "— um ecossistema de bibliotecas e ferramentas para desenvolvedores e DevOps.",
    "hero.btn.projects": "Ver Projetos",
    "hero.btn.contact": "Contato",

    // About
    "about.title": "Sobre mim",
    "about.p1.start": "Sou desenvolvedor de software com experiência em",
    "about.p1.mid": "e práticas de",
    "about.p1.end": "Trabalho no",
    "about.p1.location": "em Pompeia, SP — Brasil.",
    "about.p2.start": "Fundei o projeto",
    "about.p2.mid":
      ", onde mantenho bibliotecas open source, GitHub Actions, templates de CI/CD e ferramentas de observabilidade que já acumulam mais de",
    "about.p2.end": "downloads",
    "about.p2.suffix": "nos pacotes NuGet.",
    "stat.repos": "Repositórios",
    "stat.downloads": "Downloads NuGet",
    "stat.packages": "Pacotes .NET",
    "stat.tooark": "Repos Tooark",

    // Skills
    "skills.title": "Skills & Tecnologias",
    "skill.backend": "Backend",
    "skill.devops": "DevOps & CI/CD",
    "skill.observability": "Observabilidade",
    "skill.frontend": "Frontend",
    "skill.security": "Segurança",
    "skill.packages": "Pacotes & Libs",

    // Projects
    "projects.title": "Projetos em Destaque",
    "project.tooark.tag": "Ecossistema",
    "project.tooark.desc":
      "Ecossistema com pacotes, ferramentas e projetos open source para desenvolvedores e DevOps. Inclui",
    "project.tooark.desc.mid":
      "pacotes NuGet, GitHub Actions, templates CI/CD, libs de observabilidade e mais.",
    "project.net.tag": "Biblioteca",
    "project.net.desc":
      "Biblioteca de ferramentas C# com validações, notificações, value objects, DTOs, entidades e utilitários.",
    "project.net.downloads": "downloads.",
    "project.trivy.tag": "CI/CD",
    "project.trivy.desc":
      "GitHub Action para criar resumos de scan de segurança de imagens Docker com Trivy.",
    "project.obs.tag": "Observabilidade",
    "project.obs.desc":
      "Biblioteca Node.js para pré-configuração do OpenTelemetry em aplicações backend.",
    "project.eslint.tag": "Ferramenta",
    "project.eslint.desc":
      "Configuração compartilhada de ESLint para projetos Node, React, Angular e Vue.",
    "project.base.tag": "Infra",
    "project.base.desc":
      "Imagens Docker base otimizadas para deploy de aplicações em ambientes de produção.",
    "projects.more": "Ver todos no GitHub",

    // Contact
    "contact.title": "Contato",
    "contact.text":
      "Quer trocar uma ideia, colaborar em um projeto ou só dar um oi? Me encontre nas redes abaixo.",

    // Footer
    "footer.rights": "Todos os direitos reservados.",

    // Dynamic text helpers
    "downloads.thousand": "mil",
    "downloads.million": "milhão",
  },

  en: {
    "header.languageSelector": "Select language",

    // Nav
    "nav.about": "About",
    "nav.skills": "Skills",
    "nav.projects": "Projects",
    "nav.contact": "Contact",

    // Hero
    "hero.greeting": "Hi, I'm",
    "hero.role": "Software Developer & DevOps",
    "hero.description":
      "Software developer passionate about DevOps and open source tools. Creator of",
    "hero.description.tooark":
      "— an ecosystem of libraries and tools for developers and DevOps.",
    "hero.btn.projects": "View Projects",
    "hero.btn.contact": "Contact",

    // About
    "about.title": "About me",
    "about.p1.start": "I'm a software developer with experience in",
    "about.p1.mid": "and",
    "about.p1.end": "practices. I work at",
    "about.p1.location": "in Pompeia, SP — Brazil.",
    "about.p2.start": "I founded the",
    "about.p2.mid":
      "project, where I maintain open source libraries, GitHub Actions, CI/CD templates and observability tools with over",
    "about.p2.end": "downloads",
    "about.p2.suffix": "on NuGet packages.",
    "stat.repos": "Repositories",
    "stat.downloads": "NuGet Downloads",
    "stat.packages": ".NET Packages",
    "stat.tooark": "Tooark Repos",

    // Skills
    "skills.title": "Skills & Technologies",
    "skill.backend": "Backend",
    "skill.devops": "DevOps & CI/CD",
    "skill.observability": "Observability",
    "skill.frontend": "Frontend",
    "skill.security": "Security",
    "skill.packages": "Packages & Libs",

    // Projects
    "projects.title": "Featured Projects",
    "project.tooark.tag": "Ecosystem",
    "project.tooark.desc":
      "Open source ecosystem with packages, tools and projects for developers and DevOps. Includes",
    "project.tooark.desc.mid":
      "NuGet packages, GitHub Actions, CI/CD templates, observability libs and more.",
    "project.net.tag": "Library",
    "project.net.desc":
      "C# toolkit library with validations, notifications, value objects, DTOs, entities and utilities.",
    "project.net.downloads": "downloads.",
    "project.trivy.tag": "CI/CD",
    "project.trivy.desc":
      "GitHub Action to create security scan summaries of Docker images with Trivy.",
    "project.obs.tag": "Observability",
    "project.obs.desc":
      "Node.js library for pre-configured OpenTelemetry in backend applications.",
    "project.eslint.tag": "Tool",
    "project.eslint.desc":
      "Shared ESLint configuration for Node, React, Angular and Vue projects.",
    "project.base.tag": "Infra",
    "project.base.desc":
      "Optimized base Docker images for deploying applications in production environments.",
    "projects.more": "View all on GitHub",

    // Contact
    "contact.title": "Contact",
    "contact.text":
      "Want to chat, collaborate on a project, or just say hi? Find me on the networks below.",

    // Footer
    "footer.rights": "All rights reserved.",

    // Dynamic text helpers
    "downloads.thousand": "k",
    "downloads.million": "M",
  },
};

const savedLang = localStorage.getItem("lang");

// ---- Language detection -------------
/**
 * Usa preferência salva quando disponível; caso contrário, detecta o idioma do navegador.
 * @returns {"pt" | "en"}
 */
function getInitialLang () {
  // Verifica se o idioma salvo é válido
  if (savedLang === "pt" || savedLang === "en") {
    return /** @type {"pt" | "en"} */ (savedLang);
  }

  const browserLang = (navigator.language || "").toLowerCase();
  return browserLang.startsWith("pt") ? "pt" : "en";
}

/** @type {"pt" | "en"} */
let currentLang = getInitialLang();

// ---- Translation functions ----------
/**
 * Recupera a tradução para uma chave específica com base no idioma atual.
 * @param {string} key
 */
function t (key) {
  // @ts-ignore
  return translations[currentLang]?.[key] || translations.pt[key] || key;
}

/**
 * Aplica as traduções a todos os elementos com atributos data-i18n.
 */
function applyTranslations () {
  document.documentElement.lang = currentLang === "pt" ? "pt-BR" : "en";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");

    // Para elementos de texto, atualiza o conteúdo textual
    if (key) {
      el.textContent = t(key);
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");

    // Para elementos de input, atualiza o placeholder
    if (key) {
       /** @type {HTMLInputElement} */ (el).placeholder = t(key);
    }
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria-label");

    // Para elementos com aria-label, atualiza o atributo
    if (key) {
      el.setAttribute("aria-label", t(key));
    }
  });
}

/**
 * Atualiza o estado dos botões de troca de idioma para refletir o idioma atual.
 */
function updateLanguageSwitch () {
  document.querySelectorAll(".lang-switch__btn").forEach((btn) => {
    const lang = btn.getAttribute("data-lang");
    const isActive = lang === currentLang;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

/**
 * Define o idioma atual, salva a preferência e reaplica as traduções.
 * @param {"pt" | "en"} lang
 */
function setLang (lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  applyTranslations();
  updateLanguageSwitch();

  // Recarrega as estatísticas para atualizar os textos dinâmicos
  if (typeof fetchStats === "function") {
    fetchStats();
  }
}

/**
 * Alterna o idioma entre Português e Inglês
 */
function toggleLang () {
  setLang(currentLang === "pt" ? "en" : "pt");
}

document.querySelectorAll(".lang-switch__btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const lang = btn.getAttribute("data-lang");

    // Verifica se o idioma é válido antes de aplicar a mudança
    if (lang === "pt" || lang === "en") {
      setLang(lang);
    }
  });
});

updateLanguageSwitch();
