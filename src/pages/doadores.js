import { el, statusBox } from "../ui.js";
import { requisitar } from "../api.js";

export function paginaDoadores(container) {
  const secao = el("section", { className: "pagina" });
  secao.append(el("header", { className: "pagina-titulo" }, el("h1", { text: "Doadores" })));

  const layout = el("div", { className: "layout-doadores" });
  const formulario = el("form", { className: "painel formulario", id: "form-doador" });
  const tituloForm = el("h2", { text: "Novo doador" });
  const nome = el("input", { name: "nome", required: "", maxlength: "150", autocomplete: "name" });
  const tipo = el("select", { name: "tipo", required: "" });
  tipo.append(
    el("option", { value: "", text: "Selecione o tipo" }),
    el("option", { value: "pessoa_fisica", text: "Pessoa física" }),
    el("option", { value: "pessoa_juridica", text: "Pessoa jurídica" }),
  );
  const email = el("input", {
    name: "email",
    type: "email",
    maxlength: "254",
    autocomplete: "email",
  });
  const telefone = el("input", { name: "telefone", maxlength: "20", autocomplete: "tel" });
  formulario.append(
    tituloForm,
    campo("Nome", nome),
    campo("Tipo", tipo),
    campo("E-mail", email),
    campo("Telefone", telefone),
    el("button", { className: "botao primario", type: "submit", text: "Salvar doador" }),
  );

  const lista = el("div", { className: "painel" });
  lista.append(el("h2", { text: "Lista de doadores" }), statusBox("Carregando...", "carregando"));
  layout.append(formulario, lista);
  secao.append(layout);
  container.replaceChildren(secao);

  let editando = null;

  async function carregar() {
    lista.replaceChildren(
      el("h2", { text: "Lista de doadores" }),
      statusBox("Carregando...", "carregando"),
    );
    try {
      const doadores = await requisitar("/api/doadores");
      lista.replaceChildren(el("h2", { text: "Lista de doadores" }));
      if (!doadores.length) {
        lista.append(statusBox("Nenhum doador cadastrado.", ""));
        return;
      }
      const cards = el("div", { className: "grade-cards" });
      doadores.forEach((doador) => {
        const card = el("article", { className: "card" });
        card.append(
          el("h3", { text: doador.nome }),
          el("p", { text: doador.tipo === "pessoa_fisica" ? "Pessoa física" : "Pessoa jurídica" }),
          el("p", { text: doador.email || "sem e-mail" }),
          el("p", { text: doador.telefone || "sem telefone" }),
        );
        const acoes = el("div", { className: "acoes" });
        const editar = el("button", {
          className: "botao secundario",
          type: "button",
          text: "Editar",
        });
        editar.addEventListener("click", () => iniciarEdicao(doador));
        const excluir = el("button", {
          className: "botao perigo",
          type: "button",
          text: "Excluir",
        });
        excluir.addEventListener("click", () => excluirDoador(doador));
        acoes.append(editar, excluir);
        card.append(acoes);
        cards.append(card);
      });
      lista.append(cards);
    } catch (erro) {
      lista.replaceChildren(
        el("h2", { text: "Lista de doadores" }),
        statusBox(erro.message, "erro"),
      );
    }
  }

  function iniciarEdicao(doador) {
    editando = doador.id_doador;
    nome.value = doador.nome;
    tipo.value = doador.tipo;
    email.value = doador.email || "";
    telefone.value = doador.telefone || "";
    tituloForm.textContent = "Editar doador";
    formulario.querySelector("button").textContent = "Atualizar doador";
    nome.focus();
  }

  async function excluirDoador(doador) {
    if (!window.confirm(`Excluir ${doador.nome}?`)) return;
    try {
      await requisitar(`/api/doadores/${doador.id_doador}`, { method: "DELETE" });
      await carregar();
    } catch (erro) {
      lista.append(statusBox(erro.message, "erro"));
    }
  }

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const dados = Object.fromEntries(new FormData(formulario));
    const botao = formulario.querySelector("button");
    const estavaEditando = Boolean(editando);
    botao.disabled = true;
    try {
      if (editando) {
        await requisitar(`/api/doadores/${editando}`, {
          method: "PUT",
          body: JSON.stringify(dados),
        });
      } else {
        await requisitar("/api/doadores", { method: "POST", body: JSON.stringify(dados) });
      }
      formulario.reset();
      editando = null;
      tituloForm.textContent = "Novo doador";
      botao.textContent = "Salvar doador";
      await carregar();
      lista.append(
        statusBox(estavaEditando ? "Doador atualizado." : "Doador salvo com sucesso.", "sucesso"),
      );
    } catch (erro) {
      lista.append(statusBox(erro.message, "erro"));
    } finally {
      botao.disabled = false;
    }
  });

  carregar();
}

function campo(rotulo, controle) {
  const id = `campo-${controle.name}`;
  controle.id = id;
  return el("label", { className: "campo", for: id }, el("span", { text: rotulo }), controle);
}
