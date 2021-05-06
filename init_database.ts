const { Pool } = require('pg');
const fs = require('fs');
const sql = fs.readFileSync('init_database.sql').toString();
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

pool.query(sql, (error) => {
  if (error) {
    console.log('Error: ', error);
    process.exit(1);
  }

  console.log('Success database init');

  pool.end();
  process.exit(0);
});
