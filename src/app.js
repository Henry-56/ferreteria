require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Importar utilidades
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler.middleware');

// Importar modelos para sincronizar
const { syncModels } = require('./models');

const app = express();

// ====================
// Seguridad
// ====================
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "https://storage.googleapis.com"],
        },
    },
}));

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Rate Limiting - protección contra ataques de fuerza bruta
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de peticiones
    message: 'Demasiadas peticiones desde esta IP, por favor intente nuevamente más tarde'
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Demasiados intentos de login, por favor intente nuevamente más tarde'
});

// ====================
// Middlewares
// ====================
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// HTTP request logger
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

// Sesión (mantener para compatibilidad con vistas EJS si es necesario)
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_cambiar_en_produccion',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 horas
    }
}));

// ====================
// Configuración de vistas (EJS)
// ====================
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir archivos estáticos
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Servir imágenes subidas

// ====================
// Rutas API (RESTful)
// ====================
const authRoutes = require('./routes/api/auth.routes');
const productosRoutes = require('./routes/api/productos.routes');
const ventasRoutes = require('./routes/api/ventas.routes');
const reportesRoutes = require('./routes/api/reportes.routes');
const clientesRoutes = require('./routes/api/clientes.routes');

// Aplicar rate limiting a rutas API
app.use('/api', apiLimiter);
app.use('/api/auth/login', loginLimiter);

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de productos
app.use('/api/productos', productosRoutes);

// Rutas de ventas
app.use('/api/ventas', ventasRoutes);

// Rutas de reportes
app.use('/api/reportes', reportesRoutes);

// Rutas de clientes
app.use('/api/clientes', clientesRoutes);

// TODO: Agregar más rutas API (ventas, compras, reportes)

// ====================
// Rutas legacy (mantener temporalmente para compatibilidad)
// ====================
const legacyProductosRoutes = require('./routes/productos');
const legacyRubrosRoutes = require('./routes/rubros');
const legacyProveedoresRoutes = require('./routes/proveedores');
const legacyComprasRoutes = require('./routes/compras');
const legacyDetalleComprasRoutes = require('./routes/detalleCompras');
const legacyVentasRoutes = require('./routes/ventas');
const legacyDetalleVentasRoutes = require('./routes/detalleVentas');
const legacyMovInventariosRoutes = require('./routes/movInventarios');

app.use('/', legacyProductosRoutes);
app.use('/', legacyRubrosRoutes);
app.use('/', legacyProveedoresRoutes);
app.use('/', legacyComprasRoutes);
app.use('/', legacyDetalleComprasRoutes);
app.use('/', legacyVentasRoutes);
app.use('/', legacyDetalleVentasRoutes);
app.use('/', legacyMovInventariosRoutes);

// ====================
// Archivos estáticos
// ====================
app.use(express.static(path.join(__dirname, 'public')));

// Ruta raíz - redirigir al login
app.get('/', (req, res) => {
    res.redirect('/views/login.html');
});

// ====================
// Manejo de errores
// ====================
app.use(notFound); // 404
app.use(errorHandler); // Errores generales

// ====================
// Inicialización
// ====================
const startServer = async () => {
    try {
        // Sincronizar modelos (en desarrollo)
        if (process.env.NODE_ENV === 'development') {
            await syncModels({ alter: false }); // Cambiar a true solo si quieres alterar tablas
        }

        // Iniciar servidor
        const PORT = app.get('port');
        app.listen(PORT, () => {
            logger.info(`==============================================`);
            logger.info(`🚀 Servidor iniciado en puerto ${PORT}`);
            logger.info(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🌐 URL: http://localhost:${PORT}`);
            logger.info(`==============================================`);
        });

    } catch (error) {
        logger.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
