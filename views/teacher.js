/**
 * Premium Teacher Views - Dual Module Architecture
 * Separates Analytics (Dashboard) from Management (My Courses)
 */

// Objeto base compartido para estado y funciones comunes
const TeacherBase = {
    state: {
        courses: [],
        analytics: { stats: {}, riskList: [], overviewList: [] },
        selectedCourse: null,
        selectedNRC: null,
        students: [],
        tempGrades: {},
        tempAttendance: {}
    },

    async loadData() {
        try {
            const [courses, analytics] = await Promise.all([
                API.get('/teachers/my-courses'),
                API.get('/teachers/dashboard-analytics')
            ]);
            this.state.courses = courses;
            this.state.analytics = analytics;
        } catch (e) {
            console.error('Error loading data', e);
        }
    },

    closeModal() {
        const modal = document.getElementById('grades-modal');
        if (modal) modal.classList.add('hidden');
        this.state.tempGrades = {};
        this.state.tempAttendance = {};
    }
};

// VISTA 1: DASHBOARD ANALÍTICO
Views['teacher-dashboard'] = {
    ...TeacherBase,

    async render() {
        await this.loadData();
        const stats = this.state.analytics.stats || { totalStudents: 0, atRiskCount: 0, averageGlobal: '0.0' };
        const hasRisk = this.state.analytics.riskList && this.state.analytics.riskList.length > 0;
        const displayList = hasRisk ? this.state.analytics.riskList : (this.state.analytics.overviewList || []);

        return `
            <div class="space-y-10 animate-fade-in pb-20">
                <section>
                    <h2 class="text-4xl font-extrabold text-slate-900 tracking-tight">Centro de Analítica</h2>
                    <p class="text-slate-500 mt-1">Seguimiento preventivo y alertas de rendimiento académico en tiempo real.</p>
                </section>

                <!-- KPI Metrics -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="card-premium bg-white p-8 border-l-4 border-indigo-600">
                        <div class="flex justify-between items-start mb-4">
                            <div class="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><i data-lucide="users" class="w-6 h-6"></i></div>
                        </div>
                        <div class="text-3xl font-black text-slate-900">${stats.totalStudents}</div>
                        <div class="text-xs font-bold text-slate-400 uppercase tracking-widest">Estudiantes Totales</div>
                    </div>
                    <div class="card-premium bg-white p-8 border-l-4 ${stats.atRiskCount > 0 ? 'border-rose-600' : 'border-emerald-600'}">
                        <div class="flex justify-between items-start mb-4">
                            <div class="p-3 ${stats.atRiskCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'} rounded-2xl"><i data-lucide="alert-triangle" class="w-6 h-6"></i></div>
                        </div>
                        <div class="text-3xl font-black text-slate-900">${stats.atRiskCount}</div>
                        <div class="text-xs font-bold text-slate-400 uppercase tracking-widest">Alertas de Riesgo</div>
                    </div>
                    <div class="card-premium bg-white p-8 border-l-4 border-indigo-600">
                        <div class="flex justify-between items-start mb-4">
                            <div class="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><i data-lucide="trending-up" class="w-6 h-6"></i></div>
                        </div>
                        <div class="text-3xl font-black text-slate-900">${stats.averageGlobal}</div>
                        <div class="text-xs font-bold text-slate-400 uppercase tracking-widest">Promedio General</div>
                    </div>
                </div>

                <!-- Tabla Dinámica: Riesgo o Rendimiento General -->
                <section class="card-premium bg-white p-8 border-none shadow-xl shadow-slate-100 ring-1 ring-slate-100">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h3 class="text-xl font-black text-slate-900">
                                ${hasRisk ? 'Alertas de Seguimiento Crítico' : 'Reporte de Rendimiento General'}
                            </h3>
                            <p class="text-xs ${hasRisk ? 'text-rose-500' : 'text-emerald-500'} font-bold uppercase tracking-widest mt-1">
                                ${hasRisk ? 'Estudiantes que requieren intervención inmediata' : 'Resumen de actividad y notas actuales'}
                            </p>
                        </div>
                        ${!hasRisk ? '<span class="badge badge-success">¡Todo en orden!</span>' : ''}
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead>
                                <tr class="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <th class="pb-4">Estudiante</th>
                                    <th class="pb-4">Asignatura / NRC</th>
                                    <th class="pb-4">Estado / Motivo</th>
                                    <th class="pb-4 text-center">Promedio</th>
                                    <th class="pb-4 text-center">Fallas</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-50">
                                ${displayList.map(r => `
                                    <tr class="hover:bg-slate-50/50 transition-colors">
                                        <td class="py-4">
                                            <div class="flex items-center gap-3">
                                                <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">${r.name[0]}</div>
                                                <div>
                                                    <div class="text-sm font-bold text-slate-900">${r.name}</div>
                                                    <div class="text-[10px] text-slate-400 font-medium">${r.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="py-4">
                                            <div class="text-xs font-bold text-slate-700">${r.subject}</div>
                                            <div class="text-[10px] text-slate-400">NRC: ${r.nrc}</div>
                                        </td>
                                        <td class="py-4">
                                            <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight 
                                                ${r.level === 'critical' ? 'bg-rose-50 text-rose-600' : 
                                                  r.level === 'warning' ? 'bg-amber-50 text-amber-600' : 
                                                  'bg-emerald-50 text-emerald-600'}">
                                                ${r.reason}
                                            </span>
                                        </td>
                                        <td class="py-4 text-center">
                                            <span class="text-sm font-black ${parseFloat(r.avg) < 3 ? 'text-rose-600' : 'text-slate-900'}">${r.avg}</span>
                                        </td>
                                        <td class="py-4 text-center">
                                            <span class="text-sm font-black ${r.absences >= 3 ? 'text-rose-600' : 'text-slate-900'}">${r.absences}</span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        ${displayList.length === 0 ? '<div class="py-10 text-center text-slate-400 italic">No se encontraron datos registrados.</div>' : ''}
                    </div>
                </section>
            </div>
        `;
    }
};

// VISTA 2: MIS CURSOS (GESTIÓN TRADICIONAL)
Views.teacher = {
    ...TeacherBase,

    async render() {
        await this.loadData();

        return `
            <div class="space-y-10 animate-fade-in pb-20">
                <section class="flex justify-between items-center">
                    <div>
                        <h2 class="text-4xl font-extrabold text-slate-900 tracking-tight">Mis Asignaturas</h2>
                        <p class="text-slate-500 mt-1">Gestión directa de calificaciones y pase de lista.</p>
                    </div>
                    <div class="flex gap-3">
                        <button class="btn-premium btn-ghost" onclick="Views.teacher.triggerImport('grades')">
                            <i data-lucide="upload" class="w-4 h-4 mr-2"></i> Importar Masivo
                        </button>
                    </div>
                    <input type="file" id="bulk-import-input" class="hidden" accept=".csv">
                </section>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${this.renderCourses()}
                </div>

                <!-- Modal de Gestión (Compartido) -->
                <div id="grades-modal" class="hidden fixed inset-0 z-[60] overflow-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div class="bg-white rounded-[32px] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col transform transition-all animate-scale-up">
                        <div class="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div><h3 id="modal-course-title" class="text-2xl font-black text-slate-900">Gestionar</h3><p id="modal-course-subtitle" class="text-sm text-slate-500"></p></div>
                            <button onclick="Views.teacher.closeModal()" class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><i data-lucide="x" class="w-5 h-5 text-slate-600"></i></button>
                        </div>
                        <div class="p-8 overflow-y-auto flex-grow">
                            <table class="w-full text-left"><thead id="modal-table-header" class="border-b border-slate-100"></thead><tbody id="students-list-body" class="divide-y divide-slate-50"></tbody></table>
                        </div>
                        <div class="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button id="btn-print-report" onclick="Views.teacher.downloadCourseReport()" class="btn-premium btn-ghost text-xs font-black hidden"><i data-lucide="printer" class="w-4 h-4 mr-2"></i> Acta Oficial</button>
                            <button onclick="Views.teacher.closeModal()" class="btn-premium btn-ghost text-xs">Cerrar</button>
                            <button id="btn-save-all" class="btn-premium btn-primary px-8 font-black uppercase text-xs tracking-widest">Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderCourses() {
        if (!this.state.courses.length) return '<div class="col-span-full py-20 text-center text-slate-400 font-medium">No se encontraron cursos asignados.</div>';
        return this.state.courses.map(course => `
            <div class="card-premium group">
                <div class="flex items-center justify-between mb-6">
                    <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500"><i data-lucide="book" class="w-6 h-6"></i></div>
                </div>
                <h3 class="text-xl font-black mb-1 text-slate-900">${course.materia}</h3>
                <p class="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">NRC: ${course.nrc}</p>
                <div class="flex items-center gap-6 mb-8 text-slate-700">
                    <div><div class="text-2xl font-black">${course.num_estudiantes}</div><div class="text-[10px] text-slate-500 font-bold uppercase">Alumnos</div></div>
                    <div class="w-px h-8 bg-slate-100"></div>
                    <div><div class="text-sm font-bold text-slate-800">${course.salon}</div><div class="text-[10px] text-slate-500 font-bold uppercase">${course.horario}</div></div>
                </div>
                <div class="flex gap-2">
                    <button onclick="Views.teacher.openCourse(${course.id}, '${course.materia}')" class="btn-premium btn-primary flex-1 py-3 text-xs">Notas</button>
                    <button onclick="Views.teacher.openAttendance(${course.id}, '${course.materia}', '${course.nrc}')" class="btn-premium btn-ghost flex-1 py-3 text-xs">Asistencia</button>
                </div>
            </div>
        `).join('');
    },

    // Funciones de gestión de notas y asistencia
    async openCourse(courseId, courseName) {
        this.state.selectedCourse = courseId;
        const modal = document.getElementById('grades-modal');
        document.getElementById('modal-course-title').innerText = courseName;
        document.getElementById('modal-course-subtitle').innerText = 'Planilla de Calificaciones';
        modal.classList.remove('hidden');
        document.getElementById('btn-print-report').classList.remove('hidden');
        document.getElementById('btn-save-all').onclick = () => this.saveAllGrades();
        
        try {
            const body = document.getElementById('students-list-body');
            body.innerHTML = '<tr><td colspan="5" class="py-10 text-center text-slate-400 italic">Cargando planilla...</td></tr>';
            this.state.students = await API.get(`/teachers/courses/${courseId}/students`);
            this.renderStudents();
        } catch (e) { console.error(e); }
        lucide.createIcons();
    },

    renderStudents() {
        const body = document.getElementById('students-list-body');
        const header = document.getElementById('modal-table-header');
        header.innerHTML = `<tr><th class="pb-4 text-[10px] uppercase font-black text-slate-400">Estudiante</th><th class="text-center text-[10px] uppercase font-black text-slate-400">Parcial 1</th><th class="text-center text-[10px] uppercase font-black text-slate-400">Parcial 2</th><th class="text-center text-[10px] uppercase font-black text-slate-400">Final</th><th class="text-right text-[10px] uppercase font-black text-slate-400">Acción</th></tr>`;
        body.innerHTML = this.state.students.map(s => `
            <tr class="hover:bg-slate-50/50 transition-colors">
                <td class="py-4"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-[10px]">${s.nombres[0]}</div><div><div class="text-sm font-bold text-slate-900">${s.nombres} ${s.apellidos}</div><div class="text-[9px] text-indigo-600 font-black uppercase">${s.institutional_id}</div></div></div></td>
                <td class="text-center"><input type="number" step="0.1" value="${s.grades['Parcial 1'] || s.grades['Corte 1'] || ''}" class="w-12 text-center bg-slate-50 border rounded p-1 text-xs font-bold" onchange="Views.teacher.updateTempGrade(${s.matricula_id}, 'Parcial 1', this.value)"></td>
                <td class="text-center"><input type="number" step="0.1" value="${s.grades['Parcial 2'] || s.grades['Corte 2'] || ''}" class="w-12 text-center bg-slate-50 border rounded p-1 text-xs font-bold" onchange="Views.teacher.updateTempGrade(${s.matricula_id}, 'Parcial 2', this.value)"></td>
                <td class="text-center"><input type="number" step="0.1" value="${s.grades['Examen Final'] || s.grades['Corte 3'] || ''}" class="w-12 text-center bg-slate-50 border rounded p-1 text-xs font-bold" onchange="Views.teacher.updateTempGrade(${s.matricula_id}, 'Examen Final', this.value)"></td>
                <td class="text-right"><button onclick="Views.teacher.saveGrades(${s.matricula_id})" class="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors"><i data-lucide="save" class="w-4 h-4"></i></button></td>
            </tr>
        `).join('');
        lucide.createIcons();
    },

    async openAttendance(courseId, courseName, nrc) {
        this.state.selectedCourse = courseId;
        this.state.selectedNRC = nrc;
        const modal = document.getElementById('grades-modal');
        document.getElementById('modal-course-title').innerText = `Asistencia: ${courseName}`;
        document.getElementById('modal-course-subtitle').innerText = `Pase de lista diario - NRC: ${nrc}`;
        modal.classList.remove('hidden');
        document.getElementById('btn-print-report').classList.add('hidden');
        document.getElementById('btn-save-all').onclick = () => this.saveAllAttendance();

        let datePickerDiv = document.getElementById('attendance-date-picker-div');
        if (!datePickerDiv) {
            const header = document.querySelector('#grades-modal .p-8.border-b');
            datePickerDiv = document.createElement('div');
            datePickerDiv.id = 'attendance-date-picker-div';
            datePickerDiv.className = 'mt-4';
            datePickerDiv.innerHTML = `<input type="date" id="attendance-date-picker" value="${new Date().toISOString().split('T')[0]}" onchange="Views.teacher.refreshAttendanceList()" class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm font-bold text-indigo-600 outline-none">`;
            header.appendChild(datePickerDiv);
        } else datePickerDiv.classList.remove('hidden');

        try {
            this.state.students = await API.get(`/teachers/courses/${courseId}/students`);
            await this.refreshAttendanceList();
        } catch (e) { console.error(e); }
        lucide.createIcons();
    },

    async refreshAttendanceList() {
        const date = document.getElementById('attendance-date-picker').value;
        const res = await API.get(`/teachers/courses/${this.state.selectedCourse}/attendance?date=${date}`);
        const map = {};
        res.forEach(a => map[a.student_id] = a.status);
        
        const body = document.getElementById('students-list-body');
        const header = document.getElementById('modal-table-header');
        header.innerHTML = `<tr><th class="pb-4 text-[10px] uppercase font-black text-slate-400">Estudiante</th><th class="text-center text-[10px] uppercase font-black text-slate-400">Estado de Asistencia</th><th class="text-right text-[10px] uppercase font-black text-slate-400">Acción</th></tr>`;
        
        body.innerHTML = this.state.students.map(s => {
            const status = map[s.institutional_id] || 'presente';
            this.state.tempAttendance[s.institutional_id] = status;
            return `
                <tr class="hover:bg-slate-50/50 transition-colors">
                    <td class="py-4"><div><div class="text-sm font-bold text-slate-900">${s.nombres} ${s.apellidos}</div><div class="text-[9px] text-indigo-600 font-black">${s.institutional_id}</div></div></td>
                    <td class="text-center">
                        <div class="inline-flex bg-slate-100 p-1 rounded-xl gap-1">
                            <button onclick="Views.teacher.markTempStatus('${s.institutional_id}', 'presente')" class="px-4 py-1.5 rounded-lg text-[9px] font-black transition-all ${status === 'presente' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}">P</button>
                            <button onclick="Views.teacher.markTempStatus('${s.institutional_id}', 'ausente_no_justificada')" class="px-4 py-1.5 rounded-lg text-[9px] font-black transition-all ${status === 'ausente_no_justificada' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}">A</button>
                            <button onclick="Views.teacher.markTempStatus('${s.institutional_id}', 'ausente_justificada')" class="px-4 py-1.5 rounded-lg text-[9px] font-black transition-all ${status === 'ausente_justificada' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400'}">J</button>
                        </div>
                    </td>
                    <td class="text-right"><button onclick="Views.teacher.saveSingleAttendance('${s.institutional_id}')" class="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg"><i data-lucide="check-circle" class="w-5 h-5"></i></button></td>
                </tr>
            `;
        }).join('');
        lucide.createIcons();
    },

    // Auxiliares
    updateTempGrade(mId, comp, val) { this.state.tempGrades[mId] = this.state.tempGrades[mId] || {}; this.state.tempGrades[mId][comp] = val; },
    markTempStatus(sId, status) { this.state.tempAttendance[sId] = status; this.refreshAttendanceList(); },
    async saveGrades(mId) { const grades = this.state.tempGrades[mId]; if (!grades) return Toast.show('Sin cambios', 'info'); for (const [c, v] of Object.entries(grades)) await API.post('/teachers/update-grade', { matricula_id: mId, componente: c, valor: v }); Toast.show('Nota guardada', 'success'); delete this.state.tempGrades[mId]; },
    async saveAllGrades() { const ps = []; for (const [mId, g] of Object.entries(this.state.tempGrades)) for (const [c, v] of Object.entries(g)) ps.push(API.post('/teachers/update-grade', { matricula_id: mId, componente: c, valor: v })); if (ps.length) { await Promise.all(ps); Toast.show('Todo guardado', 'success'); this.closeModal(); } },
    async saveAllAttendance() { const date = document.getElementById('attendance-date-picker').value; const data = this.state.students.map(s => ({ nrc: this.state.selectedNRC, student_id: s.institutional_id, status: this.state.tempAttendance[s.institutional_id], date })); await API.post('/teachers/import-attendance', { data }); Toast.show('Asistencia guardada', 'success'); this.closeModal(); },
    async saveSingleAttendance(sId) { const date = document.getElementById('attendance-date-picker').value; await API.post('/teachers/import-attendance', { data: [{ nrc: this.state.selectedNRC, student_id: sId, status: this.state.tempAttendance[sId], date }] }); Toast.show('Guardado', 'success'); },
    triggerImport(type) { const input = document.getElementById('bulk-import-input'); input.onchange = async (e) => { const file = e.target.files[0]; const text = await file.text(); const lines = text.split('\n').filter(l => l.trim()); const hs = lines[0].split(',').map(h => h.trim().toLowerCase()); const rows = lines.slice(1).map(l => { const vs = l.split(','); const o = {}; hs.forEach((h, i) => o[h] = vs[i].trim()); return o; }); const ep = type === 'grades' ? '/teachers/import-grades' : '/teachers/import-attendance'; await API.post(ep, { data: rows }); Toast.show('Importación exitosa', 'success'); this.render(); }; input.click(); },
    async downloadCourseReport() { 
        const course = this.state.courses.find(c => c.id === this.state.selectedCourse);
        const win = window.open('', '_blank');
        win.document.write(`<html><head><title>Acta</title><script src="https://cdn.tailwindcss.com"></script><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet"><style>body{font-family:'Inter',sans-serif;}</style></head><body class="p-10"><div class="max-w-4xl mx-auto border-4 border-slate-900 p-10"><div class="flex justify-between items-start mb-10 border-b-2 border-slate-900 pb-6"><h1 class="text-4xl font-black uppercase leading-none">Acta Oficial<br>de Notas</h1><div class="text-right text-xs font-black uppercase tracking-widest"><p>UNICATÓLICA</p><p>Gestión Académica</p></div></div><div class="grid grid-cols-2 gap-10 mb-10 text-sm font-bold uppercase tracking-tighter"><div><p class="text-slate-400">Materia:</p><p class="text-xl font-black">${course.materia}</p></div><div><p class="text-slate-400">NRC:</p><p class="text-xl font-black">${course.nrc}</p></div></div><table class="w-full text-left mb-10"><thead><tr class="bg-slate-900 text-white text-[10px] font-black uppercase"><th class="p-3">ID</th><th class="p-3">Estudiante</th><th class="p-3 text-center">Definitiva</th></tr></thead><tbody>${this.state.students.map(s => `<tr><td class="p-3 border-b border-slate-100 font-mono text-xs">${s.institutional_id}</td><td class="p-3 border-b border-slate-100 font-black">${s.nombres} ${s.apellidos}</td><td class="p-3 border-b border-slate-100 text-center font-black text-lg">${((parseFloat(s.grades['Parcial 1']||s.grades['Corte 1']||0)*0.3)+(parseFloat(s.grades['Parcial 2']||s.grades['Corte 2']||0)*0.3)+(parseFloat(s.grades['Examen Final']||s.grades['Corte 3']||0)*0.4)).toFixed(2)}</td></tr>`).join('')}</tbody></table><div class="mt-20 border-t border-slate-900 pt-4 w-64"><p class="text-[10px] font-black uppercase">Firma del Docente</p></div><button onclick="window.print()" class="no-print mt-10 bg-black text-white px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform">Imprimir Acta Oficial</button></div></body></html>`);
        win.document.close();
    }
};
