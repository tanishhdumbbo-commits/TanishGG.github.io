/* =====================================================
   TANISHGG — COMPLETE FIREBASE WEBSITE APP
   ===================================================== */

const DEFAULT_SITE = {
  homeTitle: "Think. Design. Build.",
  homeDescription: "I'm Tanish — building organised Discord communities, designing modern websites and developing Roblox game experiences.",
  aboutTitle: "The person behind the pixels.",
  aboutBody: "I work across Discord server development, website design and Roblox game development. My focus is creating clear, memorable and useful digital experiences.",

  services: [
    {
      title: "Discord Server Development",
      description: "Custom servers, roles, permissions, bots, embeds and community systems."
    },
    {
      title: "Website Design",
      description: "Responsive portfolios, landing pages and business websites."
    },
    {
      title: "Roblox Game Development",
      description: "Game concepts, interactive experiences and Roblox development."
    },
    {
      title: "UI / UX & Creative Development",
      description: "Clear interfaces, front-end builds, interactions and polished details."
    }
  ],

  team: [
    {
      name: "Tanish",
      role: "Founder · Lead Developer",
      detail: "Discord development, website design and Roblox game development."
    },
    {
      name: "Weirdmine",
      role: "Partner · Developer",
      detail: "Development team staff.",
      discord: "https://discord.com/users/1449633180494729400"
    },
    {
      name: "Sky",
      role: "Helper · Team Staff",
      detail: "Community assistance and team support.",
      discord: "https://discord.com/users/1541710506715250707"
    }
  ],

  contact: {
    email: "tanishhdumbbo@gmail.com",
    discord: "https://discord.com/users/1465283869195501670",
    instagram: "https://www.instagram.com/still_lonelyyy/"
  }
};

let db = null;
let auth = null;
let siteData = { ...DEFAULT_SITE };
let siteListener = null;

const CONTACT = DEFAULT_SITE.contact;

/* =====================================================
   HELPERS
   ===================================================== */

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(
      new Error("Could not load: " + src)
    );
    document.head.appendChild(script);
  });
}

function showConnectionError(error) {
  console.error("TanishGG Firebase error:", error);

  const app = document.getElementById("app");

  if (app) {
    app.innerHTML = `
      <section class="page">
        <div class="card">
          <h2>Firebase connection failed</h2>
          <p>Please refresh the page.</p>
          <p class="muted">${esc(error?.message || "Unknown connection error")}</p>
        </div>
      </section>
    `;
  }
}

/* =====================================================
   FIREBASE INITIALIZATION
   ===================================================== */

window.firebaseReady = (async function () {
  try {
    await loadScript(
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
    );

    await loadScript(
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"
    );

    await loadScript(
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"
    );

    await loadScript("assets/firebase-config.js");

    if (!window.firebase) {
      throw new Error("Firebase SDK did not initialize.");
    }

    db = firebase.firestore();
    auth = firebase.auth();

    window.tanishDB = db;
    window.tanishAuth = auth;

    console.log("TanishGG Firebase connected successfully.");

    return true;

  } catch (error) {
    console.error("Firebase connection error:", error);
    showConnectionError(error);
    return false;
  }
})();

/* =====================================================
   DATABASE HELPERS
   ===================================================== */

// Public reads must include a query matching Firestore rules.
async function getRows(collection, field, value) {
  if (!db) return [];

  try {
    const snapshot = await db
      .collection(collection)
      .where(field, "==", value)
      .get();

    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    items.sort((a, b) => {
      const dateA = a.createdAt?.toMillis?.() || 0;
      const dateB = b.createdAt?.toMillis?.() || 0;
      return dateB - dateA;
    });

    return items;

  } catch (error) {
    console.error("Database read error:", collection, error);
    return [];
  }
}

async function submitRow(collection, data, form) {
  const status = form.querySelector(".form-status");

  if (!db) {
    status.textContent = "Database unavailable. Please refresh.";
    return;
  }

  status.textContent = "Submitting...";

  try {
    await db.collection(collection).add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    status.textContent = "Submitted successfully! Thank you.";
    form.reset();

  } catch (error) {
    console.error("Submission error:", error);
    status.textContent = "Could not submit: " + error.message;
  }
}

/* =====================================================
   WEBSITE SETTINGS AND LIVE UPDATES
   ===================================================== */

async function loadSiteData() {
  if (!db) return;

  const settingsRef = db.collection("portfolio").doc("main");

  try {
    const snapshot = await settingsRef.get();

    if (snapshot.exists) {
      siteData = {
        ...DEFAULT_SITE,
        ...snapshot.data()
      };
    }

  } catch (error) {
    console.error("Settings loading error:", error);
  }

  if (siteListener) {
    siteListener();
  }

  siteListener = settingsRef.onSnapshot(snapshot => {
    if (snapshot.exists) {
      siteData = {
        ...DEFAULT_SITE,
        ...snapshot.data()
      };

      render();
    }
  }, error => {
    console.error("Live update error:", error);
  });
}

/* =====================================================
   LAYOUT
   ===================================================== */

function shell(kicker, title, description, content) {
  return `
    <section class="page">
      <div class="page-intro">
        <div class="eyebrow">${esc(kicker)}</div>
        <h1 class="page-title">${esc(title)}</h1>
        <p class="muted">${esc(description)}</p>
      </div>
      ${content}
    </section>
  `;
}

function serviceCards() {
  const services = Array.isArray(siteData.services)
    ? siteData.services
    : DEFAULT_SITE.services;

  return services.map(service => `
    <article class="card">
      <div class="iconbox">◈</div>
      <h3>${esc(service.title)}</h3>
      <p>${esc(service.description)}</p>
    </article>
  `).join("");
}

function contactCards() {
  const contact = {
    ...CONTACT,
    ...(siteData.contact || {})
  };

  return `
    <div class="grid">

      <article class="card">
        <div class="iconbox">✉</div>
        <h3>Email</h3>
        <p>${esc(contact.email)}</p>
        <a class="btn" href="mailto:${esc(contact.email)}">
          Email Tanish ↗
        </a>
      </article>

      <article class="card">
        <div class="iconbox">◈</div>
        <h3>Discord</h3>
        <p>Connect with Tanish on Discord.</p>
        <a class="btn" target="_blank" rel="noopener"
          href="${esc(contact.discord)}">
          Open Discord ↗
        </a>
      </article>

      <article class="card">
        <div class="iconbox">◎</div>
        <h3>Instagram</h3>
        <p>Follow Tanish on Instagram.</p>
        <a class="btn" target="_blank" rel="noopener"
          href="${esc(contact.instagram)}">
          Open Instagram ↗
        </a>
      </article>

    </div>
  `;
}

/* =====================================================
   MAIN WEBSITE RENDERER
   ===================================================== */

async function render() {
  const app = document.getElementById("app");

  if (!app || !db) return;

  const params = new URLSearchParams(location.search);
  const page = params.get("page") || "home";

  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  document.querySelectorAll("[data-page]").forEach(link => {
    link.classList.toggle(
      "active",
      link.dataset.page === page
    );
  });

  const menu = document.getElementById("menu");
  const nav = document.getElementById("nav");

  if (menu && nav) {
    menu.onclick = () => nav.classList.toggle("open");
  }

  /* HOME */

  if (page === "home") {
    app.innerHTML = `
      <section class="hero">
        <div>
          <div class="eyebrow">Digital creator · Developer</div>

          <h1>${esc(siteData.homeTitle || DEFAULT_SITE.homeTitle)}</h1>

          <p class="lead">
            ${esc(siteData.homeDescription || DEFAULT_SITE.homeDescription)}
          </p>

          <div class="actions">
            <a class="btn" href="?page=projects">Explore my work ↗</a>
            <a class="btn alt" href="?page=contact">Start a project</a>
          </div>

          <div class="pills">
            <span class="pill">Discord Development</span>
            <span class="pill">Website Design</span>
            <span class="pill">Roblox Game Development</span>
          </div>
        </div>

        <div class="hero-card">
          <div class="monogram">T.</div>
          <h3>Creative mind.<br>Builder mindset.</h3>
          <p>Turning ideas into digital experiences, one detail at a time.</p>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <div>
            <div class="eyebrow">What I do</div>
            <h2>Built for the digital world.</h2>
          </div>
          <a class="btn alt" href="?page=services">All services ↗</a>
        </div>
        <div class="grid">${serviceCards()}</div>
      </section>

      <section class="section">
        <div class="section-head">
          <div>
            <div class="eyebrow">Latest updates</div>
            <h2>What's new.</h2>
          </div>
          <a class="btn alt" href="?page=news">All news ↗</a>
        </div>
        <div id="homeNews" class="grid">
          <div class="empty">Loading...</div>
        </div>
      </section>
    `;

    const news = await getRows("news", "published", true);
    const box = document.getElementById("homeNews");

    if (box) {
      box.innerHTML = news.slice(0, 3).map(item => `
        <article class="card">
          <div class="tag">${esc(item.category || "Update")}</div>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.body)}</p>
        </article>
      `).join("") || `
        <div class="empty">New updates will appear here soon.</div>
      `;
    }

    return;
  }

  /* PROJECTS */

  if (page === "projects") {
    const projects = await getRows("projects", "published", true);

    app.innerHTML = shell(
      "Selected work",
      "Ideas into experiences.",
      "A selection of Discord, website and Roblox projects.",

      projects.length
        ? `<div class="grid">
            ${projects.map(project => `
              <article class="card">
                <div class="tag">${esc(project.category || "Project")}</div>
                <h3>${esc(project.title)}</h3>
                <p>${esc(project.description)}</p>

                ${project.imageUrl ? `
                  <img src="${esc(project.imageUrl)}"
                    alt="${esc(project.title)}"
                    style="width:100%;border-radius:12px">
                ` : ""}

                ${project.url ? `
                  <a class="btn alt" href="${esc(project.url)}"
                    target="_blank" rel="noopener">
                    View project ↗
                  </a>
                ` : ""}
              </article>
            `).join("")}
          </div>`
        : `<div class="empty">Projects will be published here soon.</div>`
    );

    return;
  }

  /* SERVICES */

  if (page === "services") {
    app.innerHTML = shell(
      "What I do",
      "Services built around your ideas.",
      "Choose a service and tell me what you're planning.",

      `<div class="grid">${serviceCards()}</div>
       <div class="actions">
         <a class="btn" href="?page=budget">Plan your budget ↗</a>
       </div>`
    );

    return;
  }

  /* TEAM */

  if (page === "team") {
    const team = Array.isArray(siteData.team)
      ? siteData.team
      : DEFAULT_SITE.team;

    app.innerHTML = shell(
      "The people behind the work",
      "Meet the team.",
      "A small creative and development team.",

      `<div class="grid">
        ${team.map(member => `
          <article class="card">
            <div class="iconbox">◈</div>
            <h3>${esc(member.name)}</h3>
            <span class="team-role">${esc(member.role)}</span>
            <p>${esc(member.detail)}</p>

            ${member.discord ? `
              <a class="muted" href="${esc(member.discord)}"
                target="_blank" rel="noopener">
                Discord profile ↗
              </a>
            ` : ""}
          </article>
        `).join("")}
      </div>`
    );

    return;
  }

  /* ABOUT */

  if (page === "about") {
    app.innerHTML = shell(
      "About Tanish",
      siteData.aboutTitle || DEFAULT_SITE.aboutTitle,
      "I enjoy turning ideas into polished digital experiences.",

      `<article class="card">
        <h3>Hey, I'm Tanish.</h3>
        <p>${esc(siteData.aboutBody || DEFAULT_SITE.aboutBody)}</p>
      </article>`
    );

    return;
  }

  /* CONTACT */

  if (page === "contact") {
    app.innerHTML = shell(
      "Let's connect",
      "Have a project in mind?",
      "Reach out through any of these links.",

      contactCards() + `
        <div class="actions">
          <a class="btn" href="?page=budget">Send project brief ↗</a>
        </div>
      `
    );

    return;
  }

  /* REVIEWS */

  if (page === "reviews") {
    const reviews = await getRows("reviews", "status", "approved");

    app.innerHTML = shell(
      "Client feedback",
      "Reviews & testimonials.",
      "Feedback from people who have worked with Tanish.",

      `<div class="two">
        <div>
          ${reviews.map(review => `
            <article class="card review">
              <div class="stars">
                ${"★".repeat(Math.max(1, Math.min(5, Number(review.rating) || 5)))}
              </div>
              <blockquote>“${esc(review.message)}”</blockquote>
              <div class="person">— ${esc(review.name)}</div>
              <p>${esc(review.service || "")}</p>
            </article>
          `).join("") || `
            <div class="empty">No published reviews yet. Be the first!</div>
          `}
        </div>

        <form class="card" id="reviewForm">
          <h3>Leave a review</h3>

          <div class="field">
            <label>Name</label>
            <input name="name" maxlength="70" required>
          </div>

          <div class="field">
            <label>Service</label>
            <select name="service">
              <option>Discord Development</option>
              <option>Website Design</option>
              <option>Roblox Game Development</option>
              <option>Other</option>
            </select>
          </div>

          <div class="field">
            <label>Rating</label>
            <select name="rating">
              <option value="5">★★★★★ — 5</option>
              <option value="4">★★★★ — 4</option>
              <option value="3">★★★ — 3</option>
              <option value="2">★★ — 2</option>
              <option value="1">★ — 1</option>
            </select>
          </div>

          <div class="field">
            <label>Your review</label>
            <textarea name="message" maxlength="1200" required></textarea>
          </div>

          <button class="btn" type="submit">Submit for approval</button>
          <p class="muted form-status">Reviews appear after admin approval.</p>
        </form>
      </div>`
    );

    document.getElementById("reviewForm").onsubmit = async event => {
      event.preventDefault();

      const data = Object.fromEntries(
        new FormData(event.currentTarget)
      );

      data.rating = Number(data.rating);
      data.status = "pending";

      await submitRow("reviews", data, event.currentTarget);
    };

    return;
  }

  /* QUESTIONS AND ANSWERS */

  if (page === "qa") {
    const questions = await getRows("questions", "status", "answered");

    app.innerHTML = shell(
      "Questions & answers",
      "Ask Tanish.",
      "Ask about services, projects, availability or working together.",

      `<div class="two">
        <div>
          ${questions.map(item => `
            <article class="card">
              <h3>${esc(item.question)}</h3>
              <p>${esc(item.answer)}</p>
              <small class="muted">
                Asked by ${esc(item.name || "Visitor")}
              </small>
            </article>
          `).join("") || `
            <div class="empty">No public answers yet. Ask the first question.</div>
          `}
        </div>

        <form class="card" id="qForm">
          <h3>Ask a question</h3>

          <div class="field">
            <label>Your name (optional)</label>
            <input name="name" maxlength="70">
          </div>

          <div class="field">
            <label>Your question</label>
            <textarea name="question" maxlength="1000" required></textarea>
          </div>

          <button class="btn" type="submit">Send question</button>
          <p class="muted form-status">
            Questions are reviewed before publication.
          </p>
        </form>
      </div>`
    );

    document.getElementById("qForm").onsubmit = async event => {
      event.preventDefault();

      const data = Object.fromEntries(
        new FormData(event.currentTarget)
      );

      data.status = "pending";

      await submitRow("questions", data, event.currentTarget);
    };

    return;
  }

  /* NEWS */

  if (page === "news") {
    const news = await getRows("news", "published", true);

    app.innerHTML = shell(
      "Announcements",
      "News & updates.",
      "The latest projects, releases and announcements.",

      news.length
        ? `<div class="grid">
            ${news.map(item => `
              <article class="card">
                <div class="tag">${esc(item.category || "Update")}</div>
                <h3>${esc(item.title)}</h3>
                <p>${esc(item.body)}</p>
                <small class="muted">
                  ${item.createdAt?.toDate
                    ? item.createdAt.toDate().toLocaleDateString()
                    : ""}
                </small>
              </article>
            `).join("")}
          </div>`
        : `<div class="empty">No updates published yet. Check back soon.</div>`
    );

    return;
  }

  /* BUDGET REQUESTS — USD */

  if (page === "budget") {
    app.innerHTML = shell(
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
          <select name="service">
            <option>Discord Server Development</option>
            <option>Website Desig
