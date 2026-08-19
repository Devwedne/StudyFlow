import type { RequestHandler } from 'express'
import { cadastrarUsuarioSchema, loginSchema } from './usuario.schemas.js'
import {
  autenticarUsuario,
  cadastrarUsuario,
  listarUsuarios,
} from './usuario.service.js'

export const cadastrar: RequestHandler = async (request, response) => {
  const dados = cadastrarUsuarioSchema.parse(request.body)
  const usuario = await cadastrarUsuario(dados)
  response.status(201).json(usuario)
}

export const login: RequestHandler = async (request, response) => {
  const dados = loginSchema.parse(request.body)
  const usuario = await autenticarUsuario(dados.email, dados.senha)
  response.json(usuario)
}

export const listar: RequestHandler = async (_request, response) => {
  const usuarios = await listarUsuarios()
  response.json(usuarios)
}
