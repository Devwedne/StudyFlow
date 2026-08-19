import { compare, hash } from 'bcryptjs'
import { AppError } from '../../errors/app-error.js'
import type { DadosCadastro } from './usuario.schemas.js'
import {
  buscarUsuarioPorEmail,
  inserirUsuario,
  listarUsuarios as listarUsuariosNoBanco,
} from './usuario.repository.js'

const CUSTO_HASH = 12

export async function cadastrarUsuario(dados: DadosCadastro) {
  const usuarioExistente = await buscarUsuarioPorEmail(dados.email)

  if (usuarioExistente) {
    throw new AppError('Este e-mail ja esta cadastrado.', 409)
  }

  const senhaHash = await hash(dados.senha, CUSTO_HASH)

  try {
    return await inserirUsuario(dados.nome, dados.email, senhaHash)
  } catch (error) {
    if (temCodigoPostgres(error, '23505')) {
      throw new AppError('Este e-mail ja esta cadastrado.', 409)
    }
    throw error
  }
}

export async function autenticarUsuario(email: string, senha: string) {
  const usuario = await buscarUsuarioPorEmail(email)

  if (!usuario || !(await compare(senha, usuario.senhaHash))) {
    throw new AppError('E-mail ou senha invalidos.', 401)
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    criadoEm: usuario.criadoEm,
  }
}

export function listarUsuarios() {
  return listarUsuariosNoBanco()
}

function temCodigoPostgres(error: unknown, codigo: string) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === codigo
}
