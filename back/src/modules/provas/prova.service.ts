import { AppError } from '../../errors/app-error.js'
import type { DadosCadastroProva } from './prova.schemas.js'
import {
  inserirProva,
  listarProvasPorUsuario,
  removerProva,
} from './prova.repository.js'

export function listarProvas(usuarioId: number, periodoId?: number) {
  return listarProvasPorUsuario(usuarioId, periodoId)
}

export async function cadastrarProva(
  usuarioId: number,
  materiaId: number,
  dados: DadosCadastroProva,
) {
  try {
    const prova = await inserirProva(usuarioId, materiaId, dados)

    if (!prova) {
      throw new AppError('Materia nao encontrada.', 404)
    }

    return prova
  } catch (error) {
    if (temRestricaoPostgres(error, 'avaliacoes_data_no_periodo')) {
      throw new AppError('A data da avaliacao deve estar dentro do periodo letivo.', 400)
    }
    if (temCodigoPostgres(error, '23505')) {
      throw new AppError('Esta avaliacao ja esta cadastrada para a disciplina.', 409)
    }
    throw error
  }
}

export async function excluirProva(usuarioId: number, materiaId: number, provaId: number) {
  const removida = await removerProva(usuarioId, materiaId, provaId)

  if (!removida) {
    throw new AppError('Avaliacao nao encontrada.', 404)
  }
}

function temCodigoPostgres(error: unknown, codigo: string) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === codigo
}

function temRestricaoPostgres(error: unknown, restricao: string) {
  return typeof error === 'object'
    && error !== null
    && 'constraint' in error
    && error.constraint === restricao
}
