/**
 * Premium Director Dashboard - Enterprise Executive Standard
 */

Views.director = {
  async render() {
    try {
        const data = await API.get('/directors/dashboard');
        const programName = data.my_program ? data.my_program.nombre : 'Sin Programa Asignado';
        const students = data.students || [];

        return `
            <div class="space-y-10 animate-fade-in">
                
                <!-- Executive Hero -->
                <section class="relative overflow-hidden rounded-[40px] bg-slate-900 p-12 text-white shadow-3xl">
                    <div class="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent"></div>
                    <div class="relative z-10">
                        <div class="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-400/20">
                            <i data-lucide="shield-check" class="w-3 h-3"></i> Dirección Académica
                        </div>
                        <h2 class="text-5xl font-black mb-6 tracking-tight leading-tight">Métricas <br/> <span class="text-[#fab720]">${programName}</span>.</h2>
                        <p class="text-slate-400 text-lg max-w-2xl">
                            Visualización de desempeño y progreso para los estudiantes inscritos en este programa.
                        </p>
                    </div>
                </section>

                <!-- Students List Section -->
                <div class="card-premium border-slate-200">
                    <div class="flex items-center justify-between mb-8">
                        <h3 class="text-2xl font-bold text-slate-900">Estudiantes del Programa (${students.length})</h3>
                    </div>
                    
                    <div class="table-scroll-container">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100 bg-slate-50/30">
                                    <th class="px-6 py-6 font-black">Estudiante</th>
                                    <th class="px-6 py-6 font-black">Progreso General</th>
                                    <th class="px-6 py-6 font-black text-right">Cursos Inscritos</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 bg-white">
                                ${students.length === 0 ? `
                                    <tr><td colspan="3" class="p-10 text-center text-slate-400 font-bold italic">No hay estudiantes asignados a este programa aún.</td></tr>
                                ` : students.map(st => `
                                    <tr class="hover:bg-slate-50 transition-all">
                                        <td class="px-6 py-6">
                                            <div class="flex flex-col">
                                                <span class="font-bold text-slate-800">${st.nombres} ${st.apellidos}</span>
                                                <span class="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">ID: ${st.codigo || st.id} | Semestre: ${st.semestre_actual}</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-6">
                                            <div class="flex items-center gap-3">
                                                <div class="text-2xl font-black ${st.promedio_acumulado < 3 ? 'text-red-500' : 'text-emerald-500'}">${st.promedio_acumulado.toFixed(1)}</div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-6">
                                            <div class="space-y-3">
                                                ${(st.courses || []).length === 0 ? '<span class="text-xs text-slate-400">Sin cursos registrados</span>' : 
                                                st.courses.map(c => `
                                                    <div class="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                        <div class="flex flex-col">
                                                            <span class="text-xs font-bold text-slate-700">${c.materia}</span>
                                                            <span class="text-[9px] text-indigo-600 uppercase font-black">NRC: ${c.nrc || 'N/A'}</span>
                                                        </div>
                                                        <span class="text-sm font-black ${c.promedio < 3 ? 'text-red-500' : 'text-slate-900'}">${c.promedio.toFixed(1)}</span>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        return `<div class="p-20 text-center text-red-500 font-bold">Error cargando dashboard: ${err.message}</div>`;
    }
  },

  afterRender() {
    lucide.createIcons();
  }
};
