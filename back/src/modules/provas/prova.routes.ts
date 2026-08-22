import { Router } from 'express'
import { cadastrar, excluir, listar } from './prova.controller.js'

export const provaRoutes = Router()

provaRoutes.get('/usuarios/:usuarioId/provas', listar)
provaRoutes.post('/usuarios/:usuarioId/materias/:materiaId/provas', cadastrar)
provaRoutes.delete('/usuarios/:usuarioId/materias/:materiaId/provas/:provaId', excluir)
