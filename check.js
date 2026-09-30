import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'CDMX',
  password: 'Saladito68',
  port: 5432,
});

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT pg_get_constraintdef(c.oid) AS definicion
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      WHERE c.conname = 'chk_codigo_categoria';
    `);
    console.log("Definición de la restricción:");
    console.log(res.rows[0]);
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
