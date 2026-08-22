import { AppError } from '../../errors/app-error.js'
import type {
  DadosAtualizacaoTrabalho,
  DadosCadastroTrabalho,
} from './trabalho.schemas.js'
import {
  atualizarTrabalhoNoBanco,
  inserirTrabalho,
  listarTrabalhosPorUsuario,
  removerTrabalho,
} from './trabalho.repository.js'

export function listarTrabalhos(usuarioId: number, periodoId?: number) {
  return listarTrabalhosPorUsuario(usuarioId, periodoId)
}

export async function cadastrarTrabalho(usuarioId: number, dados: DadosCadastroTrabalho) {
  try {
    const trabalho = await inserirTrabalho(usuarioId, dados)
    if (!trabalho) {
      throw new AppError('Selecione uma materia do periodo letivo atual.', 400)
    }
    return trabalho
  } catch (error) {
    tratarRestricaoDoPeriodo(error)
    throw error
  }
}

export async function atualizarTrabalho(
  usuarioId: number,
  trabalhoId: number,
  dados: DadosAtualizacaoTrabalho,
) {
  try {
    const trabalho = await atualizarTrabalhoNoBanco(usuarioId, trabalhoId, dados)
    if (!trabalho) throw new AppError('Trabalho nao encontrado neste periodo.', 404)
    return trabalho
  } catch (error) {
    tratarRestricaoDoPeriodo(error)
    throw error
  }
}

export async function excluirTrabalho(usuarioId: number, trabalhoId: number) {
  const removido = await removerTrabalho(usuarioId, trabalhoId)
  if (!removido) throw new AppError('Trabalho nao encontrado.', 404)
}

function tratarRestricaoDoPeriodo(error: unknown) {
  if (
    typeof error === 'object'
    && error !== null
    && 'constraint' in error
    && error.constraint === 'trabalhos_data_no_periodo'
  ) {
    throw new AppError('A data de entrega deve estar dentro do periodo letivo.', 400)
  }

  if (
    typeof error === 'object'
    && error !== null
    && 'constraint' in error
    && error.constraint === 'trabalhos_materia_no_periodo'
  ) {
    throw new AppError('Selecione uma materia do periodo letivo atual.', 400)
  }
}
