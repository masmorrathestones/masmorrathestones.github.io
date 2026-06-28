/*
  A MASMORRA - THE STONES

  Versão para ler arquivos CSV diretamente do GitHub Pages.

  Estrutura esperada:

  index.html
  styles.css
  script.js
  data/
    inicio.csv
    mapa.csv
    personagens.csv
    eventos.csv
    avatares.csv

  EVENTOS agora aceita descrição:
  foto,nome,tipo,data,hora,descricao
*/

/* =========================
   CONFIGURAÇÕES
========================= */

const SHEETS = {
  inicio: "data/inicio.csv",
  mapa: "data/mapa.csv",
  personagens: "data/personagens.csv",
  eventos: "data/eventos.csv",
  avatares: "data/avatares.csv",
};

const FALLBACK_IMAGES = {
  character:
    "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=900&q=80",

  event:
    "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80",

  avatar:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",

  map:
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=900&q=80",
};

/* =========================
   INICIAR SITE
========================= */

document.addEventListener("DOMContentLoaded", () => {
  console.log("Script carregou corretamente.");

  document.body.classList.add("locked");

  setupAgeGate();
  setupMenu();
  setupCharacterFilters();

  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  carregarInicio();
  carregarMapa();
  carregarPersonagens();
  carregarEventos();
  carregarAvatares();
});

/* =========================
   AGE GATE
========================= */

function setupAgeGate() {
  const gate = document.getElementById("ageGate");
  const button = document.getElementById("enterButton");

  if (!gate || !button) return;

  const alreadyAccepted = localStorage.getItem("masmorraAgeAccepted") === "true";

  if (alreadyAccepted) {
    gate.classList.add("hidden");
    document.body.classList.remove("locked");
  }

  button.onclick = () => {
    localStorage.setItem("masmorraAgeAccepted", "true");
    gate.classList.add("hidden");
    document.body.classList.remove("locked");
  };
}

/* =========================
   MENU
========================= */

function setupMenu() {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("navMenu");

  if (!toggle || !nav) return;

  toggle.onclick = () => {
    nav.classList.toggle("open");
  };

  nav.querySelectorAll("a").forEach((link) => {
    link.onclick = () => {
      nav.classList.remove("open");
    };
  });
}

/* =========================
   FILTROS DE PERSONAGENS
========================= */

function setupCharacterFilters() {
  const filterBox = document.getElementById("characterFilters");

  if (!filterBox) return;

  filterBox.onclick = (event) => {
    const button = event.target.closest(".filter");

    if (!button) return;

    filterBox.querySelectorAll(".filter").forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    const filter = button.dataset.filter;

    document.querySelectorAll(".character-card").forEach((card) => {
      const group = normalizar(card.dataset.group);

      card.style.display =
        filter === "todos" || group === filter ? "" : "none";
    });
  };
}

/* =========================
   CARREGAR INÍCIO
========================= */

function carregarInicio() {
  carregarCSV(SHEETS.inicio, "início")
    .then((dados) => {
      const home = dados[0];

      if (!home) return;

      setText("homeEyebrow", home.eyebrow);
      setText("homeTitle", home.title);
      setText("homeDescription", home.description);

      if (home.banner) {
        const hero = document.querySelector(".hero");

        if (hero) {
          hero.style.setProperty("--hero-image", `url("${home.banner}")`);
        }
      }
    })
    .catch((err) => {
      console.warn("Início não carregado:", err);
    });
}

/* =========================
   CARREGAR MAPA
========================= */

function carregarMapa() {
  const container = document.getElementById("mapContainer");
  const template = document.getElementById("mapTemplate");

  if (!container || !template) return;

  carregarCSV(SHEETS.mapa, "mapa")
    .then((locais) => {
      limparContainer(container);

      if (!locais.length) {
        mostrarVazio(container, "Nenhum local cadastrado no mapa.");
        return;
      }

      locais.forEach((local) => {
        const card = template.content.cloneNode(true);

        const img = card.querySelector("img");
        const tag = card.querySelector(".tag");
        const title = card.querySelector("h3");
        const description = card.querySelector("p");

        if (img) {
          img.src = imagemSegura(local.foto, FALLBACK_IMAGES.map);
          img.alt = local.nome || "Local do mapa";
        }

        if (tag) tag.textContent = local.tipo || "Local";
        if (title) title.textContent = local.nome || "Local sem nome";

        if (description) {
          description.textContent =
            local.descricao || "Sem descrição cadastrada.";
        }

        container.appendChild(card);
      });
    })
    .catch((err) => {
      mostrarErro(container, err);
    });
}

/* =========================
   CARREGAR PERSONAGENS
========================= */

function carregarPersonagens() {
  const container = document.getElementById("charactersContainer");
  const template = document.getElementById("characterTemplate");

  if (!container || !template) return;

  carregarCSV(SHEETS.personagens, "personagens")
    .then((personagens) => {
      limparContainer(container);

      if (!personagens.length) {
        mostrarVazio(container, "Nenhum personagem cadastrado.");
        return;
      }

      personagens.forEach((personagem) => {
        const card = template.content.cloneNode(true);

        const article = card.querySelector(".character-card");
        const img = card.querySelector("img");
        const tag = card.querySelector(".tag");
        const title = card.querySelector("h3");
        const personality = card.querySelector(".personality");
        const history = card.querySelector(".history");
        const details = card.querySelector(".details");

        if (article) {
          article.dataset.group = personagem.grupo || "";
        }

        if (img) {
          img.src = imagemSegura(personagem.foto, FALLBACK_IMAGES.character);
          img.alt = personagem.nome || "Personagem";
        }

        if (tag) tag.textContent = personagem.grupo || "Sem grupo";
        if (title) title.textContent = personagem.nome || "Personagem sem nome";

        if (personality) {
          personality.textContent =
            personagem.personalidade || "Personalidade não cadastrada.";
        }

        if (history) {
          history.textContent =
            personagem.historia || "História não cadastrada.";
        }

        if (details) {
          details.textContent =
            personagem.detalhes || "Sem detalhes adicionais.";
        }

        container.appendChild(card);
      });
    })
    .catch((err) => {
      mostrarErro(container, err);
    });
}

/* =========================
   CARREGAR EVENTOS
========================= */

function carregarEventos() {
  const container = document.getElementById("eventsContainer");
  const template = document.getElementById("eventTemplate");

  if (!container || !template) return;

  carregarCSV(SHEETS.eventos, "eventos")
    .then((eventos) => {
      limparContainer(container);

      if (!eventos.length) {
        mostrarVazio(container, "Nenhum evento cadastrado.");
        return;
      }

      eventos.forEach((evento) => {
        const card = template.content.cloneNode(true);

        const article = card.querySelector(".event-card");
        const img = card.querySelector("img");
        const tag = card.querySelector(".tag");
        const date = card.querySelector(".date");
        const title = card.querySelector("h3");
        const time = card.querySelector(".time");

        if (article) {
          article.classList.add("clickable-event");
          article.setAttribute("tabindex", "0");
          article.setAttribute("role", "button");
          article.setAttribute(
            "aria-label",
            `Abrir detalhes do evento ${evento.nome || ""}`
          );

          article.addEventListener("click", () => {
            abrirDescricaoEvento(evento);
          });

          article.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              abrirDescricaoEvento(evento);
            }
          });
        }

        if (img) {
          img.src = imagemSegura(evento.foto, FALLBACK_IMAGES.event);
          img.alt = evento.nome || "Evento";
        }

        if (tag) tag.textContent = evento.tipo || "Evento";
        if (date) date.textContent = evento.data || "";
        if (title) title.textContent = evento.nome || "Evento sem nome";

        if (time) {
          time.textContent = evento.hora
            ? `Horário: ${evento.hora}`
            : "Horário opcional";
        }

        container.appendChild(card);
      });
    })
    .catch((err) => {
      mostrarErro(container, err);
    });
}

function abrirDescricaoEvento(evento) {
  const modalAntigo = document.getElementById("eventModal");

  if (modalAntigo) {
    modalAntigo.remove();
  }

  const modal = document.createElement("div");
  modal.id = "eventModal";
  modal.className = "event-modal";

  modal.innerHTML = `
    <div class="event-modal-content">
      <button class="event-modal-close" aria-label="Fechar">×</button>

      <img
        class="event-modal-image"
        src="${escaparHTML(imagemSegura(evento.foto, FALLBACK_IMAGES.event))}"
        alt="${escaparHTML(evento.nome || "Evento")}"
      >

      <div class="event-modal-body">
        <span class="tag">${escaparHTML(evento.tipo || "Evento")}</span>

        <h2>${escaparHTML(evento.nome || "Evento sem nome")}</h2>

        <p class="event-modal-date">
          ${escaparHTML(evento.data || "")}
          ${evento.hora ? ` • ${escaparHTML(evento.hora)}` : ""}
        </p>

        <p class="event-modal-description">
          ${escaparHTML(evento.descricao || "Sem descrição cadastrada.")}
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.classList.add("modal-open");

  const closeButton = modal.querySelector(".event-modal-close");

  closeButton.onclick = () => {
    fecharModalEvento();
  };

  modal.onclick = (event) => {
    if (event.target === modal) {
      fecharModalEvento();
    }
  };

  document.addEventListener("keydown", fecharModalComEsc);
}

function fecharModalEvento() {
  const modal = document.getElementById("eventModal");

  if (modal) {
    modal.remove();
  }

  document.body.classList.remove("modal-open");
  document.removeEventListener("keydown", fecharModalComEsc);
}

function fecharModalComEsc(event) {
  if (event.key === "Escape") {
    fecharModalEvento();
  }
}

/* =========================
   CARREGAR AVATARES
========================= */

function carregarAvatares() {
  const container = document.getElementById("avatarsContainer");
  const template = document.getElementById("avatarTemplate");

  if (!container || !template) return;

  carregarCSV(SHEETS.avatares, "avatares")
    .then((avatares) => {
      limparContainer(container);

      if (!avatares.length) {
        mostrarVazio(container, "Nenhum avatar cadastrado.");
        return;
      }

      avatares.forEach((avatar) => {
        const card = template.content.cloneNode(true);

        const img = card.querySelector("img");
        const name = card.querySelector("strong");

        if (img) {
          img.src = imagemSegura(avatar.foto, FALLBACK_IMAGES.avatar);
          img.alt = avatar.nome || "Avatar";
        }

        if (name) {
          name.textContent = avatar.nome || "Avatar sem nome";
        }

        container.appendChild(card);
      });
    })
    .catch((err) => {
      mostrarErro(container, err);
    });
}

/* =========================
   CARREGAR CSV
========================= */

function carregarCSV(url, nomeDaSecao) {
  console.log(`Carregando ${nomeDaSecao}:`, url);

  return fetch(url, { cache: "no-store" })
    .then((res) => {
      console.log(`Resposta ${nomeDaSecao}:`, res.status, res.url);

      if (!res.ok) {
        throw new Error(`Erro HTTP ${res.status} ao carregar ${url}`);
      }

      return res.text();
    })
    .then((texto) => {
      console.log(`Texto recebido de ${nomeDaSecao}:`, texto);

      const dados = csvParaObjetos(texto);

      console.log(`Dados convertidos de ${nomeDaSecao}:`, dados);

      return dados;
    });
}

/* =========================
   CSV PARA OBJETOS
========================= */

function csvParaObjetos(csv) {
  const linhas = parseCSV(csv);

  if (!linhas.length) return [];

  const headers = linhas.shift().map((h) => normalizarCabecalho(h));

  return linhas
    .filter((linha) =>
      linha.some((valor) => String(valor || "").trim() !== "")
    )
    .map((linha) => {
      const obj = {};

      headers.forEach((header, index) => {
        if (!header) return;
        obj[header] = linha[index]?.trim() || "";
      });

      return obj;
    });
}

/*
  Parser CSV compatível com:
  - vírgula
  - ponto e vírgula
  - tabulação
  - campos com aspas
*/

function parseCSV(texto) {
  texto = String(texto || "").replace(/^\uFEFF/, "").trim();

  if (!texto) return [];

  const primeiraLinha = texto.split(/\r?\n/)[0];

  let separador = ",";

  if (primeiraLinha.includes("\t")) {
    separador = "\t";
  } else if (primeiraLinha.includes(";")) {
    separador = ";";
  }

  const linhas = [];
  let linha = [];
  let valor = "";
  let dentroDeAspas = false;

  for (let i = 0; i < texto.length; i++) {
    const char = texto[i];
    const proximo = texto[i + 1];

    if (char === '"' && dentroDeAspas && proximo === '"') {
      valor += '"';
      i++;
    } else if (char === '"') {
      dentroDeAspas = !dentroDeAspas;
    } else if (char === separador && !dentroDeAspas) {
      linha.push(limparValor(valor));
      valor = "";
    } else if ((char === "\n" || char === "\r") && !dentroDeAspas) {
      if (char === "\r" && proximo === "\n") i++;

      linha.push(limparValor(valor));
      linhas.push(linha);

      linha = [];
      valor = "";
    } else {
      valor += char;
    }
  }

  if (valor || linha.length) {
    linha.push(limparValor(valor));
    linhas.push(linha);
  }

  return linhas;
}

function limparValor(valor) {
  return String(valor || "")
    .replace(/^\uFEFF/, "")
    .replace(/\u00a0/g, " ")
    .replace(/^"|"$/g, "")
    .trim();
}

/* =========================
   FUNÇÕES AUXILIARES
========================= */

function normalizarCabecalho(header) {
  return normalizar(header)
    .replace(/^\uFEFF/, "")
    .replace(/\s+/g, "_")
    .replace("história", "historia")
    .replace("descrição", "descricao");
}

function normalizar(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element && value) {
    element.textContent = value;
  }
}

function imagemSegura(url, fallback) {
  return url && /^https?:\/\//i.test(url) ? url : fallback;
}

function escaparHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function limparContainer(container) {
  container.classList.remove("loading", "empty", "error");
  container.innerHTML = "";
}

function mostrarVazio(container, mensagem) {
  container.classList.add("empty");
  container.textContent = mensagem;
}

function mostrarErro(container, erro) {
  console.error("Erro ao carregar seção:", erro);

  container.classList.remove("loading");
  container.classList.add("error");

  container.textContent =
    "Não foi possível carregar esta seção. Confira se o arquivo CSV existe e está no caminho certo.";
}
