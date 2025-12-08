require('dotenv').config();
const { sequelize, Role, User } = require('../models');
const { ROLES, PERMISSIONS } = require('../config/constants');

/**
 * Script para inicializar la base de datos con roles y usuario admin
 */
async function seed() {
    try {
        console.log('🌱 Iniciando seed de base de datos...\n');

        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✓ Conectado a la base de datos\n');

        // Sincronizar modelos (crear tablas si no existen)
        console.log('⏳ Sincronizando modelos...');
        await sequelize.sync({ alter: false }); // Cambiar a true con precaución
        console.log('✓ Modelos sincronizados\n');

        // Crear roles
        console.log('⏳ Creando roles...');

        const roles = [
            {
                nombre: ROLES.ADMIN,
                descripcion: 'Administrador del sistema con todos los permisos',
                permisos: Object.keys(PERMISSIONS).reduce((acc, key) => {
                    acc[PERMISSIONS[key]] = true;
                    return acc;
                }, {})
            },
            {
                nombre: ROLES.VENDEDOR,
                descripcion: 'Vendedor - puede realizar ventas y gestionar clientes',
                permisos: {
                    [PERMISSIONS.PRODUCTOS_VER]: true,
                    [PERMISSIONS.VENTAS_VER]: true,
                    [PERMISSIONS.VENTAS_CREAR]: true
                }
            },
            {
                nombre: ROLES.ALMACENERO,
                descripcion: 'Almacenero - gestiona inventario y compras',
                permisos: {
                    [PERMISSIONS.PRODUCTOS_VER]: true,
                    [PERMISSIONS.PRODUCTOS_CREAR]: true,
                    [PERMISSIONS.PRODUCTOS_EDITAR]: true,
                    [PERMISSIONS.PRODUCTOS_AJUSTAR_STOCK]: true,
                    [PERMISSIONS.COMPRAS_VER]: true,
                    [PERMISSIONS.COMPRAS_CREAR]: true,
                    [PERMISSIONS.COMPRAS_EDITAR]: true
                }
            },
            {
                nombre: ROLES.CAJERO,
                descripcion: 'Cajero - realiza ventas',
                permisos: {
                    [PERMISSIONS.PRODUCTOS_VER]: true,
                    [PERMISSIONS.VENTAS_CREAR]: true,
                    [PERMISSIONS.VENTAS_VER]: true
                }
            },
            {
                nombre: ROLES.SUPERVISOR,
                descripcion: 'Supervisor - acceso a reportes y visualización',
                permisos: {
                    [PERMISSIONS.PRODUCTOS_VER]: true,
                    [PERMISSIONS.VENTAS_VER]: true,
                    [PERMISSIONS.COMPRAS_VER]: true,
                    [PERMISSIONS.REPORTES_VENTAS]: true,
                    [PERMISSIONS.REPORTES_INVENTARIO]: true,
                    [PERMISSIONS.REPORTES_FINANCIEROS]: true
                }
            }
        ];

        for (const rolData of roles) {
            const [rol, created] = await Role.findOrCreate({
                where: { nombre: rolData.nombre },
                defaults: rolData
            });

            if (created) {
                console.log(`  ✓ Rol creado: ${rol.nombre}`);
            } else {
                console.log(`  ℹ Rol ya existe: ${rol.nombre}`);
            }
        }

        console.log('\n⏳ Creando usuario administrador...');

        // Obtener el rol de admin
        const adminRole = await Role.findOne({ where: { nombre: ROLES.ADMIN } });

        if (!adminRole) {
            throw new Error('No se encontró el rol de administrador');
        }

        // Crear usuario admin
        const [admin, created] = await User.findOrCreate({
            where: { username: 'admin' },
            defaults: {
                username: 'admin',
                email: 'admin@pos.com',
                password_hash: 'admin123', // Se hasheará automáticamente
                nombre_completo: 'Administrador del Sistema',
                rol_id: adminRole.id,
                activo: 1
            }
        });

        if (created) {
            console.log('  ✓ Usuario admin creado');
            console.log('  📧 Email: admin@pos.com');
            console.log('  🔑 Password: admin123');
            console.log('  ⚠️  IMPORTANTE: Cambie esta contraseña inmediatamente');
        } else {
            console.log('  ℹ Usuario admin ya existe');
        }

        console.log('\n✅ Seed completado exitosamente!\n');

        console.log('==============================================');
        console.log('Datos de acceso:');
        console.log('  Usuario: admin');
        console.log('  Password: admin123');
        console.log('==============================================\n');

    } catch (error) {
        console.error('❌ Error durante el seed:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Ejecutar seed
seed()
    .then(() => {
        console.log('🎉 Proceso completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
