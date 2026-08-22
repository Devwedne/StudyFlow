import { Router } from 'express'
import { atualizar, cadastrar, listar, selecionarAtual } from './periodo.controller.js'

export const periodoRoutes = Router()

periodoRoutes.get('/usuarios/:usuarioId/periodos', listar)
periodoRoutes.post('/usuarios/:usuarioId/periodos', cadastrar)
periodoRoutes.patch('/usuarios/:usuarioId/periodos/:periodoId', atualizar)
periodoRoutes.patch('/usuarios/:usuarioId/periodo-atual', selecionarAtual)
