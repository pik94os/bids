const Sequelize = require('sequelize');
const db_user = process.env.DB_USER || 'admingo';
const db = process.env.DB || 'admingo';
const password = process.env.DB_PASSWORD || 'admingo';
const port = process.env.DB_PORT || 5432;
var sequelize = new Sequelize(`postgres://${db_user}:${password}@localhost:${port}/${db}`);

module.exports = sequelize;