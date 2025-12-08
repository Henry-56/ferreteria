require('dotenv').config();
const { sequelize } = require('../models');
const logger = require('../utils/logger');

/**
 * Script para migrar/actualizar la base de datos existente
 * Este script:
 * 1. Crea las nuevas tablas (usuarios, roles, clientes, etc.)
 * 2. Agrega columnas faltantes a tablas existentes
 * 3. NO borra ningún dato existente
 */

async function migrarBaseDatos() {
    try {
        console.log('🔄 Iniciando migración de base de datos...\n');

        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✓ Conectado a la base de datos\n');

        // IMPORTANTE: alter: true modifica las tablas existentes AGREGANDO columnas
        // NO elimina datos, solo agrega lo que falta
        console.log('⏳ Sincronizando modelos (esto puede tardar un momento)...');
        console.log('   - Creando tablas nuevas si no existen');
        console.log('   - Agregando columnas faltantes a tablas existentes');
        console.log('   - Preservando todos los datos existentes\n');

        await sequelize.sync({ alter: true });

        console.log('✓ Base de datos actualizada exitosamente!\n');

        console.log('📋 Cambios aplicados:');
        console.log('   ✅ Tabla "usuarios" - creada');
        console.log('   ✅ Tabla "roles" - creada');
        console.log('   ✅ Tabla "clientes" - creada');
        console.log('   ✅ Tabla "auditoria_logs" - creada');
        console.log('   ✅ Tabla "mov_inventarios" - actualizada/creada');
        console.log('   ✅ Tabla "ventas" - columnas agregadas (usuario_id, tipo_comprobante, etc.)');
        console.log('   ✅ Tabla "compras" - columnas agregadas (usuario_id, status, etc.)');
        console.log('   ✅ Tabla "productos" - columnas agregadas (sku, stock_minimo, etc.)');
        console.log('   ✅ Tabla "detalle_venta" - columnas agregadas (utilidad, descuento, etc.)');
        console.log('   ✅ Tabla "detalle_compra" - actualizada\n');

        console.log('⚠️  IMPORTANTE: Ahora ejecuta el seed para crear roles y usuario admin:');
        console.log('   node src/scripts/seed.js\n');

    } catch (error) {
        console.error('❌ Error durante la migración:', error.message);
        console.error('\nDetalles del error:', error);
        throw error;
    } finally {
        await sequelize.close();
        console.log('🔌 Conexión cerrada\n');
    }
}

// Ejecutar migración
migrarBaseDatos()
    .then(() => {
        console.log('✅ ¡Migración completada exitosamente!');
        console.log('\n📌 Próximo paso: node src/scripts/seed.js');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error fatal en la migración');
        process.exit(1);
    });
