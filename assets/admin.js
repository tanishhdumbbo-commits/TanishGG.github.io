/* =====================================================
   TANISHGG ADMIN PORTAL — FIREBASE VERSION
   PART 1 — CONNECTION, LOGIN & ADMIN SECURITY
   ===================================================== */

const ADMIN_UID = "2MJaMK6lzWOsUURow1PqEifQGWA2";

let adminDB = null;
let adminAuth = null;
let adminUser = null;

const adminRoot = document.createElement("div");
adminRoot.id = "tanishAdminRoot";
document.body.appendChild(adminRoot);

function adminEscape(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function adminScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(
      new Error("Failed to load " + src)
    );
    document.head.appendChild(script);
  });
}

async function initializeAdminFirebase() {
  try {
    await adminScript(
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
    );

    await adminScript(
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"
    );

    await adminScript(
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"
    );

    await adminScript("assets/firebase-config.js");

    adminDB = firebase.firestore();
    adminAuth = firebase.auth();

    window.tanishDB = adminDB;
    window.tanishAuth = adminAuth;

    return true;
  } catch (error) {
    console.error("Admin Firebase error:", error);
    adminRoot.innerHTML = `
      <h2>Connection failed</h2>
      <p>${adminEscape(error.message)}</p>
      <button onclick="location.reload()">Retry</button>
    `;
    return false;
  }
}

function adminStyles() {
  if (document.getElementById("tanishAdminStyles")) return;

  const style = document.createElement("style");
  style.id = "tanishAdminStyles";

  style.textContent = `
    #tanishAdminRoot {
      min-height: 100vh;
      background: #090b12;
      color: #f4f4f5;
      padding: 24px;
      font-family: Arial, sans-serif;
      box-sizing: border-box;
    }

    #tanishAdminRoot * {
      box-sizing: border-box;
    }

    .admin-container {
      max-width: 1150px;
      margin: auto;
    }

    .admin-card {
      background: #131722;
      border: 1px solid #252c3a;
      border-radius: 16px;
      padding: 22px;
      margin-bottom: 18px;
    }

    .admin-brand {
      font-size: 25px;
      font-weight: 900;
      margin-bottom: 28px;
    }

    .admin-brand span {
      color: #8b7cff;
    }

    .admin-input,
    .admin-select,
    .admin-textarea {
      display: block;
      width: 100%;
      padding: 13px;
      margin: 9px 0 17px;
      color: white;
      background: #090e19;
      border: 1px solid #30394b;
      border-radius: 9px;
      font-size: 15px;
    }

    .admin-textarea {
      min-height: 110px;
      resize: vertical;
    }

    .admin-button {
      border: 0;
      border-radius: 9px;
      padding: 12px 18px;
      background: #7967f5;
      color: white;
      font-weight: bold;
      cursor: pointer;
      margin: 4px;
    }

    .admin-button.secondary {
      background: #293246;
    }

    .admin-button.danger {
      background: #a93649;
    }

    .admin-button:disabled {
      opacity: .5;
      cursor: not-allowed;
    }

    .admin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 15px;
    }

    .admin-status {
      color: #b5aaff;
      margin-top: 12px;
    }

    .admin-item {
      background: #0d121e;
      border: 1px solid #283247;
      padding: 17px;
      border-radius: 12px;
      margin: 12px 0;
    }

    .admin-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 22px;
    }

    .admin-nav button {
      background: #20283a;
    }

    @media(max-width: 600px) {
      #tanishAdminRoot {
        padding: 14px;
      }
    }
  `;

  document.head.appendChild(style);
}

function renderAdminLogin(message = "") {
  adminRoot.innerHTML = `
    <div class="admin-container">
      <div class="admin-card" style="max-width:440px;margin:70px auto">
        <div class="admin-brand">
          TANISH<span>GG</span> ADMIN
        </div>

        <h2>Welcome back.</h2>
        <p>Sign in to manage your website.</p>

        <form id="adminLoginForm">
          <label>Email address</label>
          <input class="admin-input" name="email"
            type="email" required autocomplete="username">

          <label>Password</label>
          <input class="admin-input" name="password"
            type="password" required autocomplete="current-password">

          <button class="admin-button" type="submit">
            Sign in
          </button>
        </form>

        <p class="admin-status" id="adminLoginStatus">
          ${adminEscape(message)}
        </p>
      </div>
    </div>
  `;

  document.getElementById("adminLoginForm")
    .addEventListener("submit", async event => {
      event.preventDefault();

      const form = event.currentTarget;
      const status = document.getElementById("adminLoginStatus");
      const button = form.querySelector("button");

      button.disabled = true;
      status.textContent = "Signing in...";

      try {
        await adminAuth.signInWithEmailAndPassword(
          form.email.value.trim(),
          form.password.value
        );
      } catch (error) {
        status.textContent = error.message;
        button.disabled = false;
      }
    });
}

function verifyAdmin(user) {
  if (!user || user.uid !== ADMIN_UID) {
    adminRoot.innerHTML = `
      <div class="admin-container">
        <div class="admin-card">
          <h2>Access denied</h2>
          <p>This account is not authorized to manage TanishGG.</p>
          <button class="admin-button"
            onclick="adminAuth.signOut()">
            Sign out
          </button>
        </div>
      </div>
    `;
    return false;
  }

  adminUser = user;
  return true;
}

/* =====================================================
   TANISHGG ADMIN PORTAL
   PART 2 — DASHBOARD & ADMIN NAVIGATION
   ===================================================== */

const ADMIN_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "website", label: "Website Editor" },
  { id: "projects", label: "Projects" },
  { id: "reviews", label: "Reviews" },
  { id: "questions", label: "Q&A" },
  { id: "news", label: "News" },
  { id: "budgets", label: "Budget Requests" }
];

let activeAdminSection = "overview";

function renderAdminDashboard() {
  adminRoot.innerHTML = `
    <div class="admin-container">

      <header class="admin-card">
        <div class="admin-brand">
          TANISH<span>GG</span> ADMIN
        </div>

        <div>
          <h2>Welcome to your dashboard.</h2>
          <p>Manage your portfolio and website content.</p>
          <small>${adminEscape(adminUser?.email || "")}</small>
        </div>

        <button class="admin-button danger"
          id="adminLogout">
          Sign out
        </button>
      </header>

      <nav class="admin-nav">
        ${ADMIN_SECTIONS.map(section => `
          <button
            class="admin-button ${activeAdminSection === section.id ? "" : "secondary"}"
            data-admin-page="${section.id}">
            ${section.label}
          </button>
        `).join("")}
      </nav>

      <section id="adminContent">
        <div class="admin-card">
          <h2>Loading dashboard...</h2>
        </div>
      </section>

    </div>
  `;

  document.getElementById("adminLogout")
    .addEventListener("click", async () => {
      await adminAuth.signOut();
    });

  document.querySelectorAll("[data-admin-page]")
    .forEach(button => {
      button.addEventListener("click", () => {
        activeAdminSection = button.dataset.adminPage;

        renderAdminDashboard();
      });
    });

  loadAdminSection();
}

async function loadAdminSection() {
  const content = document.getElementById("adminContent");

  if (!content) return;

  content.innerHTML = `
    <div class="admin-card">
      <h2>Loading...</h2>
    </div>
  `;

  try {
    if (activeAdminSection === "overview") {
      await showAdminOverview(content);
    }

    else if (activeAdminSection === "website") {
      await showWebsiteEditor(content);
    }

    else if (activeAdminSection === "projects") {
      await showProjectsManager(content);
    }

    else if (activeAdminSection === "reviews") {
      await showReviewsManager(content);
    }

    else if (activeAdminSection === "questions") {
      await showQuestionsManager(content);
    }

    else if (activeAdminSection === "news") {
      await showNewsManager(content);
    }

    else if (activeAdminSection === "budgets") {
      await showBudgetsManager(content);
    }

  } catch (error) {
    console.error("Admin section error:", error);

    content.innerHTML = `
      <div class="admin-card">
        <h2>Something went wrong</h2>
        <p>${adminEscape(error.message)}</p>
      </div>
    `;
  }
}

async function adminGetCollection(collection) {
  const snapshot = await adminDB
    .collection(collection)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

async function showAdminOverview(content) {
  const collections = [
    ["Projects", "projects"],
    ["Reviews", "reviews"],
    ["Questions", "questions"],
    ["News", "news"],
    ["Budget Requests", "budgets"]
  ];

  const results = await Promise.all(
    collections.map(async ([label, collection]) => {
      const rows = await adminGetCollection(collection);

      return {
        label,
        count: rows.length
      };
    })
  );

  content.innerHTML = `
    <div class="admin-card">
      <h2>Dashboard Overview</h2>
      <p>Here's what's happening across your website.</p>
    </div>

    <div class="admin-grid">
      ${results.map(item => `
        <article class="admin-card">
          <p>${adminEscape(item.label)}</p>
          <h1>${item.count}</h1>
          <small>Total records</small>
        </article>
      `).join("")}
    </div>

    <div class="admin-card">
      <h3>Quick actions</h3>

      <button class="admin-button"
        data-quick="website">
        Edit Website
      </button>

      <button class="admin-button"
        data-quick="projects">
        Manage Projects
      </button>

      <button class="admin-button"
        data-quick="reviews">
        Check Reviews
      </button>
    </div>
  `;

  content.querySelectorAll("[data-quick]")
    .forEach(button => {
      button.addEventListener("click", () => {
        activeAdminSection = button.dataset.quick;
        renderAdminDashboard();
      });
    });
}

async function showWebsiteEditor(content) {
  const snapshot = await adminDB
    .collection("portfolio")
    .doc("main")
    .get();

  const data = {
    ...DEFAULT_SITE,
    ...(snapshot.exists ? snapshot.data() : {})
  };

  content.innerHTML = `
    <div class="admin-card">
      <h2>Website Editor</h2>
      <p>Edit your main website information.</p>

      <form id="websiteEditorForm">

        <label>Homepage title</label>
        <input class="admin-input"
          name="homeTitle"
          value="${adminEscape(data.homeTitle)}"
          required>

        <label>Homepage description</label>
        <textarea class="admin-textarea"
          name="homeDescription"
          required>${adminEscape(data.homeDescription)}</textarea>

        <label>About title</label>
        <input class="admin-input"
          name="aboutTitle"
          value="${adminEscape(data.aboutTitle)}"
          required>

        <label>About description</label>
        <textarea class="admin-textarea"
          name="aboutBody"
          required>${adminEscape(data.aboutBody)}</textarea>

        <label>Announcement</label>
        <textarea class="admin-textarea"
          name="announcement">${adminEscape(data.announcement || "")}</textarea>

        <button class="admin-button" type="submit">
          Save Website Changes
        </button>

        <p class="admin-status" id="websiteEditorStatus"></p>
      </form>
    </div>
  `;

  document.getElementById("websiteEditorForm")
    .addEventListener("submit", async event => {
      event.preventDefault();

      const form = event.currentTarget;
      const status = document.getElementById("websiteEditorStatus");

      try {
        await adminDB.collection("portfolio")
          .doc("main")
          .set({
            homeTitle: form.elements.homeTitle.value.trim(),
            homeDescription: form.elements.homeDescription.value.trim(),
            aboutTitle: form.elements.aboutTitle.value.trim(),
            aboutBody: form.elements.aboutBody.value.trim(),
            announcement: form.elements.announcement.value.trim()
          }, { merge: true });

        status.textContent = "Website changes saved successfully!";
      } catch (error) {
        status.textContent = "Save failed: " + error.message;
      }
    });
}

/* =====================================================
   TANISHGG ADMIN PORTAL
   PART 3 — PROJECT MANAGEMENT
   ===================================================== */

async function showProjectsManager(content) {
  const projects = await adminGetCollection("projects");

  content.innerHTML = `
    <div class="admin-card">
      <h2>Project Management</h2>
      <p>Add and manage projects displayed on your portfolio.</p>
    </div>

    <div class="admin-card">
      <h3 id="projectFormTitle">Add New Project</h3>

      <form id="projectForm">
        <input type="hidden" name="id">

        <label>Project title</label>
        <input class="admin-input"
          name="title" required maxlength="120">

        <label>Project description</label>
        <textarea class="admin-textarea"
          name="description" required maxlength="2000"></textarea>

        <label>Project image URL (optional)</label>
        <input class="admin-input"
          name="image" type="url"
          placeholder="https://example.com/image.png">

        <label>Project link (optional)</label>
        <input class="admin-input"
          name="link" type="url"
          placeholder="https://example.com">

        <label>Publication status</label>
        <select class="admin-select" name="published">
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>

        <button class="admin-button" type="submit">
          Save Project
        </button>

        <button class="admin-button secondary"
          type="button" id="cancelProjectEdit">
          Clear Form
        </button>

        <p class="admin-status" id="projectStatus"></p>
      </form>
    </div>

    <div class="admin-card">
      <h3>Existing Projects (${projects.length})</h3>

      ${projects.length ? projects.map(project => `
        <article class="admin-item">
          <h3>${adminEscape(project.title || "Untitled")}</h3>
          <p>${adminEscape(project.description || "")}</p>

          <p>
            Status:
            <strong>${project.published ? "Published" : "Draft"}</strong>
          </p>

          ${project.image ? `
            <p>Image: ${adminEscape(project.image)}</p>
          ` : ""}

          <button class="admin-button"
            data-edit-project="${adminEscape(project.id)}">
            Edit
          </button>

          <button class="admin-button danger"
            data-delete-project="${adminEscape(project.id)}">
            Delete
          </button>
        </article>
      `).join("") : "<p>No projects created yet.</p>"}
    </div>
  `;

  const form = document.getElementById("projectForm");
  const status = document.getElementById("projectStatus");

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const id = form.elements.id.value.trim();

    const project = {
      title: form.elements.title.value.trim(),
      description: form.elements.description.value.trim(),
      image: form.elements.image.value.trim(),
      link: form.elements.link.value.trim(),
      published: form.elements.published.value === "true",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      if (id) {
        await adminDB.collection("projects").doc(id).update(project);
      } else {
        project.createdAt =
          firebase.firestore.FieldValue.serverTimestamp();

        await adminDB.collection("projects").add(project);
      }

      status.textContent = "Project saved successfully!";
      await showProjectsManager(content);

    } catch (error) {
      status.textContent = "Error: " + error.message;
    }
  });

  document.getElementById("cancelProjectEdit")
    .addEventListener("click", () => {
      form.reset();
      form.elements.id.value = "";
      document.getElementById("projectFormTitle").textContent =
        "Add New Project";
      status.textContent = "";
    });

  content.querySelectorAll("[data-edit-project]")
    .forEach(button => {
      button.addEventListener("click", () => {
        const project = projects.find(
          item => item.id === button.dataset.editProject
        );

        if (!project) return;

        form.elements.id.value = project.id;
        form.elements.title.value = project.title || "";
        form.elements.description.value = project.description || "";
        form.elements.image.value = project.image || "";
        form.elements.link.value = project.link || "";
        form.elements.published.value =
          project.published ? "true" : "false";

        document.getElementById("projectFormTitle").textContent =
          "Edit Project";

        form.scrollIntoView({ behavior: "smooth" });
      });
    });

  content.querySelectorAll("[data-delete-project]")
    .forEach(button => {
      button.addEventListener("click", async () => {
        const id = button.dataset.deleteProject;

        if (!confirm("Are you sure you want to delete this project?")) {
          return;
        }

        try {
          await adminDB.collection("projects").doc(id).delete();
          await showProjectsManager(content);
        } catch (error) {
          alert("Could not delete project: " + error.message);
        }
      });
    });
}
/* =====================================================
   TANISHGG ADMIN PORTAL
   PART 4 — REVIEWS & Q&A MANAGEMENT
   ===================================================== */

async function showReviewsManager(content) {
  const reviews = await adminGetCollection("reviews");

  content.innerHTML = `
    <div class="admin-card">
      <h2>Review Management</h2>
      <p>Approve or delete visitor reviews.</p>
    </div>

    ${reviews.length ? reviews.map(review => `
      <article class="admin-item">
        <h3>${adminEscape(review.name || "Anonymous")}</h3>

        <p>
          Rating: ${"★".repeat(Math.min(5, Math.max(0,
            Number(review.rating) || 0)))}
        </p>

        <p>${adminEscape(review.message || "")}</p>

        <p>
          Status:
          <strong>${adminEscape(review.status || "pending")}</strong>
        </p>

        ${review.status !== "approved" ? `
          <button class="admin-button"
            data-approve-review="${adminEscape(review.id)}">
            Approve
          </button>
        ` : ""}

        <button class="admin-button danger"
          data-delete-review="${adminEscape(review.id)}">
          Delete
        </button>
      </article>
    `).join("") : `
      <div class="admin-card">
        <p>No reviews submitted yet.</p>
      </div>
    `}
  `;

  content.querySelectorAll("[data-approve-review]")
    .forEach(button => {
      button.addEventListener("click", async () => {
        try {
          await adminDB.collection("reviews")
            .doc(button.dataset.approveReview)
            .update({
              status: "approved"
            });

          await showReviewsManager(content);
        } catch (error) {
          alert("Approval failed: " + error.message);
        }
      });
    });

  content.querySelectorAll("[data-delete-review]")
    .forEach(button => {
      button.addEventListener("click", async () => {
        if (!confirm("Delete this review permanently?")) return;

        try {
          await adminDB.collection("reviews")
            .doc(button.dataset.deleteReview)
            .delete();

          await showReviewsManager(content);
        } catch (error) {
          alert("Deletion failed: " + error.message);
        }
      });
    });
}


async function showQuestionsManager(content) {
  const questions = await adminGetCollection("questions");

  content.innerHTML = `
    <div class="admin-card">
      <h2>Q&A Management</h2>
      <p>Answer questions submitted by your visitors.</p>
    </div>

    ${questions.length ? questions.map(question => `
      <article class="admin-item">
        <h3>${adminEscape(question.name || "Anonymous")}</h3>

        <p>
          <strong>Question:</strong>
          ${adminEscape(question.question || "")}
        </p>

        <p>
          Status:
          <strong>${adminEscape(question.status || "pending")}</strong>
        </p>

        <form data-answer-form="${adminEscape(question.id)}">
          <label>Answer</label>

          <textarea class="admin-textarea"
            name="answer" required>${adminEscape(question.answer || "")}</textarea>

          <button class="admin-button" type="submit">
            Save & Publish Answer
          </button>
        </form>

        <button class="admin-button danger"
          data-delete-question="${adminEscape(question.id)}">
          Delete Question
        </button>
      </article>
    `).join("") : `
      <div class="admin-card">
        <p>No questions submitted yet.</p>
      </div>
    `}
  `;

  content.querySelectorAll("[data-answer-form]")
    .forEach(form => {
      form.addEventListener("submit", async event => {
        event.preventDefault();

        const id = form.dataset.answerForm;
        const answer = form.elements.answer.value.trim();

        try {
          await adminDB.collection("questions")
            .doc(id)
            .update({
              answer,
              status: "answered",
              answeredAt:
                firebase.firestore.FieldValue.serverTimestamp()
            });

          await showQuestionsManager(content);
        } catch (error) {
          alert("Could not save answer: " + error.message);
        }
      });
    });

  content.querySelectorAll("[data-delete-question]")
    .forEach(button => {
      button.addEventListener("click", async () => {
        if (!confirm("Delete this question permanently?")) return;

        try {
          await adminDB.collection("questions")
            .doc(button.dataset.deleteQuestion)
            .delete();

          await showQuestionsManager(content);
        } catch (error) {
          alert("Could not delete question: " + error.message);
        }
      });
    });
}
/* =====================================================
   TANISHGG ADMIN PORTAL
   PART 5 — NEWS, BUDGETS & FINAL STARTUP
   ===================================================== */


/* -----------------------------
   NEWS MANAGEMENT
----------------------------- */

async function showNewsManager(content) {
  const news = await adminGetCollection("news");

  content.innerHTML = `
    <div class="admin-card">
      <h2>News Management</h2>
      <p>Create announcements and publish news on your website.</p>
    </div>

    <div class="admin-card">
      <h3 id="newsFormTitle">Create News</h3>

      <form id="newsForm">
        <input type="hidden" name="id">

        <label>News title</label>
        <input class="admin-input" name="title" required maxlength="150">

        <label>Description</label>
        <textarea class="admin-textarea" name="description" required></textarea>

        <label>Publication status</label>
        <select class="admin-select" name="published">
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>

        <button class="admin-button" type="submit">Save News</button>
        <button class="admin-button secondary" type="button" id="clearNewsForm">
          Clear Form
        </button>

        <p class="admin-status" id="newsStatus"></p>
      </form>
    </div>

    <div class="admin-card">
      <h3>Existing News (${news.length})</h3>

      ${news.length ? news.map(item => `
        <article class="admin-item">
          <h3>${adminEscape(item.title || "Untitled")}</h3>
          <p>${adminEscape(item.description || "")}</p>
          <p>Status: <strong>${item.published ? "Published" : "Draft"}</strong></p>

          <button class="admin-button" data-edit-news="${adminEscape(item.id)}">
            Edit
          </button>

          <button class="admin-button danger" data-delete-news="${adminEscape(item.id)}">
            Delete
          </button>
        </article>
      `).join("") : "<p>No news created yet.</p>"}
    </div>
  `;

  const form = document.getElementById("newsForm");
  const status = document.getElementById("newsStatus");

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const id = form.elements.id.value.trim();

    const item = {
      title: form.elements.title.value.trim(),
      description: form.elements.description.value.trim(),
      published: form.elements.published.value === "true",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      if (id) {
        await adminDB.collection("news").doc(id).update(item);
      } else {
        item.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await adminDB.collection("news").add(item);
      }

      await showNewsManager(content);
    } catch (error) {
      status.textContent = "Save failed: " + error.message;
    }
  });

  document.getElementById("clearNewsForm").addEventListener("click", () => {
    form.reset();
    form.elements.id.value = "";
    document.getElementById("newsFormTitle").textContent = "Create News";
    status.textContent = "";
  });

  content.querySelectorAll("[data-edit-news]").forEach(button => {
    button.addEventListener("click", () => {
      const item = news.find(row => row.id === button.dataset.editNews);
      if (!item) return;

      form.elements.id.value = item.id;
      form.elements.title.value = item.title || "";
      form.elements.description.value = item.description || "";
      form.elements.published.value = item.published ? "true" : "false";

      document.getElementById("newsFormTitle").textContent = "Edit News";
      form.scrollIntoView({ behavior: "smooth" });
    });
  });

  content.querySelectorAll("[data-delete-news]").forEach(button => {
    button.addEventListener("click", async () => {
      if (!confirm("Delete this news post?")) return;

      try {
        await adminDB.collection("news").doc(button.dataset.deleteNews).delete();
        await showNewsManager(content);
      } catch (error) {
        alert("Delete failed: " + error.message);
      }
    });
  });
}


/* -----------------------------
   BUDGET REQUEST MANAGEMENT
----------------------------- */

async function showBudgetsManager(content) {
  const budgets = await adminGetCollection("budgets");

  content.innerHTML = `
    <div class="admin-card">
      <h2>Budget Requests</h2>
      <p>View project inquiries submitted by visitors.</p>
    </div>

    ${budgets.length ? budgets.map(item => `
      <article class="admin-item">
        <h3>${adminEscape(item.name || "No name provided")}</h3>

        <p><strong>Email / Discord:</strong>
          ${adminEscape(item.email || item.contact || item.discord || "Not provided")}
        </p>

        <p><strong>Service:</strong>
          ${adminEscape(item.service || "Not specified")}
        </p>

        <p><strong>Budget:</strong>
          ${adminEscape(item.budget || "Not specified")}
        </p>

        <p><strong>Details:</strong>
          ${adminEscape(item.details || item.description || "No details provided")}
        </p>

        <p><strong>Status:</strong>
          ${adminEscape(item.status || "New")}
        </p>

        <button class="admin-button"
          data-review-budget="${adminEscape(item.id)}">
          Mark Reviewed
        </button>

        <button class="admin-button danger"
          data-delete-budget="${adminEscape(item.id)}">
          Delete Request
        </button>
      </article>
    `).join("") : `
      <div class="admin-card">
        <p>No budget requests received yet.</p>
      </div>
    `}
  `;

  content.querySelectorAll("[data-review-budget]").forEach(button => {
    button.addEventListener("click", async () => {
      try {
        await adminDB.collection("budgets")
          .doc(button.dataset.reviewBudget)
          .update({ status: "Reviewed" });

        await showBudgetsManager(content);
      } catch (error) {
        alert("Update failed: " + error.message);
      }
    });
  });

  content.querySelectorAll("[data-delete-budget]").forEach(button => {
    button.addEventListener("click", async () => {
      if (!confirm("Permanently delete this budget request?")) return;

      try {
        await adminDB.collection("budgets")
          .doc(button.dataset.deleteBudget)
          .delete();

        await showBudgetsManager(content);
      } catch (error) {
        alert("Delete failed: " + error.message);
      }
    });
  });
}


/* -----------------------------
   FIREBASE CONNECTION
   Reuses the existing connection
   when one is already available.
----------------------------- */

async function initializeAdminFirebase() {
  try {
    if (window.tanishDB && window.tanishAuth) {
      adminDB = window.tanishDB;
      adminAuth = window.tanishAuth;
      return true;
    }

    if (!window.firebase) {
      await adminScript(
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
      );
    }

    if (!firebase.firestore) {
      await adminScript(
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"
      );
    }

    if (!firebase.auth) {
      await adminScript(
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"
      );
    }

    if (!window.tanishDB || !window.tanishAuth) {
      await adminScript("assets/firebase-config.js");
    }

    adminDB = window.tanishDB || firebase.firestore();
    adminAuth = window.tanishAuth || firebase.auth();

    window.tanishDB = adminDB;
    window.tanishAuth = adminAuth;

    return true;

  } catch (error) {
    console.error("Firebase connection failed:", error);

    adminRoot.innerHTML = `
      <div class="admin-container">
        <div class="admin-card">
          <h2>Firebase connection failed</h2>
          <p>${adminEscape(error.message)}</p>
          <button class="admin-button" onclick="location.reload()">Retry</button>
        </div>
      </div>
    `;

    return false;
  }
}


/* -----------------------------
   FINAL ADMIN STARTUP
----------------------------- */

async function startTanishAdmin() {
  if (window.__tanishAdminStarted) return;
  window.__tanishAdminStarted = true;

  adminStyles();

  // Remove old unused admin elements.
  ["login", "panel", "status", "manager"].forEach(id => {
    document.getElementById(id)?.remove();
  });

  adminRoot.innerHTML = `
    <div class="admin-container">
      <div class="admin-card">
        <h2>Connecting to TanishGG...</h2>
        <p>Please wait.</p>
      </div>
    </div>
  `;

  const connected = await initializeAdminFirebase();
  if (!connected) return;

  adminAuth.onAuthStateChanged(user => {
    if (!user) {
      adminUser = null;
      activeAdminSection = "overview";
      renderAdminLogin();
      return;
    }

    if (!verifyAdmin(user)) {
      return;
    }

    renderAdminDashboard();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startTanishAdmin);
} else {
  startTanishAdmin();
                            }
