import type { RequestHandler } from 'express'
import {
  cadastrarProvaSchema,
  listarProvasQuerySchema,
  materiaProvasParamsSchema,
  provaParamsSchema,
  usuarioProvasParamsSchema,
} from './prova.schemas.js'
import { cadastrarProva, excluirProva, listarProvas } from './prova.service.js'

export const listar: RequestHandler = async (request, response) => {
  const { usuarioId } = usuarioProvasParamsSchema.parse(request.params)
  const { periodoId } = listarProvasQuerySchema.parse(request.query)
  const provas = await listarProvas(usuarioId, periodoId)
  response.json(provas)
}

export const cadastrar: RequestHandler = async (request, response) => {
  const { usuarioId, materiaId } = materiaProvasParamsSchema.parse(request.params)
  const dados = cadastrarProvaSchema.parse(request.body)
  const prova = await cadastrarProva(usuarioId, materiaId, dados)
  response.status(201).json(prova)
}

export const excluir: RequestHandler = async (request, response) => {
  const { usuarioId, materiaId, provaId } = provaParamsSchema.parse(request.params)
  await excluirProva(usuarioId, materiaId, provaId)
  response.status(204).send()
}
