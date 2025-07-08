require('dotenv').config();
const mysql = require('mysql');



const database = mysql.createPool({
  host: process.env.DB_HOST,      // Railway provides this
  port: process.env.DB_PORT || 3306, // Railway may provide port, or default 3306
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

module.exports = { database };

module.exports = {
  database: conn,
  secret: process.env.JWT_SECRET ,
  expiresIn: process.env.JWT_EXPIRES_IN          
};
