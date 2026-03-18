// ============================================================
// ADMIN PANEL - JavaScript Logic
// TIF-B CyberSquad Website
// ============================================================

"use strict";

let currentScheduleFilter = "senin";

// ─────────────────────────────────────────────
// AUTH: Protect the page
// ─────────────────────────────────────────────
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "admin.html";
    return;
  }
  // Show user info
  const emailEl = document.getElementById("userEmail");
  const initialEl = document.getElementById("userInitial");
  if (emailEl) emailEl.textContent = user.email;
  if (initialEl) initialEl.textContent = user.email[0].toUpperCase();

  // Load all data
  loadAllData();
});

function logoutAdmin() {
  if (!confirm("Yakin ingin logout?")) return;
  auth.signOut().then(() => (window.location.href = "admin.html"));
}

// ─────────────────────────────────────────────
// SIDEBAR / NAVIGATION
// ─────────────────────────────────────────────
const panelTitles = {
  dashboard: "Dashboard",
  hero: "Edit Hero / Beranda",
  about: "Edit Tentang Kami",
  members: "Kelola Anggota Kelas",
  pengurus: "Kelola Pengurus Kelas",
  schedule: "Kelola Jadwal Kuliah",
  gallery: "Kelola Galeri",
  contact: "Edit Kontak",
  nav: "Navigasi & Footer",
  music: "Kelola Musik Latar",
};

function switchPanel(name, btn) {
  document
    .querySelectorAll(".panel")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  document.getElementById("panel-" + name).classList.add("active");
  if (btn) btn.classList.add("active");
  document.getElementById("panelTitle").textContent = panelTitles[name] || name;
  closeSidebar();
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("sidebarOverlay").classList.toggle("show");
}
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.remove("show");
}
document
  .getElementById("sidebarOverlay")
  ?.addEventListener("click", closeSidebar);

// ─────────────────────────────────────────────
// TOAST NOTIFICATIONS
// ─────────────────────────────────────────────
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const icons = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    info: "fas fa-info-circle",
  };
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="${icons[type]}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ─────────────────────────────────────────────
// MODAL HELPERS
// ─────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add("show");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("show");
}

// Close modal on overlay click
document.querySelectorAll(".modal-overlay").forEach((overlay) => {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("show");
  });
});

// Initialize time inputs to force 24-hour format
document.addEventListener("DOMContentLoaded", () => {
  const timeInputs = document.querySelectorAll("input[type='time']");
  timeInputs.forEach((input) => {
    ensureTimeFormat24Hour(input.id);
  });

  // Initialize schedule time inputs with validation
  const scheduleTimeInputs = document.querySelectorAll(".schedule-time");
  scheduleTimeInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      let value = e.target.value.replace(/[^\d:]/g, ""); // Remove non-numeric/colon

      // Auto-format HH:MM
      if (value.length > 5) {
        value = value.substring(0, 5);
      }

      // Add colon after 2 digits if not present
      if (value.length === 2 && !value.includes(":")) {
        value = value + ":";
      }

      e.target.value = value;
    });

    input.addEventListener("blur", (e) => {
      const formatted = formatTime24Hour(e.target.value);
      if (e.target.value && !formatted) {
        showToast(
          "Format waktu tidak valid. Gunakan HH:MM (contoh: 08:00, 14:30)",
          "error",
        );
        e.target.value = "";
      } else if (formatted) {
        e.target.value = formatted;
      }
    });
  });
});

// ─────────────────────────────────────────────
// LOAD ALL DATA FROM FIREBASE
// ─────────────────────────────────────────────
async function loadAllData() {
  try {
    const snap = await db.ref("siteContent").once("value");
    const data = snap.val() || {};
    populateHero(data.hero || {});
    populateAbout(data.about || {});
    populateContact(data.contact || {});
    populateNav(data.nav || {});
    populateFooter(data.footer || {});
  } catch (e) {
    showToast("Gagal memuat data dari Firebase.", "error");
  }

  loadMembers();
  loadPengurus();
  loadSchedule();
  loadGallery();
  loadMusic();
  loadHeroSlides(); // Load hero slides
}

// ─────────────────────────────────────────────
// HERO SLIDESHOW MANAGER
// ─────────────────────────────────────────────
function loadHeroSlides() {
  db.ref("siteContent/hero/slides").on("value", (snap) => {
    const data = snap.val() || [];
    renderHeroSlidesTable(Array.isArray(data) ? data : Object.values(data));
  });
}

function renderHeroSlidesTable(slides) {
  const tbody = document.getElementById("heroSlidesTableBody");
  if (!slides || slides.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3"><div class="empty-state"><i class="fas fa-images"></i>Belum ada foto slideshow.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = slides
    .map(
      (src, index) => `
    <tr>
      <td><img src="${src}" style="width:80px;height:45px;object-fit:cover;border-radius:4px;border:1px solid var(--border)"></td>
      <td style="color:var(--muted);font-size:12px;max-width:200px;overflow:hidden;text-overflow:ellipsis">${src}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteHeroSlide(${index})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`,
    )
    .join("");
}

function openAddHeroSlide() {
  ["heroSlidePhotoUrl"].forEach((id) => setVal(id, ""));
  clearPhoto("heroSlide");
  openModal("heroSlideModal");
}

async function saveHeroSlide() {
  let photoUrl = getVal("heroSlidePhotoUrl").trim();
  const fileInput = document.getElementById("heroSlideFileInput");

  if (fileInput.files && fileInput.files[0]) {
    const btn = document.getElementById("heroSlideSaveBtn");
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    try {
      photoUrl = await uploadToStorage(fileInput.files[0], "hero", "heroSlide");
    } catch (e) {
      showToast("Upload gagal: " + e.message, "error");
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save"></i> Tambah Slide';
      return;
    }
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Tambah Slide';
  }

  if (!photoUrl) return showToast("Pilih foto atau masukkan URL!", "error");

  try {
    const snap = await db.ref("siteContent/hero/slides").once("value");
    let slides = snap.val() || [];
    if (!Array.isArray(slides)) slides = [];
    slides.push(photoUrl);
    await db.ref("siteContent/hero/slides").set(slides);
    closeModal("heroSlideModal");
    showToast("Slide berhasil ditambahkan!");
  } catch (e) {
    showToast("Gagal: " + e.message, "error");
  }
}

async function deleteHeroSlide(index) {
  if (!confirm("Hapus slide ini?")) return;
  try {
    const snap = await db.ref("siteContent/hero/slides").once("value");
    let slides = snap.val() || [];
    if (Array.isArray(slides)) {
      slides.splice(index, 1);
      await db.ref("siteContent/hero/slides").set(slides);
      showToast("Slide dihapus.");
    }
  } catch (e) {
    showToast("Gagal: " + e.message, "error");
  }
}

// ─────────────────────────────────────────────
// HERO TEXT
// ─────────────────────────────────────────────
function populateHero(d) {
  setVal("heroTitle", d.title || "");
  setVal("heroSubtitle", d.subtitle || "");
  setVal("heroBtn1Text", d.btn1Text || "");
  setVal("heroBtn1Link", d.btn1Link || "");
  setVal("heroBtn2Text", d.btn2Text || "");
  setVal("heroBtn2Link", d.btn2Link || "");
}

async function saveHero() {
  const data = {
    title: getVal("heroTitle"),
    subtitle: getVal("heroSubtitle"),
    btn1Text: getVal("heroBtn1Text"),
    btn1Link: getVal("heroBtn1Link"),
    btn2Text: getVal("heroBtn2Text"),
    btn2Link: getVal("heroBtn2Link"),
  };
  await save("siteContent/hero", data, "Hero / Beranda");
}

// ─────────────────────────────────────────────
// ABOUT
// ─────────────────────────────────────────────
function populateAbout(d) {
  setVal("aboutHistory1", d.historyText1 || "");
  setVal("aboutHistory2", d.historyText2 || "");
  setVal("aboutVisi", d.visi || "");
  setVal("aboutMisi", d.misi || "");
  setVal("aboutMotto", d.motto || "");
  setVal("aboutPhotoUrl", d.photo || "");
  document.getElementById("aboutPhotoSaved").value = d.photo || "";

  if (d.photo) {
    const imgEl = document.getElementById("aboutPreviewImg");
    imgEl.src = d.photo;
    document.getElementById("aboutPreviewName").textContent = "Foto Aktif";
    document.getElementById("aboutPreviewSize").textContent =
      "Tersimpan di database";
    document.getElementById("aboutPreview").classList.add("show");
  } else {
    clearPhoto("about");
  }
}

async function saveAbout() {
  const btn = document.querySelector("#panel-about .btn-primary");
  const oldHTML = btn.innerHTML;

  let photoUrl =
    getVal("aboutPhotoUrl").trim() ||
    document.getElementById("aboutPhotoSaved").value;
  const fileInput = document.getElementById("aboutFileInput");

  if (fileInput.files && fileInput.files[0]) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    try {
      photoUrl = await uploadToStorage(fileInput.files[0], "about", "about");
    } catch (e) {
      showToast("Upload gagal: " + e.message, "error");
      btn.disabled = false;
      btn.innerHTML = oldHTML;
      return;
    }
  }

  const data = {
    historyText1: getVal("aboutHistory1"),
    historyText2: getVal("aboutHistory2"),
    visi: getVal("aboutVisi"),
    misi: getVal("aboutMisi"),
    motto: getVal("aboutMotto"),
    photo: photoUrl,
  };

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  try {
    await db.ref("siteContent/about").update(data);
    showToast("Tentang Kami berhasil disimpan!");
    document.getElementById("aboutPhotoSaved").value = photoUrl;
  } catch (e) {
    showToast("Gagal: " + e.message, "error");
  }
  btn.disabled = false;
  btn.innerHTML = oldHTML;
}

// ─────────────────────────────────────────────
// CONTACT
// ─────────────────────────────────────────────
function populateContact(d) {
  setVal("contactEmail", d.email || "");
  setVal("contactWA", d.whatsapp || "");
  setVal("contactWALink", d.waLink || "");
  setVal("contactAddress", d.address || "");
  setVal("contactHours", d.workHours || "");
  setVal("contactIG", d.instagramUrl || "");
  setVal("contactYT", d.youtubeUrl || "");
  setVal("contactFB", d.facebookUrl || "");
}

async function saveContact() {
  const data = {
    email: getVal("contactEmail"),
    whatsapp: getVal("contactWA"),
    waLink: getVal("contactWALink"),
    address: getVal("contactAddress"),
    workHours: getVal("contactHours"),
    instagramUrl: getVal("contactIG"),
    youtubeUrl: getVal("contactYT"),
    facebookUrl: getVal("contactFB"),
  };
  await save("siteContent/contact", data, "Kontak");
}

// ─────────────────────────────────────────────
// NAV & FOOTER
// ─────────────────────────────────────────────
function populateNav(d) {
  setVal("navLogoText", d.logoText || "TIF-B CyberSquad");
}
function populateFooter(d) {
  setVal(
    "footerCopyright",
    d.copyright || "© 2024 Kelas TIF-B CyberSquad. Hak Cipta Dilindungi.",
  );
  setVal("footerDevName", d.developerName || "Jefrin Telaumbanua");
  setVal("footerDevRole", d.developerRole || "Programmer TIF-B CyberSquad");

  // Developer Photo
  setVal("footerPhotoUrl", d.developerPhoto || "");
  document.getElementById("footerPhotoSaved").value = d.developerPhoto || "";
  if (
    d.developerPhoto &&
    (d.developerPhoto.startsWith("http") || d.developerPhoto.startsWith("/"))
  ) {
    const imgEl = document.getElementById("footerPreviewImg");
    const nameEl = document.getElementById("footerPreviewName");
    const sizeEl = document.getElementById("footerPreviewSize");
    imgEl.src = d.developerPhoto;
    nameEl.textContent = "Foto saat ini";
    sizeEl.textContent = "Disimpan di Firebase";
    document.getElementById("footerPreview").classList.add("show");
  } else {
    clearPhoto("footer");
  }
}

async function saveNav() {
  await save(
    "siteContent/nav",
    { logoText: getVal("navLogoText") },
    "Navigasi",
  );
}
async function saveFooter() {
  let photoUrl = document.getElementById("footerPhotoSaved").value || "";
  const urlInput = getVal("footerPhotoUrl").trim();
  if (urlInput) photoUrl = urlInput;

  const fileInput = document.getElementById("footerFileInput");
  if (fileInput.files && fileInput.files[0]) {
    const btn = document.querySelector(
      "#panel-nav .section-card:nth-child(2) .btn-primary",
    );
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengupload...';
    try {
      photoUrl = await uploadToStorage(fileInput.files[0], "footer", "footer");
    } catch (e) {
      showToast("Upload foto gagal: " + e.message, "error");
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save"></i> Simpan';
      return;
    }
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Simpan';
  }

  await save(
    "siteContent/footer",
    {
      copyright: getVal("footerCopyright"),
      developerName: getVal("footerDevName"),
      developerRole: getVal("footerDevRole"),
      developerPhoto: photoUrl,
    },
    "Footer",
  );
}

// ─────────────────────────────────────────────
// PENGURUS KELAS
// ─────────────────────────────────────────────
function loadPengurus() {
  db.ref("pengurus").on("value", (snap) => {
    const data = snap.val() || {};
    const pengurus = Object.entries(data);
    renderPengurusTable(pengurus);
  });
}

function renderPengurusTable(pengurus) {
  const tbody = document.getElementById("pengurusTableBody");
  if (!pengurus.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><i class="fas fa-user-tie"></i>Belum ada pengurus kelas. Tambahkan pengurus baru.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = pengurus
    .map(
      ([id, p]) => `
    <tr>
      <td>
        ${
          p.photo
            ? `<img src="${p.photo}" class="member-photo" onerror="this.style.display='none'">`
            : `<div class="member-photo-placeholder">${(p.name || "?")[0]}</div>`
        }
      </td>
      <td><strong>${esc(p.name)}</strong></td>
      <td><span style="color:var(--purple-light)">${esc(p.role)}</span></td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted)">${esc(p.quote) || "-"}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="editPengurus('${id}')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger btn-sm" onclick="deletePengurus('${id}', this.getAttribute('data-name'))" data-name="${esc(p.name)}"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`,
    )
    .join("");
}

function openAddPengurus() {
  document.getElementById("pengurusModalTitle").textContent = "Tambah Pengurus";
  document.getElementById("pengurusEditId").value = "";
  document.getElementById("pengurusPhoto").value = "";
  ["pengurusName", "pengurusRole", "pengurusQuote", "pengurusPhotoUrl"].forEach(
    (id) => setVal(id, ""),
  );
  clearPhoto("pengurus");
  openModal("pengurusModal");
}

async function editPengurus(id) {
  const snap = await db.ref(`pengurus/${id}`).once("value");
  const p = snap.val();
  if (!p) return;
  document.getElementById("pengurusModalTitle").textContent = "Edit Pengurus";
  document.getElementById("pengurusEditId").value = id;
  document.getElementById("pengurusPhoto").value = p.photo || "";
  setVal("pengurusName", p.name);
  setVal("pengurusRole", p.role);
  setVal("pengurusQuote", p.quote || "");
  setVal("pengurusPhotoUrl", p.photo || "");

  // Show current photo preview if it's a URL
  if (p.photo && (p.photo.startsWith("http") || p.photo.startsWith("/"))) {
    const imgEl = document.getElementById("pengurusPreviewImg");
    const nameEl = document.getElementById("pengurusPreviewName");
    const sizeEl = document.getElementById("pengurusPreviewSize");
    imgEl.src = p.photo;
    nameEl.textContent = "Foto saat ini";
    sizeEl.textContent = "Disimpan di Firebase Storage";
    document.getElementById("pengurusPreview").classList.add("show");
  } else {
    clearPhoto("pengurus");
  }

  openModal("pengurusModal");
}

async function savePengurus() {
  const id = document.getElementById("pengurusEditId").value;
  const name = getVal("pengurusName");
  const role = getVal("pengurusRole");
  let quote = getVal("pengurusQuote");

  if (!name || !role)
    return showToast("Nama dan Jabatan wajib diisi!", "error");

  // Logic: Uploaded file > URL Field > Database Old Value
  let photoUrl = document.getElementById("pengurusPhoto").value || "";
  const urlInput = getVal("pengurusPhotoUrl").trim();
  if (urlInput) photoUrl = urlInput;

  // If a file is selected in the DropZone
  const fileInput = document.getElementById("pengurusFileInput");
  if (fileInput.files && fileInput.files[0]) {
    const btn = document.getElementById("pengurusSaveBtn");
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengupload...';
    try {
      photoUrl = await uploadToStorage(
        fileInput.files[0],
        "pengurus",
        "pengurus",
      );
    } catch (e) {
      showToast("Upload foto gagal: " + e.message, "error");
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save"></i> Simpan';
      return;
    }
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Simpan';
  }

  const data = {
    name,
    role,
    quote,
    photo: photoUrl,
  };

  try {
    const btn = document.getElementById("pengurusSaveBtn");
    const oldText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    btn.disabled = true;

    if (id) {
      await db.ref(`pengurus/${id}`).update(data);
      showToast("Pengurus berhasil diupdate!");
    } else {
      await db.ref("pengurus").push(data);
      showToast("Pengurus berhasil ditambahkan!");
    }
    closeModal("pengurusModal");
    btn.innerHTML = oldText;
    btn.disabled = false;
  } catch (e) {
    showToast("Gagal menyimpan pengurus", "error");
  }
}

async function deletePengurus(id, name) {
  if (confirm(`Yakin ingin menghapus ${name}?`)) {
    try {
      await db.ref(`pengurus/${id}`).remove();
      showToast("Pengurus dihapus!");
    } catch (e) {
      showToast("Gagal menghapus", "error");
    }
  }
}

// ─────────────────────────────────────────────
// MEMBERS
// ─────────────────────────────────────────────
function loadMembers() {
  db.ref("members").on("value", (snap) => {
    const data = snap.val() || {};
    const members = Object.entries(data);
    document.getElementById("memberCount").textContent = members.length;
    document.getElementById("statMembers").textContent = members.length;
    renderMembersTable(members);
  });
}

function renderMembersTable(members) {
  const tbody = document.getElementById("membersTableBody");
  if (!members.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><i class="fas fa-users"></i>Belum ada anggota. Tambahkan anggota baru.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = members
    .map(
      ([id, m]) => `
    <tr>
      <td>
        ${
          m.photo && m.photo !== ".jpg"
            ? `<img src="${m.photo}" class="member-photo" onerror="this.style.display='none'">`
            : `<div class="member-photo-placeholder">${(m.name || "?")[0]}</div>`
        }
      </td>
      <td><strong>${esc(m.name)}</strong></td>
      <td><span style="color:var(--purple-light)">${esc(m.nim)}</span></td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted)">${esc(m.quote) || "-"}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="editMember('${id}')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger btn-sm" onclick="deleteMember('${id}', this.getAttribute('data-name'))" data-name="${esc(m.name)}"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`,
    )
    .join("");
}

function openAddMember() {
  document.getElementById("memberModalTitle").textContent = "Tambah Anggota";
  document.getElementById("memberEditId").value = "";
  document.getElementById("memberPhoto").value = "";
  ["memberName", "memberNim", "memberQuote", "memberPhotoUrl"].forEach((id) =>
    setVal(id, ""),
  );
  clearPhoto("member");
  openModal("memberModal");
}

async function editMember(id) {
  const snap = await db.ref(`members/${id}`).once("value");
  const m = snap.val();
  if (!m) return;
  document.getElementById("memberModalTitle").textContent = "Edit Anggota";
  document.getElementById("memberEditId").value = id;
  document.getElementById("memberPhoto").value = m.photo || "";
  setVal("memberName", m.name || "");
  setVal("memberNim", m.nim || "");
  setVal("memberQuote", m.quote || "");
  setVal("memberPhotoUrl", m.photo || "");
  // Show current photo preview if it's a URL
  if (m.photo && (m.photo.startsWith("http") || m.photo.startsWith("/"))) {
    const imgEl = document.getElementById("memberPreviewImg");
    const nameEl = document.getElementById("memberPreviewName");
    const sizeEl = document.getElementById("memberPreviewSize");
    imgEl.src = m.photo;
    nameEl.textContent = "Foto saat ini";
    sizeEl.textContent = "Disimpan di Firebase Storage";
    document.getElementById("memberPreview").classList.add("show");
  } else {
    clearPhoto("member");
  }
  openModal("memberModal");
}

async function saveMember() {
  const id = getVal("memberEditId");
  const name = getVal("memberName");
  const nim = getVal("memberNim");
  if (!name || !nim) {
    showToast("Nama dan NIM wajib diisi", "error");
    return;
  }

  // Determine photo URL: uploaded file > URL field > hidden stored value
  let photoUrl = document.getElementById("memberPhoto").value || "";
  const urlInput = getVal("memberPhotoUrl").trim();
  if (urlInput) photoUrl = urlInput; // manual URL/filename overrides

  // If there's a pending file to upload
  const fileInput = document.getElementById("memberFileInput");
  if (fileInput.files && fileInput.files[0]) {
    const btn = document.getElementById("memberSaveBtn");
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengupload...';
    try {
      photoUrl = await uploadToStorage(fileInput.files[0], "members", "member");
    } catch (e) {
      showToast("Upload foto gagal: " + e.message, "error");
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save"></i> Simpan';
      return;
    }
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Simpan';
  }

  const data = { name, nim, quote: getVal("memberQuote"), photo: photoUrl };
  try {
    if (id) await db.ref(`members/${id}`).update(data);
    else await db.ref("members").push(data);
    closeModal("memberModal");
    showToast(
      id ? "Data anggota diperbarui!" : "Anggota berhasil ditambahkan!",
    );
  } catch (e) {
    showToast("Gagal menyimpan: " + e.message, "error");
  }
}

async function deleteMember(id, name) {
  if (!confirm(`Hapus anggota "${name}"?`)) return;
  try {
    await db.ref(`members/${id}`).remove();
    showToast("Anggota dihapus.");
  } catch (e) {
    showToast("Gagal menghapus: " + e.message, "error");
  }
}

// ─────────────────────────────────────────────
// SCHEDULE
// ─────────────────────────────────────────────
function loadSchedule() {
  db.ref("schedule").on("value", (snap) => {
    const data = snap.val() || {};
    const all = Object.entries(data);
    const total = new Set(all.map(([, s]) => s.course)).size;
    document.getElementById("statSchedule").textContent = all.length;
    renderScheduleTable(all);
  });
}

function filterSchedule(day, btn) {
  currentScheduleFilter = day;
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  db.ref("schedule")
    .once("value")
    .then((snap) => {
      const data = snap.val() || {};
      renderScheduleTable(Object.entries(data));
    });
}

function renderScheduleTable(entries) {
  const tbody = document.getElementById("scheduleTableBody");
  const filtered = entries.filter(([, s]) => s.day === currentScheduleFilter);
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><i class="fas fa-calendar"></i>Belum ada jadwal untuk hari ini.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = filtered
    .map(
      ([id, s]) => `
    <tr>
      <td style="color:var(--purple-light);white-space:nowrap">${esc(s.time)}</td>
      <td><strong>${esc(s.course)}</strong></td>
      <td style="color:var(--muted)">${esc(s.lecturer)}</td>
      <td><span style="background:rgba(139,92,246,0.15);color:var(--purple-light);padding:2px 8px;border-radius:6px;font-size:12px">${esc(s.room)}</span></td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="editSchedule('${id}')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger btn-sm" onclick="deleteSchedule('${id}', this.getAttribute('data-course'))" data-course="${esc(s.course)}"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`,
    )
    .join("");
}

function openAddSchedule() {
  document.getElementById("scheduleModalTitle").textContent = "Tambah Jadwal";
  document.getElementById("scheduleEditId").value = "";
  [
    "scheduleCourse",
    "scheduleLecturer",
    "scheduleRoom",
    "scheduleStart",
    "scheduleEnd",
  ].forEach((id) => setVal(id, ""));
  setVal("scheduleDay", currentScheduleFilter);
  openModal("scheduleModal");
}

async function editSchedule(id) {
  const snap = await db.ref(`schedule/${id}`).once("value");
  const s = snap.val();
  if (!s) return;
  document.getElementById("scheduleModalTitle").textContent = "Edit Jadwal";
  document.getElementById("scheduleEditId").value = id;
  setVal("scheduleDay", s.day || "senin");
  setVal("scheduleCourse", s.course || "");
  setVal("scheduleLecturer", s.lecturer || "");
  setVal("scheduleRoom", s.room || "");
  const parts = (s.time || " - ").split(" - ");
  setVal("scheduleStart", parts[0] || "");
  setVal("scheduleEnd", parts[1] || "");
  openModal("scheduleModal");
}

async function saveSchedule() {
  const id = getVal("scheduleEditId");
  let start = getVal("scheduleStart");
  let end = getVal("scheduleEnd");

  // Format time to 24-hour format (HH:MM)
  start = formatTime24Hour(start);
  end = formatTime24Hour(end);

  // Validate time format
  if (!start || !end) {
    showToast(
      "Format waktu tidak valid. Gunakan format HH:MM (00:00 - 23:59)",
      "error",
    );
    return;
  }

  const data = {
    day: getVal("scheduleDay"),
    time: `${start} - ${end}`,
    course: getVal("scheduleCourse"),
    lecturer: getVal("scheduleLecturer"),
    room: getVal("scheduleRoom"),
  };
  if (!data.course) {
    showToast("Nama mata kuliah wajib diisi", "error");
    return;
  }
  try {
    if (id) await db.ref(`schedule/${id}`).update(data);
    else await db.ref("schedule").push(data);
    closeModal("scheduleModal");
    showToast(id ? "Jadwal diperbarui!" : "Jadwal berhasil ditambahkan!");
  } catch (e) {
    showToast("Error: " + e.message, "error");
  }
}

async function deleteSchedule(id, course) {
  if (!confirm(`Hapus jadwal "${course}"?`)) return;
  try {
    await db.ref(`schedule/${id}`).remove();
    showToast("Jadwal dihapus.");
  } catch (e) {
    showToast("Gagal: " + e.message, "error");
  }
}

// ─────────────────────────────────────────────
// GALLERY
// ─────────────────────────────────────────────
function loadGallery() {
  db.ref("gallery").on("value", (snap) => {
    const data = snap.val() || {};
    const entries = Object.entries(data);
    document.getElementById("statGallery").textContent = entries.length;
    renderGalleryTable(entries);
  });
}

function renderGalleryTable(entries) {
  const tbody = document.getElementById("galleryTableBody");
  if (!entries.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><i class="fas fa-images"></i>Belum ada foto galeri.</div></td></tr>`;
    return;
  }
  const catLabels = {
    all: "Semua",
    class: "Foto Kelas",
    event: "Excellent",
    study: "Studi",
    social: "Sosial",
  };
  tbody.innerHTML = entries
    .map(
      ([id, g]) => `
    <tr>
      <td>
        <img src="${esc(g.photo)}" style="width:60px;height:45px;object-fit:cover;border-radius:8px;background:#2a2a4a"
          onerror="this.src='';this.style.background='#2a2a4a'">
      </td>
      <td><strong>${esc(g.title)}</strong></td>
      <td><span style="background:rgba(59,130,246,0.15);color:#93c5fd;padding:2px 8px;border-radius:6px;font-size:12px">${catLabels[g.category] || g.category}</span></td>
      <td style="color:var(--muted);white-space:nowrap">${esc(g.date)}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="editGallery('${id}')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger btn-sm" onclick="deleteGallery('${id}', this.getAttribute('data-title'))" data-title="${esc(g.title)}"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`,
    )
    .join("");
}

function openAddGallery() {
  document.getElementById("galleryModalTitle").textContent =
    "Tambah Foto Galeri";
  document.getElementById("galleryEditId").value = "";
  document.getElementById("galleryPhoto").value = "";
  ["galleryTitle", "galleryDate", "galleryPhotoUrl"].forEach((id) =>
    setVal(id, ""),
  );
  setVal("galleryCategory", "class");
  clearPhoto("gallery");
  openModal("galleryModal");
}

async function editGallery(id) {
  const snap = await db.ref(`gallery/${id}`).once("value");
  const g = snap.val();
  if (!g) return;
  document.getElementById("galleryModalTitle").textContent = "Edit Foto Galeri";
  document.getElementById("galleryEditId").value = id;
  document.getElementById("galleryPhoto").value = g.photo || "";
  setVal("galleryTitle", g.title || "");
  setVal("galleryDate", g.date || "");
  setVal("galleryPhotoUrl", g.photo || "");
  setVal("galleryCategory", g.category || "class");
  if (g.photo && (g.photo.startsWith("http") || g.photo.startsWith("/"))) {
    const imgEl = document.getElementById("galleryPreviewImg");
    imgEl.src = g.photo;
    document.getElementById("galleryPreviewName").textContent = "Foto saat ini";
    document.getElementById("galleryPreviewSize").textContent =
      "Disimpan di Firebase Storage";
    document.getElementById("galleryPreview").classList.add("show");
  } else {
    clearPhoto("gallery");
  }
  openModal("galleryModal");
}

async function saveGalleryItem() {
  const id = getVal("galleryEditId");
  const title = getVal("galleryTitle");
  if (!title) {
    showToast("Judul foto wajib diisi", "error");
    return;
  }

  let photoUrl = document.getElementById("galleryPhoto").value || "";
  const urlInput = getVal("galleryPhotoUrl").trim();
  if (urlInput) photoUrl = urlInput;

  const fileInput = document.getElementById("galleryFileInput");
  if (fileInput.files && fileInput.files[0]) {
    const btn = document.getElementById("gallerySaveBtn");
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengupload...';
    try {
      photoUrl = await uploadToStorage(
        fileInput.files[0],
        "gallery",
        "gallery",
      );
    } catch (e) {
      showToast("Upload gagal: " + e.message, "error");
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save"></i> Simpan';
      return;
    }
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Simpan';
  }

  if (!photoUrl) {
    showToast("Pilih foto atau masukkan URL/nama file", "error");
    return;
  }

  const data = {
    title,
    date: getVal("galleryDate"),
    photo: photoUrl,
    category: getVal("galleryCategory"),
  };
  try {
    if (id) await db.ref(`gallery/${id}`).update(data);
    else await db.ref("gallery").push(data);
    closeModal("galleryModal");
    showToast(id ? "Foto diperbarui!" : "Foto berhasil ditambahkan!");
  } catch (e) {
    showToast("Error: " + e.message, "error");
  }
}

async function deleteGallery(id, title) {
  if (!confirm(`Hapus foto "${title}"?`)) return;
  try {
    await db.ref(`gallery/${id}`).remove();
    showToast("Foto dihapus.");
  } catch (e) {
    showToast("Gagal: " + e.message, "error");
  }
}

// ─────────────────────────────────────────────
// FIREBASE STORAGE UPLOAD
// ─────────────────────────────────────────────

// Track selected files
const _selectedFiles = {};

/**
 * Called when user selects a file via the file input.
 * Shows a local preview immediately; actual upload happens on Save.
 */
function handleFileSelect(prefix, input) {
  const file = input.files[0];
  if (!file) return;

  const maxMB = prefix === "gallery" ? 10 : prefix === "music" ? 15 : 5;
  if (file.size > maxMB * 1024 * 1024) {
    showToast(`Ukuran file maksimal ${maxMB} MB`, "error");
    input.value = "";
    return;
  }

  _selectedFiles[prefix] = file;

  // For audio files: skip image preview, just show file info
  if (prefix === "music") {
    document.getElementById("musicPreviewName").textContent = file.name;
    document.getElementById("musicPreviewSize").textContent = formatBytes(
      file.size,
    );
    document.getElementById("musicPreview").classList.add("show");
    return;
  }

  // Show local image preview
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById(`${prefix}PreviewImg`).src = e.target.result;
    document.getElementById(`${prefix}PreviewName`).textContent = file.name;
    document.getElementById(`${prefix}PreviewSize`).textContent = formatBytes(
      file.size,
    );
    document.getElementById(`${prefix}Preview`).classList.add("show");
  };
  reader.readAsDataURL(file);
}

/** Clear selected photo and reset upload zone */
function clearPhoto(prefix) {
  _selectedFiles[prefix] = null;
  const fi = document.getElementById(`${prefix}FileInput`);
  if (fi) fi.value = "";
  const prev = document.getElementById(`${prefix}Preview`);
  if (prev) prev.classList.remove("show");
  const progEl = document.getElementById(`${prefix}UploadProgress`);
  if (progEl) progEl.classList.remove("show");
}

/**
 * Upload file to Firebase Storage.
 * Returns a download URL promise.
 */
function uploadToStorage(file, folder, prefix) {
  return new Promise((resolve, reject) => {
    const ts = Date.now();
    const ext = file.name.split(".").pop();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${folder}/${ts}_${safeName}`;
    const ref = storage.ref(path);
    const task = ref.put(file);

    const progContainer = document.getElementById(`${prefix}UploadProgress`);
    const progFill = document.getElementById(`${prefix}ProgressFill`);
    const progText = document.getElementById(`${prefix}ProgressText`);

    if (progContainer) {
      progContainer.classList.add("show");
      if (progFill) progFill.style.width = "0%";
      if (progText) progText.textContent = "Menyiapkan upload...";
    }

    task.on(
      "state_changed",
      (snapshot) => {
        const pct = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        );
        if (progFill) progFill.style.width = pct + "%";
        if (progText) progText.textContent = `Mengupload... ${pct}%`;
      },
      (err) => {
        if (progContainer) progContainer.classList.remove("show");
        reject(err);
      },
      async () => {
        try {
          const url = await task.snapshot.ref.getDownloadURL();
          if (progText) progText.textContent = "Upload selesai!";
          setTimeout(() => {
            if (progContainer) progContainer.classList.remove("show");
          }, 1500);
          resolve(url);
        } catch (err) {
          if (progContainer) progContainer.classList.remove("show");
          reject(err);
        }
      },
    );
  });
}

/** Format bytes to human readable */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// Drag-and-drop support
[
  "member",
  "gallery",
  "pengurus",
  "music",
  "heroSlide",
  "about",
  "footer",
].forEach((prefix) => {
  const zone = document.getElementById(`${prefix}UploadZone`);
  if (!zone) return;
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("drag-over");
  });
  zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("drag-over");
    const fi = document.getElementById(`${prefix}FileInput`);
    fi.files = e.dataTransfer.files;
    handleFileSelect(prefix, fi);
  });
});

// ─────────────────────────────────────────────
// GENERIC SAVE HELPER
// ─────────────────────────────────────────────
async function save(path, data, label) {
  try {
    await db.ref(path).update(data);
    showToast(`${label} berhasil disimpan! Website otomatis diperbarui.`);
  } catch (e) {
    showToast(`Gagal menyimpan ${label}: ${e.message}`, "error");
  }
}

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────
function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Format time string to HH:MM 24-hour format
 * Converts various time formats to standardized 24-hour format
 * @param {string} timeStr - Time string in any format (HH:MM, H:MM, etc.)
 * @returns {string} Formatted time in HH:MM format or empty string if invalid
 */
function formatTime24Hour(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return "";

  // Remove whitespace
  timeStr = timeStr.trim();

  // Match HH:MM or H:MM pattern
  const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) return "";

  const hour = parseInt(timeMatch[1]);
  const minute = parseInt(timeMatch[2]);

  // Validate 24-hour format
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return "";
  }

  // Return formatted as HH:MM
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

// ─────────────────────────────────────────────
// MUSIC MANAGER
// ─────────────────────────────────────────────
function loadMusic() {
  db.ref("siteContent/music").on("value", (snap) => {
    let raw = snap.val() || [];
    let musicArray = Array.isArray(raw) ? raw : Object.values(raw);
    renderMusicTable(musicArray);
  });
}

function renderMusicTable(musicArray) {
  const tbody = document.getElementById("musicTableBody");
  if (!musicArray || musicArray.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><i class="fas fa-music"></i>Belum ada musik.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = musicArray
    .map(
      (m, index) => `
    <tr>
      <td><strong>${esc(m.title)}</strong></td>
      <td style="color:var(--muted)">${esc(m.artist)}</td>
      <td style="color:var(--purple-light);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px;" title="${esc(m.src)}">
        <a href="${esc(m.src)}" target="_blank" style="color:inherit;text-decoration:none;">${esc(m.src)}</a>
      </td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-danger btn-sm" onclick="deleteMusic(${index}, this.getAttribute('data-title'))" data-title="${esc(m.title)}"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`,
    )
    .join("");
}

function openAddMusic() {
  document.getElementById("musicModalTitle").textContent = "Tambah Musik Latar";
  ["musicTitle", "musicArtist", "musicAudioUrl"].forEach((id) =>
    setVal(id, ""),
  );
  clearPhoto("music");
  openModal("musicModal");
}

async function saveMusic() {
  const title = getVal("musicTitle");
  const artist = getVal("musicArtist") || "Unknown Artist";

  if (!title) {
    showToast("Judul lagu wajib diisi", "error");
    return;
  }

  let audioUrl = "";
  const urlInput = getVal("musicAudioUrl").trim();
  if (urlInput) audioUrl = urlInput;

  const fileInput = document.getElementById("musicFileInput");
  if (fileInput.files && fileInput.files[0]) {
    const btn = document.getElementById("musicSaveBtn");
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengupload...';
    try {
      audioUrl = await uploadToStorage(fileInput.files[0], "music", "music");
    } catch (e) {
      showToast("Upload gagal: " + e.message, "error");
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save"></i> Simpan';
      return;
    }
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Simpan';
  }

  if (!audioUrl) {
    showToast("Pilih file audio atau masukkan URL", "error");
    return;
  }

  try {
    const snap = await db.ref("siteContent/music").once("value");
    let musicList = snap.val() || [];
    if (!Array.isArray(musicList)) musicList = [];

    musicList.push({ title, artist, src: audioUrl });

    await db.ref("siteContent/music").set(musicList);
    closeModal("musicModal");
    showToast("Musik berhasil ditambahkan!");
  } catch (e) {
    showToast("Error: " + e.message, "error");
  }
}

async function deleteMusic(index, title) {
  if (!confirm(`Hapus lagu "${title}"?`)) return;
  try {
    const snap = await db.ref("siteContent/music").once("value");
    let musicList = snap.val() || [];
    if (Array.isArray(musicList)) {
      musicList.splice(index, 1);
      await db.ref("siteContent/music").set(musicList);
      showToast("Lagu dihapus.");
    }
  } catch (e) {
    showToast("Gagal menghapus: " + e.message, "error");
  }
}
