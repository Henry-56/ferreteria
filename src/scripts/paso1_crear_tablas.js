require('dotenv').config();
const sequelize = require('../config/database');

/**
 * Migración simplificada - Ejecuta SQL directo
 */

async function migrarDirecto() {
    try {
        console.log('🔄 Iniciando migración directa con SQL...\n');

        await sequelize.authenticate();
        console.log('✓ Conectado a la base de datos\n');

        // 1. Crear tabla roles si no existe
        console.log('⏳ Creando tabla roles...');
        await sequelize.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL UNIQUE,
        descripcion TEXT,
        permisos JSON NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
        console.log('✓ Tabla roles creada\n');

        // 2. Crear tabla usuarios si no existe
        console.log('⏳ Creando tabla usuarios...');
        await sequelize.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        nombre_completo VARCHAR(100),
        telefono VARCHAR(20),
        rol_id BIGINT NOT NULL,
        activo TINYINT DEFAULT 1,
        ultimo_acceso DATETIME,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (rol_id) REFERENCES roles(id)
      ) ENGINE=InnoDB;
    `);
        console.log('✓ Tabla usuarios creada\n');

        // 3. Crear tabla clientes si no existe
        console.log('⏳ Creando tabla clientes...');
        await sequelize.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        ruc_dni VARCHAR(20) UNIQUE,
        direccion VARCHAR(200),
        telefono VARCHAR(20),
        email VARCHAR(100),
        tipo_cliente ENUM('minorista', 'mayorista', 'corporativo') DEFAULT 'minorista',
        credito_disponible DECIMAL(12,2) DEFAULT 0,
        activo TINYINT DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_clientes_ruc_dni (ruc_dni),
        INDEX idx_clientes_nombre (nombre)
      ) ENGINE=InnoDB;
    `);
        console.log('✓ Tabla clientes creada\n');

        // 4. Crear tabla auditoria_logs si no existe
        console.log('⏳ Creando tabla auditoria_logs...');
        await sequelize.query(`
      CREATE TABLE IF NOT EXISTS auditoria_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        usuario_id BIGINT,
        tabla VARCHAR(50) NOT NULL,
        registro_id BIGINT,
        accion ENUM('crear', 'actualizar', 'eliminar', 'consultar') NOT NULL,
        datos_anteriores JSON,
        datos_nuevos JSON,
        ip_address VARCHAR(50),
        user_agent VARCHAR(255),
        metodo_http VARCHAR(10),
        ruta VARCHAR(255),
        duracion_ms INTEGER,
        exito TINYINT(1) DEFAULT 1,
        mensaje_error TEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        INDEX idx_auditoria_usuario (usuario_id),
        INDEX idx_auditoria_tabla (tabla),
        INDEX idx_auditoria_created (created_at)
      ) ENGINE=InnoDB;
    `);
        console.log('✓ Tabla auditoria_logs creada\n');

        // 5. Renombrar mov_inventarios si existe, luego crear nueva
        console.log('⏳ Preparando tabla mov_inventarios...');
        await sequelize.query(`DROP TABLE IF EXISTS mov_inventarios_old`).catch(() => { });
        await sequelize.query(`
      RENAME TABLE mov_inventarios TO mov_inventarios_old
    `).catch(() => console.log('  (tabla mov_inventarios no existía)'));

        await sequelize.query(`
      CREATE TABLE IF NOT EXISTS mov_inventarios (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        producto_id BIGINT NOT NULL,
        usuario_id BIGINT NOT NULL,
        tipo_movimiento ENUM('entrada', 'salida', 'ajuste') NOT NULL,
        cantidad INTEGER NOT NULL,
        stock_anterior INTEGER NOT NULL,
        stock_nuevo INTEGER NOT NULL,
        referencia VARCHAR(50),
        referencia_id BIGINT,
        motivo TEXT,
        fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        INDEX idx_mov_producto (producto_id),
        INDEX idx_mov_usuario (usuario_id),
        INDEX idx_mov_tipo (tipo_movimiento),
        INDEX idx_mov_fecha (fecha)
      ) ENGINE=InnoDB;
    `);
        console.log('✓ Tabla mov_inventarios creada\n');

        console.log('✅ Todas las tablas nuevas creadas exitosamente!\n');
        console.log('📌 SIGUIENTE PASO: node src/scripts/seed.js\n');

    } catch (error) {
        console.error('❌ Error durante la migración:', error.message);
        console.error('\nDetalles:', error);
        throw error;
    } finally {
        await sequelize.close();
        console.log('🔌 Conexión cerrada\n');
    }
}

migrarDirecto()
    .then(() => {
        console.log('✅ ¡Migración completada!');
        console.log('\n🎯 AHORA EJECUTA: node src/scripts/seed.js');
        process.exit(0);
    })
    .catch(() => {
        console.error('\n💥 Error fatal');
        process.exit(1);
    });
