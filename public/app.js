/* global document, fetch, sessionStorage, FormData */
"use strict";

// Regra de segurança deste arquivo: todo texto que vem da API entra na
// página via textContent (nunca innerHTML), então HTML/JS dentro de um
// título ou descrição de ticket é exibido como texto, não executado.

const TOKEN_KEY = "smartTriage.accessToken";

const STATUS_LABEL = {
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em andamento",
  FECHADO: "Fechado",
};
const CATEGORIA_LABEL = {
  TECNICO: "Técnico",
  FINANCEIRO: "Financeiro",
  DUVIDA: "Dúvida",
  SOLICITACAO: "Solicitação",
  OUTRO: "Outro",
};
const URGENCIA_LABEL = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  URGENTE: "Urgente",
};

// ---------- Token (sessionStorage) ----------

function getToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    // sessionStorage bloqueado: o login não persiste, mas a página segue
  }
}

function clearToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // nada a fazer
  }
}

// ---------- Chamada à API ----------

// Faz a requisição e sempre devolve { ok, status, data }, sem lançar erro.
// status 0 = não conseguiu falar com o servidor (rede caiu, servidor parado).
async function api(method, path, { body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    return { ok: false, status: 0, data: null };
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // resposta sem JSON
  }
  return { ok: res.ok, status: res.status, data };
}

function erroGenerico(status) {
  if (status === 0) {
    return "Não foi possível falar com o servidor. Verifique sua conexão e tente de novo.";
  }
  return "Algo deu errado do nosso lado. Tente de novo em instantes.";
}

// ---------- Helpers de tela ----------

const views = {
  abrir: document.getElementById("view-abrir"),
  login: document.getElementById("view-login"),
  lista: document.getElementById("view-lista"),
};

function mostrarView(nome) {
  for (const [chave, el] of Object.entries(views)) {
    el.hidden = chave !== nome;
  }
  const navAtual = nome === "abrir" ? "abrir" : "atendente";
  for (const botao of document.querySelectorAll("[data-ir]")) {
    if (botao.dataset.ir === navAtual) {
      botao.setAttribute("aria-current", "page");
    } else {
      botao.removeAttribute("aria-current");
    }
  }
  document.getElementById("btn-sair").hidden = !getToken();
}

function mostrarMsg(el, texto, tipo) {
  el.textContent = texto;
  el.className = `msg ${tipo}`;
  el.hidden = false;
}

function esconderMsg(el) {
  el.hidden = true;
  el.textContent = "";
}

function criar(tag, className, texto) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

// Sessão inválida/expirada (401 em rota protegida): volta para o login.
function sessaoExpirada() {
  clearToken();
  mostrarView("login");
  mostrarMsg(
    document.getElementById("msg-login"),
    "Sua sessão expirou. Entre de novo para continuar.",
    "info",
  );
}

// ---------- Navegação ----------

for (const botao of document.querySelectorAll("[data-ir]")) {
  botao.addEventListener("click", () => {
    if (botao.dataset.ir === "abrir") {
      mostrarView("abrir");
    } else if (getToken()) {
      mostrarView("lista");
      carregarTickets();
    } else {
      mostrarView("login");
    }
  });
}

document.getElementById("btn-sair").addEventListener("click", () => {
  clearToken();
  document.getElementById("lista-tickets").replaceChildren();
  mostrarView("login");
});

// ---------- 1. Abrir ticket ----------

const formTicket = document.getElementById("form-ticket");
const msgTicket = document.getElementById("msg-ticket");
const confirmacao = document.getElementById("confirmacao-ticket");

formTicket.addEventListener("submit", async (event) => {
  event.preventDefault();
  esconderMsg(msgTicket);

  const dados = new FormData(formTicket);
  const body = {
    nomeSolicitante: dados.get("nomeSolicitante"),
    emailSolicitante: dados.get("emailSolicitante"),
    titulo: dados.get("titulo"),
    descricao: dados.get("descricao"),
  };

  const botao = formTicket.querySelector("button[type=submit]");
  botao.disabled = true;
  const r = await api("POST", "/tickets", { body });
  botao.disabled = false;

  if (r.ok && r.data) {
    document.getElementById("ticket-criado-id").textContent = `#${r.data.id}`;
    formTicket.reset();
    formTicket.hidden = true;
    confirmacao.hidden = false;
    return;
  }

  if (r.status === 400) {
    mostrarMsg(msgTicket, "Preencha todos os campos.", "erro");
  } else {
    mostrarMsg(msgTicket, erroGenerico(r.status), "erro");
  }
});

document.getElementById("btn-novo-ticket").addEventListener("click", () => {
  confirmacao.hidden = true;
  formTicket.hidden = false;
});

// ---------- 2. Login ----------

const formLogin = document.getElementById("form-login");
const msgLogin = document.getElementById("msg-login");

formLogin.addEventListener("submit", async (event) => {
  event.preventDefault();
  esconderMsg(msgLogin);

  const dados = new FormData(formLogin);
  const body = { email: dados.get("email"), senha: dados.get("senha") };

  const botao = formLogin.querySelector("button[type=submit]");
  botao.disabled = true;
  const r = await api("POST", "/auth/login", { body });
  botao.disabled = false;

  if (r.ok && r.data && r.data.accessToken) {
    setToken(r.data.accessToken);
    formLogin.reset();
    mostrarView("lista");
    carregarTickets();
    return;
  }

  if (r.status === 401) {
    mostrarMsg(msgLogin, "E-mail ou senha incorretos.", "erro");
    formLogin.elements.senha.value = "";
    formLogin.elements.senha.focus();
  } else if (r.status === 400) {
    mostrarMsg(msgLogin, "Informe e-mail e senha.", "erro");
  } else {
    mostrarMsg(msgLogin, erroGenerico(r.status), "erro");
  }
});

// ---------- 3. Lista de tickets ----------

const listaEl = document.getElementById("lista-tickets");
const msgLista = document.getElementById("msg-lista");
const filtroStatus = document.getElementById("filtro-status");

// Evita que uma resposta antiga sobrescreva uma lista mais nova
// (ex.: trocar o filtro duas vezes rápido).
let versaoLista = 0;

async function carregarTickets() {
  const versao = ++versaoLista;
  const status = filtroStatus.value;
  const path = status
    ? `/tickets?status=${encodeURIComponent(status)}`
    : "/tickets";

  const r = await api("GET", path, { auth: true });
  if (versao !== versaoLista) return;

  if (r.status === 401) {
    sessaoExpirada();
    return;
  }
  if (!r.ok || !Array.isArray(r.data)) {
    mostrarMsg(msgLista, erroGenerico(r.status), "erro");
    return;
  }

  listaEl.replaceChildren();
  if (r.data.length === 0) {
    listaEl.append(criar("li", "vazio", "Nenhum ticket encontrado."));
    return;
  }
  for (const ticket of r.data) {
    listaEl.append(criarCardTicket(ticket));
  }
}

function criarCardTicket(ticket) {
  const li = criar("li", "ticket");

  li.append(criar("h2", "ticket-titulo", ticket.titulo));

  const criadoEm = ticket.criadoEm
    ? new Date(ticket.criadoEm).toLocaleString("pt-BR")
    : "";
  li.append(
    criar(
      "p",
      "ticket-meta",
      `#${ticket.id}${criadoEm ? ` · ${criadoEm}` : ""}`,
    ),
  );

  const etiquetas = criar("div", "etiquetas");
  etiquetas.append(
    criar("span", "etiqueta", STATUS_LABEL[ticket.status] ?? ticket.status),
  );
  const areaClassificacao = criar("span", "etiquetas");
  etiquetas.append(areaClassificacao);
  li.append(etiquetas);
  preencherClassificacao(ticket, areaClassificacao);

  const msg = criar("p", "msg");
  msg.hidden = true;
  msg.setAttribute("role", "alert");

  // Só mostra a ação que a API aceita no status atual: Aberto pode ser
  // assumido, Em andamento pode ser fechado, Fechado não tem ação. Depois
  // de uma ação, carregarTickets() redesenha o cartão com o status novo.
  const acoes = criar("div", "acoes");
  if (ticket.status === "ABERTO") {
    const btnAssumir = criar("button", "botao", "Assumir");
    btnAssumir.type = "button";
    btnAssumir.addEventListener("click", () =>
      executarAcao(ticket.id, "assumir", btnAssumir, msg),
    );
    acoes.append(btnAssumir);
  } else if (ticket.status === "EM_ANDAMENTO") {
    const btnFechar = criar("button", "botao", "Fechar");
    btnFechar.type = "button";
    btnFechar.addEventListener("click", () =>
      executarAcao(ticket.id, "fechar", btnFechar, msg),
    );
    acoes.append(btnFechar);
  }

  if (acoes.childElementCount > 0) li.append(acoes);
  li.append(msg);
  return li;
}

// A classificação roda em segundo plano logo após a criação e, se falhar,
// não é refeita. Passado esse prazo sem classificação, o ticket não vai
// mais ser classificado, então "classificando..." deixaria de ser verdade.
const PRAZO_CLASSIFICACAO_MS = 2 * 60 * 1000;

function textoSemClassificacao(ticket) {
  const criadoEm = new Date(ticket.criadoEm).getTime();
  if (Number.isNaN(criadoEm)) return "sem classificação";
  return Date.now() - criadoEm < PRAZO_CLASSIFICACAO_MS
    ? "classificando..."
    : "sem classificação";
}

// A classificação pode vir na própria listagem. Se o campo nem existir
// no objeto (a listagem atual da API não inclui), busca o detalhe do
// ticket, que inclui. null = a IA ainda não classificou.
async function preencherClassificacao(ticket, area) {
  let classificacao;
  if ("classificacao" in ticket) {
    classificacao = ticket.classificacao;
  } else {
    area.append(criar("span", "etiqueta pendente", "carregando..."));
    const r = await api("GET", `/tickets/${encodeURIComponent(ticket.id)}`, {
      auth: true,
    });
    if (!r.ok || !r.data) {
      area.replaceChildren(
        criar("span", "etiqueta pendente", "classificação indisponível"),
      );
      return;
    }
    classificacao = r.data.classificacao ?? null;
  }

  area.replaceChildren();
  if (!classificacao) {
    area.append(
      criar("span", "etiqueta pendente", textoSemClassificacao(ticket)),
    );
    return;
  }
  area.append(
    criar(
      "span",
      "etiqueta",
      `Categoria: ${CATEGORIA_LABEL[classificacao.categoria] ?? classificacao.categoria}`,
    ),
    criar(
      "span",
      "etiqueta",
      `Urgência: ${URGENCIA_LABEL[classificacao.urgencia] ?? classificacao.urgencia}`,
    ),
  );
}

const MENSAGENS_ACAO = {
  assumir: {
    ok: "Ticket assumido.",
    403: "Você não tem permissão para assumir este ticket.",
    404: "Este ticket não existe mais. Atualize a lista.",
    409: "Este ticket não está aberto: ele já foi assumido ou fechado.",
  },
  fechar: {
    ok: "Ticket fechado.",
    403: "Este ticket está com outro atendente. Só quem assumiu pode fechar.",
    404: "Este ticket não existe mais. Atualize a lista.",
    409: "Só é possível fechar um ticket que está em andamento (assuma-o antes).",
  },
};

async function executarAcao(id, acao, botao, msgEl) {
  esconderMsg(msgEl);
  botao.disabled = true;
  const r = await api("PATCH", `/tickets/${encodeURIComponent(id)}/${acao}`, {
    auth: true,
  });
  botao.disabled = false;

  if (r.ok) {
    mostrarMsg(msgLista, `#${id}: ${MENSAGENS_ACAO[acao].ok}`, "ok");
    carregarTickets();
    return;
  }
  if (r.status === 401) {
    sessaoExpirada();
    return;
  }
  const texto = MENSAGENS_ACAO[acao][r.status] ?? erroGenerico(r.status);
  mostrarMsg(msgEl, texto, "erro");
}

filtroStatus.addEventListener("change", () => {
  esconderMsg(msgLista);
  carregarTickets();
});

document.getElementById("btn-atualizar").addEventListener("click", () => {
  esconderMsg(msgLista);
  carregarTickets();
});

// ---------- Início ----------

mostrarView("abrir");
