import type { PoolClient, QueryResultRow } from 'pg'
import { pool } from '../../database/pool.js'
import type {
  DadosAtualizacaoPeriodo,
  DadosCadastroPeriodo,
} from './periodo.schemas.js'

export interface PeriodoLetivo extends QueryResultRow {
  id: number
  usuarioId: number
  ano: number
  semestre: 1 | 2
  nome: string
  dataInicio: string
  dataTermino: string
  status: 'ativo' | 'encerrado'
  atual: boolean
  criadoEm: Date
  atualizadoEm: Date
}

const CAMPOS_RETORNO = `
  p.id,
  p.usuario_id AS "usuarioId",
  p.ano,
  p.semestre,
  p.nome,
  p.data_inicio::TEXT AS "dataInicio",
  p.data_termino::TEXT AS "dataTermino",
  p.status,
  (u.periodo_atual_id = p.id) AS atual,
  p.criado_em AS "criadoEm",
  p.atualizado_em AS "atualizadoEm"
`

async function buscarComCliente(client: PoolClient, usuarioId: number, periodoId: number) {
  const resultado = await client.query<PeriodoLetivo>(
    `SELECT ${CAMPOS_RETORNO}
       FROM periodos_letivos p
       JOIN usuarios u ON u.id = p.usuario_id
      WHERE p.id = $1 AND p.usuario_id = $2`,
    [periodoId, usuarioId],
  )

  return resultado.rows[0] ?? null
}

export async function listarPeriodosPorUsuario(usuarioId: number) {
  const resultado = await pool.query<PeriodoLetivo>(
    `SELECT ${CAMPOS_RETORNO}
       FROM periodos_letivos p
       JOIN usuarios u ON u.id = p.usuario_id
      WHERE p.usuario_id = $1
      ORDER BY p.ano DESC, p.semestre DESC`,
    [usuarioId],
  )

  return resultado.rows
}

export async function buscarPeriodoPorUsuario(usuarioId: number, periodoId: number) {
  const client = await pool.connect()

  try {
    return await buscarComCliente(client, usuarioId, periodoId)
  } finally {
    client.release()
  }
}

export async function inserirPeriodoEAtivar(
  usuarioId: number,
  dados: DadosCadastroPeriodo,
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const insercao = await client.query<{ id: number }>(
      `INSERT INTO periodos_letivos (
         usuario_id, ano, semestre, nome, data_inicio, data_termino
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        usuarioId,
        dados.ano,
        dados.semestre,
        `${dados.ano}.${dados.semestre}`,
        dados.dataInicio,
        dados.dataTermino,
      ],
    )
    const periodoId = insercao.rows[0]!.id

    await client.query(
      'UPDATE usuarios SET periodo_atual_id = $1, atualizado_em = NOW() WHERE id = $2',
      [periodoId, usuarioId],
    )

    const periodo = await buscarComCliente(client, usuarioId, periodoId)
    await client.query('COMMIT')
    return periodo
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function atualizarPeriodoNoBanco(
  usuarioId: number,
  periodoId: number,
  dados: DadosAtualizacaoPeriodo,
) {
  const resultado = await pool.query<{ id: number }>(
    `UPDATE periodos_letivos
        SET data_inicio = COALESCE($3, data_inicio),
            data_termino = COALESCE($4, data_termino),
            status = COALESCE($5, status),
            atualizado_em = NOW()
      WHERE id = $1 AND usuario_id = $2
      RETURNING id`,
    [
      periodoId,
      usuarioId,
      dados.dataInicio ?? null,
      dados.dataTermino ?? null,
      dados.status ?? null,
    ],
  )

  if (!resultado.rows[0]) return null
  return buscarPeriodoPorUsuario(usuarioId, periodoId)
}

export async function definirPeriodoAtualNoBanco(usuarioId: number, periodoId: number) {
  const resultado = await pool.query(
    `UPDATE usuarios u
        SET periodo_atual_id = $2,
            atualizado_em = NOW()
      WHERE u.id = $1
        AND EXISTS (
          SELECT 1
            FROM periodos_letivos p
           WHERE p.id = $2 AND p.usuario_id = u.id
        )
      RETURNING u.id`,
    [usuarioId, periodoId],
  )

  return Boolean(resultado.rowCount)
}
