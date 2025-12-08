const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { PERMISSIONS } = require('../../config/constants');

// Rutas públicas (sin autenticación)
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

// Rutas protegidas (requieren autenticación)
router.use(authenticate);

router.get('/me', authController.getMe);
router.post('/logout', authController.logout);
router.post('/change-password', authController.changePassword);

// Solo admin puede registrar nuevos usuarios
router.post('/register',
    authorize(PERMISSIONS.USUARIOS_CREAR),
    authController.register
);

module.exports = router;
