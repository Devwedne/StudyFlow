import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()
const dataSchema = z
  .string({ error: 'Informe a data.' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data valida.')

export const usuarioPeriodosParamsSchema = z.object({
  usuarioId: idSchema,
})

export const periodoParamsSchema = z.object({
  usuarioId: idSchema,
  periodoId: idSchema,
})

export const cadastrarPeriodoSchema = z
  .object({
    ano: z.number().int().min(1900).max(2200),
    semestre: z.union([z.literal(1), z.literal(2)]),
    dataInicio: dataSchema,
    dataTermino: dataSchema,
  })
  .refine((dados) => dados.dataTermino >= dados.dataInicio, {
    path: ['dataTermino'],
    message: 'A data final deve ser igual ou posterior a data inicial.',
  })

export const atualizarPeriodoSchema = z
  .object({
    dataInicio: dataSchema.optional(),
    dataTermino: dataSchema.optional(),
    status: z.enum(['ativo', 'encerrado']).optional(),
  })
  .refine((dados) => Object.keys(dados).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  })
  .refine(
    (dados) => !dados.dataInicio || !dados.dataTermino || dados.dataTermino >= dados.dataInicio,
    {
      path: ['dataTermino'],
      message: 'A data final deve ser igual ou posterior a data inicial.',
    },
  )

export const definirPeriodoAtualSchema = z.object({
  periodoId: idSchema,
})

export type DadosCadastroPeriodo = z.infer<typeof cadastrarPeriodoSchema>
export type DadosAtualizacaoPeriodo = z.infer<typeof atualizarPeriodoSchema>
