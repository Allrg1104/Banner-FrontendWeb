/**
 * API Wrapper - Communication with Backend
 */

const API_BASE_URL = 'https://api.unicatolica.online//api';

const API = {
    async request(endpoint, options = {}) {
        // Get token from session
        const token = sessionStorage.getItem('token');

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                // Token expired or invalid
                if (response.status === 401 && !endpoint.includes('/auth/login')) {
                    Auth.logout();
                    Router.navigate('/login');
                    throw new Error('Sesión expirada. Por favor ingresa de nuevo.');
                }
                throw new Error(data.error || 'Error en la petición');
            }

            return data;
        } catch (err) {
            console.error('API Error:', err.message);
            Toast.show(err.message, 'error');
            throw err;
        }
    },

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

/**
 * Global Toast System
 */
const Toast = {
    show(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `p-4 rounded-lg shadow-lg bg-white border-l-4 transform transition-all translate-y-10 opacity-0 flex items-center gap-3 min-w-[300px] z-[9999]`;

        const colors = {
            success: 'border-green-500 text-green-800',
            error: 'border-red-500 text-red-800',
            info: 'border-blue-500 text-blue-800',
            warning: 'border-yellow-500 text-yellow-800'
        };

        toast.classList.add(...(colors[type] || colors.info).split(' '));

        const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info';
        toast.innerHTML = `
      <i data-lucide="${icon}" class="w-5 h-5"></i>
      <span class="text-sm font-medium">${message}</span>
    `;

        container.appendChild(toast);
        lucide.createIcons();

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-10', 'opacity-0');
        });

        // Auto remove
        setTimeout(() => {
            toast.classList.add('translate-y-10', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },
    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error'); },
    info(msg) { this.show(msg, 'info'); },
    warning(msg) { this.show(msg, 'warning'); }
};
