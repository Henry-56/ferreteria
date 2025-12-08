const { Producto } = require('./src/models');
const sequelize = require('./src/config/database');

async function testDB() {
    try {
        console.log('Conectando a la base de datos...');
        await sequelize.authenticate();
        console.log('Conexión exitosa.');

        console.log('Listando tablas...');
        const [results] = await sequelize.query("SHOW TABLES");
        console.log('Tablas encontradas:', results.map(r => Object.values(r)[0]));

        console.log('Intentando obtener productos...');
        const productos = await Producto.findAll({ limit: 1 });
        console.log('Productos obtenidos:', productos.length);

    } catch (error) {
        console.error('ERROR DETALLADO:', error.message);
        if (error.original) {
            console.error('SQL Error:', error.original.sqlMessage);
            console.error('SQL Query:', error.original.sql);
        }
    } finally {
        await sequelize.close();
    }
}

testDB();
