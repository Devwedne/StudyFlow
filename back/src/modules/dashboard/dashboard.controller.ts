import type { RequestHandler } from 'express'
import { dashboardParamsSchema, dashboardQuerySchema } from './dashboard.schemas.js'
import { obterDashboard } from './dashboard.service.js'

export const exibir: RequestHandler = async (request, response) => {
  const { usuarioId } = dashboardParamsSchema.parse(request.params)
  const { periodoId } = dashboardQuerySchema.parse(request.query)
  response.json(await obterDashboard(usuarioId, periodoId))
}
