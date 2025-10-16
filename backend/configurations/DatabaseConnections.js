require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',             // default username
  host: 'localhost',
  database: 'orderboard_db',    // your database
  password: 'Trophydeleader34#',// your postgres password
  port: 5432,                   // default postgres port
});

pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL database!'))
  .catch(err => console.error('❌ Database connection error:', err));

module.exports = {
  database: pool,                        // ✅ export pool instead of conn
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN
};
