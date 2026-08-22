import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()
const tituloSchema = z
  .string({ error: 'Informe o titulo do trabalho.' })
  .trim()
  .min(2, 'O titulo deve ter pelo menos 2 caracteres.')
  .max(150, 'O titulo deve ter no maximo 150 caracteres.')
const dataSchema = z
  .string({ error: 'Informe a data de entrega.' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data valida.')

export const usuarioTrabalhosParamsSchema = z.object({
  usuarioId: idSchema,
})

export const trabalhoParamsSchema = z.object({
  usuarioId: idSchema,
  trabalhoId: idSchema,
})

export const listarTrabalhosQuerySchema = z.object({
  periodoId: idSchema.optional(),
})

export const cadastrarTrabalhoSchema = z.object({
  titulo: tituloSchema,
  materiaId: idSchema,
  dataEntrega: dataSchema,
  prioridade: z.enum(['baixa', 'media', 'alta']).default('media'),
  status: z.enum(['pendente', 'andamento', 'concluido']).default('pendente'),
})

export const atualizarTrabalhoSchema = z
  .object({
    titulo: tituloSchema.optional(),
    materiaId: idSchema.optional(),
    dataEntrega: dataSchema.optional(),
    prioridade: z.enum(['baixa', 'media', 'alta']).optional(),
    status: z.enum(['pendente', 'andamento', 'concluido']).optional(),
  })
  .refine((dados) => Object.keys(dados).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  })

export type DadosCadastroTrabalho = z.infer<typeof cadastrarTrabalhoSchema>
export type DadosAtualizacaoTrabalho = z.infer<typeof atualizarTrabalhoSchema>
