/**
 * Premium App Shell Redesign
 * Enterprise grade navigation and layout architecture
 */
// Views container is initialized in index.html to prevent Module Hoisting conflicts

import './api.js?v=19';
import './auth.js?v=18';
import './router.js?v=18';

// Views
import '../views/login.js';
import '../views/student-dashboard.js?v=18';
import '../views/enrollment.js';
import '../views/profile.js';
import '../views/student.js';
import '../views/teacher.js';
import '../views/director.js';
import '../views/director-attendance.js';
import '../views/director-evaluations.js';
import '../views/financial.js';
import '../views/registro.js';
import '../views/salones.js';
import '../views/requests.js';
import '../views/admin.js?v=18';
import '../views/change-password.js';
import '../views/reset-password.js';

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
                        ${user.rol === 'estudiante' ? this.navItem('/enrollment', 'plus-circle', 'Inscripciones') : ''}
                        ${user.rol === 'estudiante' ? this.navItem('/student', 'book-open', 'Mi Academia') : ''}
                        ${user.rol === 'docente' ? this.navItem('/teacher', 'presentation', 'Mis Cursos') : ''}
                        ${user.rol === 'docente' ? this.navItem('/teacher-services', 'briefcase', 'Servicios Docente') : ''}
                        ${user.rol === 'director' || user.rol === 'decano' ? this.navItem('/director', 'bar-chart-3', 'Métricas SIS') : ''}
                        ${user.rol === 'director' || user.rol === 'decano' ? this.navItem('/director-asistencia', 'clipboard-check', 'Asistencias') : ''}
                        ${user.rol === 'director' || user.rol === 'decano' ? this.navItem('/director-evaluations', 'star', 'Evaluación Docente') : ''}
                        ${user.rol === 'registro' ? `
                            ${this.navItem('/registro', 'users', 'Gestión Usuarios')}
                            ${this.navItem('/registro-solicitudes', 'clipboard-list', 'Solicitudes')}
                            <button onclick="
                                const menu = document.getElementById('submenu-cursos');
                                const chevron = document.getElementById('cursos-chevron');
                                if (menu.style.maxHeight && menu.style.maxHeight !== '0px') {
                                    menu.style.maxHeight = '0px';
                                    menu.style.opacity = '0';
                                    menu.style.marginTop = '0';
                                    chevron.style.transform = 'rotate(0deg)';
                                } else {
                                    menu.style.maxHeight = menu.scrollHeight + 'px';
                                    menu.style.opacity = '1';
                                    menu.style.marginTop = '4px';
                                    chevron.style.transform = 'rotate(180deg)';
                                }
                            " class="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${(window.location.hash === '#/registro-cursos' || window.location.hash === '#/registro-inscripcion') ? 'bg-[#fab720] text-[#032840] shadow-lg shadow-[#fab720]/20' : 'text-slate-200/60 hover:text-white hover:bg-white/5'}">
                                <div class="flex items-center gap-3">
                                    <i data-lucide="book-open" class="w-5 h-5 ${(window.location.hash === '#/registro-cursos' || window.location.hash === '#/registro-inscripcion') ? 'text-[#032840]' : 'text-slate-400 group-hover:text-[#fab720]'}"></i>
                                    <span class="font-bold text-sm tracking-tight">Cursos</span>
                                </div>
                                <i id="cursos-chevron" data-lucide="chevron-down" class="w-4 h-4 transition-transform duration-300 ${(window.location.hash === '#/registro-cursos' || window.location.hash === '#/registro-inscripcion') ? 'text-[#032840]/40' : 'text-slate-500 group-hover:text-slate-400'}" style="transform: ${(window.location.hash === '#/registro-cursos' || window.location.hash === '#/registro-inscripcion') ? 'rotate(180deg)' : 'rotate(0deg)'};"></i>
                            </button>
                            <div id="submenu-cursos" class="pl-4 space-y-1 border-l border-slate-700/50 ml-6 overflow-hidden transition-all duration-300" style="${(window.location.hash === '#/registro-cursos' || window.location.hash === '#/registro-inscripcion') ? 'max-height: 500px; opacity: 1; margin-top: 4px;' : 'max-height: 0px; opacity: 0; margin-top: 0;'}">
                                ${this.navSubItem('/registro-cursos', 'settings', 'Mantenimiento de Cursos')}
                                ${this.navSubItem('/registro-inscripcion', 'user-plus', 'Inscripción Estudiantes')}
                            </div>
                            ${this.navItem('/salones', 'map', 'Sedes y Salones')}
                        ` : ''}
                        ${user.rol === 'financiero' ? this.navItem('/financial', 'wallet', 'Cartera') : ''}
                        ${user.rol === 'admin' ? this.navItem('/admin', 'shield-check', 'Admin Usuarios') : ''}
                        
                        <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-8 mb-4 px-4">Operaciones</div>
                        ${(user.rol === 'estudiante' || user.rol === 'docente') ? this.navItem('/profile', 'user-circle', 'Mi Perfil') : ''}
                        ${user.rol === 'estudiante' ? this.navItem('/requests', 'clipboard-list', 'Mis Solicitudes') : ''}
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
        const isActive = window.location.hash === '#' + path || 
            (path === '/' && window.location.hash === '') ||
            (path === '/registro-cursos' && window.location.hash === '#/registro-inscripcion');
        return `
            <a href="#${path}" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive ? 'bg-[#fab720] text-[#032840] shadow-lg shadow-[#fab720]/20' : 'text-slate-200/60 hover:text-white hover:bg-white/5'}">
                <i data-lucide="${icon}" class="w-5 h-5 ${isActive ? 'text-[#032840]' : 'text-slate-400 group-hover:text-[#fab720]'}"></i>
                <span class="font-bold text-sm tracking-tight">${label}</span>
                ${isActive ? '<i data-lucide="chevron-right" class="w-4 h-4 ml-auto text-[#032840]/40"></i>' : ''}
            </a>
        `;
    },

    navSubItem(path, icon, label) {
        const isActive = window.location.hash === '#' + path;
        return `
            <a href="#${path}" class="flex items-center gap-3 pl-8 pr-4 py-2 rounded-xl transition-all duration-300 group ${isActive ? 'bg-[#fab720]/20 text-[#fab720] border-l-4 border-[#fab720]' : 'text-slate-400/80 hover:text-white hover:bg-white/5'}">
                <i data-lucide="${icon}" class="w-4 h-4 ${isActive ? 'text-[#fab720]' : 'text-slate-400 group-hover:text-[#fab720]'}"></i>
                <span class="font-bold text-xs tracking-tight">${label}</span>
            </a>
        `;
    },

    getCurrentRouteName() {
        const hash = window.location.hash || '#/';
        const routes = {
            '#/': 'Resumen General',
            '#/student': 'Mi Perfil Académico',
            '#/teacher-dashboard': 'Dashboard Analítico',
            '#/teacher-services': 'Centro de Servicios Docente',
            '#/teacher': 'Gestión de Cursos',
            '#/director': 'Analítica SIS',
            '#/director-asistencia': 'Asistencias programa',
            '#/director-evaluations': 'Evaluación Docente',
            '#/registro': 'Gestión de Usuarios',
            '#/registro-solicitudes': 'Solicitudes Académicas',
            '#/registro-cursos': 'Gestión de Cursos',
            '#/registro-inscripcion': 'Inscripción Estudiantes',
            '#/salones': 'Sedes y Salones',
            '#/financial': 'Módulo Financiero',
            '#/admin': 'Admin Usuarios',
            '#/requests': 'Gestión de Solicitudes',
            '#/change-password': 'Seguridad'
        };
        return routes[hash] || 'Plataforma';
    },

    getUserDashboardPath() {
        const user = Auth.getUser();
        if (!user) return '/';
        const map = {
            'estudiante': '/dashboard',
            'docente': '/teacher-dashboard',
            'director': '/director',
            'decano': '/director',
            'registro': '/registro',
            'financiero': '/financial',
            'admin': '/admin'
        };
        return map[user.rol] || '/';
    }
};

window.Layout = Layout;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    Router.init({
        '/': 'login',
        '/login': 'login',
        '/dashboard': 'student-dashboard',
        '/enrollment': 'enrollment',
        '/profile': 'profile',
        '/student': 'student',
        '/teacher-dashboard': 'teacher-dashboard',
        '/teacher-services': 'teacher-services',
        '/teacher': 'teacher',
        '/director': 'director',
        '/director-asistencia': 'director-attendance',
        '/director-evaluations': 'director-evaluations',
        '/registro': 'registro',
        '/registro-solicitudes': 'registro',
        '/registro-cursos': 'registro',
        '/registro-inscripcion': 'registro',
        '/salones': 'salones',
        '/requests': 'requests',
        '/financial': 'financial',
        '/admin': 'admin',
        '/change-password': 'change-password',
        '/reset-password': 'reset-password'
    });
});
