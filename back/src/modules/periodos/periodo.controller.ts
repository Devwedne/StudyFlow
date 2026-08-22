import type { RequestHandler } from 'express'
import {
  atualizarPeriodoSchema,
  cadastrarPeriodoSchema,
  definirPeriodoAtualSchema,
  periodoParamsSchema,
  usuarioPeriodosParamsSchema,
} from './periodo.schemas.js'
import {
  atualizarPeriodo,
  cadastrarPeriodo,
  definirPeriodoAtual,
  listarPeriodos,
} from './periodo.service.js'

export const listar: RequestHandler = async (request, response) => {
  const { usuarioId } = usuarioPeriodosParamsSchema.parse(request.params)
  response.json(await listarPeriodos(usuarioId))
}

export const cadastrar: RequestHandler = async (request, response) => {
  const { usuarioId } = usuarioPeriodosParamsSchema.parse(request.params)
  const dados = cadastrarPeriodoSchema.parse(request.body)
  response.status(201).json(await cadastrarPeriodo(usuarioId, dados))
}

export const atualizar: RequestHandler = async (request, response) => {
  const { usuarioId, periodoId } = periodoParamsSchema.parse(request.params)
  const dados = atualizarPeriodoSchema.parse(request.body)
  response.json(await atualizarPeriodo(usuarioId, periodoId, dados))
}

export const selecionarAtual: RequestHandler = async (request, response) => {
  const { usuarioId } = usuarioPeriodosParamsSchema.parse(request.params)
  const { periodoId } = definirPeriodoAtualSchema.parse(request.body)
  response.json(await definirPeriodoAtual(usuarioId, periodoId))
}
