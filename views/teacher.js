/**
 * Premium Teacher Views - Dual Module Architecture
 * Separates Analytics (Dashboard) from Management (My Courses)
 */

// Objeto base compartido para estado y funciones comunes
const TeacherBase = {
    state: {
        courses: [],
        analytics: { stats: {}, riskList: [] },
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
        document.getElementById('grades-modal').classList.add('hidden');
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

        return `
            <div class="space-y-10 animate-fade-in pb-20">
                <section>
                    <h2 class="text-4xl font-extrabold text-slate-900 tracking-tight">Centro de Analítica</h2>
                    <p class="text-slate-500 mt-1">Seguimiento preventivo y alertas de rendimiento académico.</p>
                </section>

                <!-- KPI Metrics -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="card-premium bg-white p-8 border-l-4 border-indigo-600">
                        <div class="text-3xl font-black text-slate-900">${stats.totalStudents}</div>
                        <div class="text-xs font-bold text-slate-400 uppercase tracking-widest">Estudiantes Totales</div>
                    </div>
                    <div class="card-premium bg-white p-8 border-l-4 ${stats.atRiskCount > 0 ? 'border-rose-600' : 'border-emerald-600'}">
                        <div class="text-3xl font-black text-slate-900">${stats.atRiskCount}</div>
                        <div class="text-xs font-bold text-slate-400 uppercase tracking-widest">Estudiantes en Riesgo</div>
                    </div>
                    <div class="card-premium bg-white p-8 border-l-4 border-indigo-600">
                        <div class="text-3xl font-black text-slate-900">${stats.averageGlobal}</div>
                        <div class="text-xs font-bold text-slate-400 uppercase tracking-widest">Promedio General</div>
                    </div>
                </div>

                <!-- Tabla de Riesgo -->
                <section class="card-premium bg-white p-8 border-none shadow-xl shadow-slate-100 ring-1 ring-slate-100">
                    <div class="mb-8">
                        <h3 class="text-xl font-black text-slate-900">Alertas de Seguimiento</h3>
                        <p class="text-xs text-rose-500 font-bold uppercase tracking-widest mt-1">Regla institucional: >3 inasistencias o promedio < 3.0</p>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead>
                                <tr class="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <th class="pb-4">Estudiante</th>
                                    <th class="pb-4">Asignatura</th>
                                    <th class="pb-4">Motivo Alerta</th>
                                    <th class="pb-4 text-center">Definitiva</th>
                                    <th class="pb-4 text-center">Fallas</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-50">
                                ${this.state.analytics.riskList.map(r => `
                                    <tr class="hover:bg-slate-50 transition-colors">
                                        <td class="py-4 font-bold text-sm text-slate-900">${r.name}</td>
                                        <td class="py-4 text-xs text-slate-500">${r.subject}</td>
                                        <td class="py-4">
                                            <span class="px-2 py-1 rounded-full text-[9px] font-black uppercase ${r.level === 'critical' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}">
                                                ${r.reason}
                                            </span>
                                        </td>
                                        <td class="py-4 text-center font-black">${r.avg}</td>
                                        <td class="py-4 text-center font-black text-rose-500">${r.absences}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
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
                        <p class="text-slate-500 mt-1">Gestión de calificaciones y asistencia por curso.</p>
                    </div>
                    <button class="btn-premium btn-ghost" onclick="Views.teacher.triggerImport('grades')">
                        <i data-lucide="upload" class="w-4 h-4"></i> Importar Masivo
                    </button>
                    <input type="file" id="bulk-import-input" class="hidden" accept=".csv">
                </section>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${this.renderCourses()}
                </div>

                <!-- Modal de Gestión (Compartido) -->
                <div id="grades-modal" class="hidden fixed inset-0 z-[60] overflow-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div class="bg-white rounded-[32px] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col transform transition-all animate-scale-up">
                        <div class="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 id="modal-course-title" class="text-2xl font-black text-slate-900">Gestionar Curso</h3>
                                <p id="modal-course-subtitle" class="text-sm text-slate-500"></p>
                            </div>
                            <button onclick="Views.teacher.closeModal()" class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                <i data-lucide="x" class="w-5 h-5"></i>
                            </button>
                        </div>
                        <div class="p-8 overflow-y-auto flex-grow">
                            <table class="w-full text-left">
                                <thead id="modal-table-header" class="border-b border-slate-100"></thead>
                                <tbody id="students-list-body" class="divide-y divide-slate-50"></tbody>
                            </table>
                        </div>
                        <div id="modal-footer" class="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button id="btn-print-report" onclick="Views.teacher.downloadCourseReport()" class="btn-premium btn-ghost text-xs font-black hidden">
                                <i data-lucide="printer" class="w-4 h-4 mr-2"></i> Generar Acta
                            </button>
                            <button onclick="Views.teacher.closeModal()" class="btn-premium btn-ghost text-xs">Cerrar</button>
                            <button id="btn-save-all" class="btn-premium btn-primary px-8 font-black uppercase text-xs">Guardar Todo</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderCourses() {
        return this.state.courses.map(course => `
            <div class="card-premium group">
                <div class="flex items-center justify-between mb-6">
                    <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <i data-lucide="book" class="w-6 h-6"></i>
                    </div>
                </div>
                <h3 class="text-xl font-black mb-1 text-slate-900">${course.materia}</h3>
                <p class="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">NRC: ${course.nrc}</p>
                
                <div class="flex items-center gap-6 mb-8">
                    <div><div class="text-2xl font-black">${course.num_estudiantes}</div><div class="text-[10px] text-slate-500 uppercase">Alumnos</div></div>
                    <div class="w-px h-8 bg-slate-100"></div>
                    <div><div class="text-sm font-bold text-slate-800">${course.salon}</div><div class="text-[10px] text-slate-500 uppercase">${course.horario}</div></div>
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
        modal.classList.remove('hidden');
        document.getElementById('btn-print-report').classList.remove('hidden');
        document.getElementById('btn-save-all').onclick = () => this.saveAllGrades();
        
        try {
            this.state.students = await API.get(`/teachers/courses/${courseId}/students`);
            this.renderStudents();
        } catch (e) { console.error(e); }
        lucide.createIcons();
    },

    renderStudents() {
        const body = document.getElementById('students-list-body');
        const header = document.getElementById('modal-table-header');
        header.innerHTML = `<tr><th class="pb-4 text-[10px] uppercase font-black">Estudiante</th><th class="text-center text-[10px] uppercase font-black">C1</th><th class="text-center text-[10px] uppercase font-black">C2</th><th class="text-center text-[10px] uppercase font-black">C3</th><th class="text-right text-[10px] uppercase font-black"></th></tr>`;
        body.innerHTML = this.state.students.map(s => `
            <tr>
                <td class="py-4"><div><div class="text-sm font-bold">${s.nombres} ${s.apellidos}</div><div class="text-[9px] text-indigo-600 font-black">${s.institutional_id}</div></div></td>
                <td class="text-center"><input type="number" step="0.1" value="${s.grades['Corte 1'] || ''}" class="w-12 text-center border rounded p-1 text-xs" onchange="Views.teacher.updateTempGrade(${s.matricula_id}, 'Corte 1', this.value)"></td>
                <td class="text-center"><input type="number" step="0.1" value="${s.grades['Corte 2'] || ''}" class="w-12 text-center border rounded p-1 text-xs" onchange="Views.teacher.updateTempGrade(${s.matricula_id}, 'Corte 2', this.value)"></td>
                <td class="text-center"><input type="number" step="0.1" value="${s.grades['Corte 3'] || ''}" class="w-12 text-center border rounded p-1 text-xs" onchange="Views.teacher.updateTempGrade(${s.matricula_id}, 'Corte 3', this.value)"></td>
                <td class="text-right"><button onclick="Views.teacher.saveGrades(${s.matricula_id})" class="text-emerald-600"><i data-lucide="save" class="w-4 h-4"></i></button></td>
            </tr>
        `).join('');
        lucide.createIcons();
    },

    async openAttendance(courseId, courseName, nrc) {
        this.state.selectedCourse = courseId;
        this.state.selectedNRC = nrc;
        const modal = document.getElementById('grades-modal');
        document.getElementById('modal-course-title').innerText = `Asistencia: ${courseName}`;
        modal.classList.remove('hidden');
        document.getElementById('btn-print-report').classList.add('hidden');
        document.getElementById('btn-save-all').onclick = () => this.saveAllAttendance();

        let datePickerDiv = document.getElementById('attendance-date-picker-div');
        if (!datePickerDiv) {
            const header = document.querySelector('#grades-modal .p-8.border-b');
            datePickerDiv = document.createElement('div');
            datePickerDiv.id = 'attendance-date-picker-div';
            datePickerDiv.className = 'mt-4';
            datePickerDiv.innerHTML = `<input type="date" id="attendance-date-picker" value="${new Date().toISOString().split('T')[0]}" onchange="Views.teacher.refreshAttendanceList()" class="bg-slate-50 border rounded-lg px-3 py-1 text-sm">`;
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
        header.innerHTML = `<tr><th class="pb-4 text-[10px] uppercase font-black">Estudiante</th><th class="text-center text-[10px] uppercase font-black">Estado</th><th class="text-right text-[10px] uppercase font-black"></th></tr>`;
        
        body.innerHTML = this.state.students.map(s => {
            const status = map[s.institutional_id] || 'presente';
            this.state.tempAttendance[s.institutional_id] = status;
            return `
                <tr>
                    <td class="py-4"><div><div class="text-sm font-bold">${s.nombres}</div><div class="text-[9px] text-indigo-600 font-black">${s.institutional_id}</div></div></td>
                    <td class="text-center">
                        <div class="inline-flex bg-slate-100 p-1 rounded-xl gap-1">
                            <button onclick="Views.teacher.markTempStatus('${s.institutional_id}', 'presente')" class="px-3 py-1 rounded-lg text-[9px] font-black ${status === 'presente' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}">P</button>
                            <button onclick="Views.teacher.markTempStatus('${s.institutional_id}', 'ausente_no_justificada')" class="px-3 py-1 rounded-lg text-[9px] font-black ${status === 'ausente_no_justificada' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}">A</button>
                            <button onclick="Views.teacher.markTempStatus('${s.institutional_id}', 'ausente_justificada')" class="px-3 py-1 rounded-lg text-[9px] font-black ${status === 'ausente_justificada' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400'}">J</button>
                        </div>
                    </td>
                    <td class="text-right"><button onclick="Views.teacher.saveSingleAttendance('${s.institutional_id}')" class="text-indigo-600"><i data-lucide="check-circle" class="w-4 h-4"></i></button></td>
                </tr>
            `;
        }).join('');
        lucide.createIcons();
    },

    // Funciones auxiliares heredadas
    updateTempGrade(mId, comp, val) { this.state.tempGrades[mId] = this.state.tempGrades[mId] || {}; this.state.tempGrades[mId][comp] = val; },
    markTempStatus(sId, status) { this.state.tempAttendance[sId] = status; this.refreshAttendanceList(); },
    async saveGrades(mId) { const grades = this.state.tempGrades[mId]; if (!grades) return; for (const [c, v] of Object.entries(grades)) await API.post('/teachers/update-grade', { matricula_id: mId, componente: c, valor: v }); Toast.show('Nota guardada', 'success'); },
    async saveAllGrades() { for (const [mId, g] of Object.entries(this.state.tempGrades)) for (const [c, v] of Object.entries(g)) await API.post('/teachers/update-grade', { matricula_id: mId, componente: c, valor: v }); Toast.show('Todo guardado', 'success'); this.closeModal(); },
    async saveAllAttendance() { const date = document.getElementById('attendance-date-picker').value; const data = this.state.students.map(s => ({ nrc: this.state.selectedNRC, student_id: s.institutional_id, status: this.state.tempAttendance[s.institutional_id], date })); await API.post('/teachers/import-attendance', { data }); Toast.show('Asistencia guardada', 'success'); this.closeModal(); },
    async saveSingleAttendance(sId) { const date = document.getElementById('attendance-date-picker').value; await API.post('/teachers/import-attendance', { data: [{ nrc: this.state.selectedNRC, student_id: sId, status: this.state.tempAttendance[sId], date }] }); Toast.show('Guardado', 'success'); },
    triggerImport(type) { const input = document.getElementById('bulk-import-input'); input.onchange = async (e) => { const file = e.target.files[0]; const text = await file.text(); const lines = text.split('\n').filter(l => l.trim()); const headers = lines[0].split(',').map(h => h.trim().toLowerCase()); const rows = lines.slice(1).map(l => { const vals = l.split(','); const obj = {}; headers.forEach((h, i) => obj[h] = vals[i].trim()); return obj; }); const endpoint = type === 'grades' ? '/teachers/import-grades' : '/teachers/import-attendance'; await API.post(endpoint, { data: rows }); Toast.show('Importación exitosa', 'success'); this.render(); }; input.click(); },
    async downloadCourseReport() { 
        const course = this.state.courses.find(c => c.id === this.state.selectedCourse);
        const win = window.open('', '_blank');
        win.document.write(`<html><head><title>Acta</title><script src="https://cdn.tailwindcss.com"></script></head><body><div class="p-10"><h1 class="text-2xl font-black mb-4 uppercase">Acta Oficial de Notas</h1><p class="mb-8 font-bold">NRC: ${course.nrc} | Materia: ${course.materia}</p><table class="w-full border-collapse border border-slate-200"><thead><tr class="bg-slate-50"><th class="border p-2 text-xs">ID</th><th class="border p-2 text-xs">Estudiante</th><th class="border p-2 text-xs">Promedio</th></tr></thead><tbody>${this.state.students.map(s => `<tr><td class="border p-2 text-xs font-mono">${s.institutional_id}</td><td class="border p-2 text-xs font-bold">${s.nombres} ${s.apellidos}</td><td class="border p-2 text-xs text-center">${((parseFloat(s.grades['Corte 1']||0)*0.3)+(parseFloat(s.grades['Corte 2']||0)*0.3)+(parseFloat(s.grades['Corte 3']||0)*0.4)).toFixed(2)}</td></tr>`).join('')}</tbody></table><button onclick="window.print()" class="mt-10 bg-black text-white px-6 py-2 rounded font-bold uppercase text-[10px]">Imprimir Acta</button></div></body></html>`);
        win.document.close();
    }
};
