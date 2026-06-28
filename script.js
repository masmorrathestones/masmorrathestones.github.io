/*
  A MASMORRA - THE STONES

  COMO LIGAR COM GOOGLE PLANILHAS:

  1. Crie uma planilha para cada seção.
  2. Em cada planilha, use a primeira linha como cabeçalho.
  3. Vá em Arquivo > Compartilhar > Publicar na Web.
  4. Publique a aba como CSV.
  5. Cole os links abaixo em SHEETS.

  Cabeçalhos esperados:

  INÍCIO:
  title | eyebrow | description | banner

  MAPA:
  foto | nome | tipo | descricao

  PERSONAGENS:
  foto | nome | personalidade | historia | grupo | detalhes

  EVENTOS:
  foto | nome | tipo | data | hora

  AVATARES:
  foto | nome
*/

const SHEETS = {
  inicio: "COLE_AQUI_O_LINK_CSV_DA_PLANILHA_INICIO",
  mapa: "COLE_AQUI_O_LINK_CSV_DA_PLANILHA_MAPA",
  personagens: "COLE_AQUI_O_LINK_CSV_DA_PLANILHA_PERSONAGENS",
  eventos: "COLE_AQUI_O_LINK_CSV_DA_PLANILHA_EVENTOS",
  avatares: "COLE_AQUI_O_LINK_CSV_DA_PLANILHA_AVATARES",
};

const FALLBACK_IMAGES = {
  character: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=900&q=80",
  event: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80",
  avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  map: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=900&q=80",
};

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("locked");
  setupAgeGate();
  setupMenu();
  setupCharacterFilters();
  document.getElementById("year").textContent = new Date().getFullYear();

  loadHome();
  loadMap();
  loadCharacters();
  loadEvents();
  loadAvatars();
});

function setupAgeGate() {
  const gate = document.getElementById("ageGate");
  const button = document.getElementById("enterButton");

  const alreadyAccepted = localStorage.getItem("masmorraAgeAccepted") === "true";
  if (alreadyAccepted) {
    gate.classList.add("hidden");
    document.body.classList.remove("locked");
  }

  button.addEventListener("click", () => {
    localStorage.setItem("masmorraAgeAccepted", "true");
    gate.classList.add("hidden");
    document.body.classList.remove("locked");
  });
}

function setupMenu() {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("navMenu");

  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });
}

function setupCharacterFilters() {
  const filterBox = document.getElementById("characterFilters");
  filterBox.addEventListener("click", (event) => {
    const button = event.target.closest(".filter");
    if (!button) return;

    filterBox.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    const filter = button.dataset.filter;
    document.querySelectorAll(".character-card").forEach((card) => {
      const group = normalize(card.dataset.group);
      card.style.display = filter === "todos" || group === filter ? "" : "none";
    });
  });
}

async function loadHome() {
  try {
    const rows = await getSheetRows(SHEETS.inicio);
    const home = rows[0];
    if (!home) return;

    setText("homeEyebrow", home.eyebrow);
    setText("homeTitle", home.title);
    setText("homeDescription", home.description);

    if (home.banner) {
      document.querySelector(".hero").style.setProperty("--hero-image", `url("${home.banner}")`);
    }
  } catch (error) {
    console.warn("Não foi possível carregar a seção inicial:", error);
  }
}

async function loadMap() {
  const container = document.getElementById("mapContainer");
  const template = document.getElementById("mapTemplate");

  try {
    const rows = await getSheetRows(SHEETS.mapa);
    clearContainer(container);

    if (!rows.length) return showEmpty(container, "Nenhum local cadastrado no mapa.");

    rows.forEach((location) => {
      const card = template.content.cloneNode(true);
      const img = card.querySelector("img");

      img.src = safeImage(location.foto, FALLBACK_IMAGES.map);
      img.alt = location.nome || "Local do mapa";
      card.querySelector(".tag").textContent = location.tipo || "Local";
      card.querySelector("h3").textContent = location.nome || "Local sem nome";
      card.querySelector("p").textContent = location.descricao || "Sem descrição cadastrada.";

      container.appendChild(card);
    });
  } catch (error) {
    showError(container, error);
  }
}

async function loadCharacters() {
  const container = document.getElementById("charactersContainer");
  const template = document.getElementById("characterTemplate");

  try {
    const rows = await getSheetRows(SHEETS.personagens);
    clearContainer(container);

    if (!rows.length) return showEmpty(container, "Nenhum personagem cadastrado.");

    rows.forEach((character) => {
      const card = template.content.cloneNode(true);
      const article = card.querySelector(".character-card");
      const img = card.querySelector("img");

      article.dataset.group = character.grupo || "";
      img.src = safeImage(character.foto, FALLBACK_IMAGES.character);
      img.alt = character.nome || "Personagem";

      card.querySelector(".tag").textContent = character.grupo || "Sem grupo";
      card.querySelector("h3").textContent = character.nome || "Personagem sem nome";
      card.querySelector(".personality").textContent = character.personalidade || "Personalidade não cadastrada.";
      card.querySelector(".history").textContent = character.historia || "História não cadastrada.";
      card.querySelector(".details").textContent = character.detalhes || "Sem detalhes adicionais.";

      container.appendChild(card);
    });
  } catch (error) {
    showError(container, error);
  }
}

async function loadEvents() {
  const container = document.getElementById("eventsContainer");
  const template = document.getElementById("eventTemplate");

  try {
    const rows = await getSheetRows(SHEETS.eventos);
    clearContainer(container);

    if (!rows.length) return showEmpty(container, "Nenhum evento cadastrado.");

    rows.forEach((eventItem) => {
      const card = template.content.cloneNode(true);
      const img = card.querySelector("img");

      img.src = safeImage(eventItem.foto, FALLBACK_IMAGES.event);
      img.alt = eventItem.nome || "Evento";

      card.querySelector(".tag").textContent = eventItem.tipo || "Evento";
      card.querySelector(".date").textContent = eventItem.data || "";
      card.querySelector("h3").textContent = eventItem.nome || "Evento sem nome";
      card.querySelector(".time").textContent = eventItem.hora ? `Horário: ${eventItem.hora}` : "Horário opcional";

      container.appendChild(card);
    });
  } catch (error) {
    showError(container, error);
  }
}

async function loadAvatars() {
  const container = document.getElementById("avatarsContainer");
  const template = document.getElementById("avatarTemplate");

  try {
    const rows = await getSheetRows(SHEETS.avatares);
    clearContainer(container);

    if (!rows.length) return showEmpty(container, "Nenhum avatar cadastrado.");

    rows.forEach((avatar) => {
      const card = template.content.cloneNode(true);
      const img = card.querySelector("img");

      img.src = safeImage(avatar.foto, FALLBACK_IMAGES.avatar);
      img.alt = avatar.nome || "Avatar";

      card.querySelector("strong").textContent = avatar.nome || "Avatar sem nome";
      container.appendChild(card);
    });
  } catch (error) {
    showError(container, error);
  }
}

async function getSheetRows(url) {
  if (!url || url.includes("COLE_AQUI")) return [];

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro ao carregar planilha: ${response.status}`);
  }

  const csvText = await response.text();
  return csvToObjects(csvText);
}

function csvToObjects(csvText) {
  const rows = parseCSV(csvText);
  if (!rows.length) return [];

  const headers = rows[0].map(normalizeHeader);

  return rows.slice(1)
    .filter((row) => row.some((cell) => String(cell).trim() !== ""))
    .map((row) => {
      const object = {};
      headers.forEach((header, index) => {
        object[header] = row[index]?.trim() || "";
      });
      return object;
    });
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      value += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

function normalizeHeader(header) {
  return normalize(header)
    .replace(/\s+/g, "_")
    .replace("história", "historia")
    .replace("descrição", "descricao");
}

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function setText(id, value) {
  if (value) document.getElementById(id).textContent = value;
}

function safeImage(url, fallback) {
  return url && /^https?:\/\//i.test(url) ? url : fallback;
}

function clearContainer(container) {
  container.classList.remove("loading", "empty", "error");
  container.innerHTML = "";
}

function showEmpty(container, message) {
  container.classList.add("empty");
  container.textContent = message;
}

function showError(container, error) {
  console.error(error);
  container.classList.remove("loading");
  container.classList.add("error");
  container.textContent = "Não foi possível carregar esta seção. Confira se o link CSV da planilha está público e correto.";
}
