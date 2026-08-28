/**
 * API Wrapper - Communication with Backend
 */

// Híbrido: Detectar si estamos en producción o en entorno local
const API_BASE_URL = window.location.hostname.includes('unicatolica.online')
    ? 'https://api.unicatolica.online/api'
    : `${window.location.protocol}//${window.location.hostname}:3000/api`;

const API = {
    async request(endpoint, options = {}) {
        const { silent = false, ...fetchOptions } = options;
        // Get token from session
        const token = sessionStorage.getItem('token');

        const headers = {
            'Content-Type': 'application/json',
            ...fetchOptions.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            // Clean endpoint and base URL to avoid double slashes
            const cleanBase = API_BASE_URL.replace(/\/$/, '');
            const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
            const url = `${cleanBase}${cleanEndpoint}`;
            console.log(`📡 [API DEBUG] Llamando a: ${url}`);

            const response = await fetch(url, {
                ...fetchOptions,
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
                const err = new Error(data.error || 'Error en la petición');
                err.status = response.status;
                throw err;
            }

            return data;
        } catch (err) {
            console.error('API Error:', err.message);
            const skipToast = silent && err.status === 404;
            if (!skipToast) Toast.show(err.message, 'error');
            throw err;
        }
    },

    get(endpoint, opts = {}) {
        return this.request(endpoint, { method: 'GET', ...opts });
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

const customConfirm = function(message, title = "Confirmación Requerida", isCritical = false) {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-confirm-modal');
        const box = document.getElementById('custom-confirm-box');
        if (!modal || !box) {
            console.error("Global custom-confirm-modal not found in DOM");
            resolve(confirm(message));
            return;
        }

        document.getElementById('custom-confirm-message').innerText = message;
        document.getElementById('custom-confirm-title').innerText = title;

        const acceptBtn = document.getElementById('custom-confirm-accept');
        const iconBg = document.getElementById('custom-confirm-icon-bg');
        const icon = document.getElementById('custom-confirm-icon');

        if (isCritical) {
            acceptBtn.classList.remove('bg-[#032840]', 'shadow-[#032840]/30', 'hover:bg-[#032840]/90');
            acceptBtn.classList.add('bg-red-500', 'shadow-red-500/30', 'hover:bg-red-600');
            iconBg.classList.remove('bg-indigo-50');
            iconBg.classList.add('bg-red-50');
            icon.classList.remove('text-[#032840]');
            icon.classList.add('text-red-500');
            icon.setAttribute('data-lucide', 'alert-triangle');
        } else {
            acceptBtn.classList.remove('bg-red-500', 'shadow-red-500/30', 'hover:bg-red-600');
            acceptBtn.classList.add('bg-[#032840]', 'shadow-[#032840]/30', 'hover:bg-[#032840]/90');
            iconBg.classList.remove('bg-red-50');
            iconBg.classList.add('bg-indigo-50');
            icon.classList.remove('text-red-500');
            icon.classList.add('text-[#032840]');
            icon.setAttribute('data-lucide', 'help-circle');
        }
        if (window.lucide) {
            window.lucide.createIcons();
        }

        modal.classList.remove('hidden');
        // Trigger reflow
        void modal.offsetWidth;
        modal.classList.remove('opacity-0');
        box.classList.remove('scale-95');

        const cleanup = () => {
            modal.classList.add('opacity-0');
            box.classList.add('scale-95');
            document.getElementById('custom-confirm-cancel').removeEventListener('click', onCancel);
            acceptBtn.removeEventListener('click', onAccept);
        };

        const onCancel = () => {
            cleanup();
            setTimeout(() => {
                modal.classList.add('hidden');
                resolve(false);
            }, 300);
        };
        const onAccept = () => {
            cleanup();
            setTimeout(() => {
                modal.classList.add('hidden');
                resolve(true);
            }, 300);
        };

        document.getElementById('custom-confirm-cancel').addEventListener('click', onCancel);
        acceptBtn.addEventListener('click', onAccept);
    });
};

window.API = API;
window.Toast = Toast;
window.customConfirm = customConfirm;
