import { Pool } from 'pg'
import { env } from '../config/env.js'

export const pool = new Pool({
  connectionString: env.DATABASEURL,
})

pool.on('error', (error) => {
  console.error('Erro inesperado na conexao com o PostgreSQL:', error)
})
