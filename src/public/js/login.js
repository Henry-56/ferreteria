// Lógica de Login
document.addEventListener('DOMContentLoaded', () => {
    // Redirigir si ya está autenticado
    auth.redirectIfAuthenticated();

    // Referencias a elementos
    const form = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginBtnLoader = document.getElementById('loginBtnLoader');
    const generalError = document.getElementById('generalError');

    // Manejar envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Limpiar errores
        generalError.textContent = '';

        // Obtener valores
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // Validar
        if (!username || !password) {
            generalError.textContent = 'Por favor completa todos los campos';
            return;
        }

        // Deshabilitar formulario
        loginBtn.disabled = true;
        loginBtnText.style.display = 'none';
        loginBtnLoader.style.display = 'inline-flex';

        try {
            // Hacer petición de login
            const response = await api.post(API_CONFIG.endpoints.login, {
                username,
                password
            });

            if (response.success && response.data) {
                // Guardar sesión
                auth.setSession(response.data);

                // Mostrar notificación de éxito
                utils.showToast(MESSAGES.success.login, 'success');

                // Redirigir a dashboard
                setTimeout(() => {
                    window.location.href = '/views/dashboard.html';
                }, 500);
            } else {
                throw new Error(response.message || 'Error al iniciar sesión');
            }

        } catch (error) {
            console.error('Error en login:', error);
            generalError.textContent = error.message || 'Error al procesar la solicitud';

            // Rehabilitar formulario
            loginBtn.disabled = false;
            loginBtnText.style.display = 'inline';
            loginBtnLoader.style.display = 'none';

            // Focus en username
            usernameInput.focus();
        }
    });

    // Enter en username pasa a password
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            passwordInput.focus();
        }
    });
});
