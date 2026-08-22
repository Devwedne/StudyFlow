import type { QueryResultRow } from 'pg'
import { pool } from '../../database/pool.js'
import type {
  DadosAtualizacaoMateria,
  DadosCadastroMateria,
} from './materia.schemas.js'

export interface Materia extends QueryResultRow {
  id: number
  nome: string
  professor: string
  periodoId: number
  periodoLetivo: string
  dataInicio: string
  dataTermino: string
  nota1: number | null
  nota2: number | null
  media: number | null
  progresso: number
  status: 'andamento' | 'concluida'
  criadoEm: Date
  atualizadoEm: Date
}

const CAMPOS_RETORNO = `
  id,
  nome,
  professor,
  periodo_id AS "periodoId",
  (SELECT p.nome FROM periodos_letivos p WHERE p.id = materias.periodo_id) AS "periodoLetivo",
  data_inicio::TEXT AS "dataInicio",
  data_termino::TEXT AS "dataTermino",
  nota_1::DOUBLE PRECISION AS "nota1",
  nota_2::DOUBLE PRECISION AS "nota2",
  media::DOUBLE PRECISION AS "media",
  CASE
    WHEN nota_1 IS NOT NULL AND nota_2 IS NOT NULL THEN 100
    WHEN CURRENT_DATE < data_inicio THEN 0
    WHEN CURRENT_DATE >= data_termino THEN 100
    WHEN data_termino = data_inicio THEN 100
    ELSE ROUND(
      ((CURRENT_DATE - data_inicio)::NUMERIC / (data_termino - data_inicio)::NUMERIC) * 100
    )::INTEGER
  END AS progresso,
  CASE
    WHEN nota_1 IS NOT NULL AND nota_2 IS NOT NULL THEN 'concluida'
    WHEN CURRENT_DATE >= data_termino THEN 'concluida'
    ELSE 'andamento'
  END AS status,
  criado_em AS "criadoEm",
  atualizado_em AS "atualizadoEm"
`

export async function listarMateriasPorUsuario(usuarioId: number, periodoId?: number) {
  const resultado = await pool.query<Materia>(
    `SELECT ${CAMPOS_RETORNO}
      FROM materias
      WHERE usuario_id = $1
        AND ($2::INTEGER IS NULL OR periodo_id = $2)
      ORDER BY nome ASC, id ASC`,
    [usuarioId, periodoId ?? null],
  )

  return resultado.rows
}

export async function inserirMateria(usuarioId: number, dados: DadosCadastroMateria) {
  const resultado = await pool.query<Materia>(
    `INSERT INTO materias (
       usuario_id, nome, professor, periodo_id, data_inicio, data_termino, nota_1, nota_2
     )
     SELECT $1, $2, $3, p.id, p.data_inicio, p.data_termino, $5, $6
       FROM periodos_letivos p
      WHERE p.id = $4 AND p.usuario_id = $1
     RETURNING ${CAMPOS_RETORNO}`,
    [
      usuarioId,
      dados.nome,
      dados.professor,
      dados.periodoId,
      dados.nota1 ?? null,
      dados.nota2 ?? null,
    ],
  )

  return resultado.rows[0] ?? null
}

export async function atualizarMateria(
  usuarioId: number,
  materiaId: number,
  dados: DadosAtualizacaoMateria,
) {
  const temNota1 = Object.prototype.hasOwnProperty.call(dados, 'nota1')
  const temNota2 = Object.prototype.hasOwnProperty.call(dados, 'nota2')

  const resultado = await pool.query<Materia>(
    `UPDATE materias
        SET nome = COALESCE($3, nome),
            professor = COALESCE($4, professor),
            periodo_id = COALESCE($5, periodo_id),
            data_inicio = COALESCE((
              SELECT p.data_inicio
                FROM periodos_letivos p
               WHERE p.id = COALESCE($5, materias.periodo_id)
                 AND p.usuario_id = $2
            ), data_inicio),
            data_termino = COALESCE((
              SELECT p.data_termino
                FROM periodos_letivos p
               WHERE p.id = COALESCE($5, materias.periodo_id)
                 AND p.usuario_id = $2
            ), data_termino),
            nota_1 = CASE WHEN $6::BOOLEAN THEN $7 ELSE nota_1 END,
            nota_2 = CASE WHEN $8::BOOLEAN THEN $9 ELSE nota_2 END,
            atualizado_em = NOW()
      WHERE id = $1 AND usuario_id = $2
        AND (
          $5::INTEGER IS NULL
          OR EXISTS (
            SELECT 1 FROM periodos_letivos p
             WHERE p.id = $5 AND p.usuario_id = $2
          )
        )
      RETURNING ${CAMPOS_RETORNO}`,
    [
      materiaId,
      usuarioId,
      dados.nome ?? null,
      dados.professor ?? null,
      dados.periodoId ?? null,
      temNota1,
      dados.nota1 ?? null,
      temNota2,
      dados.nota2 ?? null,
    ],
  )

  return resultado.rows[0] ?? null
}

export async function removerMateria(usuarioId: number, materiaId: number) {
  const resultado = await pool.query(
    'DELETE FROM materias WHERE id = $1 AND usuario_id = $2 RETURNING id',
    [materiaId, usuarioId],
  )

  return Boolean(resultado.rowCount)
}
