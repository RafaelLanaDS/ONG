import { el, statusBox, hoje, formatarMoeda, formatarData } from "../ui.js";
import { requisitar } from "../api.js";

export function paginaDoacoes(container) {
  const secao = el("section", { className: "pagina" });
  secao.append(el("header", { className: "pagina-titulo" }, el("h1", { text: "Doações" })));
  const layout = el("div", { className: "layout-doacoes" });

  const formulario = el("form", { className: "painel formulario" });
  const doador = el("select", { name: "id_doador", required: "" });
  doador.append(el("option", { value: "", text: "Carregando doadores..." }));
  const valor = el("input", {
    name: "valor",
    type: "number",
    min: "0.01",
    step: "0.01",
    required: "",
  });
  const data = el("input", { name: "data_doacao", type: "date", value: hoje(), required: "" });
  const forma = el("select", { name: "forma_pagamento", required: "" });
  [
    ["pix", "PIX"],
    ["dinheiro", "Dinheiro"],
    ["transferencia", "Transferência"],
    ["cartao", "Cartão"],
    ["boleto", "Boleto"],
    ["outro", "Outro"],
  ].forEach(([valorOpcao, texto]) =>
    forma.append(el("option", { value: valorOpcao, text: texto })),
  );
  const status = el("select", { name: "status", required: "" });
  [
    ["pendente", "Pendente"],
    ["confirmada", "Confirmada"],
    ["cancelada", "Cancelada"],
  ].forEach(([valorOpcao, texto]) =>
    status.append(el("option", { value: valorOpcao, text: texto })),
  );
  const observacoes = el("textarea", { name: "observacoes", maxlength: "500", rows: "4" });
  formulario.append(
    el("h2", { text: "Registrar doação" }),
    campo("Doador", doador),
    campo("Valor (R$)", valor),
    campo("Data", data),
    campo("Forma de pagamento", forma),
    campo("Status", status),
    campo("Observações", observacoes),
    el("button", { className: "botao primario", type: "submit", text: "Registrar doação" }),
  );

  const lista = el("div", { className: "painel" });
  lista.append(el("h2", { text: "Histórico" }), statusBox("Carregando...", "carregando"));
  layout.append(formulario, lista);
  secao.append(layout);
  container.replaceChildren(secao);

  async function carregar() {
    lista.replaceChildren(
      el("h2", { text: "Histórico" }),
      statusBox("Carregando...", "carregando"),
    );
    try {
      const [doadores, doacoes] = await Promise.all([
        requisitar("/api/doadores"),
        requisitar("/api/doacoes"),
      ]);
      doador.replaceChildren(el("option", { value: "", text: "Selecione o doador" }));
      doadores.forEach((item) =>
        doador.append(el("option", { value: String(item.id_doador), text: item.nome })),
      );
      if (!doadores.length)
        doador.append(el("option", { value: "", text: "Cadastre um doador primeiro" }));

      lista.replaceChildren(el("h2", { text: "Histórico" }));
      if (!doacoes.length) {
        lista.append(statusBox("Nenhuma doação registrada.", ""));
        return;
      }
      const cards = el("div", { className: "grade-cards" });
      doacoes.forEach((item) => {
        const card = el("article", { className: "card doacao-card" });
        card.append(
          el("h3", { text: formatarMoeda(item.valor) }),
          el("p", { text: item.doador_nome }),
          el("p", { text: formatarData(item.data_doacao) }),
          el("span", { className: `tag status-${item.status}`, text: item.status }),
          el("p", { text: item.observacoes || "Sem observações" }),
        );
        cards.append(card);
      });
      lista.append(cards);
    } catch (erro) {
      lista.replaceChildren(el("h2", { text: "Histórico" }), statusBox(erro.message, "erro"));
    }
  }

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const dados = Object.fromEntries(new FormData(formulario));
    dados.valor = Number(dados.valor);
    dados.id_doador = Number(dados.id_doador);
    const botao = formulario.querySelector("button");
    botao.disabled = true;
    try {
      const resultado = await requisitar("/api/doacoes", {
        method: "POST",
        body: JSON.stringify(dados),
      });
      formulario.reset();
      data.value = hoje();
      await carregar();
      lista.append(statusBox(resultado.mensagem, "sucesso"));
    } catch (erro) {
      lista.append(statusBox(erro.message, "erro"));
    } finally {
      botao.disabled = false;
    }
  });

  carregar();
}

function campo(rotulo, controle) {
  const id = `campo-doacao-${controle.name}`;
  controle.id = id;
  return el("label", { className: "campo", for: id }, el("span", { text: rotulo }), controle);
}
