import type { QueryResultRow } from 'pg'
import { pool } from '../../database/pool.js'
import type { DadosCadastroProva } from './prova.schemas.js'

export interface Prova extends QueryResultRow {
  id: number
  materiaId: number
  titulo: string
  data: string
  criadoEm: Date
}

const CAMPOS_RETORNO = `
  id,
  materia_id AS "materiaId",
  titulo,
  data_prova::TEXT AS "data",
  criado_em AS "criadoEm"
`

export async function listarProvasPorUsuario(usuarioId: number, periodoId?: number) {
  const resultado = await pool.query<Prova>(
    `SELECT ${CAMPOS_RETORNO.replaceAll('\n  ', '\n  p.')}
       FROM provas p
      JOIN materias m ON m.id = p.materia_id
      WHERE m.usuario_id = $1
        AND ($2::INTEGER IS NULL OR m.periodo_id = $2)
      ORDER BY p.data_prova ASC, p.id ASC`,
    [usuarioId, periodoId ?? null],
  )

  return resultado.rows
}

export async function inserirProva(
  usuarioId: number,
  materiaId: number,
  dados: DadosCadastroProva,
) {
  const resultado = await pool.query<Prova>(
    `INSERT INTO provas (materia_id, titulo, data_prova)
     SELECT id, $3, $4
       FROM materias
      WHERE id = $1 AND usuario_id = $2
     RETURNING ${CAMPOS_RETORNO}`,
    [materiaId, usuarioId, dados.titulo, dados.data],
  )

  return resultado.rows[0] ?? null
}

export async function removerProva(usuarioId: number, materiaId: number, provaId: number) {
  const resultado = await pool.query(
    `DELETE FROM provas p
           USING materias m
     WHERE p.id = $1
       AND p.materia_id = $2
       AND m.id = p.materia_id
       AND m.usuario_id = $3
     RETURNING p.id`,
    [provaId, materiaId, usuarioId],
  )

  return Boolean(resultado.rowCount)
}
