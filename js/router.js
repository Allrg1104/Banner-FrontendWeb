/**
 * Custom Hash Router for SPA
 */

const Router = {
    routes: {},
    root: document.getElementById('main-content'),

    init(routes) {
        this.routes = routes;
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    },

    async handleRoute() {
        const path = window.location.hash.slice(1) || '/';

        // Check Auth
        if (!Auth.isAuthenticated() && path !== '/login' && !path.startsWith('/reset-password')) {
            return this.navigate('/login');
        }

        // Auth redirection
        if (Auth.isAuthenticated() && (path === '/login' || path === '/')) {
            return this.redirectToDashboard();
        }

        const viewName = this.routes[path] || this.routes['/404'] || 'login';
        this.render(viewName);
    },

    navigate(path) {
        window.location.hash = path;
    },

    redirectToDashboard() {
        const user = Auth.getUser();
        if (!user) return this.navigate('/login');

        const dashboardMap = {
            'estudiante': '/dashboard',
            'docente': '/teacher',
            'director': '/director',
            'decano': '/director',
            'registro': '/registro',
            'financiero': '/financial',
            'admin': '/admin'
        };

        this.navigate(dashboardMap[user.rol] || '/login');
    },

    async render(viewName) {
        const app = document.getElementById('app');
        const view = Views[viewName];

        if (!view) {
            app.innerHTML = '<h1>Error 404: Vista no encontrada</h1>';
            return;
        }

        try {
            const content = await view.render();

            if (viewName === 'login' || viewName === 'change-password') {
                app.innerHTML = content;
            } else {
                app.innerHTML = Layout.shell(content);
            }

            if (view.afterRender) view.afterRender();
            lucide.createIcons();
        } catch (err) {
            console.error('Render Error:', err);
            app.innerHTML = '<div class="p-8 text-center text-white"><h2 class="text-red-500">Error al cargar la vista</h2><p class="text-gray-400">' + err.message + '</p></div>';
        }
    }
};
