import { AppError } from '../../errors/app-error.js'
import type {
  DadosAtualizacaoMateria,
  DadosCadastroMateria,
} from './materia.schemas.js'
import {
  atualizarMateria as atualizarMateriaNoBanco,
  inserirMateria,
  listarMateriasPorUsuario,
  removerMateria,
} from './materia.repository.js'

export function listarMaterias(usuarioId: number, periodoId?: number) {
  return listarMateriasPorUsuario(usuarioId, periodoId)
}

export async function cadastrarMateria(usuarioId: number, dados: DadosCadastroMateria) {
  try {
    const materia = await inserirMateria(usuarioId, dados)
    if (!materia) throw new AppError('Periodo letivo nao encontrado.', 404)
    return materia
  } catch (error) {
    if (temRestricaoPostgres(error, [
      'materias_datas_no_periodo',
      'materias_avaliacoes_no_periodo',
      'materias_trabalhos_no_periodo',
    ])) {
      throw new AppError('As datas da materia devem acompanhar o periodo letivo.', 400)
    }
    if (temCodigoPostgres(error, '23503')) {
      throw new AppError('Usuario nao encontrado.', 404)
    }
    if (temCodigoPostgres(error, '23514')) {
      throw new AppError('Verifique o periodo e as notas informadas.', 400)
    }
    throw error
  }
}

export async function atualizarMateria(
  usuarioId: number,
  materiaId: number,
  dados: DadosAtualizacaoMateria,
) {
  try {
    const materia = await atualizarMateriaNoBanco(usuarioId, materiaId, dados)

    if (!materia) {
      throw new AppError('Materia nao encontrada.', 404)
    }

    return materia
  } catch (error) {
    if (temRestricaoPostgres(error, [
      'materias_datas_no_periodo',
      'materias_avaliacoes_no_periodo',
      'materias_trabalhos_no_periodo',
    ])) {
      throw new AppError('As datas da materia devem acompanhar o periodo letivo.', 400)
    }
    if (temCodigoPostgres(error, '23514')) {
      throw new AppError('Verifique o periodo e as notas informadas.', 400)
    }
    throw error
  }
}

export async function excluirMateria(usuarioId: number, materiaId: number) {
  const removida = await removerMateria(usuarioId, materiaId)

  if (!removida) {
    throw new AppError('Materia nao encontrada.', 404)
  }
}

function temCodigoPostgres(error: unknown, codigo: string) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === codigo
}

function temRestricaoPostgres(error: unknown, restricoes: string[]) {
  return typeof error === 'object'
    && error !== null
    && 'constraint' in error
    && typeof error.constraint === 'string'
    && restricoes.includes(error.constraint)
}
