import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

const nomeSchema = z
  .string({ error: 'Informe o nome da materia.' })
  .trim()
  .min(2, 'O nome deve ter pelo menos 2 caracteres.')
  .max(150, 'O nome deve ter no maximo 150 caracteres.')

const professorSchema = z
  .string({ error: 'Informe o professor.' })
  .trim()
  .min(2, 'O professor deve ter pelo menos 2 caracteres.')
  .max(120, 'O professor deve ter no maximo 120 caracteres.')

const notaSchema = z.number().min(0, 'A nota minima e 0.').max(10, 'A nota maxima e 10.')

export const usuarioMateriaParamsSchema = z.object({
  usuarioId: idSchema,
})

export const listarMateriasQuerySchema = z.object({
  periodoId: idSchema.optional(),
})

export const materiaParamsSchema = z.object({
  usuarioId: idSchema,
  materiaId: idSchema,
})

export const cadastrarMateriaSchema = z.object({
  nome: nomeSchema,
  professor: professorSchema,
  periodoId: idSchema,
  nota1: notaSchema.optional(),
  nota2: notaSchema.optional(),
})

export const atualizarMateriaSchema = z
  .object({
    nome: nomeSchema.optional(),
    professor: professorSchema.optional(),
    periodoId: idSchema.optional(),
    nota1: notaSchema.nullable().optional(),
    nota2: notaSchema.nullable().optional(),
  })
  .refine((dados) => Object.keys(dados).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  })

export type DadosCadastroMateria = z.infer<typeof cadastrarMateriaSchema>
export type DadosAtualizacaoMateria = z.infer<typeof atualizarMateriaSchema>
