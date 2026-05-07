const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: '123',
  host: 'localhost',
  port: 5432,
  database: 'postgres' // Connect to default postgres database
});

async function createDatabase() {
  try {
    await client.connect();
    
    // Check if database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'gestao_academica'"
    );
    
    if (result.rows.length === 0) {
      await client.query('CREATE DATABASE gestao_academica');
      console.log('✅ Database gestao_academica created successfully!');
    } else {
      console.log('ℹ️  Database gestao_academica already exists');
    }
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
  } finally {
    await client.end();
  }
}

createDatabase();

