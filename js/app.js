/**
 * Premium App Shell Redesign
 * Enterprise grade navigation and layout architecture
 */

// Global Views Container
window.Views = {};

const Layout = {
    /**
     * Premium App Shell Wrap
     */
    shell(content) {
        const user = Auth.getUser();
        if (!user) return Views.login.render();

        return `
            <div class="premium-bg"></div>
            <div class="app-shell">
                
                <!-- Sidebar: Solid Unicatólica Identity -->
                <aside class="sidebar glass-dark">
                    <div class="flex items-center gap-3 mb-10 px-4">
                        <div class="w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center animate-float">
                            <i data-lucide="graduation-cap" class="text-[#032840] w-6 h-6"></i>
                        </div>
                        <span class="text-white text-xl font-black tracking-tight" style="font-family: 'Outfit'">UNICA<span class="text-[#fab720]">TÓLICA</span></span>
                    </div>

                    <nav class="flex-grow space-y-2">
                        <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">Menú Principal</div>
                        
                        ${user.rol === 'estudiante' ? this.navItem('/dashboard', 'layout-dashboard', 'Dashboard') : this.navItem(this.getUserDashboardPath(), 'layout-dashboard', 'Dashboard')}
                        ${user.rol === 'estudiante' ? this.navItem('/student', 'book-open', 'Mi Academia') : ''}
                        ${user.rol === 'docente' ? this.navItem('/teacher', 'presentation', 'Mis Cursos') : ''}
                        ${user.rol === 'director' || user.rol === 'decano' ? this.navItem('/director', 'bar-chart-3', 'Métricas SIS') : ''}
                        ${user.rol === 'registro' ? this.navItem('/registro', 'users', 'Gestión Usuarios') : ''}
                        ${user.rol === 'financiero' ? this.navItem('/financial', 'wallet', 'Cartera') : ''}
                        ${user.rol === 'admin' ? this.navItem('/admin', 'shield-check', 'Admin TI') : ''}
                        
                        <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-8 mb-4 px-4">Operaciones</div>
                        ${user.rol === 'estudiante' ? this.navItem('/profile', 'user-circle', 'Mi Perfil') : ''}
                        ${this.navItem('/change-password', 'key-round', 'Seguridad')}
                    </nav>

                    <div class="mt-auto px-2">
                        <div class="bg-white/10 rounded-2xl p-4 border border-white/10 mb-4">
                             <div class="flex items-center gap-3 mb-3">
                                 <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#032840] font-extrabold">
                                     ${user.nombres[0]}
                                 </div>
                                 <div class="overflow-hidden">
                                     <div class="text-sm font-bold text-white truncate">${user.nombres}</div>
                                     <div class="text-[10px] text-[#fab720] uppercase font-black tracking-tighter">${user.rol}</div>
                                 </div>
                             </div>
                             <button onclick="Auth.logout()" class="btn-premium btn-logout w-full py-2 text-white text-xs">
                                 Cerrar Sesión
                                 <i data-lucide="log-out" class="w-3 h-3"></i>
                             </button>
                        </div>
                    </div>
                </aside>

                <!-- Content Area -->
                <main class="main-content flex flex-col">
                    
                    <!-- Header: Floating Glass -->
                    <header class="header-premium glass animate-fade-in shadow-lg">
                        <div class="flex items-center gap-4">
                            <span class="text-slate-800 font-bold text-sm">Dashboard</span>
                            <i data-lucide="chevron-right" class="w-4 h-4 text-slate-500"></i>
                            <span class="text-slate-950 font-black">${this.getCurrentRouteName()}</span>
                        </div>

                        <div class="flex items-center gap-4">
                            <button class="relative text-slate-500 hover:text-[#032840] transition-colors">
                                <i data-lucide="bell" class="w-5 h-5"></i>
                                <span class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                        </div>
                    </header>

                    <!-- Real View Content -->
                    <div id="view-mount" class="animate-fade-in">
                        ${content}
                    </div>

                    <footer class="mt-12 py-8 border-t border-slate-200 text-center">
                        <p class="text-slate-500 text-xs font-bold">© 2026 UNICATÓLICA • Sistema de Gestión Académica</p>
                    </footer>
                </main>
            </div>
        `;
    },

    navItem(path, icon, label) {
        const isActive = window.location.hash === '#' + path || (path === '/' && window.location.hash === '');
        return `
            <a href="#${path}" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive ? 'bg-[#fab720] text-[#032840] shadow-lg shadow-[#fab720]/20' : 'text-slate-200/60 hover:text-white hover:bg-white/5'}">
                <i data-lucide="${icon}" class="w-5 h-5 ${isActive ? 'text-[#032840]' : 'text-slate-400 group-hover:text-[#fab720]'}"></i>
                <span class="font-bold text-sm tracking-tight">${label}</span>
                ${isActive ? '<i data-lucide="chevron-right" class="w-4 h-4 ml-auto text-[#032840]/40"></i>' : ''}
            </a>
        `;
    },

    getCurrentRouteName() {
        const hash = window.location.hash || '#/';
        const routes = {
            '#/': 'Resumen General',
            '#/student': 'Mi Perfil Académico',
            '#/teacher': 'Gestión de Cursos',
            '#/director': 'Analítica SIS',
            '#/registro': 'Registro Académico',
            '#/financial': 'Módulo Financiero',
            '#/admin': 'Consola de Administración',
            '#/change-password': 'Seguridad'
        };
        return routes[hash] || 'Plataforma';
    },

    getUserDashboardPath() {
        const user = Auth.getUser();
        if (!user) return '/';
        const map = {
            'estudiante': '/dashboard',
            'docente': '/teacher',
            'director': '/director',
            'decano': '/director',
            'registro': '/registro',
            'financiero': '/financial',
            'admin': '/admin'
        };
        return map[user.rol] || '/';
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    Router.init({
        '/': 'login',
        '/login': 'login',
        '/dashboard': 'student-dashboard',
        '/profile': 'profile',
        '/student': 'student',
        '/teacher': 'teacher',
        '/director': 'director',
        '/registro': 'registro',
        '/financial': 'financial',
        '/admin': 'admin',
        '/change-password': 'change-password'
    });
});
