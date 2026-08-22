import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

export const usuarioProvasParamsSchema = z.object({
  usuarioId: idSchema,
})

export const listarProvasQuerySchema = z.object({
  periodoId: idSchema.optional(),
})

export const materiaProvasParamsSchema = z.object({
  usuarioId: idSchema,
  materiaId: idSchema,
})

export const provaParamsSchema = z.object({
  usuarioId: idSchema,
  materiaId: idSchema,
  provaId: idSchema,
})

export const cadastrarProvaSchema = z.object({
  titulo: z
    .string({ error: 'Informe o titulo da avaliacao.' })
    .trim()
    .min(2, 'O titulo deve ter pelo menos 2 caracteres.')
    .max(100, 'O titulo deve ter no maximo 100 caracteres.'),
  data: z
    .string({ error: 'Informe a data da avaliacao.' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data valida.'),
})

export type DadosCadastroProva = z.infer<typeof cadastrarProvaSchema>
