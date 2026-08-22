import type { QueryResultRow } from 'pg'
import { pool } from '../../database/pool.js'

export interface UsuarioPublico extends QueryResultRow {
  id: number
  nome: string
  email: string
  periodoAtualId: number | null
  criadoEm: Date
}

export interface UsuarioComSenha extends UsuarioPublico {
  senhaHash: string
}

export async function buscarUsuarioPorEmail(email: string) {
  const resultado = await pool.query<UsuarioComSenha>(
    `SELECT id, nome, email, periodo_atual_id AS "periodoAtualId",
            senha_hash AS "senhaHash", criado_em AS "criadoEm"
       FROM usuarios
      WHERE email = $1`,
    [email],
  )

  return resultado.rows[0] ?? null
}

export async function inserirUsuario(nome: string, email: string, senhaHash: string) {
  const client = await pool.connect()
  const agora = new Date()
  const ano = agora.getFullYear()
  const semestre = agora.getMonth() < 6 ? 1 : 2
  const dataInicio = `${ano}-${semestre === 1 ? '01-01' : '07-01'}`
  const dataTermino = `${ano}-${semestre === 1 ? '06-30' : '12-31'}`

  try {
    await client.query('BEGIN')
    const insercaoUsuario = await client.query<UsuarioPublico>(
      `INSERT INTO usuarios (nome, email, senha_hash)
       VALUES ($1, $2, $3)
       RETURNING id, nome, email, NULL::INTEGER AS "periodoAtualId",
                 criado_em AS "criadoEm"`,
      [nome, email, senhaHash],
    )
    const usuario = insercaoUsuario.rows[0]!
    const insercaoPeriodo = await client.query<{ id: number }>(
      `INSERT INTO periodos_letivos (
         usuario_id, ano, semestre, nome, data_inicio, data_termino
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [usuario.id, ano, semestre, `${ano}.${semestre}`, dataInicio, dataTermino],
    )
    const periodoAtualId = insercaoPeriodo.rows[0]!.id

    await client.query(
      'UPDATE usuarios SET periodo_atual_id = $1 WHERE id = $2',
      [periodoAtualId, usuario.id],
    )
    await client.query('COMMIT')

    return { ...usuario, periodoAtualId }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function listarUsuarios() {
  const resultado = await pool.query<UsuarioPublico>(
    `SELECT id, nome, email, periodo_atual_id AS "periodoAtualId", criado_em AS "criadoEm"
       FROM usuarios
      ORDER BY nome ASC, id ASC`,
  )

  return resultado.rows
}
