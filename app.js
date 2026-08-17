const defaultParts = [
  { id: crypto.randomUUID(), name: "Fender", image: "", youtube: "", notes: "" },
  { id: crypto.randomUUID(), name: "Hood", image: "", youtube: "", notes: "" },
  { id: crypto.randomUUID(), name: "Door Panel", image: "", youtube: "", notes: "" },
  { id: crypto.randomUUID(), name: "Quarter Panel", image: "", youtube: "", notes: "" },
  { id: crypto.randomUUID(), name: "Rocker Panel", image: "", youtube: "", notes: "" },
  { id: crypto.randomUUID(), name: "Bumper", image: "", youtube: "", notes: "" },
  { id: crypto.randomUUID(), name: "Radiator Support", image: "", youtube: "", notes: "" }
];

const STORAGE_KEY = "panel_beater_study_parts_v1";
let parts = loadParts();
let selectedId = parts[0]?.id || null;

const partsList = document.getElementById("partsList");
const searchInput = document.getElementById("searchInput");
const addBtn = document.getElementById("addBtn");
const editBtn = document.getElementById("editBtn");
const emptyState = document.getElementById("emptyState");
const detailCard = document.getElementById("detailCard");
const detailName = document.getElementById("detailName");
const imagesBtn = document.getElementById("imagesBtn");
const watchBtn = document.getElementById("watchBtn");
const notesArea = document.getElementById("notesArea");
const saveNotesBtn = document.getElementById("saveNotesBtn");

const partDialog = document.getElementById("partDialog");
const partForm = document.getElementById("partForm");
const dialogTitle = document.getElementById("dialogTitle");
const partId = document.getElementById("partId");
const partName = document.getElementById("partName");
const imageUrl = document.getElementById("imageUrl");
const youtubeUrl = document.getElementById("youtubeUrl");
const partNotes = document.getElementById("partNotes");
const closeDialogBtn = document.getElementById("closeDialogBtn");
const deleteBtn = document.getElementById("deleteBtn");

function loadParts() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultParts));
    return defaultParts;
  }
  try { return JSON.parse(saved); } catch { return defaultParts; }
}

function saveParts() { localStorage.setItem(STORAGE_KEY, JSON.stringify(parts)); }

function renderParts(filter = "") {
  const q = filter.trim().toLowerCase();
  const filtered = parts.filter(p => p.name.toLowerCase().includes(q));
  partsList.innerHTML = "";

  filtered.forEach(part => {
    const row = document.createElement("div");
    row.className = "part-item" + (part.id === selectedId ? " active" : "");
    row.innerHTML = `
      <button class="part-main" type="button">
        <div class="link-icon">🔗</div>
        <div class="part-text">
          <div class="part-name">${escapeHtml(part.name)}</div>
          <div class="part-sub">${part.image ? "🖼 View Images" : "Add image link"} · ${part.youtube ? "▶ Video" : "Add video"}</div>
        </div>
      </button>
      <button class="sidebar-edit" type="button" title="Edit ${escapeHtml(part.name)}">✎</button>`;

    row.querySelector(".part-main").addEventListener("click", () => {
      selectedId = part.id;
      renderParts(searchInput.value);
      renderDetail();
      if (window.innerWidth <= 760) document.querySelector(".content").scrollIntoView({ behavior: "smooth" });
    });

    row.querySelector(".sidebar-edit").addEventListener("click", e => {
      e.stopPropagation();
      selectedId = part.id;
      renderParts(searchInput.value);
      renderDetail();
      openEditDialog();
    });
    partsList.appendChild(row);
  });
}

function setLinkButton(button, url, readyText, emptyText) {
  if (url) {
    button.href = normalizeWebUrl(url);
    button.textContent = readyText;
    button.style.pointerEvents = "auto";
    button.style.opacity = "1";
  } else {
    button.removeAttribute("href");
    button.textContent = emptyText;
    button.style.pointerEvents = "none";
    button.style.opacity = ".5";
  }
}

function renderDetail() {
  const part = parts.find(p => p.id === selectedId);
  if (!part) {
    emptyState.classList.remove("hidden");
    detailCard.classList.add("hidden");
    return;
  }
  emptyState.classList.add("hidden");
  detailCard.classList.remove("hidden");
  detailName.textContent = part.name;
  notesArea.value = part.notes || "";
  setLinkButton(imagesBtn, part.image, "🖼 View Images", "No Image Link Yet");
  setLinkButton(watchBtn, part.youtube, "▶ Watch Video", "No Video Link Yet");
}

function openAddDialog() {
  dialogTitle.textContent = "Add New Part";
  partId.value = "";
  partName.value = "";
  imageUrl.value = "";
  youtubeUrl.value = "";
  partNotes.value = "";
  deleteBtn.classList.add("hidden");
  partDialog.showModal();
}

function openEditDialog() {
  const part = parts.find(p => p.id === selectedId);
  if (!part) return;
  dialogTitle.textContent = "Edit Part";
  partId.value = part.id;
  partName.value = part.name;
  imageUrl.value = part.image || "";
  youtubeUrl.value = part.youtube || "";
  partNotes.value = part.notes || "";
  deleteBtn.classList.remove("hidden");
  partDialog.showModal();
}

partForm.addEventListener("submit", e => {
  e.preventDefault();
  const id = partId.value;
  const data = {
    id: id || crypto.randomUUID(),
    name: partName.value.trim(),
    image: normalizeWebUrl(imageUrl.value.trim()),
    youtube: normalizeWebUrl(youtubeUrl.value.trim()),
    notes: partNotes.value.trim()
  };
  if (!data.name) return;
  if (id) parts = parts.map(p => p.id === id ? data : p);
  else { parts.push(data); selectedId = data.id; }
  saveParts();
  renderParts(searchInput.value);
  renderDetail();
  partDialog.close();
});

saveNotesBtn.addEventListener("click", () => {
  const part = parts.find(p => p.id === selectedId);
  if (!part) return;
  part.notes = notesArea.value;
  saveParts();
  saveNotesBtn.textContent = "Saved ✓";
  setTimeout(() => saveNotesBtn.textContent = "Save Notes", 1200);
});

deleteBtn.addEventListener("click", () => {
  const id = partId.value;
  if (!id) return;
  parts = parts.filter(p => p.id !== id);
  selectedId = parts[0]?.id || null;
  saveParts();
  partDialog.close();
  renderParts(searchInput.value);
  renderDetail();
});

addBtn.addEventListener("click", openAddDialog);
editBtn.addEventListener("click", openEditDialog);
closeDialogBtn.addEventListener("click", () => partDialog.close());
searchInput.addEventListener("input", e => renderParts(e.target.value));

function normalizeWebUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return "https://" + url;
}

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

renderParts();
renderDetail();
