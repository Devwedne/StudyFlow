import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

export const dashboardParamsSchema = z.object({
  usuarioId: idSchema,
})

export const dashboardQuerySchema = z.object({
  periodoId: idSchema,
})
