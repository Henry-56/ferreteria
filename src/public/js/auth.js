// Gestión de autenticación
class AuthManager {
    constructor() {
        this.token = localStorage.getItem(STORAGE_KEYS.token);
        this.refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
        this.user = JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || 'null');
    }

    // Verificar si hay sesión activa
    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    // Guardar sesión
    setSession(data) {
        this.token = data.token;
        this.refreshToken = data.refreshToken;
        this.user = data.user;

        localStorage.setItem(STORAGE_KEYS.token, data.token);
        localStorage.setItem(STORAGE_KEYS.refreshToken, data.refreshToken);
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));
    }

    // Obtener token actual
    getToken() {
        return this.token;
    }

    // Obtener usuario actual
    getUser() {
        return this.user;
    }

    // Verificar permiso
    hasPermission(permission) {
        if (!this.user || !this.user.rol) return false;
        const permisos = this.user.rol.permisos || {};
        // Navegar por la estructura de permisos
        const parts = permission.split('.');
        let current = permisos;
        for (const part of parts) {
            if (current[part] === undefined) return false;
            current = current[part];
        }
        return current === true;
    }

    // Cerrar sesión
    logout() {
        this.token = null;
        this.refreshToken = null;
        this.user = null;

        localStorage.removeItem(STORAGE_KEYS.token);
        localStorage.removeItem(STORAGE_KEYS.refreshToken);
        localStorage.removeItem(STORAGE_KEYS.user);
    }

    // Renovar token
    async renewToken() {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.apiPrefix}${API_CONFIG.endpoints.refreshToken}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data && data.data.token) {
                    this.token = data.data.token;
                    localStorage.setItem(STORAGE_KEYS.token, data.data.token);
                    return true;
                }
            }

            // Si falla, cerrar sesión
            this.logout();
            return false;
        } catch (error) {
            this.logout();
            return false;
        }
    }

    // Redirigir a login si no está autenticado
    redirectIfNotAuthenticated() {
        if (!this.isAuthenticated()) {
            window.location.href = '/views/login.html';
            return true;
        }
        return false;
    }

    // Redirigir a dashboard si ya está autenticado
    redirectIfAuthenticated() {
        if (this.isAuthenticated()) {
            window.location.href = '/views/dashboard.html';
            return true;
        }
        return false;
    }
}

// Instancia global
const auth = new AuthManager();
