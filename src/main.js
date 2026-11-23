import "./style.css";
import { el } from "./ui.js";
import { limparSessao, obterToken, obterUsuario, requisitar, salvarSessao } from "./api.js";
import { paginaDoadores } from "./pages/doadores.js";
import { paginaDoacoes } from "./pages/doacoes.js";

const app = document.querySelector("#app");

function paginaLogin() {
  const shell = el("main", { className: "login-shell" });
  const card = el("section", { className: "painel login-card", "aria-labelledby": "login-titulo" });
  const form = el("form", { className: "formulario" });
  const email = el("input", {
    id: "email",
    name: "email",
    type: "email",
    required: "",
    autocomplete: "username",
  });
  const senha = el("input", {
    id: "senha",
    name: "senha",
    type: "password",
    required: "",
    autocomplete: "current-password",
  });
  const mensagem = el("p", { className: "status", role: "status" });
  const botao = el("button", { className: "botao primario", type: "submit", text: "Entrar" });

  form.append(
    el("h1", { id: "login-titulo", text: "Acessar sistema" }),
    el("p", { className: "login-ajuda", text: "Gestão de doações da ONG NOME_DA_ONG" }),
    el("label", { className: "campo", for: "email" }, el("span", { text: "E-mail" }), email),
    el("label", { className: "campo", for: "senha" }, el("span", { text: "Senha" }), senha),
    mensagem,
    botao,
  );
  card.append(form);
  shell.append(card);
  app.replaceChildren(shell);

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const dados = Object.fromEntries(new FormData(form));
    botao.disabled = true;
    mensagem.textContent = "Entrando...";
    try {
      const resposta = await requisitar("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(dados),
        headers: {},
      });
      salvarSessao(resposta);
      window.location.hash = "#/doadores";
      renderizar();
    } catch (erro) {
      mensagem.textContent = erro.message;
      mensagem.className = "status erro";
    } finally {
      botao.disabled = false;
    }
  });
}

function renderizar() {
  if (!obterToken()) {
    paginaLogin();
    return;
  }

  const usuario = obterUsuario();
  const hash = window.location.hash || "#/doadores";
  const rota = ["#/doadores", "#/doacoes/nova", "#/doacoes"].includes(hash) ? hash : "#/doadores";
  if (hash !== rota) window.location.hash = rota;

  const shell = el("div", { className: "app-shell" });
  const header = el("header", { className: "topbar" });
  const marca = el("a", { className: "marca", href: "#/doadores", text: "NOME_DA_ONG" });
  const nav = el("nav", { "aria-label": "Navegação principal" });
  const links = [
    ["#/doadores", "Doadores"],
    ["#/doacoes/nova", "Nova doação"],
    ["#/doacoes", "Doações"],
  ];
  links.forEach(([href, texto]) => {
    const link = el("a", { href, text: texto });
    if (rota === href) link.setAttribute("aria-current", "page");
    nav.append(link);
  });
  const usuarioNome = el("span", { className: "usuario", text: usuario?.nome || "Usuário" });
  const sair = el("button", { className: "botao sair", type: "button", text: "Sair" });
  sair.addEventListener("click", () => {
    limparSessao();
    window.location.hash = "";
    renderizar();
  });
  header.append(marca, nav, el("div", { className: "usuario-area" }, usuarioNome, sair));

  const main = el("main", { className: "conteudo" });
  shell.append(header, main);
  app.replaceChildren(shell);

  if (rota === "#/doadores") paginaDoadores(main);
  else if (rota === "#/doacoes/nova" || rota === "#/doacoes") paginaDoacoes(main);
}

window.addEventListener("hashchange", renderizar);
renderizar();
