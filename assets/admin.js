
/* =====================================================
   TANISHGG ADMIN PORTAL — FIREBASE VERSION
   ===================================================== */

const ADMIN_UID = "2MJaMK6lzWOsUURow1PqEifQGWA2";

let adminDB;
let adminAuth;

const login = document.getElementById("login");
const panel = document.getElementById("panel");
const statusEl = document.getElementById("status");
const manager = document.getElementById("manager");

const escapeHTML = value =>
  String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

function showStatus(message) {
  if (statusEl) statusEl.textContent = message;
}

function timestamp() {
  return firebase.firestore.FieldValue.serverTimestamp();
}

/* Login */
document.getElementById("signIn").onclick = async () => {
  showStatus("Connecting to Firebase...");

  const connected = await window.firebaseReady;

  if (!connected) {
    showStatus("Firebase connection failed. Refresh and try again.");
    return;
  }

  adminDB = window.tanishDB;
  adminAuth = window.tanishAuth;

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showStatus("Enter your email and password.");
    return;
  }

  try {
    const result = await adminAuth.signInWithEmailAndPassword(
      email,
      password
    );

    await checkAdmin(result.user);
  } catch (error) {
    console.error(error);
    showStatus(error.message);
  }
};

/* Verify admin account */
async function checkAdmin(user) {
  if (!user || user.uid !== ADMIN_UID) {
    await adminAuth.signOut();
    showStatus("This account is not authorised as an admin.");
    return;
  }

  login.hidden = true;
  panel.hidden = false;

  showStatus("");
  loadEditor();
}

/* Logout */
document.getElementById("logout").onclick = async () => {
  if (adminAuth) await adminAuth.signOut();
  location.reload();
};

/* Navigation */
document.querySelectorAll("[data-table]").forEach(button => {
  button.onclick = () => {
    loadTable(button.dataset.table);
  };
});

/* Dashboard navigation helper */
function navigation() {
  return `
    <div class="actions">
      <button class="btn" data-section="editor">Website Editor</button>
      <button class="btn alt" data-section="news">News</button>
      <button class="btn alt" data-section="projects">Projects</button>
      <button class="btn alt" data-section="reviews">Reviews</button>
      <button class="btn alt" data-section="questions">Q&A</button>
      <button class="btn alt" data-section="budgets">Budgets</button>
    </div>
  `;
}

function attachNavigation() {
  manager.querySelectorAll("[data-section]").forEach(button => {
    button.onclick = () => {
      const section = button.dataset.section;

      if (section === "editor") loadEditor();
      else loadTable(section);
    };
  });
}

/* Website editor */
async function loadEditor() {
  manager.innerHTML = "<p>Loading website settings...</p>";

  try {
    const snapshot = await adminDB
      .collection("portfolio")
      .doc("main")
      .get();

    const data = snapshot.exists ? snapshot.data() : {};

    const defaultServices = [
      {
        title: "Discord Server Development",
        description: "Custom servers, roles, permissions, bots and community systems."
      },
      {
        title: "Website Design",
        description: "Responsive portfolios, landing pages and business websites."
      },
      {
        title: "Roblox Game Development",
        description: "Game concepts and interactive experiences."
      },
      {
        title: "UI / UX & Creative Development",
        description: "Clear interfaces and polished details."
      }
    ];

    const defaultTeam = [
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
    ];

    const services = data.services || defaultServices;
    const team = data.team || defaultTeam;
    const contact = data.contact || {
      email: "tanishhdumbbo@gmail.com",
      discord: "https://discord.com/users/1465283869195501670",
      instagram: "https://www.instagram.com/still_lonelyyy/"
    };

    manager.innerHTML = `
      ${navigation()}

      <section class="section">
        <div class="section-head">
          <div>
            <div class="eyebrow">Control your website</div>
            <h2>Website Editor</h2>
          </div>
        </div>

        <form class="card form-card" id="siteForm">

          <h3>Homepage</h3>

          <div class="field">
            <label>Homepage heading</label>
            <input name="homeTitle"
              value="${escapeHTML(data.homeTitle || "Think. Design. Build.")}"
              required>
          </div>

          <div class="field">
            <label>Homepage description</label>
            <textarea name="homeDescription" required>${escapeHTML(data.homeDescription || "")}</textarea>
          </div>

          <hr>

          <h3>About section</h3>

          <div class="field">
            <label>About heading</label>
            <input name="aboutTitle"
              value="${escapeHTML(data.aboutTitle || "The person behind the pixels.")}">
          </div>

          <div class="field">
            <label>About description</label>
            <textarea name="aboutBody">${escapeHTML(data.aboutBody || "")}</textarea>
          </div>

          <hr>

          <h3>Services</h3>
          <p class="muted">Edit the service titles and descriptions below. Keep the JSON format intact.</p>

          <div class="field">
            <label>Services data</label>
            <textarea name="services" rows="12" required>${escapeHTML(JSON.stringify(services, null, 2))}</textarea>
          </div>

          <hr>

          <h3>Team members</h3>
          <p class="muted">Edit team names, roles, descriptions and Discord links. Keep the JSON format intact.</p>

          <div class="field">
            <label>Team data</label>
            <textarea name="team" rows="14" required>${escapeHTML(JSON.stringify(team, null, 2))}</textarea>
          </div>

          <hr>

          <h3>Contact links</h3>

          <div class="field">
            <label>Email</label>
            <input name="email" type="email"
              value="${escapeHTML(contact.email)}">
          </div>

          <div class="field">
            <label>Discord profile URL</label>
            <input name="discord"
              value="${escapeHTML(contact.discord)}">
          </div>

          <div class="field">
            <label>Instagram URL</label>
            <input name="instagram"
              value="${escapeHTML(contact.instagram)}">
          </div>

          <button class="btn" type="submit">Save website changes</button>
          <p class="muted" id="editorStatus"></p>
        </form>
      </section>
    `;

    attachNavigation();

    document.getElementById("siteForm").onsubmit = async event => {
      event.preventDefault();

      const form = event.currentTarget;
      const result = document.getElementById("editorStatus");
      const fields = Object.fromEntries(new FormData(form));

      try {
        const servicesData = JSON.parse(fields.services);
        const teamData = JSON.parse(fields.team);

        if (!Array.isArray(servicesData) || !Array.isArray(teamData)) {
          throw new Error("Services and team must be JSON arrays.");
        }

        const newData = {
          homeTitle: fields.homeTitle,
          homeDescription: fields.homeDescription,
          aboutTitle: fields.aboutTitle,
          aboutBody: fields.aboutBody,
          services: servicesData,
          team: teamData,
          contact: {
            email: fields.email,
            discord: fields.discord,
            instagram: fields.instagram
          },
          updatedAt: timestamp()
        };

        result.textContent = "Saving...";

        await adminDB.collection("portfolio")
          .doc("main")
          .set(newData, { merge: true });

        result.textContent =
          "Saved successfully! Website visitors will receive the changes automatically.";
      } catch (error) {
        console.error(error);
        result.textContent = "Error: " + error.message;
      }
    };

  } catch (error) {
    console.error(error);
    manager.innerHTML = `<p class="muted">${escapeHTML(error.message)}</p>`;
  }
}

/* Collection manager */
async function loadTable(table) {
  manager.innerHTML = "<p>Loading...</p>";

  const labels = {
    news: "News",
    projects: "Projects",
    reviews: "Reviews",
    questions: "Questions & Answers",
    budgets: "Budget Requests"
  };

  try {
    const snapshot = await adminDB.collection(table).get();

    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    items.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    let cards = items.map(item => {
      const heading = item.title || item.question || item.name || item.service || "Entry";
      const description = item.body || item.message || item.details || item.answer || "";

      let actions = "";

      if (table === "reviews") {
        actions = `
          <button class="btn" data-action="approve" data-id="${escapeHTML(item.id)}">Approve</button>
          <button class="btn alt" data-action="reject" data-id="${escapeHTML(item.id)}">Reject</button>
        `;
      }

      if (table === "questions") {
        actions = `
          <button class="btn" data-action="answer" data-id="${escapeHTML(item.id)}">Answer</button>
          <button class="btn alt" data-action="reject" data-id="${escapeHTML(item.id)}">Reject</button>
        `;
      }

      return `
        <article class="card" style="margin:12px 0">
          <h3>${escapeHTML(heading)}</h3>
          <p>${escapeHTML(description)}</p>
          ${item.budget ? `<p><b>Budget:</b> ${escapeHTML(item.budget)}</p>` : ""}
          ${item.contact ? `<p><b>Contact:</b> ${escapeHTML(item.contact)}</p>` : ""}
          ${item.rating ? `<p><b>Rating:</b> ${escapeHTML(item.rating)}/5</p>` : ""}
          <small class="muted">Status: ${escapeHTML(item.status || (item.published ? "Published" : "Unpublished"))}</small>
          <div class="actions">
            ${actions}
            ${table === "news" || table === "projects" ? `
              <button class="btn alt" data-action="toggle" data-id="${escapeHTML(item.id)}" data-published="${item.published ? "true" : "false"}">
                ${item.published ? "Unpublish" : "Publish"}
              </button>
            ` : ""}
            <button class="btn alt" data-action="delete" data-id="${escapeHTML(item.id)}">Delete</button>
          </div>
        </article>
      `;
    }).join("");

    let createForm = "";

    if (table === "news" || table === "projects") {
      createForm = `
        <form class="card form-card" id="createForm">
          <h3>Add ${table === "news" ? "news update" : "project"}</h3>

          <div class="field">
            <label>Title</label>
            <input name="title" required maxlength="150">
          </div>

          <div class="field">
            <label>Category</label>
            <input name="category" placeholder="Update / Discord / Website">
          </div>

          <div class="field">
            <label>Description</label>
            <textarea name="${table === "news" ? "body" : "description"}" required></textarea>
          </div>

          ${table === "projects" ? `
            <div class="field"><label>Project URL (optional)</label><input name="url"></div>
            <div class="field"><label>Image URL (optional)</label><input name="imageUrl"></div>
          ` : ""}

          <label><input type="checkbox" name="published" checked> Publish immediately</label>

          <button class="btn" type="submit">Save</button>
          <p class="muted" id="saveStatus"></p>
        </form>
      `;
    }

    manager.innerHTML = `
      ${navigation()}
      <section class="section">
        <div class="section-head">
          <div>
            <div class="eyebrow">Manage your website</div>
            <h2>${labels[table]}</h2>
          </div>
        </div>
        ${createForm}
        <div class="section">
          ${cards || `<div class="empty">Nothing here yet.</div>`}
        </div>
      </section>
    `;

    attachNavigation();

    const create = document.getElementById("createForm");

    if (create) {
      create.onsubmit = async event => {
        event.preventDefault();

        const form = event.currentTarget;
        const values = Object.fromEntries(new FormData(form));

        values.published = form.querySelector('[name="published"]').checked;
        values.createdAt = timestamp();

        try {
          document.getElementById("saveStatus").textContent = "Saving...";

          await adminDB.collection(table).add(values);

          loadTable(table);
        } catch (error) {
          console.error(error);
          document.getElementById("saveStatus").textContent = error.message;
        }
      };
    }

    manager.querySelectorAll("[data-action]").forEach(button => {
      button.onclick = async () => {
        const id = button.dataset.id;
        const action = button.dataset.action;
        const ref = adminDB.collection(table).doc(id);

        try {
          if (action === "delete") {
            if (!confirm("Are you sure you want to delete this entry?")) return;
            await ref.delete();
          }

          if (action === "approve") {
            await ref.update({ status: "approved" });
          }

          if (action === "reject") {
            await ref.update({ status: "rejected" });
          }

          if (action === "toggle") {
            const currentlyPublished = button.dataset.published === "true";
            await ref.update({ published: !currentlyPublished });
          }

          if (action === "answer") {
            const answer = prompt("Write your public answer:");

            if (!answer || !answer.trim()) return;

            await ref.update({
              answer: answer.trim(),
              status: "answered"
            });
          }

          loadTable(table);
        } catch (error) {
          console.error(error);
          alert("Action failed: " + error.message);
        }
      };
    });

  } catch (error) {
    console.error(error);
    manager.innerHTML = `
      <div class="card">
        <h3>Could not load data</h3>
        <p>${escapeHTML(error.message)}</p>
      </div>
    `;
  }
}

/* Start admin portal */
(async function startAdmin() {
  const connected = await window.firebaseReady;

  if (!connected) {
    showStatus("Firebase failed to connect. Refresh and try again.");
    return;
  }

  adminDB = window.tanishDB;
  adminAuth = window.tanishAuth;

  try {
    const result = await adminAuth.getRedirectResult();
    if (result.user) await checkAdmin(result.user);
  } catch (error) {
    console.error(error);
  }

  adminAuth.onAuthStateChanged(user => {
    if (user) {
      checkAdmin(user);
    } else {
      login.hidden = false;
      panel.hidden = true;
    }
  });
})();
    
