import { Router } from 'express'
import { exibir } from './dashboard.controller.js'

export const dashboardRoutes = Router()

dashboardRoutes.get('/usuarios/:usuarioId/dashboard', exibir)
