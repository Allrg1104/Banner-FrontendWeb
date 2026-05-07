/**
 * Auth - Session Management & Server Auth
 */

const Auth = {
    async login(username, password) {
        try {
            // Encriptar payload para que no sea visible en texto plano en la consola
            const secret = 'banner-secret-key-2024'; // Debe coincidir con el backend
            const payload = JSON.stringify({ username, password });
            const encrypted = CryptoJS.AES.encrypt(payload, secret).toString();

            const result = await API.post('/auth/login', { data: encrypted });
            if (result.token) {
                sessionStorage.setItem('token', result.token);
                sessionStorage.setItem('user', JSON.stringify(result.user));
                return { success: true, user: result.user };
            }
            return { success: false, error: result.error || 'Error desconocido' };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    logout() {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.hash = '/login';
    },

    getUser() {
        const user = sessionStorage.getItem('user');
        try {
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    },

    async refreshUser() {
        if (!this.isAuthenticated()) return null;
        try {
            const user = await API.get('/auth/me');
            if (user && user.id) {
                sessionStorage.setItem('user', JSON.stringify(user));
                return user;
            }
        } catch (err) {
            console.warn('No se pudo refrescar el usuario desde el servidor', err);
        }
        return this.getUser();
    },

    getToken() {
        return sessionStorage.getItem('token');
    },

    isAuthenticated() {
        return !!this.getToken();
    }
};

window.Auth = Auth;
