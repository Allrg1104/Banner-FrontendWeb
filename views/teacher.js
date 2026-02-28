/**
 * Premium Teacher Dashboard - Enterprise Architect Standard
 */

Views.teacher = {
    async render() {
        return `
            <div class="space-y-10">
                
                <!-- Header Section -->
                <section class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 class="text-4xl font-extrabold text-slate-900 tracking-tight">Panel Docente</h2>
                        <p class="text-slate-500 mt-1">Gestión integral de cursos, calificaciones y seguimiento grupal.</p>
                    </div>
                    <div class="flex gap-3">
                        <button class="btn-premium btn-ghost">
                            <i data-lucide="download" class="w-4 h-4"></i> Exportar Reportes
                        </button>
                        <button class="btn-premium btn-primary">
                            <i data-lucide="plus" class="w-4 h-4"></i> Nueva Actividad
                        </button>
                    </div>
                </section>

                <!-- Courses Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div class="card-premium group">
                        <div class="flex justify-between items-start mb-6">
                            <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <i data-lucide="calculator" class="w-6 h-6"></i>
                            </div>
                            <span class="badge badge-success">Activo</span>
                        </div>
                        <h3 class="text-xl font-bold mb-1">Cálculo Diferencial</h3>
                        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">CALC101 • Grupo A</p>
                        
                        <div class="flex items-center gap-6 mb-8">
                            <div>
                                <div class="text-2xl font-black">28</div>
                                <div class="text-[10px] text-slate-400 font-bold uppercase">Estudiantes</div>
                            </div>
                            <div class="w-px h-8 bg-slate-100"></div>
                            <div>
                                <div class="text-2xl font-black text-indigo-600">3.4</div>
                                <div class="text-[10px] text-slate-400 font-bold uppercase">Promedio</div>
                            </div>
                        </div>

                        <button onclick="Views.teacher.openCourse('Cálculo Diferencial')" class="btn-premium btn-primary w-full py-3">
                            Gestionar Curso
                        </button>
                    </div>

                    <div class="card-premium group">
                        <div class="flex justify-between items-start mb-6">
                            <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <i data-lucide="code" class="w-6 h-6"></i>
                            </div>
                            <span class="badge badge-success">Activo</span>
                        </div>
                        <h3 class="text-xl font-bold mb-1">Fundamentos de Prog.</h3>
                        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">PROG101 • Grupo B</p>
                        
                        <div class="flex items-center gap-6 mb-8">
                            <div>
                                <div class="text-2xl font-black">24</div>
                                <div class="text-[10px] text-slate-400 font-bold uppercase">Estudiantes</div>
                            </div>
                            <div class="w-px h-8 bg-slate-100"></div>
                            <div>
                                <div class="text-2xl font-black text-indigo-600">3.9</div>
                                <div class="text-[10px] text-slate-400 font-bold uppercase">Promedio</div>
                            </div>
                        </div>

                        <button class="btn-premium btn-primary w-full py-3">
                            Gestionar Curso
                        </button>
                    </div>

                    <div class="card-premium group border-dashed border-slate-200 bg-slate-50/50 shadow-none hover:shadow-none flex flex-col items-center justify-center py-12">
                        <div class="w-16 h-16 rounded-full bg-slate-200/50 flex items-center justify-center mb-4">
                            <i data-lucide="plus" class="w-8 h-8 text-slate-400"></i>
                        </div>
                        <p class="text-slate-400 font-bold text-sm">Solicitar Nuevo Curso</p>
                    </div>
                </div>

                <!-- Recent Activity Section -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="lg:col-span-2 card-premium bg-white">
                        <div class="flex items-center justify-between mb-8">
                            <h3 class="text-2xl font-bold text-slate-900">Seguimiento de Riesgo</h3>
                            <span class="text-xs font-black text-red-500 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full">4 Alertas Críticas</span>
                        </div>
                        <div class="space-y-4">
                            ${[
                { name: 'Carlos Herrera', course: 'Cálculo', risk: 88, status: 'Crítico' },
                { name: 'Valentina García', course: 'Estructuras', risk: 62, status: 'Alto' }
            ].map(alert => `
                                <div class="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                    <div class="flex items-center gap-4">
                                        <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">${alert.name[0]}</div>
                                        <div>
                                            <div class="text-sm font-bold text-slate-900">${alert.name}</div>
                                            <div class="text-[10px] text-slate-400 font-bold uppercase">${alert.course}</div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-sm font-black ${alert.risk > 80 ? 'text-red-600' : 'text-orange-600'}">${alert.risk}% Riesgo</div>
                                        <button class="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline mt-1">Intervenir</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="lg:col-span-1 rounded-[32px] bg-slate-900 p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl">
                         <div class="absolute bottom-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full -mb-24 -mr-24 blur-3xl"></div>
                         <div>
                            <h3 class="text-xl font-bold mb-4">Agenda Semanal</h3>
                            <p class="text-slate-400 text-sm mb-8">Tienes 3 parciales pendientes por calificar esta semana.</p>
                         </div>
                         <div class="space-y-4">
                            <div class="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                                <div class="w-2 h-2 rounded-full bg-indigo-500"></div>
                                <div class="text-sm font-bold">Cierre Corte 2 - Cálculo</div>
                                <div class="text-[10px] text-slate-500 ml-auto">Mañana</div>
                            </div>
                             <div class="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                                <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <div class="text-sm font-bold">Tutoría Individual</div>
                                <div class="text-[10px] text-slate-500 ml-auto">Jue 14:00</div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        `;
    },

    afterRender() {
        lucide.createIcons();
    },

    openCourse(name) {
        Toast.info('Cargando gestión para: ' + name);
    }
};
