import type { QueryResultRow } from 'pg'
import { pool } from '../../database/pool.js'
import type {
  DadosAtualizacaoTrabalho,
  DadosCadastroTrabalho,
} from './trabalho.schemas.js'

export interface Trabalho extends QueryResultRow {
  id: number
  usuarioId: number
  periodoId: number
  materiaId: number
  materiaNome: string
  titulo: string
  dataEntrega: string
  prioridade: 'baixa' | 'media' | 'alta'
  status: 'pendente' | 'andamento' | 'concluido'
  atrasado: boolean
  criadoEm: Date
  atualizadoEm: Date
}

const CAMPOS_RETORNO = `
  t.id,
  t.usuario_id AS "usuarioId",
  t.periodo_id AS "periodoId",
  t.materia_id AS "materiaId",
  m.nome AS "materiaNome",
  t.titulo,
  t.data_entrega::TEXT AS "dataEntrega",
  t.prioridade,
  t.status,
  (t.status <> 'concluido' AND t.data_entrega < CURRENT_DATE) AS atrasado,
  t.criado_em AS "criadoEm",
  t.atualizado_em AS "atualizadoEm"
`

async function buscarTrabalho(usuarioId: number, trabalhoId: number) {
  const resultado = await pool.query<Trabalho>(
    `SELECT ${CAMPOS_RETORNO}
       FROM trabalhos t
       JOIN materias m ON m.id = t.materia_id
      WHERE t.id = $1 AND t.usuario_id = $2`,
    [trabalhoId, usuarioId],
  )

  return resultado.rows[0] ?? null
}

export async function listarTrabalhosPorUsuario(usuarioId: number, periodoId?: number) {
  const resultado = await pool.query<Trabalho>(
    `SELECT ${CAMPOS_RETORNO}
       FROM trabalhos t
       JOIN materias m ON m.id = t.materia_id
       JOIN usuarios u ON u.id = t.usuario_id
      WHERE t.usuario_id = $1
        AND t.periodo_id = COALESCE($2, u.periodo_atual_id)
      ORDER BY t.data_entrega ASC, t.id ASC`,
    [usuarioId, periodoId ?? null],
  )

  return resultado.rows
}

export async function inserirTrabalho(usuarioId: number, dados: DadosCadastroTrabalho) {
  const insercao = await pool.query<{ id: number }>(
    `INSERT INTO trabalhos (
       usuario_id, periodo_id, materia_id, titulo, data_entrega, prioridade, status
     )
     SELECT u.id, u.periodo_atual_id, m.id, $3, $4, $5, $6
       FROM usuarios u
       JOIN materias m
         ON m.id = $2
        AND m.usuario_id = u.id
        AND m.periodo_id = u.periodo_atual_id
      WHERE u.id = $1 AND u.periodo_atual_id IS NOT NULL
     RETURNING id`,
    [
      usuarioId,
      dados.materiaId,
      dados.titulo,
      dados.dataEntrega,
      dados.prioridade,
      dados.status,
    ],
  )

  if (!insercao.rows[0]) return null
  return buscarTrabalho(usuarioId, insercao.rows[0].id)
}

export async function atualizarTrabalhoNoBanco(
  usuarioId: number,
  trabalhoId: number,
  dados: DadosAtualizacaoTrabalho,
) {
  const atualizacao = await pool.query<{ id: number }>(
    `UPDATE trabalhos t
        SET titulo = COALESCE($3, titulo),
            materia_id = COALESCE($4, materia_id),
            data_entrega = COALESCE($5, data_entrega),
            prioridade = COALESCE($6, prioridade),
            status = COALESCE($7, status),
            atualizado_em = NOW()
      WHERE t.id = $1 AND t.usuario_id = $2
        AND (
          $4::INTEGER IS NULL
          OR EXISTS (
            SELECT 1
              FROM materias m
             WHERE m.id = $4
               AND m.usuario_id = $2
               AND m.periodo_id = t.periodo_id
          )
        )
      RETURNING t.id`,
    [
      trabalhoId,
      usuarioId,
      dados.titulo ?? null,
      dados.materiaId ?? null,
      dados.dataEntrega ?? null,
      dados.prioridade ?? null,
      dados.status ?? null,
    ],
  )

  if (!atualizacao.rows[0]) return null
  return buscarTrabalho(usuarioId, trabalhoId)
}

export async function removerTrabalho(usuarioId: number, trabalhoId: number) {
  const resultado = await pool.query(
    'DELETE FROM trabalhos WHERE id = $1 AND usuario_id = $2 RETURNING id',
    [trabalhoId, usuarioId],
  )

  return Boolean(resultado.rowCount)
}
