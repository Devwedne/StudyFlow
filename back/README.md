# StudyFlow API

API REST em Express, TypeScript e PostgreSQL para autenticar e cadastrar usuarios do StudyFlow.

## Como executar

1. Configure o arquivo `.env` usando `.env.example` como referencia.
2. Instale as dependencias com `npm install`.
3. Crie a tabela com `npm run migrate`.
4. Inicie em desenvolvimento com `npm run dev`.

A API fica disponivel em `http://localhost:3000` por padrao.

## Endpoints

- `GET /health`: verifica se a API esta no ar.
- `GET /usuarios`: lista usuarios sem dados de senha.
- `POST /usuarios`: cadastra `{ "nome", "email", "senha" }`.
- `POST /login`: autentica `{ "email", "senha" }` e devolve o usuario sem a senha.

Exemplo de cadastro:

```json
{
  "nome": "Ana Silva",
  "email": "ana@uepb.br",
  "senha": "123456"
}
```
