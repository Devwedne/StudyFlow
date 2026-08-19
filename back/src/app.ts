import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler } from './middlewares/error-handler.js'
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

app.use((_request, response) => {
  response.status(404).json({ erro: 'Rota nao encontrada.' })
})

app.use(errorHandler)
