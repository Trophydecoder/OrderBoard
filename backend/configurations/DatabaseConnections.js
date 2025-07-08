const mysql = require('mysql');

// Create MySQL connection pool using environment variables
const conn = mysql.createPool({
  host: process.env.DB_HOST,           // e.g. containers-us-west-xxx.railway.app
  port: process.env.DB_PORT || 3306,  // fallback to default MySQL port
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// Test connection
conn.getConnection((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected successfully');
  }
});

const secret = process.env.JWT_SECRET || 'fallback_secret_key';
const expiresIn = process.env.JWT_EXPIRES_IN || '2h';

module.exports = {
  database: conn,
  secret,
  expiresIn
};
