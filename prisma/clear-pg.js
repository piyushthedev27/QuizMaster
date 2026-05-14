const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
  const client = new Client({ connectionString })
  
  try {
    await client.connect()
    console.log('Connected to DB')
    
    let res = await client.query(`DELETE FROM questions WHERE unit = 'unit-1'`)
    console.log(`Deleted ${res.rowCount} rows from questions (unit-1)`)

    res = await client.query(`DELETE FROM questions WHERE unit = 'unit-2'`)
    console.log(`Deleted ${res.rowCount} rows from questions (unit-2)`)

    res = await client.query(`DELETE FROM unit_1`)
    console.log(`Deleted ${res.rowCount} rows from unit_1 table`)
    
    res = await client.query(`DELETE FROM unit_2`)
    console.log(`Deleted ${res.rowCount} rows from unit_2 table`)

  } catch (err) {
    console.error('Error during deletion:', err)
  } finally {
    await client.end()
  }
}

main()
