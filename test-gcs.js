// Script para probar conexión con Google Cloud Storage
require('dotenv').config();
const storageService = require('./src/services/storage.service');
const logger = require('./src/utils/logger');

async function testGCSConnection() {
    try {
        logger.info('Probando conexión con Google Cloud Storage...');
        await storageService.testConnection();
        logger.info('✅ Prueba exitosa!');
        process.exit(0);
    } catch (error) {
        logger.error('❌ Prueba fallida:', error);
        process.exit(1);
    }
}

testGCSConnection();
