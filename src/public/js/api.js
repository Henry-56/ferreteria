// Cliente API con manejo de autenticación y errores
class APIClient {
    constructor() {
        this.baseURL = API_CONFIG.baseURL + API_CONFIG.apiPrefix;
    }

    // Realizar petición HTTP
    async request(endpoint, options = {}) {
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        // Agregar token si existe
        const token = auth.getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(this.baseURL + endpoint, config);

            // Manejar respuesta
            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return await response.json();
                }
                return response;
            }

            // Manejo de errores por código de estado
            if (response.status === 401) {
                // Token expirado, intentar renovar
                const renewed = await auth.renewToken();
                if (renewed) {
                    // Reintentar petición con nuevo token
                    config.headers['Authorization'] = `Bearer ${auth.getToken()}`;
                    const retryResponse = await fetch(this.baseURL + endpoint, config);
                    if (retryResponse.ok) {
                        return await retryResponse.json();
                    }
                }

                // Si no se pudo renovar, cerrar sesión
                auth.logout();
                window.location.href = '/views/login.html';
                throw new Error(MESSAGES.error.unauthorized);
            }

            if (response.status === 403) {
                throw new Error(MESSAGES.error.forbidden);
            }

            if (response.status === 404) {
                throw new Error(MESSAGES.error.notFound);
            }

            if (response.status === 422 || response.status === 400) {
                const errorData = await response.json();
                throw new Error(errorData.message || MESSAGES.error.validation);
            }

            if (response.status >= 500) {
                throw new Error(MESSAGES.error.server);
            }

            // Error genérico
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error en la petición');

        } catch (error) {
            if (error.name === 'TypeError') {
                throw new Error(MESSAGES.error.network);
            }
            throw error;
        }
    }

    // Métodos HTTP
    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
}

// Instancia global
const api = new APIClient();
