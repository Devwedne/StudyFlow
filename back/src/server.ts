import { app } from './app.js'
import { env } from './config/env.js'
import { pool } from './database/pool.js'

async function iniciarServidor() {
  await pool.query('SELECT 1')

  const servidor = app.listen(env.PORT, () => {
    console.log(`StudyFlow API rodando em http://localhost:${env.PORT}`)
  })

  const encerrar = (sinal: string) => {
    console.log(`\n${sinal} recebido. Encerrando...`)
    servidor.close(() => {
      void pool.end().finally(() => process.exit(0))
    })
  }

  process.on('SIGINT', () => encerrar('SIGINT'))
  process.on('SIGTERM', () => encerrar('SIGTERM'))
}

iniciarServidor().catch((error) => {
  console.error('Nao foi possivel iniciar a API:', error)
  process.exit(1)
})
