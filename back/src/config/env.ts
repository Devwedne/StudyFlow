import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  DATABASEURL: z.string().min(1, 'DATABASEURL precisa estar definida no .env.'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().default('*'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

const resultado = envSchema.safeParse(process.env)

if (!resultado.success) {
  const mensagens = resultado.error.issues.map((issue) => issue.message).join(' ')
  throw new Error(`Variaveis de ambiente invalidas: ${mensagens}`)
}

export const env = resultado.data
