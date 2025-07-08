require('dotenv').config();
const mysql = require('mysql');

// Create a connection
const conn = mysql.createConnection({
  host: 'localhost',
  port: 3307, 
  user: 'root',
  password: '', 
  database: 'orderboard_db',
});

console.log(' Database connected');

module.exports = {
  database: conn,
  secret: process.env.JWT_SECRET ,
  expiresIn: process.env.JWT_EXPIRES_IN          
};
