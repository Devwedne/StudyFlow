import type { QueryResultRow } from 'pg'
import { pool } from '../../database/pool.js'

export interface UsuarioPublico extends QueryResultRow {
  id: number
  nome: string
  email: string
  criadoEm: Date
}

export interface UsuarioComSenha extends UsuarioPublico {
  senhaHash: string
}

export async function buscarUsuarioPorEmail(email: string) {
  const resultado = await pool.query<UsuarioComSenha>(
    `SELECT id, nome, email, senha_hash AS "senhaHash", criado_em AS "criadoEm"
       FROM usuarios
      WHERE email = $1`,
    [email],
  )

  return resultado.rows[0] ?? null
}

export async function inserirUsuario(nome: string, email: string, senhaHash: string) {
  const resultado = await pool.query<UsuarioPublico>(
    `INSERT INTO usuarios (nome, email, senha_hash)
     VALUES ($1, $2, $3)
     RETURNING id, nome, email, criado_em AS "criadoEm"`,
    [nome, email, senhaHash],
  )

  return resultado.rows[0]!
}

export async function listarUsuarios() {
  const resultado = await pool.query<UsuarioPublico>(
    `SELECT id, nome, email, criado_em AS "criadoEm"
       FROM usuarios
      ORDER BY nome ASC, id ASC`,
  )

  return resultado.rows
}
