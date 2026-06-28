/*
  A MASMORRA - THE STONES

  Esta versão aceita links do Google Planilhas publicados como:
  - Página web: /pubhtml
  - CSV: /pub?gid=0&single=true&output=csv

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
  inicio: "COLE_AQUI_O_LINK_DA_PLANILHA_INICIO",

  mapa: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_3TN8B_dMhjqkE1SVXpJSh9PaBxwX8E0MqiOjGLNn1mGU5t-Gage3cnsc-G2TeGLsfPMoCzc-wFRk/pubhtml",

  personagens: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQoLDimGYdHD5dj6R8LBNREZFDVqA-KCDFUZan-z6cu-QvFuk0bd8bLOE0yfxRFnkSmpcFZ8J_VJ66s/pubhtml",

  eventos: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6MchWxfd_yxPIA8Ub8TqgltXM-VIhMNf5LkCsmndu8v6QcFS4_XQlooVGZGL8ilhoq2QsxEkJy9Hh/pubhtml",

  avatares: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR_jYYR0bz1dntqIySnOPErw-MwSe6DWUDniwIptSIzLl4L3DO5PsKOY_K56B8skAM9YYSPOHqVX2lO/pubhtml",
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

  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  loadHome();
  loadMap();
  loadCharacters();
  loadEvents();
  loadAvatars();
});

function setupAgeGate() {
  const gate = document.getElementById("ageGate");
  const button = document.getElementById("enterButton");

  if (!gate || !button) return;

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

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
    });
  });
}

function setupCharacterFilters() {
  const filterBox = document.getElementById("characterFilters");

  if (!filterBox) return;

  filterBox.addEventListener("click", (event) => {
    const button = event.target.closest(".filter");

    if (!button) return;

    filterBox.querySelectorAll(".filter").forEach((item) => {
      item.classList.remove("active");
    });

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
      document
        .querySelector(".hero")
        ?.style.setProperty("--hero-image", `url("${home.banner}")`);
    }
  } catch (error) {
    console.warn("Não foi possível carregar a seção inicial:", error);
  }
}

async function loadMap() {
  const container = document.getElementById("mapContainer");
  const template = document.getElementById("mapTemplate");

  if (!container || !template) return;

  try {
    const rows = await getSheetRows(SHEETS.mapa);

    clearContainer(container);

    if (!rows.length) {
      return showEmpty(container, "Nenhum local cadastrado no mapa.");
    }

    rows.forEach((location) => {
      const card = template.content.cloneNode(true);
      const img = card.querySelector("img");

      if (img) {
        img.src = safeImage(location.foto, FALLBACK_IMAGES.map);
        img.alt = location.nome || "Local do mapa";
      }

      const tag = card.querySelector(".tag");
      const title = card.querySelector("h3");
      const description = card.querySelector("p");

      if (tag) tag.textContent = location.tipo || "Local";
      if (title) title.textContent = location.nome || "Local sem nome";
      if (description) {
        description.textContent =
          location.descricao || "Sem descrição cadastrada.";
      }

      container.appendChild(card);
    });
  } catch (error) {
    showError(container, error);
  }
}

async function loadCharacters() {
  const container = document.getElementById("charactersContainer");
  const template = document.getElementById("characterTemplate");

  if (!container || !template) return;

  try {
    const rows = await getSheetRows(SHEETS.personagens);

    clearContainer(container);

    if (!rows.length) {
      return showEmpty(container, "Nenhum personagem cadastrado.");
    }

    rows.forEach((character) => {
      const card = template.content.cloneNode(true);
      const article = card.querySelector(".character-card");
      const img = card.querySelector("img");

      if (article) {
        article.dataset.group = character.grupo || "";
      }

      if (img) {
        img.src = safeImage(character.foto, FALLBACK_IMAGES.character);
        img.alt = character.nome || "Personagem";
      }

      const tag = card.querySelector(".tag");
      const title = card.querySelector("h3");
      const personality = card.querySelector(".personality");
      const history = card.querySelector(".history");
      const details = card.querySelector(".details");

      if (tag) tag.textContent = character.grupo || "Sem grupo";
      if (title) title.textContent = character.nome || "Personagem sem nome";

      if (personality) {
        personality.textContent =
          character.personalidade || "Personalidade não cadastrada.";
      }

      if (history) {
        history.textContent = character.historia || "História não cadastrada.";
      }

      if (details) {
        details.textContent = character.detalhes || "Sem detalhes adicionais.";
      }

      container.appendChild(card);
    });
  } catch (error) {
    showError(container, error);
  }
}

async function loadEvents() {
  const container = document.getElementById("eventsContainer");
  const template = document.getElementById("eventTemplate");

  if (!container || !template) return;

  try {
    const rows = await getSheetRows(SHEETS.eventos);

    clearContainer(container);

    if (!rows.length) {
      return showEmpty(container, "Nenhum evento cadastrado.");
    }

    rows.forEach((eventItem) => {
      const card = template.content.cloneNode(true);
      const img = card.querySelector("img");

      if (img) {
        img.src = safeImage(eventItem.foto, FALLBACK_IMAGES.event);
        img.alt = eventItem.nome || "Evento";
      }

      const tag = card.querySelector(".tag");
      const date = card.querySelector(".date");
      const title = card.querySelector("h3");
      const time = card.querySelector(".time");

      if (tag) tag.textContent = eventItem.tipo || "Evento";
      if (date) date.textContent = eventItem.data || "";
      if (title) title.textContent = eventItem.nome || "Evento sem nome";

      if (time) {
        time.textContent = eventItem.hora
          ? `Horário: ${eventItem.hora}`
          : "Horário opcional";
      }

      container.appendChild(card);
    });
  } catch (error) {
    showError(container, error);
  }
}

async function loadAvatars() {
  const container = document.getElementById("avatarsContainer");
  const template = document.getElementById("avatarTemplate");

  if (!container || !template) return;

  try {
    const rows = await getSheetRows(SHEETS.avatares);

    clearContainer(container);

    if (!rows.length) {
      return showEmpty(container, "Nenhum avatar cadastrado.");
    }

    rows.forEach((avatar) => {
      const card = template.content.cloneNode(true);
      const img = card.querySelector("img");
      const name = card.querySelector("strong");

      if (img) {
        img.src = safeImage(avatar.foto, FALLBACK_IMAGES.avatar);
        img.alt = avatar.nome || "Avatar";
      }

      if (name) {
        name.textContent = avatar.nome || "Avatar sem nome";
      }

      container.appendChild(card);
    });
  } catch (error) {
    showError(container, error);
  }
}

/*
  Esta função aceita:
  1. CSV puro.
  2. HTML publicado pelo Google Planilhas em /pubhtml.
*/
async function getSheetRows(url) {
  if (!url || url.includes("COLE_AQUI")) return [];

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erro ao carregar planilha: ${response.status}`);
  }

  const text = await response.text();

  const isHTML =
    text.trim().toLowerCase().startsWith("<!doctype html") ||
    text.trim().toLowerCase().startsWith("<html") ||
    text.includes("<table");

  if (isHTML) {
    return htmlTableToObjects(text);
  }

  return csvToObjects(text);
}

function htmlTableToObjects(htmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");

  const table = doc.querySelector("table");

  if (!table) return [];

  const matrix = Array.from(table.querySelectorAll("tr"))
    .map((tr) =>
      Array.from(tr.querySelectorAll("td, th")).map((cell) =>
        cleanCellText(cell.textContent)
      )
    )
    .filter((row) => row.some((cell) => cell !== ""));

  if (!matrix.length) return [];

  /*
    Em links /pubhtml do Google Planilhas,
    às vezes aparecem linhas/colunas extras.
    Por isso o código procura automaticamente a linha de cabeçalho.
  */
  const headerIndex = matrix.findIndex((row) =>
    row.some((cell) => {
      const normalized = normalizeHeader(cell);

      return [
        "foto",
        "nome",
        "tipo",
        "data",
        "hora",
        "personalidade",
        "historia",
        "grupo",
        "detalhes",
        "descricao",
        "title",
        "eyebrow",
        "description",
        "banner",
      ].includes(normalized);
    })
  );

  if (headerIndex === -1) return [];

  const headers = matrix[headerIndex].map(normalizeHeader);
  const dataRows = matrix.slice(headerIndex + 1);

  return dataRows
    .filter((row) => row.some((cell) => cell !== ""))
    .map((row) => {
      const object = {};

      headers.forEach((header, index) => {
        if (!header) return;
        object[header] = row[index] || "";
      });

      return object;
    });
}

function csvToObjects(csvText) {
  const rows = parseCSV(csvText);

  if (!rows.length) return [];

  const headers = rows[0].map(normalizeHeader);

  return rows
    .slice(1)
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

function cleanCellText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element && value) {
    element.textContent = value;
  }
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

  container.textContent =
    "Não foi possível carregar esta seção. Confira se o link da planilha está público e correto.";
}