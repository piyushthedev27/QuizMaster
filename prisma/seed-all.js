const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

function determineDifficulty(questionId) {
  const idNumber = parseInt(questionId) || 0;
  if (idNumber <= 15) return 'EASY';
  if (idNumber <= 35) return 'MEDIUM';
  return 'HARD';
}

function determineCategory(question) {
  return 'General Management'; // simplified for bulk insert
}

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('No connection string found');
    return;
  }

  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to DB');

    for (let i = 1; i <= 5; i++) {
      const tableName = `unit_${i}`;
      const jsonPath = path.join(__dirname, `unit-${i}.json`);
      
      console.log(`\n--- Processing Unit ${i} ---`);
      
      if (!fs.existsSync(jsonPath)) {
        console.log(`File ${jsonPath} not found, skipping.`);
        continue;
      }

      // Clear existing data
      console.log(`Clearing ${tableName}...`);
      try {
        await client.query(`DELETE FROM ${tableName}`);
        console.log(`Cleared ${tableName}`);
      } catch (e) {
        console.error(`Error clearing ${tableName}: ${e.message}`);
      }

      // Read JSON
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      console.log(`Found ${data.length} questions for ${tableName}`);

      // Insert data in batches
      const batchSize = 50;
      let insertedCount = 0;

      for (let j = 0; j < data.length; j += batchSize) {
        const batch = data.slice(j, j + batchSize);
        
        let query = `INSERT INTO ${tableName} (id, question, options, answer, difficulty, category, unit, "createdAt") VALUES `;
        const values = [];
        const rows = [];

        batch.forEach((item, index) => {
          const id = item.id + '-' + Date.now() + Math.floor(Math.random() * 1000);
          const question = item.question;
          const options = JSON.stringify(item.options);
          const answer = item.answer;
          const difficulty = determineDifficulty(item.id);
          const category = determineCategory(item.question);
          const unitStr = `unit-${i}`;
          const createdAt = new Date().toISOString();

          const offset = index * 8;
          rows.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8})`);
          
          values.push(id, question, options, answer, difficulty, category, unitStr, createdAt);
        });

        query += rows.join(', ');

        try {
          await client.query(query, values);
          insertedCount += batch.length;
        } catch (err) {
          console.error(`Error inserting batch in ${tableName}: ${err.message}`);
        }
      }
      
      console.log(`Inserted ${insertedCount} questions into ${tableName}`);
    }

  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await client.end();
    console.log('\nFinished all operations.');
  }
}

main();
