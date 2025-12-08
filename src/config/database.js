const Sequelize = require('sequelize');
require('dotenv').config();

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
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 2,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Función para probar la conexión
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✓ Conectado a la base de datos con éxito.');
        return true;
    } catch (err) {
        console.error('✗ No se ha podido conectar a la base de datos:', err.message);
        return false;
    }
};

// testConnection();

module.exports = sequelize;
