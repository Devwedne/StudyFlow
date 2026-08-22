import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pool } from '../src/database/pool.js'

async function executarMigracao() {
  const diretorio = resolve(process.cwd(), 'database/migrations')
  const arquivos = (await readdir(diretorio))
    .filter((arquivo) => arquivo.endsWith('.sql'))
    .sort()

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      nome VARCHAR(255) PRIMARY KEY,
      aplicada_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  for (const arquivo of arquivos) {
    const aplicada = await pool.query(
      'SELECT 1 FROM schema_migrations WHERE nome = $1',
      [arquivo],
    )

    if (aplicada.rowCount) {
      console.log(`Migracao ${arquivo} ja aplicada.`)
      continue
    }

    const sql = await readFile(resolve(diretorio, arquivo), 'utf8')
    const client = await pool.connect()

    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (nome) VALUES ($1)', [arquivo])
      await client.query('COMMIT')
      console.log(`Migracao ${arquivo} aplicada com sucesso.`)
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}

executarMigracao()
  .catch((error) => {
    console.error('Falha ao executar a migracao:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
