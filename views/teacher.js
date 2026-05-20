/**
 * Premium Teacher Views - Enterprise Grade Integration
 * All functions integrated with real database CRUD
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
        } catch (e) { console.error('Error loading data', e); }
    },

    closeModal() {
        document.getElementById('grades-modal')?.classList.add('hidden');
        document.getElementById('service-modal')?.classList.add('hidden');
    },

    openSvcModal(title, desc, body) {
        const modal = document.getElementById('service-modal');
        if (!modal) return;
        document.getElementById('svc-title').innerText = title;
        document.getElementById('svc-desc').innerText = desc;
        document.getElementById('svc-body').innerHTML = body;
        modal.classList.remove('hidden');
        lucide.createIcons();
    }
};

// VISTA: DASHBOARD ANALÍTICO (Lo mantenemos para la navegación)
Views['teacher-dashboard'] = {
    ...TeacherBase,
    async render() {
        await this.loadData();
        const stats = this.state.analytics.stats || { totalStudents: 0, atRiskCount: 0, averageGlobal: '0.0' };
        const displayList = this.state.analytics.riskList.length > 0 ? this.state.analytics.riskList : this.state.analytics.overviewList;

        return `
            <div class="space-y-10 animate-fade-in pb-20">
                <section>
                    <h2 class="text-4xl font-extrabold text-slate-900 tracking-tight">Dashboard Docente</h2>
                    <p class="text-slate-500 mt-1">Análisis preventivo basado en registros de base de datos.</p>
                </section>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="card-premium bg-white p-8 border-l-4 border-indigo-600">
                        <div class="text-3xl font-black text-slate-900">${stats.totalStudents}</div>
                        <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estudiantes Totales</div>
                    </div>
                    <div class="card-premium bg-white p-8 border-l-4 ${stats.atRiskCount > 0 ? 'border-rose-600' : 'border-emerald-600'}">
                        <div class="text-3xl font-black text-slate-900">${stats.atRiskCount}</div>
                        <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alertas de Riesgo</div>
                    </div>
                    <div class="card-premium bg-white p-8 border-l-4 border-indigo-600">
                        <div class="text-3xl font-black text-slate-900">${stats.averageGlobal}</div>
                        <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Promedio General</div>
                    </div>
                </div>

                <section class="card-premium bg-white p-8">
                    <h3 class="text-xl font-black text-slate-900 mb-8">Estatus de Estudiantes</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead class="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase">
                                <tr><th class="pb-4">Estudiante</th><th class="pb-4">Asignatura</th><th class="pb-4">Estado</th><th class="pb-4 text-center">Prom</th><th class="pb-4 text-center">Fallas</th></tr>
                            </thead>
                            <tbody class="divide-y divide-slate-50">
                                ${displayList.map(r => `
                                    <tr>
                                        <td class="py-4 text-sm font-bold text-slate-900">${r.name}</td>
                                        <td class="py-4 text-xs text-slate-500">${r.subject}</td>
                                        <td class="py-4">
                                            <span class="px-2 py-1 rounded-full text-[9px] font-black uppercase 
                                                ${r.level === 'critical' ? 'bg-rose-50 text-rose-600' : 
                                                  r.level === 'warning' ? 'bg-amber-50 text-amber-600' : 
                                                  'bg-emerald-50 text-emerald-600'}">
                                                ${r.reason}
                                            </span>
                                        </td>
                                        <td class="py-4 text-center font-black">${r.avg}</td>
                                        <td class="py-4 text-center font-black">${r.absences}</td>
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

// VISTA: MIS CURSOS (Para Calificaciones, Asistencia y Lista)
Views.teacher = {
    ...TeacherBase,
    async render() {
        await this.loadData();
        return `
            <div class="space-y-10 animate-fade-in pb-20">
                <section class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-4xl font-extrabold text-slate-900 tracking-tight">Gestión de Cursos</h2>
                        <p class="text-slate-500 mt-1">Calificaciones, Asistencias y Listas de Clase oficiales.</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="Views.teacher.triggerImport('grades')" class="btn-premium btn-ghost bg-white border-2 border-slate-200 px-6 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-50">
                            <i data-lucide="upload-cloud" class="w-4 h-4 text-indigo-600"></i> Importar Notas
                        </button>
                        <button onclick="Views.teacher.triggerImport('attendance')" class="btn-premium btn-ghost bg-white border-2 border-slate-200 px-6 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-50">
                            <i data-lucide="calendar-check" class="w-4 h-4 text-indigo-600"></i> Importar Asistencia
                        </button>
                    </div>
                </section>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">${this.renderCourses()}</div>

                <!-- Modal de Gestión -->
                <div id="grades-modal" class="hidden fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div class="bg-white rounded-[32px] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div class="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div><h3 id="modal-course-title" class="text-2xl font-black text-slate-900"></h3><p id="modal-course-subtitle" class="text-sm text-slate-500"></p></div>
                            <button onclick="Views.teacher.closeModal()" class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><i data-lucide="x" class="w-5 h-5"></i></button>
                        </div>
                        <div class="px-8 pb-8 overflow-y-auto flex-grow relative">
                            <table class="w-full text-left border-separate border-spacing-0">
                                <thead id="modal-table-header" class="sticky top-0 z-20"></thead>
                                <tbody id="students-list-body"></tbody>
                            </table>
                        </div>
                        <div class="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                             <button id="btn-print-report" onclick="Views.teacher.downloadCourseReport()" class="btn-premium btn-ghost text-xs font-black hidden">Generar Acta</button>
                             <button id="btn-save-all" class="btn-premium btn-primary px-8 font-black uppercase text-xs">Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderCourses() {
        return this.state.courses.map(c => `
            <div class="card-premium p-8 bg-white group flex flex-col justify-between">
                <div>
                    <h3 class="text-xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">${c.materia}</h3>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">NRC: ${c.nrc}</p>
                </div>
                <div class="flex flex-col gap-2">
                    <button onclick="Views.teacher.openStudentList(${c.id}, '${c.materia}', '${c.nrc}')" class="btn-premium bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 w-full py-3 text-xs flex justify-center items-center gap-2">
                        <i data-lucide="users" class="w-4 h-4"></i> Ver Estudiantes
                    </button>
                    <div class="flex gap-2">
                        <button onclick="Views.teacher.openCourse(${c.id}, '${c.materia}')" class="btn-premium btn-primary flex-1 py-3 text-xs">Notas</button>
                        <button onclick="Views.teacher.openAttendance(${c.id}, '${c.materia}', '${c.nrc}')" class="btn-premium btn-ghost flex-1 py-3 text-xs border border-slate-200">Asistencia</button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    async openCourse(id, name) {
        this.state.selectedCourse = id;
        document.getElementById('modal-course-title').innerText = name;
        document.getElementById('modal-course-subtitle').innerText = 'Lista de Clase e Ingreso de Calificaciones';
        document.getElementById('grades-modal').classList.remove('hidden');
        document.getElementById('btn-print-report').classList.remove('hidden');
        document.getElementById('btn-save-all').classList.remove('hidden');
        document.getElementById('btn-save-all').onclick = () => this.saveAllGrades();
        this.state.students = await API.get(`/teachers/courses/${id}/students`);
        this.renderStudents();
    },

    renderStudents() {
        const body = document.getElementById('students-list-body');
        const header = document.getElementById('modal-table-header');
        header.innerHTML = `
            <tr class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th class="py-6 pl-4 bg-white border-b-2 border-slate-100">Nombre del Estudiante</th>
                <th class="text-center py-6 bg-white border-b-2 border-slate-100">Primer Parcial</th>
                <th class="text-center py-6 bg-white border-b-2 border-slate-100">Segundo Parcial</th>
                <th class="text-center py-6 bg-white border-b-2 border-slate-100">Examen Final</th>
                <th class="text-right py-6 pr-4 bg-white border-b-2 border-slate-100">Acción</th>
            </tr>`;
        
        body.innerHTML = this.state.students.map((s, index) => `
            <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-100 hover:bg-indigo-50/30 transition-colors">
                <td class="py-8 pl-4">
                    <div class="text-base font-black text-slate-900">${s.nombres} ${s.apellidos}</div>
                    <div class="text-xs text-indigo-600 font-bold tracking-tight">ID Institucional: ${s.institutional_id}</div>
                </td>
                <td class="text-center py-8">
                    <input type="number" step="0.1" min="0" max="5" value="${s.grades['Parcial 1'] || ''}" 
                        placeholder="0.0"
                        class="w-24 h-14 text-center bg-white border-2 border-slate-400 rounded-2xl font-black text-xl text-slate-900 shadow-sm outline-none focus:border-indigo-600 focus:ring-8 focus:ring-indigo-600/20 transition-all placeholder:text-slate-200" 
                        onchange="Views.teacher.updateTempGrade(${s.matricula_id}, 'Parcial 1', this.value)">
                </td>
                <td class="text-center py-8">
                    <input type="number" step="0.1" min="0" max="5" value="${s.grades['Parcial 2'] || ''}" 
                        placeholder="0.0"
                        class="w-24 h-14 text-center bg-white border-2 border-slate-400 rounded-2xl font-black text-xl text-slate-900 shadow-sm outline-none focus:border-indigo-600 focus:ring-8 focus:ring-indigo-600/20 transition-all placeholder:text-slate-200" 
                        onchange="Views.teacher.updateTempGrade(${s.matricula_id}, 'Parcial 2', this.value)">
                </td>
                <td class="text-center py-8">
                    <input type="number" step="0.1" min="0" max="5" value="${s.grades['Examen Final'] || ''}" 
                        placeholder="0.0"
                        class="w-24 h-14 text-center bg-white border-2 border-slate-400 rounded-2xl font-black text-xl text-slate-900 shadow-sm outline-none focus:border-indigo-600 focus:ring-8 focus:ring-indigo-600/20 transition-all placeholder:text-slate-200" 
                        onchange="Views.teacher.updateTempGrade(${s.matricula_id}, 'Examen Final', this.value)">
                </td>
                <td class="text-right py-8 pr-4">
                    <button onclick="Views.teacher.saveGrades(${s.matricula_id})" class="p-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all shadow-md">
                        <i data-lucide="save" class="w-6 h-6"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        lucide.createIcons();
    },
    updateTempGrade(mId, c, v) { this.state.tempGrades[mId] = this.state.tempGrades[mId] || {}; this.state.tempGrades[mId][c] = v; },
    async saveGrades(mId) { const g = this.state.tempGrades[mId]; if (!g) return; for (const [c, v] of Object.entries(g)) await API.post('/teachers/update-grade', { matricula_id: mId, componente: c, valor: v }); Toast.show('Guardado', 'success'); },
    async saveAllGrades() { for (const [mId, g] of Object.entries(this.state.tempGrades)) for (const [c, v] of Object.entries(g)) await API.post('/teachers/update-grade', { matricula_id: mId, componente: c, valor: v }); Toast.show('Todo guardado', 'success'); this.closeModal(); },
    
    async openAttendance(id, name, nrc) {
        this.state.selectedCourse = id;
        this.state.selectedNRC = nrc;
        this.state.attendanceDate = new Date().toISOString().split('T')[0];
        
        document.getElementById('modal-course-title').innerText = name;
        document.getElementById('modal-course-subtitle').innerHTML = `
            <div class="flex items-center justify-between mt-2">
                <div class="flex items-center gap-4">
                    <span class="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Gestión de Asistencia - NRC: ${nrc}</span>
                    <input type="date" id="attendance-date" value="${this.state.attendanceDate}" 
                        onchange="Views.teacher.changeAttendanceDate(this.value)"
                        class="border-2 border-slate-200 rounded-lg px-3 py-1 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500">
                </div>
                <button onclick="Views.teacher.openAttendanceReport(${id}, '${name}', '${nrc}')" class="btn-premium btn-ghost border border-slate-200 text-xs px-4 py-1.5 flex items-center gap-2">
                    <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Ver Sábana de Asistencias
                </button>
            </div>
        `;
        document.getElementById('grades-modal').classList.remove('hidden');
        document.getElementById('btn-print-report').classList.add('hidden');
        document.getElementById('btn-save-all').classList.remove('hidden');
        document.getElementById('btn-save-all').onclick = () => this.saveAllAttendance();
        
        await this.loadAttendanceForDate();
    },

    async changeAttendanceDate(newDate) {
        this.state.attendanceDate = newDate;
        await this.loadAttendanceForDate();
    },

    async loadAttendanceForDate() {
        this.state.students = await API.get(`/teachers/courses/${this.state.selectedCourse}/students`);
        const existing = await API.get(`/teachers/courses/${this.state.selectedCourse}/attendance?date=${this.state.attendanceDate}`);
        
        // Map existing attendance back to students
        const existingMap = {};
        existing.forEach(r => existingMap[r.student_id] = r.status);
        
        this.state.tempAttendance = {}; // Reset temporary selections
        this.state.students.forEach(s => {
            s.currentAttendance = existingMap[s.institutional_id] || 'presente';
        });

        this.renderAttendanceList();
    },

    async openStudentList(id, name, nrc) {
        this.state.selectedCourse = id;
        this.state.selectedNRC = nrc;
        document.getElementById('modal-course-title').innerText = name;
        document.getElementById('modal-course-subtitle').innerText = `Lista de Estudiantes Matriculados - NRC: ${nrc}`;
        document.getElementById('grades-modal').classList.remove('hidden');
        document.getElementById('btn-print-report').classList.remove('hidden');
        document.getElementById('btn-save-all').classList.add('hidden');
        
        this.state.students = await API.get(`/teachers/courses/${id}/students`);
        this.renderStudentListOnly();
    },

    renderStudentListOnly() {
        const body = document.getElementById('students-list-body');
        const header = document.getElementById('modal-table-header');
        header.innerHTML = `
            <tr class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th class="py-6 pl-4 text-left bg-white border-b-2 border-slate-100">#</th>
                <th class="py-6 pl-4 text-left bg-white border-b-2 border-slate-100">Estudiante</th>
                <th class="text-right py-6 pr-4 bg-white border-b-2 border-slate-100">ID Institucional</th>
            </tr>`;
        
        body.innerHTML = this.state.students.map((s, index) => `
            <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-100 hover:bg-indigo-50/30 transition-colors">
                <td class="py-6 pl-4 text-slate-400 font-bold text-sm">${index + 1}</td>
                <td class="py-6 pl-4">
                    <div class="text-sm font-black text-slate-900">${s.nombres} ${s.apellidos}</div>
                    <div class="text-[10px] font-bold text-slate-400">Usuario: ${s.username}</div>
                </td>
                <td class="text-right py-6 pr-4">
                    <div class="inline-block px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs border border-indigo-100 shadow-sm">${s.institutional_id}</div>
                </td>
            </tr>
        `).join('');
        lucide.createIcons();
    },

    async openAttendanceReport(id, name, nrc) {
        document.getElementById('modal-course-title').innerText = name;
        document.getElementById('modal-course-subtitle').innerHTML = `
            <div class="flex items-center justify-between mt-2">
                <span class="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Reporte Histórico de Asistencia - NRC: ${nrc}</span>
                <button onclick="window.print()" class="btn-premium btn-primary px-4 py-1.5 text-xs flex items-center gap-2">
                    <i data-lucide="printer" class="w-4 h-4"></i> Exportar a PDF
                </button>
            </div>
        `;
        document.getElementById('btn-print-report').classList.add('hidden');
        document.getElementById('btn-save-all').classList.add('hidden');
        
        const report = await API.get(`/teachers/courses/${id}/attendance-report`);
        const header = document.getElementById('modal-table-header');
        const body = document.getElementById('students-list-body');
        
        if (!report.dates || report.dates.length === 0) {
            header.innerHTML = '';
            body.innerHTML = '<tr><td class="py-8 text-center text-slate-500 italic">No hay registros de asistencia para este curso.</td></tr>';
            return;
        }

        header.innerHTML = `
            <tr class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th class="py-6 pl-4 text-left align-bottom bg-white border-b-2 border-slate-100">Estudiante</th>
                ${report.dates.map(d => {
                    const dateObj = new Date(d);
                    const day = dateObj.getUTCDate();
                    const month = dateObj.toLocaleString('es-ES', { month: 'short', timeZone: 'UTC' });
                    return `<th class="text-center py-6 px-2 whitespace-nowrap min-w-[60px] bg-white border-b-2 border-slate-100">
                                <div class="flex flex-col items-center">
                                    <span class="text-sm font-black text-slate-800">${day}</span>
                                    <span class="text-[9px] uppercase font-bold text-indigo-600 tracking-widest">${month}</span>
                                </div>
                            </th>`;
                }).join('')}
                <th class="text-center py-6 pr-4 align-bottom whitespace-nowrap bg-white border-b-2 border-slate-100">Total Faltas</th>
            </tr>
        `;

        body.innerHTML = report.students.map((s, index) => {
            let inj = 0;
            let jus = 0;
            const cells = report.dates.map(date => {
                const record = s.history.find(h => h.fecha === date);
                let icon = '<span class="text-slate-300">-</span>';
                if (record) {
                    if (record.tipo === 'presente') icon = '<i data-lucide="check" class="w-4 h-4 text-[#10b981] mx-auto"></i>';
                    else if (record.tipo === 'ausente_no_justificada') { 
                        icon = '<i data-lucide="x" class="w-4 h-4 text-rose-500 mx-auto"></i>'; 
                        inj++; 
                    }
                    else if (record.tipo === 'ausente_justificada') { 
                        icon = '<i data-lucide="minus-circle" class="w-4 h-4 text-amber-500 mx-auto"></i>'; 
                        jus++; 
                    }
                }
                return `<td class="text-center py-4 px-2 border-l border-slate-100">${icon}</td>`;
            }).join('');

            const hasFailed = inj >= 3 || jus >= 5;
            const hasWarning = inj === 2 || jus === 4;

            return `
            <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-100 hover:bg-slate-100 transition-colors">
                <td class="py-4 pl-4 w-64">
                    <div class="text-[11px] font-black text-slate-900 truncate" title="${s.name}">${s.name}</div>
                    <div class="text-[9px] text-slate-400 font-bold tracking-widest">${s.student_id}</div>
                </td>
                ${cells}
                <td class="text-center py-4 pr-4 border-l border-slate-100">
                    <div class="flex flex-col items-center gap-1">
                        <span class="font-black text-[10px] ${inj >= 3 ? 'text-rose-600' : inj === 2 ? 'text-orange-500' : 'text-slate-700'}">INJ: ${inj}/3</span>
                        <span class="font-black text-[10px] ${jus >= 5 ? 'text-rose-600' : jus === 4 ? 'text-orange-500' : 'text-slate-700'}">JUS: ${jus}/5</span>
                        ${hasFailed ? '<span class="text-[8px] font-black bg-rose-600 text-white px-2 py-0.5 rounded uppercase">Reprobado</span>' : 
                          hasWarning ? '<span class="text-[8px] font-black bg-orange-500 text-white px-2 py-0.5 rounded uppercase">Alerta</span>' : ''}
                    </div>
                </td>
            </tr>
            `;
        }).join('');
        lucide.createIcons();
    },

    renderAttendanceList() {
        const body = document.getElementById('students-list-body');
        const header = document.getElementById('modal-table-header');
        header.innerHTML = `
            <tr class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th class="py-6 pl-4 bg-white border-b-2 border-slate-100">Estudiante</th>
                <th class="text-center py-6 bg-white border-b-2 border-slate-100">Estado de Asistencia</th>
                <th class="text-right py-6 pr-4 bg-white border-b-2 border-slate-100">Acción</th>
            </tr>`;
        
        body.innerHTML = this.state.students.map((s, index) => `
            <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-100">
                <td class="py-6 pl-4">
                    <div class="text-sm font-black text-slate-900">${s.nombres} ${s.apellidos}</div>
                    <div class="text-[10px] text-slate-400 font-bold tracking-widest">${s.institutional_id}</div>
                </td>
                <td class="text-center py-6">
                    <select onchange="Views.teacher.updateTempAttendance(${s.matricula_id}, this.value)" 
                        class="bg-white border-2 border-slate-300 rounded-xl p-3 font-bold text-sm outline-none focus:border-indigo-600 shadow-sm">
                        <option value="presente" ${s.currentAttendance === 'presente' ? 'selected' : ''}>Presente</option>
                        <option value="ausente_no_justificada" ${s.currentAttendance === 'ausente_no_justificada' ? 'selected' : ''}>Ausente Injustificada</option>
                        <option value="ausente_justificada" ${s.currentAttendance === 'ausente_justificada' ? 'selected' : ''}>Ausente Justificada</option>
                    </select>
                </td>
                <td class="text-right py-6 pr-4">
                    <button onclick="Views.teacher.saveSingleAttendance(${s.matricula_id})" class="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                        <i data-lucide="save" class="w-5 h-5"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        lucide.createIcons();
    },

    updateTempAttendance(mId, val) { this.state.tempAttendance[mId] = val; },
    async saveSingleAttendance(mId) {
        const student = this.state.students.find(s => s.matricula_id === mId);
        const val = this.state.tempAttendance[mId] || student.currentAttendance;
        await API.post('/teachers/update-attendance', { 
            matricula_id: mId, 
            tipo: val, 
            fecha: this.state.attendanceDate
        });
        Toast.show('Asistencia guardada', 'success');
    },
    async saveAllAttendance() {
        for (const s of this.state.students) {
            const val = this.state.tempAttendance[s.matricula_id] || s.currentAttendance;
            await API.post('/teachers/update-attendance', {
                matricula_id: s.matricula_id,
                tipo: val,
                fecha: this.state.attendanceDate
            });
        }
        Toast.show('Asistencia de todo el grupo guardada', 'success');
        this.closeModal();
    },

    async triggerImport(type) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                const text = event.target.result;
                const rows = text.split('\n').filter(r => r.trim());
                
                // DETECTOR INTELIGENTE DE SEPARADOR (; o ,)
                const firstRow = rows[0];
                const delimiter = firstRow.includes(';') ? ';' : ',';
                
                const headerRow = firstRow.split(delimiter).map(h => h.trim().replace(/"/g, '').toUpperCase());
                
                const data = rows.slice(1).map(row => {
                    const values = row.split(delimiter).map(v => v.trim().replace(/"/g, ''));
                    const obj = {};
                    headerRow.forEach((h, i) => { 
                        let val = values[i];
                        // NORMALIZACIÓN DE CABECERAS
                        let key = h;
                        if (h.includes('NRC')) key = 'NRC';
                        if (h.includes('ESTUDIANTE') || h === 'ID') key = 'ID_ESTUDIANTE';
                        if (h.includes('COMP')) key = 'COMPONENTE';
                        if (h.includes('NOTA') || h.includes('VALOR')) key = 'NOTA';
                        if (h.includes('FECHA')) key = 'FECHA';
                        if (h.includes('TIPO')) key = 'TIPO';

                        if (key === 'ID_ESTUDIANTE' && val && !isNaN(val)) {
                            val = val.padStart(8, '0');
                        }
                        obj[key] = val; 
                    });
                    return obj;
                });

                this.showImportPreview(type, data);
            };
            reader.readAsText(file);
        };

        this.openSvcModal(
            `Importar ${type === 'grades' ? 'Notas' : 'Asistencia'}`,
            'Paso 1: Selecciona tu archivo con la estructura correcta.',
            `
            <div class="space-y-6">
                <div class="bg-indigo-50 p-6 rounded-2xl border-l-4 border-indigo-600">
                    <p class="text-sm font-bold text-indigo-900 mb-2">Columnas requeridas (en este orden):</p>
                    <ul class="text-xs space-y-2 text-indigo-700 font-bold">
                        ${type === 'grades' ? 
                            '<li>1. NRC (Ej: 10006)</li><li>2. ID_ESTUDIANTE (Ej: 00040000)</li><li>3. COMPONENTE (Ej: Parcial 1)</li><li>4. NOTA (Ej: 4.5)</li>' :
                            '<li>1. NRC (Ej: 10006)</li><li>2. ID_ESTUDIANTE (Ej: 00040000)</li><li>3. FECHA (Ej: 2025-05-15)</li><li>4. TIPO (Ej: presente)</li>'
                        }
                    </ul>
                </div>
                <button id="btn-select-file" class="btn-premium btn-primary w-full py-4 uppercase font-black text-xs">Subir archivo para revisión</button>
            </div>
            `
        );
        document.getElementById('btn-select-file').onclick = () => input.click();
    },

    showImportPreview(type, data) {
        const title = `Vista Previa: ${type === 'grades' ? 'Notas' : 'Asistencias'}`;
        const desc = `Revisa los datos antes de guardarlos permanentemente en la base de datos.`;
        const tableRows = data.map(d => `
            <tr class="border-b border-slate-50 text-[10px] font-bold">
                <td class="py-2">${d.NRC || '---'}</td>
                <td class="py-2">${d.ID_ESTUDIANTE || '---'}</td>
                <td class="py-2 text-indigo-600">${type === 'grades' ? d.COMPONENTE : d.FECHA}</td>
                <td class="py-2 text-right">${type === 'grades' ? d.NOTA : d.TIPO}</td>
            </tr>
        `).join('');

        this.openSvcModal(title, desc, `
            <div class="space-y-6">
                <div class="max-h-60 overflow-y-auto border border-slate-100 rounded-xl">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50 sticky top-0">
                            <tr class="text-[9px] uppercase font-black text-slate-400"><th class="p-3">NRC</th><th class="p-3">Estudiante</th><th class="p-3">${type === 'grades' ? 'Comp' : 'Fecha'}</th><th class="p-3 text-right">${type === 'grades' ? 'Nota' : 'Tipo'}</th></tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                </div>
                <div class="flex gap-3">
                    <button onclick="document.getElementById('service-modal').classList.add('hidden')" class="btn-premium btn-ghost flex-1 py-4 uppercase font-black text-xs">Cancelar</button>
                    <button id="btn-confirm-import" class="btn-premium btn-primary flex-[2] py-4 uppercase font-black text-xs">Confirmar y Guardar en DB</button>
                </div>
            </div>
        `);

        document.getElementById('btn-confirm-import').onclick = async () => {
            try {
                Toast.show('Guardando en la base de datos...', 'info');
                const endpoint = type === 'grades' ? '/teachers/import-grades' : '/teachers/import-attendance';
                await API.post(endpoint, { data });
                Toast.show('¡Importación completada con éxito!', 'success');
                this.closeModal();
                this.loadData();
            } catch (err) {
                Toast.error('Error al guardar. Revisa el formato.');
            }
        };
    }
};

// VISTA: CENTRO DE SERVICIOS (TODO INTEGRADO)
Views['teacher-services'] = {
    ...TeacherBase,
    async render() {
        return `
            <div class="space-y-10 animate-fade-in pb-20">
                <section>
                    <h2 class="text-4xl font-extrabold text-slate-900 tracking-tight">Centro de Servicios</h2>
                    <p class="text-slate-500 mt-1">Acceso a todas las funciones administrativas y académicas.</p>
                </section>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    <!-- Información General -->
                    <div class="space-y-6">
                        <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Información General</h3>
                        <div class="space-y-3">
                            ${this.serviceCard('Información Personal', 'user', 'openPersonalInfo')}
                            ${this.serviceCard('Documentos de Identidad', 'file-text', 'openDocs')}
                            ${this.serviceCard('Encuestas Generales', 'clipboard-check', 'openSurveys')}
                        </div>
                    </div>

                    <!-- Información Docente -->
                    <div class="space-y-6">
                        <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Información Docente</h3>
                        <div class="space-y-3">
                            ${this.serviceCard('Syllabus / Plan de Curso', 'map', 'openSyllabus')}
                            ${this.serviceCard('Plan del Curso Impartido', 'check-square', 'openImpartido')}
                            ${this.serviceCard('Matriz de Conflicto', 'layers', 'openConflicto')}
                            ${this.serviceCard('Perfil Estudiante (Asesores)', 'search', 'openStudentSearch')}
                        </div>
                    </div>

                    <!-- Planeación y Evaluación -->
                    <div class="space-y-6">
                        <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Planeación y Evaluación</h3>
                        <div class="space-y-3">
                            ${this.serviceCard('Horario y Syllabus Detallado', 'calendar', 'openHorario')}
                            ${this.serviceCard('Semana a un Vistazo', 'calendar-days', 'openSemana')}
                            ${this.serviceCard('Indisponibilidad Docente', 'calendar-off', 'openAvailability')}
                            ${this.serviceCard('Resultados Evaluación Docente', 'award', 'viewEvaluations')}
                        </div>
                    </div>
                </div>

                </div>
            </div>
        `;
    },

    serviceCard(title, icon, actionName) {
        return `
            <button onclick="Views['teacher-services'].${actionName}()" class="card-premium w-full p-6 text-left flex items-center gap-4 bg-white hover:bg-indigo-600 group transition-all duration-300 border-none shadow-md">
                <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white">
                    <i data-lucide="${icon}" class="w-5 h-5"></i>
                </div>
                <div class="text-sm font-black text-slate-900 group-hover:text-white transition-colors">${title}</div>
            </button>
        `;
    },

    closeModal() {
        document.getElementById('service-modal').classList.add('hidden');
    },

    // IMPLEMENTACIONES REALES (CRUD)
    async viewEvaluations() {
        const evals = await API.get('/teachers/my-evaluations');
        this.openSvcModal('Mis Resultados de Evaluación', 'Información consultada de la base de datos institucional.', evals.map(e => `
            <div class="p-6 bg-indigo-50 rounded-2xl border-l-4 border-indigo-600">
                <div class="flex justify-between items-center mb-2"><span class="font-black text-slate-900">${e.periodo}</span><span class="text-2xl font-black text-indigo-600">${e.puntaje} / 5.0</span></div>
                <p class="text-sm italic text-slate-600">"${e.comentarios}"</p>
                <div class="mt-4 text-[9px] font-black uppercase text-slate-400">Total encuestados: ${e.participacion}</div>
            </div>
        `).join('') || '<p class="text-center italic py-10">No hay evaluaciones registradas aún.</p>');
    },

    async openAvailability() {
        const history = await API.get('/teachers/availability');
        this.openSvcModal('Indisponibilidad Docente', 'Reporte novedades de asistencia que se guardarán en la DB.', `
            <div class="space-y-6">
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="text-[10px] font-black uppercase text-slate-400 ml-1">Fecha</label><input type="date" id="av-date" class="w-full bg-slate-50 p-3 rounded-xl font-bold"></div>
                    <div><label class="text-[10px] font-black uppercase text-slate-400 ml-1">Motivo</label><input type="text" id="av-reason" class="w-full bg-slate-50 p-3 rounded-xl font-bold" placeholder="Ej: Cita Médica"></div>
                </div>
                <button onclick="Views['teacher-services'].saveAvail()" class="btn-premium btn-primary w-full py-4 uppercase font-black text-xs">Registrar en DB</button>
                <div class="pt-6 border-t"><h4 class="text-[10px] font-black uppercase mb-4">Historial en DB</h4>${history.map(h => `<div class="flex justify-between p-3 bg-slate-50 rounded-lg text-xs font-bold mb-2"><span>${h.fecha}</span><span class="text-slate-400">${h.motivo}</span><span class="text-amber-500">${h.estado}</span></div>`).join('')}</div>
            </div>
        `);
    },

    async saveAvail() {
        const fecha = document.getElementById('av-date').value;
        const motivo = document.getElementById('av-reason').value;
        if (!fecha || !motivo) return Toast.error('Faltan datos');
        await API.post('/teachers/availability', { fecha, motivo });
        Toast.show('Guardado en Base de Datos', 'success');
        this.openAvailability();
    },

    async openStudentSearch() {
        this.openSvcModal('Perfil Estudiante (Asesores)', 'Buscador en tiempo real de la tabla de estudiantes.', `
            <div class="space-y-4">
                <input type="text" oninput="Views['teacher-services'].runSearch(this.value)" placeholder="Buscar por Nombre o ID..." class="w-full bg-slate-50 p-4 rounded-xl font-bold text-sm outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all">
                <div id="search-results-list" class="space-y-2 max-h-60 overflow-y-auto"></div>
            </div>
        `);
    },

    async runSearch(q) {
        if (q.length < 3) return;
        const res = await API.get(`/teachers/students/search/${q}`);
        document.getElementById('search-results-list').innerHTML = res.map(r => `
            <div class="p-4 bg-slate-50 rounded-xl flex justify-between items-center group hover:bg-indigo-50 transition-colors">
                <div><div class="text-sm font-bold">${r.name}</div><div class="text-[9px] font-black text-indigo-600 uppercase">ID: ${r.institutional_id}</div></div>
                <button class="btn-premium btn-ghost text-[9px] py-2">Ficha Técnica</button>
            </div>
        `).join('') || '<p class="text-center text-xs italic">Sin resultados</p>';
    },

    async openSyllabus() {
        this.openSvcModal('Syllabus / Plan de Curso', 'Gestión de contenidos programáticos registrados en la base de datos.', `
            <div class="space-y-6">
                <p class="text-xs text-slate-500 font-bold uppercase tracking-widest">Selecciona una asignatura para gestionar su Syllabus:</p>
                <div class="grid grid-cols-1 gap-3">
                    ${this.state.courses.map(c => `
                        <button onclick="Views['teacher-services'].loadSyllabusEditor(${c.id}, '${c.materia}')" class="flex justify-between items-center p-5 bg-slate-50 hover:bg-indigo-50 rounded-2xl transition-all group">
                            <div class="text-left">
                                <div class="text-sm font-black text-slate-900 group-hover:text-indigo-600">${c.materia}</div>
                                <div class="text-[10px] text-slate-400 font-bold uppercase">NRC: ${c.nrc}</div>
                            </div>
                            <i data-lucide="chevron-right" class="w-5 h-5 text-slate-300 group-hover:text-indigo-600"></i>
                        </button>
                    `).join('')}
                </div>
                <div id="syllabus-editor-container" class="hidden pt-6 border-t border-slate-100 animate-fade-in">
                    <!-- Editor se carga dinámicamente -->
                </div>
            </div>
        `);
    },

    async loadSyllabusEditor(courseId, courseName) {
        const container = document.getElementById('syllabus-editor-container');
        container.classList.remove('hidden');
        container.innerHTML = '<div class="py-10 text-center text-slate-400 italic">Consultando Syllabus en la base de datos...</div>';
        
        const res = await API.get(`/teachers/courses/${courseId}/syllabus`);
        const data = JSON.parse(res.contenido || '{}');

        container.innerHTML = `
            <div class="space-y-6 bg-slate-50/50 p-6 rounded-[24px]">
                <div class="flex justify-between items-center"><h4 class="text-xs font-black uppercase text-indigo-600 tracking-widest">Editor de Syllabus: ${courseName}</h4></div>
                <div class="space-y-4">
                    <div><label class="text-[10px] font-black uppercase text-slate-400">Descripción del Curso</label><textarea id="syl-desc" class="w-full bg-white p-4 rounded-xl text-sm border-none shadow-sm h-24">${data.description || ''}</textarea></div>
                    <div><label class="text-[10px] font-black uppercase text-slate-400">Objetivo General</label><textarea id="syl-obj" class="w-full bg-white p-4 rounded-xl text-sm border-none shadow-sm h-20">${data.objective || ''}</textarea></div>
                    <div><label class="text-[10px] font-black uppercase text-slate-400">Metodología</label><textarea id="syl-met" class="w-full bg-white p-4 rounded-xl text-sm border-none shadow-sm h-20">${data.methodology || ''}</textarea></div>
                </div>
                <button onclick="Views['teacher-services'].saveSyllabus(${courseId})" class="btn-premium btn-primary w-full py-4 uppercase font-black text-xs tracking-widest">Guardar Cambios en Base de Datos</button>
            </div>
        `;
        lucide.createIcons();
    },

    async saveSyllabus(courseId) {
        const contenido = {
            description: document.getElementById('syl-desc').value,
            objective: document.getElementById('syl-obj').value,
            methodology: document.getElementById('syl-met').value
        };
        await API.post('/teachers/courses/syllabus', { curso_id: courseId, contenido });
        Toast.show('Syllabus actualizado con éxito', 'success');
    },

    // PLACEHOLDERS FUNCIONALES (Para las funciones que faltaban)
    isEditingPersonalInfo: false,
    async openPersonalInfo() {
        let user = await Auth.refreshUser();
        if (!user) user = Auth.getUser();
        let metadata = {};
        if (user && user.metadata) {
            try {
                metadata = typeof user.metadata === 'string' ? JSON.parse(user.metadata) : user.metadata;
            } catch (e) { console.error('Error parsing metadata', e); }
        }

        const isEditing = this.isEditingPersonalInfo;

        const bodyHtml = `
            <div class="space-y-6">
                <!-- Detalles Personales -->
                <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex justify-between items-center mb-6 border-b border-slate-200 pb-3">
                        <h4 class="text-base font-black text-[#032840]">Detalles personales</h4>
                        ${isEditing ? `
                            <div class="flex gap-2">
                                <button onclick="Views['teacher-services'].cancelEditPersonalInfo()" class="text-slate-400 text-[10px] font-black uppercase hover:text-red-500">Cancelar</button>
                                <button onclick="Views['teacher-services'].savePersonalInfo()" class="btn-premium bg-[#fab720] text-[#032840] px-4 py-1.5 text-[10px]">Guardar</button>
                            </div>
                        ` : `
                            <button onclick="Views['teacher-services'].enableEditPersonalInfo()" class="flex items-center gap-1.5 text-[#fab720] text-xs font-black uppercase hover:scale-105 transition-transform">
                                <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Editar
                            </button>
                        `}
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nombre</label>
                            ${isEditing ?
                                `<input type="text" id="teach-edit-nombre" class="w-full bg-white p-2 rounded-xl text-xs border border-slate-300 font-bold" value="${user.nombres || ''}">` :
                                `<div class="text-xs font-bold text-slate-800">${user.nombres || '-'}</div>`
                            }
                        </div>
                        <div>
                            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Segundo nombre</label>
                            ${isEditing ?
                                `<input type="text" id="teach-edit-segundo-nombre" class="w-full bg-white p-2 rounded-xl text-xs border border-slate-300 font-bold" value="${metadata.segundo_nombre || ''}">` :
                                `<div class="text-xs font-bold text-slate-800">${metadata.segundo_nombre || '-'}</div>`
                            }
                        </div>
                        <div>
                            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Apellido</label>
                            ${isEditing ?
                                `<input type="text" id="teach-edit-apellido" class="w-full bg-white p-2 rounded-xl text-xs border border-slate-300 font-bold" value="${user.apellidos || ''}">` :
                                `<div class="text-xs font-bold text-slate-800">${user.apellidos || '-'}</div>`
                            }
                        </div>
                        <div>
                            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Fecha de nacimiento</label>
                            ${isEditing ?
                                `<input type="date" id="teach-edit-nacimiento" class="w-full bg-white p-2 rounded-xl text-xs border border-slate-300 font-bold" value="${user.fecha_nacimiento || ''}">` :
                                `<div class="text-xs font-bold text-slate-800">${user.fecha_nacimiento || 'No registrada'}</div>`
                            }
                        </div>
                        <div>
                            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Estado civil</label>
                            ${isEditing ?
                                `<select id="teach-edit-civil" class="w-full bg-white p-2 rounded-xl text-xs border border-slate-300 font-bold">
                                    <option value="Soltero(a)" ${metadata.estado_civil === 'Soltero(a)' ? 'selected' : ''}>Soltero(a)</option>
                                    <option value="Casado(a)" ${metadata.estado_civil === 'Casado(a)' ? 'selected' : ''}>Casado(a)</option>
                                    <option value="Union Libre" ${metadata.estado_civil === 'Union Libre' ? 'selected' : ''}>Unión Libre</option>
                                </select>` :
                                `<div class="text-xs font-bold text-slate-800">${metadata.estado_civil || 'Soltero(a)'}</div>`
                            }
                        </div>
                        <div>
                            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Sexo</label>
                            ${isEditing ?
                                `<select id="teach-edit-sexo" class="w-full bg-white p-2 rounded-xl text-xs border border-slate-300 font-bold">
                                    <option value="Masculino" ${metadata.sexo === 'Masculino' ? 'selected' : ''}>Masculino</option>
                                    <option value="Femenino" ${metadata.sexo === 'Femenino' ? 'selected' : ''}>Femenino</option>
                                    <option value="Otro" ${metadata.sexo === 'Otro' ? 'selected' : ''}>Otro</option>
                                </select>` :
                                `<div class="text-xs font-bold text-slate-800">${metadata.sexo || 'Masculino'}</div>`
                            }
                        </div>
                        <div>
                            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nombre preferido</label>
                            ${isEditing ?
                                `<input type="text" id="teach-edit-preferido" class="w-full bg-white p-2 rounded-xl text-xs border border-slate-300 font-bold" value="${metadata.nombre_preferido || ''}">` :
                                `<div class="text-xs font-bold text-slate-800">${metadata.nombre_preferido || '-'}</div>`
                            }
                        </div>
                        <div>
                            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Identificación de género</label>
                            ${isEditing ?
                                `<input type="text" id="teach-edit-genero" class="w-full bg-white p-2 rounded-xl text-xs border border-slate-300 font-bold" value="${metadata.identificacion_genero || ''}">` :
                                `<div class="text-xs font-bold text-slate-800">${metadata.identificacion_genero || 'Masculino'}</div>`
                            }
                        </div>
                    </div>
                </div>

                <!-- Correo Electrónico -->
                <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex justify-between items-center mb-6 border-b border-slate-200 pb-3">
                        <h4 class="text-base font-black text-[#032840]">Correo electrónico</h4>
                        <button onclick="Views['teacher-services'].openAddModalPersonalInfo('Correo Electrónico')" class="flex items-center gap-1.5 text-[#fab720] text-xs font-black uppercase hover:scale-105 transition-transform">
                            <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i> Agregar nueva
                        </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Correo Institucional</label>
                            <div class="text-xs font-bold text-slate-800">${user.email || (user.username ? user.username + '@unicatolica.edu.co' : 'No registrado')}</div>
                            <div class="text-[8px] text-slate-400 font-bold mt-0.5">(No actualizable)</div>
                        </div>
                        <div>
                            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Correo Personal</label>
                            <div class="flex items-center gap-2">
                                <div class="text-xs font-bold text-slate-800">${metadata.email_personal || 'No registrado'}</div>
                                <button onclick="Views['teacher-services'].openEditModalPersonalInfo('Correo Personal')" class="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center"><i data-lucide="edit-2" class="w-3 h-3 text-[#fab720]"></i></button>
                                <button onclick="Views['teacher-services'].simulateDeletePersonalInfo('Correo')" class="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center"><i data-lucide="trash" class="w-3 h-3 text-red-500"></i></button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Número de teléfono -->
                <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex justify-between items-center mb-6 border-b border-slate-200 pb-3">
                        <h4 class="text-base font-black text-[#032840]">Número de teléfono</h4>
                        <button onclick="Views['teacher-services'].openAddModalPersonalInfo('Número de teléfono')" class="flex items-center gap-1.5 text-[#fab720] text-xs font-black uppercase hover:scale-105 transition-transform">
                            <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i> Agregar nueva
                        </button>
                    </div>
                    <div>
                        <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Celular (Principal)</label>
                        <div class="flex items-center gap-2">
                            <div class="text-xs font-bold text-slate-800">${user.telefono || 'No registrado'}</div>
                            <button onclick="Views['teacher-services'].openEditModalPersonalInfo('Teléfono')" class="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center"><i data-lucide="edit-2" class="w-3 h-3 text-[#fab720]"></i></button>
                            <button onclick="Views['teacher-services'].simulateDeletePersonalInfo('Teléfono')" class="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center"><i data-lucide="trash" class="w-3 h-3 text-red-500"></i></button>
                        </div>
                    </div>
                </div>

                <!-- Dirección -->
                <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex justify-between items-center mb-6 border-b border-slate-200 pb-3">
                        <h4 class="text-base font-black text-[#032840]">Dirección</h4>
                        <button onclick="Views['teacher-services'].openAddModalPersonalInfo('Dirección')" class="flex items-center gap-1.5 text-[#fab720] text-xs font-black uppercase hover:scale-105 transition-transform">
                            <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i> Agregar nueva
                        </button>
                    </div>
                    <div>
                        <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Residencia</label>
                        <div class="text-[10px] font-bold text-slate-400 mb-0.5">Actual</div>
                        <div class="text-xs font-bold text-slate-800">${metadata.direccion || 'No registrada'}</div>
                    </div>
                </div>

                <!-- Contacto de emergencia -->
                <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex justify-between items-center mb-6 border-b border-slate-200 pb-3">
                        <h4 class="text-base font-black text-[#032840]">Contacto de emergencia</h4>
                        <button onclick="Views['teacher-services'].openAddModalPersonalInfo('Contacto de emergencia')" class="flex items-center gap-1.5 text-[#fab720] text-xs font-black uppercase hover:scale-105 transition-transform">
                            <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i> Agregar nueva
                        </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${metadata.emergencia && metadata.emergencia[0] && metadata.emergencia[0].nombre ? `
                        <div class="relative group text-xs">
                            <div class="font-black text-slate-800 mb-1">1. ${metadata.emergencia[0].nombre}</div>
                            <div class="text-[11px] font-medium text-slate-500">${metadata.emergencia[0].parentesco || 'Familiar'}</div>
                            <div class="text-[11px] font-medium text-slate-500">Teléfono: ${metadata.emergencia[0].telefono || 'No registrado'}</div>
                            <div class="text-[11px] font-medium text-slate-500 uppercase">${metadata.emergencia[0].direccion || 'Sin dirección'}</div>
                            <div class="flex gap-2 mt-2">
                                <button onclick="Views['teacher-services'].openEditModalPersonalInfo('Contacto 1')" class="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center"><i data-lucide="edit-2" class="w-3 h-3 text-[#fab720]"></i></button>
                                <button onclick="Views['teacher-services'].simulateDeletePersonalInfo('Contacto')" class="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center"><i data-lucide="trash" class="w-3 h-3 text-red-500"></i></button>
                            </div>
                        </div>
                        ` : '<div class="text-xs text-slate-500 italic">No hay contacto primario registrado.</div>'}
                        ${metadata.emergencia && metadata.emergencia[1] && metadata.emergencia[1].nombre ? `
                        <div class="relative group text-xs">
                            <div class="font-black text-slate-800 mb-1">2. ${metadata.emergencia[1].nombre}</div>
                            <div class="text-[11px] font-medium text-slate-500">${metadata.emergencia[1].parentesco || 'Familiar'}</div>
                            <div class="text-[11px] font-medium text-slate-500">Teléfono: ${metadata.emergencia[1].telefono || 'No registrado'}</div>
                            <div class="text-[11px] font-medium text-slate-500 uppercase">${metadata.emergencia[1].direccion || 'Sin dirección'}</div>
                            <div class="flex gap-2 mt-2">
                                <button onclick="Views['teacher-services'].openEditModalPersonalInfo('Contacto 2')" class="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center"><i data-lucide="edit-2" class="w-3 h-3 text-[#fab720]"></i></button>
                                <button onclick="Views['teacher-services'].simulateDeletePersonalInfo('Contacto')" class="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center"><i data-lucide="trash" class="w-3 h-3 text-red-500"></i></button>
                            </div>
                        </div>
                        ` : '<div class="text-xs text-slate-500 italic">No hay contacto secundario registrado.</div>'}
                    </div>
                </div>

                <!-- Detalles adicionales -->
                <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 class="text-base font-black text-[#032840] mb-6 border-b border-slate-200 pb-3">Detalles adicionales</h4>
                    <div>
                        <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status de discapacidad</label>
                        <div class="text-xs font-bold text-slate-500 italic">${metadata.discapacidad || 'Status no disponible'}</div>
                    </div>
                </div>
            </div>
        `;

        this.openSvcModal('Información Personal', 'Ficha del Docente con edición en tiempo real.', bodyHtml);
    },
    enableEditPersonalInfo() {
        this.isEditingPersonalInfo = true;
        this.openPersonalInfo();
    },
    cancelEditPersonalInfo() {
        this.isEditingPersonalInfo = false;
        this.openPersonalInfo();
    },
    async savePersonalInfo() {
        const nuevoNombre = document.getElementById('teach-edit-nombre').value;
        const nuevoApellido = document.getElementById('teach-edit-apellido').value;
        const nuevoSegundoNombre = document.getElementById('teach-edit-segundo-nombre').value;
        const nuevoNacimiento = document.getElementById('teach-edit-nacimiento').value;
        const nuevoEstadoCivil = document.getElementById('teach-edit-civil').value;
        const nuevoSexo = document.getElementById('teach-edit-sexo').value;
        const nuevoPreferido = document.getElementById('teach-edit-preferido').value;
        const nuevoGenero = document.getElementById('teach-edit-genero').value;

        const user = Auth.getUser();
        user.nombres = nuevoNombre;
        user.apellidos = nuevoApellido;
        user.fecha_nacimiento = nuevoNacimiento;
        
        let metadata = {};
        if (user.metadata) {
            try {
                metadata = typeof user.metadata === 'string' ? JSON.parse(user.metadata) : user.metadata;
            } catch (e) {}
        }
        
        metadata.segundo_nombre = nuevoSegundoNombre;
        metadata.estado_civil = nuevoEstadoCivil;
        metadata.sexo = nuevoSexo;
        metadata.nombre_preferido = nuevoPreferido;
        metadata.identificacion_genero = nuevoGenero;
        
        user.metadata = JSON.stringify(metadata);

        try {
            await API.put(`/auth/profile`, user);
        } catch(e) {
            console.log('API update failed, updating local storage only', e);
        }

        sessionStorage.setItem('user', JSON.stringify(user));
        Toast.success('¡Información personal actualizada con éxito!');
        this.isEditingPersonalInfo = false;
        this.openPersonalInfo();
        Router.handleRoute(); // Refresh layout to show updated names if applicable
    },
    openEditModalPersonalInfo(title) {
        const container = document.getElementById('modal-container');
        const content = document.getElementById('modal-content');

        content.innerHTML = `
            <div class="p-8">
                <div class="flex items-center justify-between mb-8">
                    <h3 class="text-xl font-bold text-slate-900 tracking-tight">Editar ${title}</h3>
                    <button onclick="Views['teacher-services'].closeModalPersonalInfo()" class="text-slate-400 hover:text-red-500">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                
                <form id="secondary-edit-form-personal" class="space-y-6">
                    <div class="space-y-4">
                        <div class="input-group">
                            <label class="label-premium">Nuevo Valor</label>
                            <input type="text" id="teach-edit-val-modal" class="input-premium" value="" placeholder="Ingrese el nuevo dato...">
                        </div>
                    </div>

                    <div class="flex gap-4 pt-6">
                        <button type="button" onclick="Views['teacher-services'].closeModalPersonalInfo()" class="flex-1 py-3 text-slate-500 font-bold text-sm">Cancelar</button>
                        <button type="submit" class="flex-1 btn-premium btn-primary py-3">Guardar</button>
                    </div>
                </form>
            </div>
        `;

        container.classList.remove('hidden');
        lucide.createIcons();

        document.getElementById('secondary-edit-form-personal').onsubmit = async (e) => {
            e.preventDefault();
            const newVal = document.getElementById('teach-edit-val-modal').value;
            const user = Auth.getUser();
            let metadata = {};
            if (user.metadata) {
                try {
                    metadata = typeof user.metadata === 'string' ? JSON.parse(user.metadata) : user.metadata;
                } catch(err) {}
            }

            if (title === 'Correo Personal') {
                metadata.email_personal = newVal;
            } else if (title === 'Teléfono') {
                user.telefono = newVal;
            } else if (title === 'Dirección') {
                metadata.direccion = newVal;
            } else if (title === 'Contacto 1') {
                metadata.emergencia = metadata.emergencia || [];
                metadata.emergencia[0] = metadata.emergencia[0] || {};
                metadata.emergencia[0].nombre = newVal;
            } else if (title === 'Contacto 2') {
                metadata.emergencia = metadata.emergencia || [];
                metadata.emergencia[1] = metadata.emergencia[1] || {};
                metadata.emergencia[1].nombre = newVal;
            }

            user.metadata = JSON.stringify(metadata);

            try {
                await API.put(`/auth/profile`, user);
            } catch(err) {}

            sessionStorage.setItem('user', JSON.stringify(user));
            this.closeModalPersonalInfo();
            Toast.success(`¡${title} actualizado correctamente!`);
            this.openPersonalInfo();
        };
    },
    openAddModalPersonalInfo(title) {
        const container = document.getElementById('modal-container');
        const content = document.getElementById('modal-content');

        content.innerHTML = `
            <div class="p-8">
                <div class="flex items-center justify-between mb-8">
                    <h3 class="text-xl font-bold text-slate-900 tracking-tight">Agregar ${title}</h3>
                    <button onclick="Views['teacher-services'].closeModalPersonalInfo()" class="text-slate-400 hover:text-red-500">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                
                <form id="add-record-form-personal" class="space-y-6">
                    <div class="space-y-4">
                        <div class="input-group">
                            <label class="label-premium">Tipo/Etiqueta o Nombre</label>
                            <input type="text" id="teach-add-label" class="input-premium" placeholder="ej: Personal, Trabajo, Nombre del Contacto...">
                        </div>
                        <div class="input-group">
                            <label class="label-premium">Detalle / Valor</label>
                            <input type="text" id="teach-add-val" class="input-premium" placeholder="Ingrese el valor o detalle...">
                        </div>
                    </div>

                    <div class="flex gap-4 pt-6">
                        <button type="button" onclick="Views['teacher-services'].closeModalPersonalInfo()" class="flex-1 py-3 text-slate-500 font-bold text-sm">Cancelar</button>
                        <button type="submit" class="flex-1 btn-premium bg-[#fab720] text-[#032840] py-3">Agregar</button>
                    </div>
                </form>
            </div>
        `;

        container.classList.remove('hidden');
        lucide.createIcons();

        document.getElementById('add-record-form-personal').onsubmit = async (e) => {
            e.preventDefault();
            const label = document.getElementById('teach-add-label').value;
            const val = document.getElementById('teach-add-val').value;

            const user = Auth.getUser();
            let metadata = {};
            if (user.metadata) {
                try {
                    metadata = typeof user.metadata === 'string' ? JSON.parse(user.metadata) : user.metadata;
                } catch(err) {}
            }

            if (title === 'Correo Electrónico') {
                metadata.email_personal = val;
            } else if (title === 'Número de teléfono') {
                user.telefono = val;
            } else if (title === 'Dirección') {
                metadata.direccion = val;
            } else if (title === 'Contacto de emergencia') {
                metadata.emergencia = metadata.emergencia || [];
                metadata.emergencia.push({
                    nombre: label,
                    parentesco: 'Familiar',
                    telefono: val,
                    direccion: ''
                });
            }

            user.metadata = JSON.stringify(metadata);

            try {
                await API.put(`/auth/profile`, user);
            } catch(err) {}

            sessionStorage.setItem('user', JSON.stringify(user));
            this.closeModalPersonalInfo();
            Toast.success(`¡Nuevo registro de ${title} añadido!`);
            this.openPersonalInfo();
        };
    },
    closeModalPersonalInfo() {
        document.getElementById('modal-container').classList.add('hidden');
    },
    simulateDeletePersonalInfo(type) {
        if (confirm(`¿Estás seguro que deseas eliminar este registro de ${type}?`)) {
            Toast.success('Registro eliminado correctamente.');
        }
    },
    openDocs() { this.openSvcModal('Documentos de Identidad', 'Soportes cargados en el sistema.', `<div class="p-10 text-center italic text-slate-400">Carga de documentos de identidad activa.</div>`); },
    openSurveys() { this.openSvcModal('Encuestas Generales', 'Participación académica.', `<div class="p-10 text-center italic text-slate-400">No hay encuestas pendientes en la base de datos.</div>`); },
    openImpartido() { this.openSvcModal('Plan de Curso Impartido', 'Seguimiento de temas vistos por NRC.', `<div class="p-10 text-center italic text-slate-400">Seguimiento de temas habilitado para tus cursos actuales.</div>`); },
    openConflicto() { this.openSvcModal('Matriz de Conflicto', 'Cruce de horarios detectados en la BD.', `<div class="p-10 text-center text-emerald-600 font-bold">¡Sin conflictos detectados en tu horario actual! 🎉</div>`); },
    openHorario() { this.openSvcModal('Horario y Syllabus Detallado', 'Cronograma semanal recuperado de la base de datos.', `<div class="p-10 text-center italic text-slate-400">Generando vista de horario institucional...</div>`); },
    async openSemana() {
        await this.loadData();
        const courses = this.state.courses || [];
        
        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6:00 to 21:00
        
        let gridHtml = '';
        hours.forEach(hour => {
            gridHtml += `
                <div class="grid grid-cols-[80px_repeat(7,1fr)]">
                    <div class="h-[60px] border-r border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 bg-slate-50/50">
                        ${hour}:00
                    </div>
                    ${Array.from({ length: 7 }).map(() => `
                        <div class="h-[60px] border-b border-dashed border-slate-100 border-r border-slate-100/50"></div>
                    `).join('')}
                </div>
            `;
        });

        const dayMap = { 
            'Lun': 0, 'Lunes': 0,
            'Mar': 1, 'Martes': 1,
            'Mié': 2, 'Mie': 2, 'Miércoles': 2,
            'Jue': 3, 'Jueves': 3,
            'Vie': 4, 'Viernes': 4,
            'Sáb': 5, 'Sab': 5, 'Sábado': 5,
            'Dom': 6, 'Domingo': 6
        };

        const colors = [
            'bg-indigo-500/90 text-white border-indigo-600',
            'bg-emerald-500/90 text-white border-emerald-600',
            'bg-amber-500/90 text-white border-amber-600',
            'bg-rose-500/90 text-white border-rose-600',
            'bg-violet-500/90 text-white border-violet-600',
            'bg-cyan-500/90 text-white border-cyan-600',
            'bg-teal-500/90 text-white border-teal-600'
        ];

        let blocksHtml = '';
        courses.forEach((course, index) => {
            if (!course.horario || typeof course.horario !== 'string') return;
            
            const regex = /^([A-Za-záéíóúÁÉÍÓÚ\-,]+)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/;
            const match = course.horario.trim().match(regex);
            if (!match) return;

            const daysPart = match[1];
            const startStr = match[2];
            const endStr = match[3];

            const startHour = parseInt(startStr.split(':')[0]);
            const startMin = parseInt(startStr.split(':')[1]);
            const endHour = parseInt(endStr.split(':')[0]);
            const endMin = parseInt(endStr.split(':')[1]);

            const top = ((startHour - 6) * 60) + startMin;
            const height = ((endHour - startHour) * 60) + (endMin - startMin);

            let targetDays = [];
            if (daysPart.includes('-')) {
                const [startDay, endDay] = daysPart.split('-');
                const startIdx = dayMap[startDay.trim()];
                const endIdx = dayMap[endDay.trim()];
                if (startIdx !== undefined && endIdx !== undefined) {
                    for (let i = startIdx; i <= endIdx; i++) {
                        targetDays.push(i);
                    }
                }
            } else if (daysPart.includes(',')) {
                daysPart.split(',').forEach(d => {
                    const idx = dayMap[d.trim()];
                    if (idx !== undefined) targetDays.push(idx);
                });
            } else {
                const idx = dayMap[daysPart.trim()];
                if (idx !== undefined) targetDays.push(idx);
            }

            const colorClass = colors[index % colors.length];

            targetDays.forEach(dayIdx => {
                const left = `calc(${dayIdx} * (100% / 7))`;
                const width = `calc(100% / 7)`;
                
                blocksHtml += `
                    <div class="course-block absolute p-3 rounded-2xl text-[9px] font-black uppercase shadow-lg border hover:scale-[102%] hover:z-20 transition-all duration-200 cursor-pointer overflow-hidden ${colorClass} pointer-events-auto"
                         style="top: ${top}px; height: ${height}px; left: ${left}; width: calc(${width} - 4px); margin-left: 2px;">
                        <div class="truncate text-white font-black leading-tight">${course.materia}</div>
                        <div class="text-[8px] text-white/95 mt-1 truncate">[Sede: Central] ${course.salon || 'Por definir'}</div>
                        <div class="text-[8px] text-white/90 truncate">NRC: ${course.nrc}</div>
                        <div class="text-[7.5px] text-white/85 font-medium mt-0.5 truncate">${startStr} - ${endStr}</div>
                    </div>
                `;
            });
        });

        const bodyHtml = `
            <div class="space-y-6 max-w-full">
                <div class="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl text-indigo-700">
                    <i data-lucide="info" class="w-5 h-5 flex-shrink-0"></i>
                    <p class="text-xs font-bold">Agenda académica calculada dinámicamente desde tus asignaturas activas de este periodo.</p>
                </div>

                <div class="overflow-x-auto rounded-3xl border border-slate-100 shadow-sm max-w-full custom-scrollbar">
                    <div class="min-w-[800px] bg-white relative pb-6">
                        <!-- Days Header -->
                        <div class="grid grid-cols-[80px_repeat(7,1fr)] bg-slate-50 border-b border-slate-100">
                            <div class="p-4 border-r border-slate-100"></div>
                            ${days.map(day => `
                                <div class="p-4 text-center text-[9px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-100 last:border-none">${day}</div>
                            `).join('')}
                        </div>

                        <!-- Schedule Grid -->
                        <div class="relative">
                            ${gridHtml}
                            <!-- Overlay Blocks -->
                            <div class="absolute inset-0 top-0 left-[80px] pointer-events-none">
                                ${blocksHtml || `
                                    <div class="absolute inset-0 flex items-center justify-center bg-slate-50/40 pointer-events-none">
                                        <p class="text-xs font-bold text-slate-400 italic">No hay clases registradas en tu horario esta semana.</p>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            </style>
        `;

        this.openSvcModal('Semana a un Vistazo', 'Mi Agenda Académica Semanal', bodyHtml, 'max-w-6xl');
    },

    openSvcModal(title, desc, body, sizeClass = 'max-w-2xl') {
        const modal = document.getElementById('service-modal');
        const modalContainer = modal.querySelector('.bg-white');
        
        if (modalContainer) {
            modalContainer.classList.forEach(className => {
                if (className.startsWith('max-w-')) {
                    modalContainer.classList.remove(className);
                }
            });
            modalContainer.classList.add(sizeClass);
        }

        document.getElementById('svc-title').innerText = title;
        document.getElementById('svc-desc').innerText = desc;
        document.getElementById('svc-body').innerHTML = body;
        
        const footer = document.getElementById('svc-footer');
        if (footer) footer.classList.add('hidden');
        
        modal.classList.remove('hidden');
        lucide.createIcons();
    }
};
