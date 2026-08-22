import type { RequestHandler } from 'express'
import {
  atualizarMateriaSchema,
  cadastrarMateriaSchema,
  listarMateriasQuerySchema,
  materiaParamsSchema,
  usuarioMateriaParamsSchema,
} from './materia.schemas.js'
import {
  atualizarMateria,
  cadastrarMateria,
  excluirMateria,
  listarMaterias,
} from './materia.service.js'

export const listar: RequestHandler = async (request, response) => {
  const { usuarioId } = usuarioMateriaParamsSchema.parse(request.params)
  const { periodoId } = listarMateriasQuerySchema.parse(request.query)
  const materias = await listarMaterias(usuarioId, periodoId)
  response.json(materias)
}

export const cadastrar: RequestHandler = async (request, response) => {
  const { usuarioId } = usuarioMateriaParamsSchema.parse(request.params)
  const dados = cadastrarMateriaSchema.parse(request.body)
  const materia = await cadastrarMateria(usuarioId, dados)
  response.status(201).json(materia)
}

export const atualizar: RequestHandler = async (request, response) => {
  const { usuarioId, materiaId } = materiaParamsSchema.parse(request.params)
  const dados = atualizarMateriaSchema.parse(request.body)
  const materia = await atualizarMateria(usuarioId, materiaId, dados)
  response.json(materia)
}

export const excluir: RequestHandler = async (request, response) => {
  const { usuarioId, materiaId } = materiaParamsSchema.parse(request.params)
  await excluirMateria(usuarioId, materiaId)
  response.status(204).send()
}
