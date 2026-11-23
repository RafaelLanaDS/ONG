# Identificação

- Projeto: Sistema de gestão de doações da ONG DevOps
- Disciplina: Projeto Integrador Extensionista II
- Curso: Análise e Desenvolvimento de Sistemas
- Integrante: Rafael Lana de Sousa
- Repositório: https://github.com/RafaelLanaDS/ONG

# Como rodar o projeto

1. Instalar Git, Node.js, Vite+ e MySQL.
2. Clonar o repositório e entrar na pasta do projeto.
3. Executar `vp install`.
4. Copiar `.env.example` para `.env` e configurar as credenciais do MySQL e um valor seguro para `JWT_SECRET`.
5. Executar `database/schema.sql` no MySQL para criar o banco e o usuário de demonstração. O script apaga e recria o banco `ong_doacoes`.
6. Iniciar a API com `vp run api`.
7. Em outro terminal, iniciar o frontend com `vp dev`.
8. Acessar `http://localhost:5173`.

Acesso de demonstração:

- E-mail: `admin@ong.com`
- Senha: `admin123`

# O que funciona e o que ficou pendente

O sistema possui login com bcrypt e JWT, proteção das rotas da API, cadastro, edição, exclusão e listagem de doadores, além de registro e listagem de doações. A interface tem navegação SPA responsiva e apresenta estados de carregamento, vazio, erro e sucesso.

Foram validados o login pela interface, a autenticação e os fluxos de doadores e doações pela API. As verificações `vp check` e `vp build` foram concluídas sem erros.

Não foram identificadas pendências funcionais no fluxo testado. A aplicação foi validada localmente; a publicação em ambiente de produção não faz parte desta entrega.
