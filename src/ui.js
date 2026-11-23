export function el(tag, props = {}, ...children) {
  const element = document.createElement(tag);
  Object.entries(props).forEach(([name, value]) => {
    if (name === "className") element.className = value;
    else if (name === "text") element.textContent = value;
    else if (name.startsWith("on") && typeof value === "function") {
      element.addEventListener(name.slice(2).toLowerCase(), value);
    } else if (value !== undefined && value !== null) {
      element.setAttribute(name, String(value));
    }
  });
  children.flat().forEach((child) => {
    if (child instanceof Node) element.append(child);
    else if (child !== null && child !== undefined)
      element.append(document.createTextNode(String(child)));
  });
  return element;
}

export function statusBox(texto, tipo = "") {
  return el("p", { className: `status ${tipo}`.trim(), role: "status", text: texto });
}

export function hoje() {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatarData(valor) {
  if (!valor) return "Sem data";
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? "Sem data" : data.toLocaleDateString("pt-BR");
}
