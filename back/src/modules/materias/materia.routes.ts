import { Router } from 'express'
import { atualizar, cadastrar, excluir, listar } from './materia.controller.js'

export const materiaRoutes = Router()

materiaRoutes.get('/usuarios/:usuarioId/materias', listar)
materiaRoutes.post('/usuarios/:usuarioId/materias', cadastrar)
materiaRoutes.patch('/usuarios/:usuarioId/materias/:materiaId', atualizar)
materiaRoutes.delete('/usuarios/:usuarioId/materias/:materiaId', excluir)
