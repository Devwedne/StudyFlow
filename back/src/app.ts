import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler } from './middlewares/error-handler.js'
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js'
import { materiaRoutes } from './modules/materias/materia.routes.js'
import { periodoRoutes } from './modules/periodos/periodo.routes.js'
import { provaRoutes } from './modules/provas/prova.routes.js'
import { trabalhoRoutes } from './modules/trabalhos/trabalho.routes.js'
import { usuarioRoutes } from './modules/usuarios/usuario.routes.js'

export const app = express()

const origensPermitidas = env.CORS_ORIGIN === '*'
  ? '*'
  : env.CORS_ORIGIN.split(',').map((origem) => origem.trim())

app.disable('x-powered-by')
app.use(cors({ origin: origensPermitidas }))
app.use(express.json({ limit: '100kb' }))

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', servico: 'StudyFlow API' })
})

app.use(usuarioRoutes)
app.use(periodoRoutes)
app.use(dashboardRoutes)
app.use(materiaRoutes)
app.use(provaRoutes)
app.use(trabalhoRoutes)

app.use((_request, response) => {
  response.status(404).json({ erro: 'Rota nao encontrada.' })
})

app.use(errorHandler)
