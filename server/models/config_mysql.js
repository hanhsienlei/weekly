require("dotenv").config();
const mysql = require("mysql2/promise");
const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env;

const mysqlConfig = {
  host: DB_HOST,
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 20,
};

const pool = mysql.createPool(mysqlConfig)

module.exports = {
  mysql,
  pool
}
