import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pool } from '../src/database/pool.js'

async function executarMigracao() {
  const caminho = resolve(process.cwd(), 'database/migrations/001_create_usuarios.sql')
  const sql = await readFile(caminho, 'utf8')

  await pool.query(sql)
  console.log('Migracao 001_create_usuarios aplicada com sucesso.')
}

executarMigracao()
  .catch((error) => {
    console.error('Falha ao executar a migracao:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
