require('dotenv').config();
const sequelize = require('../config/database');

/**
 * Migración PASO 2: Actualizar tablas existentes
 * Compatible con MySQL (sin IF NOT EXISTS)
 */

async function agregarColumna(tabla, columna, definicion) {
  try {
    await sequelize.query(`ALTER TABLE ${tabla} ADD COLUMN ${columna} ${definicion}`);
    console.log(`  ✓ Agregada columna ${columna}`);
  } catch (error) {
    if (error.original && error.original.errno === 1060) {
      console.log(`  - Columna ${columna} ya existe (ok)`);
    } else {
      throw error;
    }
  }
}

async function paso2_actualizarTablas() {
  try {
    console.log('🔄 PASO 2: Actualizando tablas existentes...\n');

    await sequelize.authenticate();
    console.log('✓ Conectado a la base de datos\n');

    // 1. Agregar columnas a productos
    console.log('⏳ Actualizando tabla productos...');
    await agregarColumna('productos', 'sku', 'VARCHAR(50) UNIQUE');
    await agregarColumna('productos', 'costo_promedio', 'DECIMAL(10,2) DEFAULT 0');
    await agregarColumna('productos', 'stock_minimo', 'INTEGER DEFAULT 5');
    await agregarColumna('productos', 'ubicacion', 'VARCHAR(50)');
    await agregarColumna('productos', 'fecha_vencimiento', 'DATE');
    await agregarColumna('productos', 'lote', 'VARCHAR(50)');
    await agregarColumna('productos', 'imagen_url', 'VARCHAR(255)');
    await agregarColumna('productos', 'es_servicio', 'TINYINT DEFAULT 0');
    console.log('✓ Productos actualizado\n');

    // 2. Agregar columnas a ventas
    console.log('⏳ Actualizando tabla ventas...');
    await agregarColumna('ventas', 'usuario_id', 'BIGINT NULL');
    await agregarColumna('ventas', 'cliente_id', 'BIGINT NULL');
    await agregarColumna('ventas', 'tipo_comprobante', "ENUM('boleta', 'factura', 'ticket') DEFAULT 'ticket'");
    await agregarColumna('ventas', 'numero_comprobante', 'VARCHAR(50)');
    await agregarColumna('ventas', 'metodo_pago', "ENUM('efectivo', 'tarjeta', 'transferencia', 'mixto') DEFAULT 'efectivo'");
    await agregarColumna('ventas', 'monto_efectivo', 'DECIMAL(12,2) DEFAULT 0');
    await agregarColumna('ventas', 'monto_tarjeta', 'DECIMAL(12,2) DEFAULT 0');
    await agregarColumna('ventas', 'monto_transferencia', 'DECIMAL(12,2) DEFAULT 0');
    await agregarColumna('ventas', 'subtotal', 'DECIMAL(12,2) DEFAULT 0');
    await agregarColumna('ventas', 'descuento', 'DECIMAL(12,2) DEFAULT 0');
    await agregarColumna('ventas', 'impuesto', 'DECIMAL(12,2) DEFAULT 0');
    await agregarColumna('ventas', 'status', "ENUM('completada', 'cancelada', 'pendiente') DEFAULT 'completada'");
    await agregarColumna('ventas', 'notas', 'TEXT');
    console.log('✓ Ventas actualizado\n');

    // 3. Obtener ID del admin
    console.log('⏳ Buscando usuario admin...');
    const [admin] = await sequelize.query(`SELECT id FROM usuarios WHERE username = 'admin' LIMIT 1`);

    if (!admin || admin.length === 0) {
      throw new Error('Usuario admin no encontrado. Ejecuta: node src/scripts/seed.js');
    }

    const adminId = admin[0].id;
    console.log(`✓ Usuario admin encontrado (ID: ${adminId})\n`);

    // 4. Actualizar ventas existentes
    console.log('⏳ Asignando admin a ventas existentes...');
    const [result] = await sequelize.query(`
      UPDATE ventas 
      SET usuario_id = ${adminId},
          subtotal = COALESCE(total, 0),
          status = 'completada'
      WHERE usuario_id IS NULL
    `);
    console.log(`✓ ${result.affectedRows || 0} ventas actualizadas\n`);

    // 5. Actualizar compras
    console.log('⏳ Actualizando tabla compras...');
    await agregarColumna('compras', 'usuario_id', 'BIGINT NULL');
    await agregarColumna('compras', 'status', "ENUM('completada', 'cancelada', 'pendiente') DEFAULT 'completada'");
    await agregarColumna('compras', 'notas', 'TEXT');

    await sequelize.query(`
      UPDATE compras 
      SET usuario_id = ${adminId}
      WHERE usuario_id IS NULL
    `);
    console.log('✓ Compras actualizado\n');

    // 6. Actualizar detalle_venta
    console.log('⏳ Actualizando tabla detalle_venta...');
    await agregarColumna('detalle_venta', 'precio_unitario', 'DECIMAL(10,2)');
    await agregarColumna('detalle_venta', 'descuento_unitario', 'DECIMAL(10,2) DEFAULT 0');
    await agregarColumna('detalle_venta', 'costo_unitario', 'DECIMAL(10,2)');
    await agregarColumna('detalle_venta', 'utilidad', 'DECIMAL(10,2)');

    // Copiar precio_unit a precio_unitario
    await sequelize.query(`
      UPDATE detalle_venta 
      SET precio_unitario = COALESCE(precio_unit, 0)
      WHERE precio_unitario IS NULL
    `).catch(() => console.log('  (precio_unit no existe)'));
    console.log('✓ Detalle_venta actualizado\n');

    // 7. Agregar foreign keys
    console.log('⏳ Agregando foreign keys...');

    await sequelize.query(`
      ALTER TABLE ventas 
      ADD CONSTRAINT fk_ventas_usuario 
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    `).catch(() => console.log('  (FK ventas_usuario ya existe)'));

    await sequelize.query(`
      ALTER TABLE ventas 
      ADD CONSTRAINT fk_ventas_cliente 
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    `).catch(() => console.log('  (FK ventas_cliente ya existe)'));

    await sequelize.query(`
      ALTER TABLE compras 
      ADD CONSTRAINT fk_compras_usuario 
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    `).catch(() => console.log('  (FK compras_usuario ya existe)'));

    console.log('✓ Foreign keys agregadas\n');

    console.log('✅ PASO 2 COMPLETADO!\n');
    console.log('📌 Base de datos completamente actualizada');
    console.log('🎯 AHORA PUEDES: npm run dev\n');

  } catch (error) {
    console.error('❌ Error en paso 2:', error.message);
    console.error('\nDetalles:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

paso2_actualizarTablas()
  .then(() => {
    console.log('✅ ¡Migración completada exitosamente!');
    console.log('\n🚀 Inicia el servidor: npm run dev');
    process.exit(0);
  })
  .catch(() => {
    console.error('\n💥 Error fatal');
    process.exit(1);
  });
