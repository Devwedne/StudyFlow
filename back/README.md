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
- `GET /usuarios/:usuarioId/periodos`: lista os periodos letivos do usuario.
- `POST /usuarios/:usuarioId/periodos`: cria e ativa um periodo letivo.
- `PATCH /usuarios/:usuarioId/periodo-atual`: define `{ "periodoId" }` como contexto atual.
- `GET /usuarios/:usuarioId/materias?periodoId=:periodoId`: lista as materias do periodo.
- `POST /usuarios/:usuarioId/materias`: cadastra uma materia.
- `PATCH /usuarios/:usuarioId/materias/:materiaId`: atualiza uma materia.
- `DELETE /usuarios/:usuarioId/materias/:materiaId`: exclui uma materia.
- `GET /usuarios/:usuarioId/provas`: lista todas as avaliacoes do usuario.
- `POST /usuarios/:usuarioId/materias/:materiaId/provas`: cadastra uma avaliacao.
- `DELETE /usuarios/:usuarioId/materias/:materiaId/provas/:provaId`: remove uma avaliacao.
- `GET /usuarios/:usuarioId/trabalhos?periodoId=:periodoId`: lista trabalhos do periodo.
- `POST /usuarios/:usuarioId/trabalhos`: cadastra no periodo atual do usuario.
- `PATCH /usuarios/:usuarioId/trabalhos/:trabalhoId`: atualiza um trabalho.
- `DELETE /usuarios/:usuarioId/trabalhos/:trabalhoId`: remove um trabalho.
- `GET /usuarios/:usuarioId/dashboard?periodoId=:periodoId`: retorna o resumo consolidado.

Periodos letivos sao entidades proprias. Materias usam `periodoId`; avaliacoes
herdam o periodo da materia e trabalhos sao vinculados ao periodo e a materia.

Exemplo de cadastro:

```json
{
  "nome": "Ana Silva",
  "email": "ana@uepb.br",
  "senha": "123456"
}
```
