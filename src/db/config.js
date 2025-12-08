const Sequelize = require('sequelize');

const database = process.env.DB_NAME || 'botjeakuw3mobg9umzms';
const username = process.env.DB_USERNAME || 'ukvoxgwj6fb4zwuj';
const password = process.env.DB_PASSWORD || 'bPTsvB8FJI6ithgDu7UG';
const host = process.env.DB_HOST || 'botjeakuw3mobg9umzms-mysql.services.clever-cloud.com';
const dialect = process.env.DB_DIALECT || 'mysql';

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
  dialectOptions: {
    ssl: {
      require: true, // Require SSL/TLS
      rejectUnauthorized: false // Accept self-signed certificates
    }
  }
});

sequelize
  .authenticate()
  .then(() => console.log('Conectado a la base de datos con éxito.'))
  .catch(err => console.log('No se ha podido conectar: ', err));

module.exports = sequelize;
