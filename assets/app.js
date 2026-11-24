const SB_URL = "https://ulycivxmrkbuwbrxbzgd.supabase.co";
const SB_ANON_KEY = "sb_publishable_kiLaJIXU3-QjP_agL7pNvQ_kTHL2y3y";

const db = window.supabase
  ? window.supabase.createClient(SB_URL, SB_ANON_KEY)
  : null;

const CONTACT = {
  email: "tanishhdumbbo@gmail.com",
  discord: "https://discord.com/users/1465283869195501670",
  instagram: "https://www.instagram.com/tanishhhg?evlk=MTQxaGNlMDlwNGRnYg=="
};

const TEAM = [
  {
    name: "Tanish",
    role: "Founder & Lead Developer",
    detail: "Discord development, website design and Roblox game development."
  },
  {
    name: "Weirdmine",
    role: "Developer",
    detail: "Development team staff.",
    discord: "https://discord.com/users/1449633180494729400"
  },
  {
    name: "Sky",
    role: "Helper · Team Staff",
    detail: "Community assistance and team support.",
    discord: "https://discord.com/users/1541710506715250707"
  }
];

const esc = value =>
  String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

async function rows(table, modifyQuery) {
  if (!db) return [];

  let query = db.from(table).select("*");

  if (modifyQuery) query = modifyQuery(query);

  const { data, error } = await query;

  if (error) {
    console.error("Database error:", error);
    return [];
  }

  return data || [];
}

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
  const services = [
    {
      icon: "◈",
      title: "Discord Server Development",
      description: "Custom servers, roles, permissions, bots, embeds and community systems."
    },
    {
      icon: "⌘",
      title: "Website Design",
      description: "Responsive portfolios, landing pages and business websites."
    },
    {
      icon: "🎮",
      title: "Roblox Game Development",
      description: "Game concepts, interactive experiences and Roblox development."
    },
    {
      icon: "✳",
      title: "UI / UX & Creative Development",
      description: "Clear interfaces, front-end builds, interactions and polished details."
    }
  ];

  return services.map(service => `
    <article class="card">
      <div class="iconbox">${service.icon}</div>
      <h3>${service.title}</h3>
      <p>${service.description}</p>
    </article>
  `).join("");
}

function contactCards() {
  return `
    <div class="grid">
      <article class="card">
        <div class="iconbox">✉</div>
        <h3>Email</h3>
        <p>${CONTACT.email}</p>
        <a class="btn" href="mailto:${CONTACT.email}">Email Tanish ↗</a>
      </article>

      <article class="card">
        <div class="iconbox">◈</div>
        <h3>Discord</h3>
        <p>Connect with Tanish on Discord.</p>
        <a class="btn" target="_blank" rel="noopener" href="${CONTACT.discord}">Open Discord ↗</a>
      </article>

      <article class="card">
        <div class="iconbox">◎</div>
        <h3>Instagram</h3>
        <p>Follow Tanish on Instagram.</p>
        <a class="btn" target="_blank" rel="noopener" href="${CONTACT.instagram}">Open Instagram ↗</a>
      </article>
    </div>
  `;
}

async function submitRow(table, data, form) {
  const status = form.querySelector(".form-status");

  if (!db) {
    status.textContent = "Database connection is unavailable.";
    return;
  }

  status.textContent = "Submitting...";

  try {
    const { error } = await db.from(table).insert(data);

    if (error) throw error;

    status.textContent = "Submitted successfully! It will appear after review.";
    form.reset();
  } catch (error) {
    console.error(error);
    status.textContent = "Could not submit. Please try again later.";
  }
}

async function render() {
  const app = document.getElementById("app");

  // admin.html also loads this file. Do not run website code there.
  if (!app) return;

  const params = new URLSearchParams(location.search);
  const page = params.get("page") || "home";

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  document.querySelectorAll("[data-page]").forEach(link => {
    link.classList.toggle("active", link.dataset.page === page);
  });

  const menu = document.getElementById("menu");
  const nav = document.getElementById("nav");

  if (menu && nav) {
    menu.onclick = () => nav.classList.toggle("open");
  }

  if (page === "home") {
    app.innerHTML = `
      <section class="hero">
        <div>
          <div class="eyebrow">Digital creator · Developer</div>
          <h1>Think.<br><span class="gradient">Design. Build.</span></h1>
          <p class="lead">
            I'm Tanish — building organised Discord communities,
            designing modern websites and developing Roblox game experiences.
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
          <div><div class="eyebrow">What I do</div><h2>Built for the digital world.</h2></div>
          <a class="btn alt" href="?page=services">All services ↗</a>
        </div>
        <div class="grid">${serviceCards()}</div>
      </section>

      <section class="section">
        <div class="section-head">
          <div><div class="eyebrow">Latest updates</div><h2>What's new.</h2></div>
          <a class="btn alt" href="?page=news">All news ↗</a>
        </div>
        <div id="homeNews" class="grid">
          <div class="empty">Loading updates...</div>
        </div>
      </section>
    `;

    const news = await rows("news", q =>
      q.eq("published", true).order("created_at", { ascending: false }).limit(3)
    );

    const newsBox = document.getElementById("homeNews");

    if (newsBox) {
      newsBox.innerHTML = news.length
        ? news.map(item => `
          <article class="card">
            <div class="tag">${esc(item.category || "Update")}</div>
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.body)}</p>
          </article>
        `).join("")
        : `<div class="empty">New updates will appear here soon.</div>`;
    }

    return;
  }

  if (page === "projects") {
    const projects = await rows("projects", q =>
      q.eq("published", true).order("created_at", { ascending: false })
    );

    app.innerHTML = shell(
      "Selected work",
      "Ideas into experiences.",
      "A selection of Discord, website and Roblox projects.",
      projects.length
        ? `<div class="grid">${projects.map(project => `
            <article class="card">
              <div class="tag">${esc(project.category || "Project")}</div>
              <h3>${esc(project.title)}</h3>
              <p>${esc(project.description)}</p>
              ${project.url ? `<a class="btn alt" href="${esc(project.url)}" target="_blank" rel="noopener">View project ↗</a>` : ""}
            </article>
          `).join("")}</div>`
        : `<div class="empty">Projects will be published here soon.</div>`
    );
    return;
  }

  if (page === "services") {
    app.innerHTML = shell(
      "What I do",
      "Services built around your ideas.",
      "Choose a service and tell me what you're planning.",
      `<div class="grid">${serviceCards()}</div>
       <div class="actions"><a class="btn" href="?page=budget">Plan your budget ↗</a></div>`
    );
    return;
  }

  if (page === "team") {
    app.innerHTML = shell(
      "The people behind the work",
      "Meet the team.",
      "A small creative and development team.",
      `<div class="grid">${TEAM.map(member => `
        <article class="card">
          <div class="iconbox">◈</div>
          <h3>${esc(member.name)}</h3>
          <span class="team-role">${esc(member.role)}</span>
          <p>${esc(member.detail)}</p>
          ${member.discord ? `<a class="muted" href="${member.discord}" target="_blank" rel="noopener">Discord profile ↗</a>` : ""}
        </article>
      `).join("")}</div>`
    );
    return;
  }

  if (page === "about") {
    app.innerHTML = shell(
      "About Tanish",
      "The person behind the pixels.",
      "I enjoy turning ideas into polished digital experiences.",
      `<article class="card">
        <h3>Hey, I'm Tanish.</h3>
        <p>
          I work across Discord server development, website design and
          Roblox game development. My focus is creating clear, memorable
          and useful digital experiences.
        </p>
        <p>I care about clean design, thoughtful details and making things easy to use.</p>
      </article>`
    );
    return;
  }

  if (page === "contact") {
    app.innerHTML = shell(
      "Let's connect",
      "Have a project in mind?",
      "Reach out through any of these links.",
      contactCards() + `<div class="actions"><a class="btn" href="?page=budget">Send project brief ↗</a></div>`
    );
    return;
  }

  if (page === "reviews") {
    const reviews = await rows("reviews", q =>
      q.eq("status", "approved").order("created_at", { ascending: false })
    );

    app.innerHTML = shell(
      "Client feedback",
      "Reviews & testimonials.",
      "Feedback from people who have worked with Tanish.",
      `<div class="two">
        <div>
          ${reviews.length ? reviews.map(review => `
            <article class="card review">
              <div class="stars">${"★".repeat(Math.max(1, Math.min(5, Number(review.rating) || 5)))}</div>
              <blockquote>“${esc(review.message)}”</blockquote>
              <div class="person">— ${esc(review.name)}</div>
              <p>${esc(review.service || "")}</p>
            </article>
          `).join("") : `<div class="empty">No published reviews yet. Be the first to share feedback.</div>`}
        </div>

        <form class="card" id="reviewForm">
          <h3>Leave a review</h3>
          <div class="field"><label>Name</label><input name="name" maxlength="70" required></div>
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
          <div class="field"><label>Your review</label><textarea name="message" maxlength="1200" required></textarea></div>
          <button class="btn" type="submit">Submit for approval</button>
          <p class="muted form-status">Reviews appear publicly only after admin approval.</p>
        </form>
      </div>`
    );

    document.getElementById("reviewForm").onsubmit = async event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget));
      data.rating = Number(data.rating);
      data.status = "pending";
      await submitRow("reviews", data, event.currentTarget);
    };
    return;
  }

  if (page === "qa") {
    const questions = await rows("questions", q =>
      q.eq("status", "answered").order("created_at", { ascending: false })
    );

    app.innerHTML = shell(
      "Questions & answers",
      "Ask Tanish.",
      "Ask about services, projects, availability or working together.",
      `<div class="two">
        <div>
          ${questions.length ? questions.map(item => `
            <article class="card">
              <h3>${esc(item.question)}</h3>
              <p>${esc(item.answer)}</p>
              <small class="muted">Asked by ${esc(item.name || "Visitor")}</small>
            </article>
          `).join("") : `<div class="empty">No public answers yet. Ask the first question.</div>`}
        </div>

        <form class="card" id="qForm">
          <h3>Ask a question</h3>
          <div class="field"><label>Your name (optional)</label><input name="name" maxlength="70"></div>
          <div class="field"><label>Your question</label><textarea name="question" maxlength="1000" required></textarea></div>
          <button class="btn" type="submit">Send question</button>
          <p class="muted form-status">Questions are reviewed before publication.</p>
        </form>
      </div>`
    );

    document.getElementById("qForm").onsubmit = async event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget));
      data.status = "pending";
      await submitRow("questions", data, event.currentTarget);
    };
    return;
  }

  if (page === "news") {
    const news = await rows("news", q =>
      q.eq("published", true).order("created_at", { ascending: false })
    );

    app.innerHTML = shell(
      "Announcements",
      "News & updates.",
      "The latest projects, releases and announcements.",
      news.length
        ? `<div class="grid">${news.map(item => `
            <article class="card">
              <div class="tag">${esc(item.category || "Update")}</div>
              <h3>${esc(item.title)}</h3>
              <p>${esc(item.body)}</p>
              <small class="muted">${item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}</small>
            </article>
          `).join("")}</div>`
        : `<div class="empty">No updates published yet. Check back soon.</div>`
    );
    return;
  }

  if (page === "budget") {
    app.innerHTML = shell(
      "Project inquiry",
      "Let's plan your project.",
      "Choose a budget range or enter your own amount.",
      `<form class="card form-card" id="budgetForm">
        <div class="field"><label>Your name</label><input name="name" required maxlength="70"></div>
        <div class="field"><label>Email or Discord username</label><input name="contact" required maxlength="120"></div>
        <div class="field">
          <label>What do you need?</label>
          <select name="service">
            <option>Discord Server Development</option>
            <option>Website Design</option>
            <option>Roblox Game Development</option>
            <option>Other</option>
          </select>
        </div>
        <div class="field">
          <label>Select a budget (INR)</label>
          <select id="budgetPreset">
            <option value="Not decided">Not decided</option>
            <option>₹500–₹1,000</option>
            <option>₹1,000–₹3,000</option>
            <option>₹3,000–₹5,000</option>
            <option>₹5,000–₹10,000</option>
            <option>₹10,000+</option>
            <option value="custom">Enter my own budget</option>
          </select>
        </div>
        <div class="field" id="customBudget" hidden>
          <label>Custom budget (INR)</label>
          <input id="customAmount" type="number" min="1" placeholder="Enter amount">
        </div>
        <div class="field"><label>Project details</label><textarea name="details" required maxlength="2000"></textarea></div>
        <button class="btn" type="submit">Send project request</button>
        <p class="muted form-status">Your request will be sent privately to the admin.</p>
      </form>`
    );

    const preset = document.getElementById("budgetPreset");
    const custom = document.getElementById("customBudget");

    preset.onchange = () => {
      custom.hidden = preset.value !== "custom";
    };

    document.getElementById("budgetForm").onsubmit = async event => {
      event.preventDefault();

      const data = Object.fromEntries(new FormData(event.currentTarget));

      if (preset.value === "custom") {
        const amount = document.getElementById("customAmount").value;
        if (!amount || Number(amount) < 1) {
          event.currentTarget.querySelector(".form-status").textContent = "Enter a valid custom budget.";
          return;
        }
        data.budget = "₹" + amount;
      } else {
        data.budget = preset.value;
      }

      await submitRow("budgets", data, event.currentTarget);
    };
    return;
  }

  app.innerHTML = shell(
    "Page not found",
    "That page isn't here.",
    "Use the navigation above to explore TanishGG.",
    `<a class="btn" href="index.html">Back home</a>`
  );
}

function setupAI() {
  const chat = document.getElementById("chat");
  const open = document.getElementById("aiOpen");
  const close = document.getElementById("aiClose");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const log = document.getElementById("chatLog");

  if (!chat || !open || !close || !form || !input || !log) return;

  open.onclick = () => chat.classList.add("open");
  close.onclick = () => chat.classList.remove("open");

  function bubble(message, who) {
    const paragraph = document.createElement("p");
    paragraph.className = who;
    paragraph.textContent = message;
    log.appendChild(paragraph);
    log.scrollTop = log.scrollHeight;
  }

  form.onsubmit = async event => {
    event.preventDefault();

    const question = input.value.trim();
    if (!question) return;

    bubble(question, "user");
    input.value = "";

    let answer =
      `You can contact Tanish at ${CONTACT.email}, through Discord or Instagram. ` +
      "Services include Discord development, website design and Roblox game development. " +
      "Use the Contact or Budget page to send a project request.";

    if (db) {
      try {
        const { data, error } = await db.functions.invoke("ask-ai", {
          body: { question }
        });

        if (!error && data && data.answer) {
          answer = data.answer;
        } else {
          console.warn("AI function error:", error);
        }
      } catch (error) {
        console.error("AI request failed:", error);
      }
    }

    bubble(answer, "bot");
  };
}

(async function startApp() {
  try {
    await render();
    setupAI();
  } catch (error) {
    console.error("TanishGG app error:", error);

    const app = document.getElementById("app");
    if (app) {
      app.innerHTML = `
        <div class="card">
          <h2>Something went wrong</h2>
          <p>Please refresh the page and try again.</p>
        </div>
      `;
    }
  }
})();
      
