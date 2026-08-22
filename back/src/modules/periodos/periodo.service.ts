import { AppError } from '../../errors/app-error.js'
import type {
  DadosAtualizacaoPeriodo,
  DadosCadastroPeriodo,
} from './periodo.schemas.js'
import {
  atualizarPeriodoNoBanco,
  buscarPeriodoPorUsuario,
  definirPeriodoAtualNoBanco,
  inserirPeriodoEAtivar,
  listarPeriodosPorUsuario,
} from './periodo.repository.js'

export function listarPeriodos(usuarioId: number) {
  return listarPeriodosPorUsuario(usuarioId)
}

export async function cadastrarPeriodo(usuarioId: number, dados: DadosCadastroPeriodo) {
  try {
    return await inserirPeriodoEAtivar(usuarioId, dados)
  } catch (error) {
    if (temCodigoPostgres(error, '23505')) {
      throw new AppError('Este periodo letivo ja esta cadastrado.', 409)
    }
    if (temCodigoPostgres(error, '23503')) {
      throw new AppError('Usuario nao encontrado.', 404)
    }
    throw error
  }
}

export async function atualizarPeriodo(
  usuarioId: number,
  periodoId: number,
  dados: DadosAtualizacaoPeriodo,
) {
  try {
    const periodo = await atualizarPeriodoNoBanco(usuarioId, periodoId, dados)
    if (!periodo) throw new AppError('Periodo letivo nao encontrado.', 404)
    return periodo
  } catch (error) {
    if (temRestricaoPostgres(error, 'periodos_conteudo_dentro_das_datas')) {
      throw new AppError('As novas datas deixariam materias, avaliacoes ou trabalhos fora do periodo.', 400)
    }
    if (temCodigoPostgres(error, '23514')) {
      throw new AppError('Verifique as datas do periodo letivo.', 400)
    }
    throw error
  }
}

export async function definirPeriodoAtual(usuarioId: number, periodoId: number) {
  const atualizado = await definirPeriodoAtualNoBanco(usuarioId, periodoId)
  if (!atualizado) throw new AppError('Periodo letivo nao encontrado.', 404)
  return buscarPeriodoPorUsuario(usuarioId, periodoId)
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
