import { z } from 'zod'

const email = z
  .email('Informe um e-mail valido.')
  .max(254, 'O e-mail e muito longo.')
  .transform((valor) => valor.trim().toLowerCase())

export const cadastrarUsuarioSchema = z.object({
  nome: z
    .string({ error: 'Informe o nome.' })
    .trim()
    .min(2, 'O nome deve ter pelo menos 2 caracteres.')
    .max(120, 'O nome deve ter no maximo 120 caracteres.'),
  email,
  senha: z
    .string({ error: 'Informe a senha.' })
    .min(6, 'A senha deve ter pelo menos 6 caracteres.')
    .max(72, 'A senha deve ter no maximo 72 caracteres.'),
})

export const loginSchema = z.object({
  email,
  senha: z.string({ error: 'Informe a senha.' }).min(1, 'Informe a senha.'),
})

export type DadosCadastro = z.infer<typeof cadastrarUsuarioSchema>
