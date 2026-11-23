const TOKEN_KEY = "ong_token";
const USER_KEY = "ong_usuario";

export function salvarSessao(dados) {
  localStorage.setItem(TOKEN_KEY, dados.token);
  localStorage.setItem(USER_KEY, JSON.stringify(dados.usuario));
}

export function obterUsuario() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function obterToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function limparSessao() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function requisitar(caminho, opcoes = {}) {
  const token = obterToken();
  const headers = { ...opcoes.headers };
  if (opcoes.body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const resposta = await fetch(caminho, { ...opcoes, headers });
  if (resposta.status === 204) return null;
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro || "Erro ao comunicar com o servidor.");
  return dados;
}
