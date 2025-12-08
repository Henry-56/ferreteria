const sequelize = require('./src/config/database');

async function checkColumns() {
    try {
        await sequelize.authenticate();
        console.log('Conectado.');

        const [results] = await sequelize.query("DESCRIBE productos");
        console.log('Columnas en BD:');
        results.forEach(c => console.log(`- ${c.Field} (${c.Type})`));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkColumns();
