import "dotenv/config";
import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ong_doacoes",
  waitForConnections: true,
  connectionLimit: 10,
});

const JWT_SECRET = process.env.JWT_SECRET;

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "NOME_DA_ONG", hora: new Date().toISOString() });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ erro: "Informe e-mail e senha." });
  }

  try {
    const [linhas] = await pool.execute(
      "SELECT id_usuario, nome, email, senha_hash FROM usuario WHERE email = ?",
      [String(email).trim().toLowerCase()],
    );
    const usuario = linhas[0];
    if (!usuario || !(await bcrypt.compare(String(senha), usuario.senha_hash))) {
      return res.status(401).json({ erro: "E-mail ou senha inválidos." });
    }

    const token = jwt.sign(
      { sub: usuario.id_usuario, nome: usuario.nome, email: usuario.email },
      JWT_SECRET,
      { expiresIn: "8h" },
    );
    return res.json({
      token,
      usuario: { id: usuario.id_usuario, nome: usuario.nome, email: usuario.email },
    });
  } catch (erro) {
    console.error("Erro no login:", erro);
    return res.status(500).json({ erro: "Não foi possível realizar o login." });
  }
});

if (!JWT_SECRET) {
  console.error("JWT_SECRET não configurado. Defina a variável no arquivo .env.");
  process.exit(1);
}

function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || "").split(" ");
  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ erro: "Token não informado." });
  }
  try {
    req.usuario = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}

app.use("/api", autenticar);

app.get("/api/doadores", async (req, res) => {
  try {
    const [linhas] = await pool.execute(
      "SELECT id_doador, nome, tipo, email, telefone, criado_em FROM doador ORDER BY nome",
    );
    res.json(linhas);
  } catch (erro) {
    console.error("Erro ao listar doadores:", erro);
    res.status(500).json({ erro: "Não foi possível listar os doadores." });
  }
});

app.post("/api/doadores", async (req, res) => {
  const { nome, tipo, email, telefone } = req.body;
  if (!nome?.trim() || !["pessoa_fisica", "pessoa_juridica"].includes(tipo)) {
    return res.status(400).json({ erro: "Informe nome e tipo válidos." });
  }
  try {
    const [resultado] = await pool.execute(
      "INSERT INTO doador (nome, tipo, email, telefone) VALUES (?, ?, ?, ?)",
      [nome.trim(), tipo, email?.trim() || null, telefone?.trim() || null],
    );
    const [linhas] = await pool.execute(
      "SELECT id_doador, nome, tipo, email, telefone, criado_em FROM doador WHERE id_doador = ?",
      [resultado.insertId],
    );
    res.status(201).json(linhas[0]);
  } catch (erro) {
    console.error("Erro ao cadastrar doador:", erro);
    res.status(500).json({ erro: "Não foi possível cadastrar o doador." });
  }
});

app.put("/api/doadores/:id", async (req, res) => {
  const { nome, tipo, email, telefone } = req.body;
  if (!nome?.trim() || !["pessoa_fisica", "pessoa_juridica"].includes(tipo)) {
    return res.status(400).json({ erro: "Informe nome e tipo válidos." });
  }
  try {
    const [resultado] = await pool.execute(
      "UPDATE doador SET nome = ?, tipo = ?, email = ?, telefone = ? WHERE id_doador = ?",
      [nome.trim(), tipo, email?.trim() || null, telefone?.trim() || null, req.params.id],
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: "Doador não encontrado." });
    }
    res.json({ mensagem: "Doador atualizado." });
  } catch (erro) {
    console.error("Erro ao atualizar doador:", erro);
    res.status(500).json({ erro: "Não foi possível atualizar o doador." });
  }
});

app.delete("/api/doadores/:id", async (req, res) => {
  try {
    await pool.execute("DELETE FROM doador WHERE id_doador = ?", [req.params.id]);
    res.status(204).end();
  } catch (erro) {
    if (erro?.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({ erro: "O doador possui doações e não pode ser excluído." });
    }
    console.error("Erro ao excluir doador:", erro);
    res.status(500).json({ erro: "Não foi possível excluir o doador." });
  }
});

app.get("/api/doacoes", async (req, res) => {
  try {
    const [linhas] = await pool.execute(
      `SELECT d.id_doacao, d.id_doador, o.nome AS doador_nome, d.valor,
              d.data_doacao, d.forma_pagamento, d.status, d.observacoes
       FROM doacao d JOIN doador o ON o.id_doador = d.id_doador
       ORDER BY d.data_doacao DESC, d.id_doacao DESC`,
    );
    res.json(linhas);
  } catch (erro) {
    console.error("Erro ao listar doações:", erro);
    res.status(500).json({ erro: "Não foi possível listar as doações." });
  }
});

app.post("/api/doacoes", async (req, res) => {
  const { id_doador, valor, data_doacao, forma_pagamento, status, observacoes } = req.body;
  if (!id_doador || !Number(valor) || Number(valor) <= 0) {
    return res.status(400).json({ erro: "Selecione o doador e informe um valor válido." });
  }
  if (
    !["pix", "dinheiro", "transferencia", "cartao", "boleto", "outro"].includes(forma_pagamento)
  ) {
    return res.status(400).json({ erro: "Informe uma forma de pagamento válida." });
  }
  try {
    const [resultado] = await pool.execute(
      `INSERT INTO doacao
       (id_doador, valor, data_doacao, forma_pagamento, status, observacoes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id_doador,
        Number(valor),
        data_doacao || new Date(),
        forma_pagamento,
        ["pendente", "confirmada", "cancelada"].includes(status) ? status : "pendente",
        observacoes?.trim() || null,
      ],
    );
    res.status(201).json({ id_doacao: resultado.insertId, mensagem: "Doação registrada." });
  } catch (erro) {
    if (erro?.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(404).json({ erro: "Doador não encontrado." });
    }
    console.error("Erro ao registrar doação:", erro);
    res.status(500).json({ erro: "Não foi possível registrar a doação." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
