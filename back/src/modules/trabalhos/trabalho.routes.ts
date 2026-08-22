import { Router } from 'express'
import { atualizar, cadastrar, excluir, listar } from './trabalho.controller.js'

export const trabalhoRoutes = Router()

trabalhoRoutes.get('/usuarios/:usuarioId/trabalhos', listar)
trabalhoRoutes.post('/usuarios/:usuarioId/trabalhos', cadastrar)
trabalhoRoutes.patch('/usuarios/:usuarioId/trabalhos/:trabalhoId', atualizar)
trabalhoRoutes.delete('/usuarios/:usuarioId/trabalhos/:trabalhoId', excluir)
