
/* =====================================================
   TANISHGG — FIREBASE PORTFOLIO WEBSITE
   PART 1 — CONFIGURATION & DEFAULT WEBSITE DATA
   ===================================================== */

const DEFAULT_SITE = {
  homeTitle: "Think. Design. Build.",
  homeDescription:
    "I'm Tanish — building organised Discord communities, designing modern websites and developing Roblox game experiences.",

  aboutTitle: "The person behind the pixels.",
  aboutBody:
    "I'm Tanish, a website designer and developer passionate about building modern digital experiences, organised Discord communities and creative Roblox projects.",

  services: [
    {
      title: "Discord Server Development",
      description:
        "Professional Discord server setup, organisation, permissions, roles and community systems."
    },
    {
      title: "Website Design",
      description:
        "Modern, responsive and visually appealing websites designed around your brand."
    },
    {
      title: "Roblox Game Development",
      description:
        "Creative Roblox game experiences, development and implementation."
    },
    {
      title: "UI / UX Design",
      description:
        "Clean interfaces and thoughtful user experiences."
    }
  ],

  team: [
    {
      name: "Tanish",
      role: "Founder · Lead Developer",
      description: "Website designer and Discord developer.",
      link: "https://discord.com/users/1465283869195501670"
    },
    {
      name: "Weirdmine",
      role: "Partner · Developer",
      description: "Partner and development team member.",
      link: "https://discord.com/users/1449633180494729400"
    },
    {
      name: "Sky",
      role: "Helper · Team Staff",
      description: "Helping keep the team organised.",
      link: "https://discord.com/users/1541710506715250707"
    }
  ],

  contact: {
    discord: "1465283869195501670",
    instagram: "https://www.instagram.com/still_lonelyyy/",
    email: "tanishhdumbbo@gmail.com"
  },

  announcement: "",
  maintenance: false
};

const COLLECTIONS = {
  settings: "portfolio",
  projects: "projects",
  reviews: "reviews",
  questions: "questions",
  news: "news",
  budgets: "budgets"
};

let siteData = { ...DEFAULT_SITE };

let projectsData = [];
let reviewsData = [];
let questionsData = [];
let newsData = [];

let currentPage = "home";
let firebaseDB = null;
let firebaseAuth = null;

const $ = (selector) => document.querySelector(selector);

const escapeHTML = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);

const safeLink = (value = "") => {
  const url = String(value).trim();

  if (/^https?:\/\//i.test(url)) {
    return escapeHTML(url);
  }

  return "#";
};

const formatDate = (value) => {
  if (!value) return "";

  const date = value.toDate
    ? value.toDate()
    : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

console.log("TanishGG application starting...");
/* =====================================================
   PART 2 — FIREBASE CONNECTION & DATABASE
   ===================================================== */

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = [...document.scripts].find(
      (script) => script.src === new URL(src, location.href).href
    );

    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
      } else {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(
      new Error("Could not load Firebase: " + src)
    );

    document.head.appendChild(script);
  });
}

async function connectFirebase() {
  try {
    await loadScript(
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
    );

    await loadScript(
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"
    );

    await loadScript(
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"
    );

    await loadScript("assets/firebase-config.js");

    if (!window.firebase || !firebase.apps.length) {
      throw new Error("Firebase configuration was not initialized.");
    }

    firebaseDB = firebase.firestore();
    firebaseAuth = firebase.auth();

    window.tanishDB = firebaseDB;
    window.tanishAuth = firebaseAuth;

    console.log("TanishGG connected to Firebase.");

    return true;
  } catch (error) {
    console.error("Firebase connection failed:", error);
    return false;
  }
}

async function getRows(collection, field, value) {
  if (!firebaseDB) return [];

  try {
    const snapshot = await firebaseDB
      .collection(collection)
      .where(field, "==", value)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Database read failed:", collection, error);
    return [];
  }
}

async function loadSiteData() {
  if (!firebaseDB) return;

  try {
    const settings = await firebaseDB
      .collection(COLLECTIONS.settings)
      .doc("main")
      .get();

    if (settings.exists) {
      siteData = {
        ...DEFAULT_SITE,
        ...settings.data()
      };
    }
  } catch (error) {
    console.error("Could not load website settings:", error);
  }

  const results = await Promise.all([
    getRows(COLLECTIONS.projects, "published", true),
    getRows(COLLECTIONS.reviews, "status", "approved"),
    getRows(COLLECTIONS.questions, "status", "answered"),
    getRows(COLLECTIONS.news, "published", true)
  ]);

  projectsData = results[0];
  reviewsData = results[1];
  questionsData = results[2];
  newsData = results[3];

  console.log("TanishGG website data loaded.");
}

function watchWebsiteData() {
  if (!firebaseDB) return;

  firebaseDB
    .collection(COLLECTIONS.settings)
    .doc("main")
    .onSnapshot(async (snapshot) => {
      if (snapshot.exists) {
        siteData = {
          ...DEFAULT_SITE,
          ...snapshot.data()
        };

        await render();
      }
    });

  [
    ["projects", "published", true],
    ["reviews", "status", "approved"],
    ["questions", "status", "answered"],
    ["news", "published", true]
  ].forEach(([collection, field, value]) => {
    firebaseDB
      .collection(collection)
      .where(field, "==", value)
      .onSnapshot((snapshot) => {
        const rows = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        if (collection === "projects") projectsData = rows;
        if (collection === "reviews") reviewsData = rows;
        if (collection === "questions") questionsData = rows;
        if (collection === "news") newsData = rows;

        render();
      }, (error) => {
        console.error("Live update failed:", collection, error);
      });
  });
            }
/* =====================================================
   PART 3 — WEBSITE LAYOUT & NAVIGATION
   ===================================================== */

function shell(title, subtitle, content) {
  return `
    <div class="page-wrapper">
      <header class="site-header">
        <a class="brand" href="#home">
          <span class="brand-mark">T</span>
          <span>TANISH<span class="brand-accent">GG</span></span>
        </a>

        <button class="menu-toggle" id="menuToggle"
          aria-label="Toggle navigation">
          ☰
        </button>

        <nav class="main-nav" id="mainNav">
          ${[
            ["home", "Home"],
            ["projects", "Projects"],
            ["services", "Services"],
            ["team", "Team"],
            ["about", "About"],
            ["reviews", "Reviews"],
            ["news", "News"],
            ["qa", "Q&A"],
            ["contact", "Contact"]
          ].map(([page, label]) => `
            <a href="#${page}"
              class="${currentPage === page ? "active" : ""}">
              ${label}
            </a>
          `).join("")}
        </nav>
      </header>

      <main class="main-content">
        <section class="page-heading">
          <p class="eyebrow">TANISHGG / ${escapeHTML(currentPage)}</p>
          <h1>${escapeHTML(title)}</h1>
          <p>${escapeHTML(subtitle)}</p>
        </section>

        ${content}
      </main>

      <footer class="site-footer">
        <div class="footer-brand">TANISH<span>GG</span></div>
        <p>Think. Design. Build.</p>
        <p>© ${new Date().getFullYear()} TanishGG. All rights reserved.</p>
        <div class="footer-links">
          <a href="${safeLink(siteData.contact.instagram)}"
            target="_blank" rel="noopener">Instagram</a>
          <a href="mailto:${escapeHTML(siteData.contact.email)}">
            Email
          </a>
        </div>
      </footer>
    </div>
  `;
}

function card(title, description, extra = "") {
  return `
    <article class="card">
      <h3>${escapeHTML(title)}</h3>
      <p>${escapeHTML(description)}</p>
      ${extra}
    </article>
  `;
}

function emptyState(message) {
  return `
    <div class="empty-state">
      <p>${escapeHTML(message)}</p>
    </div>
  `;
}

function renderHome() {
  return shell(
    siteData.homeTitle,
    siteData.homeDescription,
    `
      <section class="hero-section">
        <p class="eyebrow">WELCOME TO MY PORTFOLIO</p>
        <h2>Creating digital experiences that stand out.</h2>
        <p>
          From Discord communities to modern websites and Roblox
          experiences, I turn ideas into reality.
        </p>

        <div class="hero-actions">
          <a class="btn btn-primary" href="#projects">
            Explore my work
          </a>
          <a class="btn btn-secondary" href="#budget">
            Start a project
          </a>
        </div>
      </section>

      <section class="content-section">
        <h2>What I do</h2>
        <div class="card-grid">
          ${siteData.services.slice(0, 3).map((service) =>
            card(service.title, service.description)
          ).join("")}
        </div>
      </section>

      <section class="content-section">
        <h2>Let's build something great.</h2>
        <p>
          Have an idea? Let's discuss your next project.
        </p>
        <a class="btn btn-primary" href="#contact">
          Get in touch
        </a>
      </section>
    `
  );
}

function renderProjects() {
  return shell(
    "Things I've built.",
    "A collection of projects and creative work.",
    `
      <div class="card-grid">
        ${projectsData.length
          ? projectsData.map((project) => `
            <article class="card project-card">
              ${project.image ? `
                <img src="${safeLink(project.image)}"
                  alt="${escapeHTML(project.title || "Project")}"
                  loading="lazy">
              ` : ""}
              <h3>${escapeHTML(project.title || "Untitled project")}</h3>
              <p>${escapeHTML(project.description || "")}</p>
              ${project.link ? `
                <a href="${safeLink(project.link)}"
                  target="_blank" rel="noopener">
                  View project →
                </a>
              ` : ""}
            </article>
          `).join("")
          : emptyState("Projects will appear here soon.")}
      </div>
    `
  );
}

function renderServices() {
  return shell(
    "What I can do for you.",
    "Services built around creativity, quality and detail.",
    `
      <div class="card-grid">
        ${siteData.services.map((service) =>
          card(service.title, service.description, `
            <a href="#budget" class="text-link">
              Request this service →
            </a>
          `)
        ).join("")}
      </div>
    `
  );
}

async function render() {
  const app = document.getElementById("app");
  if (!app) return;

  const pages = {
    home: renderHome,
    projects: renderProjects,
    services: renderServices
  };

  const pageRenderer = pages[currentPage];

  if (pageRenderer) {
    app.innerHTML = pageRenderer();
  }

  attachNavigation();
}

function attachNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      const page = link.getAttribute("href").slice(1);

      if (page) {
        currentPage = page;
        window.location.hash = page;
        render();
      }
    });
  });

  const toggle = $("#menuToggle");
  const nav = $("#mainNav");

  toggle?.addEventListener("click", () => {
    nav?.classList.toggle("open");
  });
}
/* =====================================================
   PART 4 — TEAM, ABOUT, CONTACT & REVIEWS
   ===================================================== */

function renderTeam() {
  return shell(
    "Meet the people behind TanishGG.",
    "The team working together to build great things.",
    `
      <div class="card-grid">
        ${siteData.team.map((member) => `
          <article class="card team-card">
            <div class="team-avatar">
              ${escapeHTML(member.name.charAt(0))}
            </div>
            <h3>${escapeHTML(member.name)}</h3>
            <p class="member-role">${escapeHTML(member.role)}</p>
            <p>${escapeHTML(member.description)}</p>
            <a href="${safeLink(member.link)}"
              target="_blank" rel="noopener">
              View Discord profile →
            </a>
          </article>
        `).join("")}
      </div>
    `
  );
}

function renderAbout() {
  return shell(
    siteData.aboutTitle,
    "A little more about me and what I do.",
    `
      <section class="card about-card">
        <h2>Hey, I'm Tanish.</h2>
        <p>${escapeHTML(siteData.aboutBody)}</p>
        <p>
          I believe good design should look great, work smoothly
          and make people's lives easier.
        </p>
      </section>
    `
  );
}

function renderContact() {
  return shell(
    "Let's talk.",
    "Have a question or want to work together?",
    `
      <div class="card-grid">
        <article class="card">
          <h3>Discord</h3>
          <p>Connect with me on Discord.</p>
          <button class="btn btn-secondary"
            id="copyDiscord">
            Copy Discord ID
          </button>
        </article>

        <article class="card">
          <h3>Instagram</h3>
          <p>Follow my Instagram.</p>
          <a class="btn btn-secondary"
            href="${safeLink(siteData.contact.instagram)}"
            target="_blank" rel="noopener">
            Open Instagram
          </a>
        </article>

        <article class="card">
          <h3>Email</h3>
          <p>Send me an email.</p>
          <a class="btn btn-secondary"
            href="mailto:${escapeHTML(siteData.contact.email)}">
            Send email
          </a>
        </article>
      </div>
    `
  );
}

function renderReviews() {
  return shell(
    "What people say.",
    "Feedback and experiences from people I've worked with.",
    `
      <div class="card-grid">
        ${reviewsData.length
          ? reviewsData.map((review) => `
            <article class="card review-card">
              <div class="review-stars">
                ${"★".repeat(Math.min(5, Math.max(0,
                  Number(review.rating) || 0)))}
              </div>
              <p>${escapeHTML(review.message || review.review || "")}</p>
              <h3>${escapeHTML(review.name || "Anonymous")}</h3>
              <small>${escapeHTML(review.project || "")}</small>
            </article>
          `).join("")
          : emptyState("No approved reviews yet. Be the first!")}
      </div>

      <section class="content-section">
        <h2>Leave a review</h2>

        <form class="card form-card" id="reviewForm">
          <div class="field">
            <label for="reviewName">Your name</label>
            <input id="reviewName" name="name"
              required maxlength="70">
          </div>

          <div class="field">
            <label for="reviewRating">Rating</label>
            <select id="reviewRating" name="rating" required>
              <option value="5">★★★★★ — Excellent</option>
              <option value="4">★★★★ — Great</option>
              <option value="3">★★★ — Good</option>
              <option value="2">★★ — Fair</option>
              <option value="1">★ — Poor</option>
            </select>
          </div>

          <div class="field">
            <label for="reviewMessage">Your review</label>
            <textarea id="reviewMessage" name="message"
              required maxlength="1000"></textarea>
          </div>

          <button class="btn btn-primary" type="submit">
            Submit review
          </button>

          <p class="form-status" id="reviewStatus"></p>
        </form>
      </section>
    `
  );
}

function attachPageActions() {
  $("#copyDiscord")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(
        siteData.contact.discord
      );
      alert("Discord ID copied!");
    } catch (error) {
      alert("Your Discord ID: " + siteData.contact.discord);
    }
  });

  $("#reviewForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const status = $("#reviewStatus");

    if (!firebaseDB) {
      status.textContent = "Database connection unavailable.";
      return;
    }

    const data = new FormData(form);

    try {
      await firebaseDB.collection(COLLECTIONS.reviews).add({
        name: String(data.get("name")).trim(),
        rating: Number(data.get("rating")),
        message: String(data.get("message")).trim(),
        status: "pending",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      form.reset();
      status.textContent =
        "Thank you! Your review is waiting for approval.";
    } catch (error) {
      console.error(error);
      status.textContent =
        "Could not submit your review. Please try again.";
    }
  });
}
/* =====================================================
   PART 5 — NEWS, Q&A & PROJECT BUDGET REQUESTS
   ===================================================== */

function renderNews() {
  return shell(
    "What's happening at TanishGG.",
    "Updates, announcements and the latest news.",
    `
      <div class="card-grid">
        ${newsData.length
          ? newsData.map((item) => `
            <article class="card news-card">
              <small>${escapeHTML(formatDate(item.createdAt))}</small>
              <h3>${escapeHTML(item.title || "Announcement")}</h3>
              <p>${escapeHTML(item.description || item.content || "")}</p>
            </article>
          `).join("")
          : emptyState("No news or announcements yet.")}
      </div>
    `
  );
}

function renderQA() {
  return shell(
    "Questions & answers.",
    "Find answers or send me your own question.",
    `
      <div class="card-grid">
        ${questionsData.length
          ? questionsData.map((item) => `
            <article class="card">
              <h3>${escapeHTML(item.question || "")}</h3>
              <p>${escapeHTML(item.answer || "")}</p>
            </article>
          `).join("")
          : emptyState("No answered questions yet.")}
      </div>

      <section class="content-section">
        <h2>Ask a question</h2>

        <form class="card form-card" id="questionForm">
          <div class="field">
            <label>Your name</label>
            <input name="name" required maxlength="70">
          </div>

          <div class="field">
            <label>Your question</label>
            <textarea name="question"
              required maxlength="1000"></textarea>
          </div>

          <button class="btn btn-primary" type="submit">
            Send question
          </button>

          <p class="form-status" id="questionStatus"></p>
        </form>
      </section>
    `
  );
}

function renderBudget() {
  return shell(
    "Project inquiry",
    "Let's plan your project.",
    "All budgets are in US dollars (USD).",

    `<form class="card form-card" id="budgetForm">

      <div class="field">
        <label>Your name</label>
        <input name="name" required maxlength="70">
      </div>

      <div class="field">
        <label>Email or Discord username</label>
        <input name="contact" required maxlength="120">
      </div>

      <div class="field">
        <label>What do you need?</label>
        <select name="service" required>
          <option value="Discord Server Development">
            Discord Server Development
          </option>
          <option value="Website Design">Website Design</option>
          <option value="Roblox Game Development">
            Roblox Game Development
          </option>
          <option value="UI / UX Design">UI / UX Design</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div class="field">
        <label>Your budget (USD)</label>
        <select name="budget" required>
          <option value="">Select your budget</option>
          <option value="Under $25">Under $25</option>
          <option value="$25 - $50">$25 - $50</option>
          <option value="$50 - $100">$50 - $100</option>
          <option value="$100 - $250">$100 - $250</option>
          <option value="$250 - $500">$250 - $500</option>
          <option value="$500+">$500+</option>
          <option value="Not sure yet">Not sure yet</option>
        </select>
      </div>

      <div class="field">
        <label>Tell me about your project</label>
        <textarea name="details"
          required maxlength="3000"></textarea>
      </div>

      <button class="btn btn-primary" type="submit">
        Send project request
      </button>

      <p class="form-status" id="budgetStatus"></p>
    </form>`
  );
}

function attachExtraForms() {
  $("#questionForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const status = $("#questionStatus");
    const data = new FormData(form);

    try {
      await firebaseDB.collection(COLLECTIONS.questions).add({
        name: String(data.get("name")).trim(),
        question: String(data.get("question")).trim(),
        answer: "",
        status: "pending",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      form.reset();
      status.textContent =
        "Question submitted! It will appear after approval.";
    } catch (error) {
      console.error(error);
      status.textContent = "Could not send your question.";
    }
  });

  $("#budgetForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const status = $("#budgetStatus");
    const data = new FormData(form);

    try {
      await firebaseDB.collection(COLLECTIONS.budgets).add({
        name: String(data.get("name")).trim(),
        contact: String(data.get("contact")).trim(),
        service: String(data.get("service")),
        budget: String(data.get("budget")),
        details: String(data.get("details")).trim(),
        status: "new",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      form.reset();
      status.textContent =
        "Your project request has been sent successfully!";
    } catch (error) {
      console.error(error);
      status.textContent =
        "Could not send your request. Please try again.";
    }
  });
}
/* =====================================================
   PART 6 — FINAL STARTUP & COMPLETE PAGE NAVIGATION
   ===================================================== */

// Updated shell: supports an optional introduction.

function shell(title, subtitle, content, extraContent = "") {
  return `
    <div class="page-content">
      <section class="page-heading">
        <p class="eyebrow">TANISHGG / ${escapeHTML(currentPage)}</p>
        <h1>${escapeHTML(title)}</h1>
        <p>${escapeHTML(subtitle)}</p>
      </section>

      ${content || ""}
      ${extraContent || ""}
    </div>
  `;
}

// Corrected budget page.
function renderBudget() {
  return shell(
    "Project inquiry",
    "Let's plan your project.",
    "",
    `<p class="section-description">
      All budgets are in US dollars (USD).
    </p>

    <form class="card form-card" id="budgetForm">
      <div class="field">
        <label>Your name</label>
        <input name="name" required maxlength="70">
      </div>

      <div class="field">
        <label>Email or Discord username</label>
        <input name="contact" required maxlength="120">
      </div>

      <div class="field">
        <label>What do you need?</label>
        <select name="service" required>
          <option value="Discord Server Development">
            Discord Server Development
          </option>
          <option value="Website Design">Website Design</option>
          <option value="Roblox Game Development">
            Roblox Game Development
          </option>
          <option value="UI / UX Design">UI / UX Design</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div class="field">
        <label>Your budget (USD)</label>
        <select name="budget" required>
          <option value="">Select your budget</option>
          <option>Under $25</option>
          <option>$25 - $50</option>
          <option>$50 - $100</option>
          <option>$100 - $250</option>
          <option>$250 - $500</option>
          <option>$500+</option>
          <option>Not sure yet</option>
        </select>
      </div>

      <div class="field">
        <label>Tell me about your project</label>
        <textarea name="details" required maxlength="3000"></textarea>
      </div>

      <button class="btn btn-primary" type="submit">
        Send project request
      </button>
      <p class="form-status" id="budgetStatus"></p>
    </form>`
  );
}

// Complete page renderer.
async function render() {
  const app = document.getElementById("app");
  if (!app) return;

  const pages = {
    home: renderHome,
    projects: renderProjects,
    services: renderServices,
    team: renderTeam,
    about: renderAbout,
    reviews: renderReviews,
    news: renderNews,
    qa: renderQA,
    contact: renderContact,
    budget: renderBudget
  };

  if (!pages[currentPage]) currentPage = "home";

  app.innerHTML = pages[currentPage]();

  attachNavigation();
  attachPageActions();
  attachExtraForms();
}

// Navigation without repeatedly adding event listeners.


function attachNavigation() {
  const toggle = document.getElementById("menu");
  const nav = document.getElementById("nav");

  toggle?.addEventListener("click", () => {
    nav?.classList.toggle("open");
  });

  document.querySelectorAll("#nav a[data-page], .navbtn").forEach((link) => {
    link.onclick = (event) => {
      event.preventDefault();

      const page = link.dataset.page ||
        new URL(link.href).searchParams.get("page") ||
        "budget";

      currentPage = page;
      history.pushState(null, "", "?page=" + page);

      render();
      nav?.classList.remove("open");
    };
  });
}

// Handle browser back and forward navigation.
window.addEventListener("popstate", () => {
  currentPage = new URLSearchParams(location.search).get("page") || "home";
  render();
});

// Start the application.
(async function startApp() {
  const app = document.getElementById("app");

  // Remove any old AI assistant elements.
  document.getElementById("aiOpen")?.remove();
  document.getElementById("chat")?.remove();

  if (!app) return;

  app.innerHTML = `
    <div class="loading">
      <h2>TANISHGG</h2>
      <p>Loading your experience...</p>
    </div>
  `;

  const connected = await connectFirebase();

  if (!connected) {
    app.innerHTML = `
      <div class="loading">
        <h2>Connection problem</h2>
        <p>Firebase could not connect. Please refresh and try again.</p>
        <button class="btn btn-primary"
          onclick="location.reload()">Retry</button>
      </div>
    `;
    return;
  }

  await loadSiteData();

  currentPage = new URLSearchParams(location.search).get("page") || "home";

  await render();

  // Keep public website data updated automatically.
  watchWebsiteData();

  console.log("TanishGG is ready!");
})();
