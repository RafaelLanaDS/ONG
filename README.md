# NOME_DA_ONG

Sistema de gestão de doações para a ONG NOME_DA_ONG.

Projeto Integrador Extensionista · ADS.

## Requisitos

- Git
- Vite+ (comando vp): https://viteplus.dev

## Como rodar

1. Clone o repositório e entre na pasta:
   git clone https://github.com/RafaelLanaDS/ONG.git
   cd ONG
2. Instale as dependências: vp install
3. Copie .env.example para .env
4. Terminal 1, inicie a API: vp run api
5. Terminal 2, inicie o frontend: vp dev
6. Abra http://localhost:5173

## Banco de dados (MySQL)

O arquivo `database/schema.sql` define o modelo reconstruído para doações em dinheiro: doadores e suas doações. Ele recria o banco `ong_doacoes` quando executado; use apenas para desenvolvimento e validação, pois a execução apaga os dados anteriores desse banco.

Para validar a atividade, abra o cliente MySQL na raiz do projeto e execute o arquivo duas vezes:

1. `mysql -u root -p`
2. No prompt do MySQL, execute `source database/schema.sql;`
3. Execute `source database/schema.sql;` novamente. Ambas as execuções devem terminar sem erro.
