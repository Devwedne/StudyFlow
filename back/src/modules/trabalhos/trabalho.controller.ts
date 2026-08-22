import type { RequestHandler } from 'express'
import {
  atualizarTrabalhoSchema,
  cadastrarTrabalhoSchema,
  listarTrabalhosQuerySchema,
  trabalhoParamsSchema,
  usuarioTrabalhosParamsSchema,
} from './trabalho.schemas.js'
import {
  atualizarTrabalho,
  cadastrarTrabalho,
  excluirTrabalho,
  listarTrabalhos,
} from './trabalho.service.js'

export const listar: RequestHandler = async (request, response) => {
  const { usuarioId } = usuarioTrabalhosParamsSchema.parse(request.params)
  const { periodoId } = listarTrabalhosQuerySchema.parse(request.query)
  response.json(await listarTrabalhos(usuarioId, periodoId))
}

export const cadastrar: RequestHandler = async (request, response) => {
  const { usuarioId } = usuarioTrabalhosParamsSchema.parse(request.params)
  const dados = cadastrarTrabalhoSchema.parse(request.body)
  response.status(201).json(await cadastrarTrabalho(usuarioId, dados))
}

export const atualizar: RequestHandler = async (request, response) => {
  const { usuarioId, trabalhoId } = trabalhoParamsSchema.parse(request.params)
  const dados = atualizarTrabalhoSchema.parse(request.body)
  response.json(await atualizarTrabalho(usuarioId, trabalhoId, dados))
}

export const excluir: RequestHandler = async (request, response) => {
  const { usuarioId, trabalhoId } = trabalhoParamsSchema.parse(request.params)
  await excluirTrabalho(usuarioId, trabalhoId)
  response.status(204).send()
}
