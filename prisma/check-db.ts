import { Pool } from 'pg'

async function main() {
  const pool = new Pool({
    host: '201.23.70.201',
    port: 5432,
    database: 'filehub',
    user: 'filehub',
    password: 'FileHub2024@Secure!Pass',
  })

  console.log('Verificando tabelas no schema smartloja...')

  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'smartloja'
      ORDER BY table_name
    `)

    if (result.rows.length === 0) {
      console.log('Nenhuma tabela encontrada no schema smartloja')
    } else {
      console.log('Tabelas encontradas:')
      result.rows.forEach(row => console.log('  -', row.table_name))
    }

    // Verificar schemas disponíveis
    const schemas = await pool.query(`
      SELECT schema_name
      FROM information_schema.schemata
      ORDER BY schema_name
    `)
    console.log('\nSchemas disponíveis:')
    schemas.rows.forEach(row => console.log('  -', row.schema_name))

  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await pool.end()
  }
}

main()
