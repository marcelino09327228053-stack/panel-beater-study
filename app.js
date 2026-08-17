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
const fallbackImage =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
  <rect width="100%" height="100%" fill="#e5e7eb"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
    font-family="Arial" font-size="32" fill="#64748b">No Image</text>
</svg>`);

let parts = loadParts();
let selectedId = parts[0]?.id || null;

const partsList = document.getElementById("partsList");
const searchInput = document.getElementById("searchInput");
const addBtn = document.getElementById("addBtn");
const editBtn = document.getElementById("editBtn");
const emptyState = document.getElementById("emptyState");
const detailCard = document.getElementById("detailCard");
const detailImage = document.getElementById("detailImage");
const detailName = document.getElementById("detailName");
const watchBtn = document.getElementById("watchBtn");
const notesArea = document.getElementById("notesArea");
const saveNotesBtn = document.getElementById("saveNotesBtn");

const partDialog = document.getElementById("partDialog");
const partForm = document.getElementById("partForm");
const dialogTitle = document.getElementById("dialogTitle");
const partId = document.getElementById("partId");
const partName = document.getElementById("partName");
const imageUrl = document.getElementById("imageUrl");
const imageFile = document.getElementById("imageFile");
const imagePreview = document.getElementById("imagePreview");
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
  try {
    return JSON.parse(saved);
  } catch {
    return defaultParts;
  }
}

function saveParts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parts));
}

function renderParts(filter = "") {
  const q = filter.trim().toLowerCase();
  const filtered = parts.filter(p => p.name.toLowerCase().includes(q));

  partsList.innerHTML = "";

  filtered.forEach(part => {
    const row = document.createElement("div");
    row.className = "part-item" + (part.id === selectedId ? " active" : "");

    row.innerHTML = `
      <button class="part-main" type="button">
        <img class="part-thumb" src="${part.image || fallbackImage}" alt="">
        <div class="part-text">
          <div class="part-name">${escapeHtml(part.name)}</div>
          <div class="part-sub">${part.youtube ? "▶ Watch Video" : "Add video link"}</div>
        </div>
      </button>
      <button class="sidebar-edit" type="button" title="Edit ${escapeHtml(part.name)}">✎</button>
    `;

    row.querySelector(".part-main").addEventListener("click", () => {
      selectedId = part.id;
      renderParts(searchInput.value);
      renderDetail();
      if (window.innerWidth <= 760) {
        document.querySelector(".content").scrollIntoView({ behavior: "smooth" });
      }
    });

    row.querySelector(".sidebar-edit").addEventListener("click", (e) => {
      e.stopPropagation();
      selectedId = part.id;
      renderParts(searchInput.value);
      renderDetail();
      openEditDialog();
    });

    partsList.appendChild(row);
  });
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

  detailImage.src = part.image || fallbackImage;
  detailName.textContent = part.name;
  notesArea.value = part.notes || "";

  if (part.youtube) {
    watchBtn.href = normalizeYoutubeUrl(part.youtube);
    watchBtn.textContent = "▶ Watch Video";
    watchBtn.style.pointerEvents = "auto";
    watchBtn.style.opacity = "1";
  } else {
    watchBtn.removeAttribute("href");
    watchBtn.textContent = "No Video Link Yet";
    watchBtn.style.pointerEvents = "none";
    watchBtn.style.opacity = ".5";
  }
}

function openAddDialog() {
  dialogTitle.textContent = "Add New Part";
  partId.value = "";
  partName.value = "";
  imageUrl.value = "";
  imageFile.value = "";
  imagePreview.src = fallbackImage;
  imagePreview.dataset.uploadedData = "";
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
  imageUrl.value = part.image && !part.image.startsWith("data:image/") ? part.image : "";
  imageFile.value = "";
  imagePreview.src = part.image || fallbackImage;
  imagePreview.dataset.uploadedData = part.image && part.image.startsWith("data:image/") ? part.image : "";
  youtubeUrl.value = part.youtube || "";
  partNotes.value = part.notes || "";
  deleteBtn.classList.remove("hidden");
  partDialog.showModal();
}

partForm.addEventListener("submit", e => {
  e.preventDefault();

  const id = partId.value;
  const existing = parts.find(p => p.id === id);

  let finalImage = imagePreview.dataset.uploadedData || "";
  const typedImageUrl = normalizeWebUrl(imageUrl.value.trim());

  if (!finalImage && typedImageUrl) {
    finalImage = typedImageUrl;
  } else if (!finalImage && existing?.image) {
    finalImage = existing.image;
  }

  const data = {
    id: id || crypto.randomUUID(),
    name: partName.value.trim(),
    image: finalImage,
    youtube: normalizeWebUrl(youtubeUrl.value.trim()),
    notes: partNotes.value.trim()
  };

  if (!data.name) return;

  if (id) {
    parts = parts.map(p => p.id === id ? data : p);
  } else {
    parts.push(data);
    selectedId = data.id;
  }

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
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return "https://" + url;
}

function normalizeYoutubeUrl(url) {
  return normalizeWebUrl(url);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


imageFile.addEventListener("change", () => {
  const file = imageFile.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please choose an image file.");
    imageFile.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    imagePreview.src = reader.result;
    imagePreview.dataset.uploadedData = reader.result;
    imageUrl.value = "";
  };
  reader.readAsDataURL(file);
});

imageUrl.addEventListener("input", () => {
  const value = imageUrl.value.trim();
  if (!value) {
    if (!imagePreview.dataset.uploadedData) imagePreview.src = fallbackImage;
    return;
  }

  const url = normalizeWebUrl(value);
  imagePreview.src = url;
  imagePreview.dataset.uploadedData = "";
});

imagePreview.addEventListener("error", () => {
  imagePreview.src = fallbackImage;
});

youtubeUrl.addEventListener("blur", () => {
  const value = youtubeUrl.value.trim();
  if (value) youtubeUrl.value = normalizeWebUrl(value);
});

renderParts();
renderDetail();
