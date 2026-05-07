/**
 * Premium Teacher Dashboard - Dynamic Enterprise Grade
 */

Views.teacher = {
    state: {
        courses: [],
        selectedCourse: null,
        selectedNRC: null,
        students: [],
        tempGrades: {},
        tempAttendance: {}
    },

    async render() {
        try {
            this.state.courses = await API.get('/teachers/my-courses');
        } catch (e) {
            console.error('Error loading courses', e);
        }

        return `
            <div class="space-y-10 animate-fade-in">
                
                <!-- Header Section -->
                <section class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 class="text-4xl font-extrabold text-slate-900 tracking-tight">Panel Docente</h2>
                        <p class="text-slate-500 mt-1">Gestión integral por NRC e ID Institucional.</p>
                    </div>
                    <div class="flex gap-3">
                        <button class="btn-premium btn-ghost" onclick="Views.teacher.triggerImport('grades')">
                            <i data-lucide="upload" class="w-4 h-4"></i> Importar Notas
                        </button>
                        <button class="btn-premium btn-ghost" onclick="Views.teacher.triggerImport('attendance')">
                            <i data-lucide="calendar" class="w-4 h-4"></i> Importar Asistencias
                        </button>
                        <input type="file" id="bulk-import-input" class="hidden" accept=".csv">
                        <button class="btn-premium btn-primary" onclick="Views.teacher.render()">
                            <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                        </button>
                    </div>
                </section>

                <!-- Courses Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${this.renderCourses()}
                    
                    <div class="card-premium group border-dashed border-slate-200 bg-slate-50/50 shadow-none hover:shadow-none flex flex-col items-center justify-center py-12">
                        <div class="w-16 h-16 rounded-full bg-slate-200/50 flex items-center justify-center mb-4">
                            <i data-lucide="plus" class="w-8 h-8 text-slate-400"></i>
                        </div>
                        <p class="text-slate-400 font-bold text-sm">Solicitar Nuevo Curso</p>
                    </div>
                </div>

                <!-- Modal de Calificaciones y Asistencias -->
                <div id="grades-modal" class="hidden fixed inset-0 z-[60] overflow-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div class="bg-white rounded-[32px] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col transform transition-all animate-scale-up">
                        <div class="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h3 id="modal-course-title" class="text-2xl font-black text-slate-900">Gestionar Curso</h3>
                                <p id="modal-course-subtitle" class="text-sm text-slate-500 font-medium"></p>
                            </div>
                            <button onclick="Views.teacher.closeModal()" class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                                <i data-lucide="x" class="w-5 h-5 text-slate-600"></i>
                            </button>
                        </div>
                        
                        <div class="p-8 overflow-y-auto flex-grow">
                            <div class="overflow-x-auto">
                                <table class="w-full text-left">
                                    <thead>
                                        <tr id="modal-table-header" class="border-b border-slate-100">
                                            <!-- Cabecera dinámica -->
                                        </tr>
                                    </thead>
                                    <tbody id="students-list-body" class="divide-y divide-slate-50">
                                        <!-- Estudiantes se cargarán aquí -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div id="modal-footer" class="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button onclick="Views.teacher.closeModal()" class="btn-premium btn-ghost">Cerrar</button>
                            <button id="btn-save-all" class="btn-premium btn-primary px-8 font-black uppercase text-xs tracking-widest">Guardar Todo</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderCourses() {
        if (!this.state.courses.length) return `<div class="col-span-full py-20 text-center text-slate-400 font-medium">No tienes cursos asignados para este periodo.</div>`;

        return this.state.courses.map(course => `
            <div class="card-premium group">
                <div class="flex items-center justify-between mb-6">
                    <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        <i data-lucide="book" class="w-6 h-6"></i>
                    </div>
                    <span class="badge badge-success">Activo</span>
                </div>
                <h3 class="text-xl font-black mb-1 text-slate-900">${course.materia}</h3>
                <p class="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">NRC: ${course.nrc} • ${course.codigo}</p>
                
                <div class="flex items-center gap-6 mb-8 text-slate-700">
                    <div>
                        <div class="text-2xl font-black">${course.num_estudiantes}</div>
                        <div class="text-[10px] text-slate-500 font-bold uppercase">Estudiantes</div>
                    </div>
                    <div class="w-px h-8 bg-slate-100"></div>
                    <div>
                        <div class="text-sm font-bold text-slate-800">${course.salon}</div>
                        <div class="text-[10px] text-slate-500 font-bold uppercase">${course.horario}</div>
                    </div>
                </div>

                <div class="flex gap-2">
                    <button onclick="Views.teacher.openCourse(${course.id}, '${course.materia}')" class="btn-premium btn-primary flex-1 py-3 text-xs">
                        Notas
                    </button>
                    <button onclick="Views.teacher.openAttendance(${course.id}, '${course.materia}', '${course.nrc}')" class="btn-premium btn-ghost flex-1 py-3 text-xs">
                        Asistencias
                    </button>
                </div>
            </div>
        `).join('');
    },

    async openCourse(courseId, courseName) {
        this.state.selectedCourse = courseId;
        const modal = document.getElementById('grades-modal');
        document.getElementById('modal-course-title').innerText = courseName;
        document.getElementById('modal-course-subtitle').innerText = 'Gestión de Calificaciones por Corte';
        modal.classList.remove('hidden');

        const datePicker = document.getElementById('attendance-date-picker-div');
        if (datePicker) datePicker.classList.add('hidden');

        const btnSave = document.getElementById('btn-save-all');
        btnSave.onclick = () => this.saveAllGrades();
        btnSave.innerText = 'Guardar Todas las Notas';

        const body = document.getElementById('students-list-body');
        body.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-slate-400 italic">Cargando estudiantes...</td></tr>`;

        try {
            this.state.students = await API.get(`/teachers/courses/${courseId}/students`);
            this.renderStudents();
        } catch (e) {
            body.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-rose-500 font-bold">Error</td></tr>`;
        }
        lucide.createIcons();
    },

    renderStudents() {
        const body = document.getElementById('students-list-body');
        const header = document.getElementById('modal-table-header');
        
        header.innerHTML = `
            <th class="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estudiante</th>
            <th class="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Corte 1 (30%)</th>
            <th class="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Corte 2 (30%)</th>
            <th class="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Corte 3 (40%)</th>
            <th class="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
        `;

        body.innerHTML = this.state.students.map(s => `
            <tr class="hover:bg-slate-50/50 transition-colors">
                <td class="py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">${s.nombres[0]}${s.apellidos[0]}</div>
                        <div>
                            <div class="text-sm font-bold text-slate-900">${s.nombres} ${s.apellidos}</div>
                            <div class="text-[10px] text-indigo-600 font-black tracking-widest">ID: ${s.institutional_id}</div>
                        </div>
                    </div>
                </td>
                <td class="py-4 text-center">
                    <input type="number" step="0.1" min="0" max="5" value="${s.grades['Corte 1'] || ''}" 
                        class="w-16 text-center bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900 outline-none"
                        onchange="Views.teacher.updateTempGrade(${s.matricula_id}, 'Corte 1', this.value)">
                </td>
                <td class="py-4 text-center">
                    <input type="number" step="0.1" min="0" max="5" value="${s.grades['Corte 2'] || ''}" 
                        class="w-16 text-center bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900 outline-none"
                        onchange="Views.teacher.updateTempGrade(${s.matricula_id}, 'Corte 2', this.value)">
                </td>
                <td class="py-4 text-center">
                    <input type="number" step="0.1" min="0" max="5" value="${s.grades['Corte 3'] || ''}" 
                        class="w-16 text-center bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900 outline-none"
                        onchange="Views.teacher.updateTempGrade(${s.matricula_id}, 'Corte 3', this.value)">
                </td>
                <td class="py-4 text-right">
                    <button onclick="Views.teacher.saveGrades(${s.matricula_id})" class="text-emerald-600 p-2 hover:bg-emerald-50 rounded-lg">
                        <i data-lucide="save" class="w-5 h-5"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        lucide.createIcons();
    },

    async openAttendance(courseId, courseName, nrc) {
        this.state.selectedCourse = courseId;
        this.state.selectedNRC = nrc;
        const modal = document.getElementById('grades-modal');
        document.getElementById('modal-course-title').innerText = `Asistencia: ${courseName}`;
        document.getElementById('modal-course-subtitle').innerText = `NRC: ${nrc} • Pase de lista diario`;
        modal.classList.remove('hidden');

        const btnSave = document.getElementById('btn-save-all');
        btnSave.onclick = () => this.saveAllAttendance();
        btnSave.innerText = 'Guardar Toda la Asistencia';

        let datePickerDiv = document.getElementById('attendance-date-picker-div');
        if (!datePickerDiv) {
            const header = document.querySelector('#grades-modal .p-8.border-b');
            datePickerDiv = document.createElement('div');
            datePickerDiv.id = 'attendance-date-picker-div';
            datePickerDiv.className = 'mt-4 flex items-center gap-4';
            datePickerDiv.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="text-[10px] font-black text-slate-400 uppercase">Fecha:</span>
                    <input type="date" id="attendance-date-picker" value="${new Date().toISOString().split('T')[0]}" 
                           onchange="Views.teacher.refreshAttendanceList()"
                           class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm font-bold text-indigo-600 outline-none">
                </div>
                <button onclick="Views.teacher.openAttendanceReport()" class="btn-premium btn-ghost py-2 text-[10px]">
                    <i data-lucide="table" class="w-3 h-3"></i> Sábana de Asistencias
                </button>
            `;
            header.appendChild(datePickerDiv);
        } else {
            datePickerDiv.classList.remove('hidden');
        }

        try {
            this.state.students = await API.get(`/teachers/courses/${courseId}/students`);
            await this.refreshAttendanceList();
        } catch (e) {
            console.error(e);
        }
        lucide.createIcons();
    },

    async refreshAttendanceList() {
        const date = document.getElementById('attendance-date-picker').value;
        const res = await API.get(`/teachers/courses/${this.state.selectedCourse}/attendance?date=${date}`);
        const map = {};
        res.forEach(a => map[a.student_id] = a.status);
        this.renderAttendanceList(map);
    },

    renderAttendanceList(map = {}) {
        const body = document.getElementById('students-list-body');
        const header = document.getElementById('modal-table-header');
        header.innerHTML = `
            <th class="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estudiante</th>
            <th class="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
            <th class="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
        `;

        body.innerHTML = this.state.students.map(s => {
            const status = map[s.institutional_id] || 'presente';
            this.state.tempAttendance[s.institutional_id] = status;
            return `
                <tr class="hover:bg-slate-50/50 transition-colors">
                    <td class="py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">${s.nombres[0]}${s.apellidos[0]}</div>
                            <div>
                                <div class="text-sm font-bold text-slate-900">${s.nombres} ${s.apellidos}</div>
                                <div class="text-[10px] text-indigo-600 font-black">ID: ${s.institutional_id}</div>
                            </div>
                        </div>
                    </td>
                    <td class="py-4 text-center">
                        <div class="inline-flex bg-slate-100 p-1 rounded-xl gap-1">
                            <button onclick="Views.teacher.markTempStatus('${s.institutional_id}', 'presente')" id="btn-p-${s.institutional_id}" 
                                class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${status === 'presente' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}">P</button>
                            <button onclick="Views.teacher.markTempStatus('${s.institutional_id}', 'ausente_no_justificada')" id="btn-a-${s.institutional_id}" 
                                class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${status === 'ausente_no_justificada' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-400'}">A</button>
                            <button onclick="Views.teacher.markTempStatus('${s.institutional_id}', 'ausente_justificada')" id="btn-j-${s.institutional_id}" 
                                class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${status === 'ausente_justificada' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-400'}">J</button>
                        </div>
                    </td>
                    <td class="py-4 text-right">
                        <button onclick="Views.teacher.saveSingleAttendance('${s.institutional_id}')" class="text-indigo-600 p-2">
                            <i data-lucide="check-circle" class="w-5 h-5"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        lucide.createIcons();
    },

    async saveAllAttendance() {
        const date = document.getElementById('attendance-date-picker').value;
        const data = this.state.students.map(s => ({
            nrc: this.state.selectedNRC,
            student_id: s.institutional_id,
            status: this.state.tempAttendance[s.institutional_id] || 'presente',
            date: date
        }));
        try {
            await API.post('/teachers/import-attendance', { data });
            Toast.show('Asistencia guardada con éxito', 'success');
        } catch (e) {
            Toast.error('Error al guardar');
        }
    },

    async saveAllGrades() {
        const allPromises = [];
        for (const [mId, grades] of Object.entries(this.state.tempGrades)) {
            for (const [comp, val] of Object.entries(grades)) {
                allPromises.push(API.post('/teachers/update-grade', { matricula_id: mId, componente: comp, valor: val }));
            }
        }
        try {
            if (allPromises.length === 0) return Toast.show('No hay cambios pendientes', 'info');
            await Promise.all(allPromises);
            Toast.show('Todas las notas se han guardado correctamente', 'success');
            this.state.tempGrades = {};
        } catch (e) {
            Toast.error('Error al guardar notas masivas');
        }
    },

    updateTempGrade(mId, comp, val) {
        this.state.tempGrades[mId] = this.state.tempGrades[mId] || {};
        this.state.tempGrades[mId][comp] = val;
    },

    async saveGrades(mId) {
        const grades = this.state.tempGrades[mId];
        if (!grades) return Toast.show('Sin cambios', 'info');
        try {
            for (const [comp, val] of Object.entries(grades)) {
                await API.post('/teachers/update-grade', { matricula_id: mId, componente: comp, valor: val });
            }
            Toast.show('Notas de estudiante guardadas', 'success');
            delete this.state.tempGrades[mId];
        } catch (e) {
            Toast.error('Error');
        }
    },

    markTempStatus(sId, status) {
        this.state.tempAttendance[sId] = status;
        this.renderAttendanceList(this.state.tempAttendance);
    },

    async saveSingleAttendance(sId) {
        const date = document.getElementById('attendance-date-picker').value;
        try {
            await API.post('/teachers/import-attendance', {
                data: [{ nrc: this.state.selectedNRC, student_id: sId, status: this.state.tempAttendance[sId], date }]
            });
            Toast.show('Asistencia guardada', 'success');
        } catch (e) {
            Toast.error('Error');
        }
    },

    async openAttendanceReport() {
        const res = await API.get(`/teachers/courses/${this.state.selectedCourse}/attendance-report`);
        const header = document.getElementById('modal-table-header');
        const body = document.getElementById('students-list-body');

        let headerHtml = `<th class="pb-4 text-[10px] font-black text-slate-400 uppercase sticky left-0 bg-white">Estudiante</th>`;
        res.dates.forEach(d => {
            headerHtml += `<th class="pb-4 text-[10px] font-black text-slate-400 uppercase text-center min-w-[60px]">${d.split('-').slice(1).join('/')}</th>`;
        });
        header.innerHTML = headerHtml;

        body.innerHTML = res.students.map(s => `
            <tr>
                <td class="py-3 sticky left-0 bg-white/90 backdrop-blur-sm z-10 font-bold text-xs">${s.name}</td>
                ${res.dates.map(d => {
                    const rec = s.history.find(h => h.fecha === d);
                    let cls = 'bg-slate-100 text-slate-300';
                    let lbl = '-';
                    if (rec) {
                        if (rec.tipo === 'presente') { cls = 'bg-emerald-100 text-emerald-600'; lbl = 'P'; }
                        if (rec.tipo === 'ausente_no_justificada') { cls = 'bg-rose-100 text-rose-600'; lbl = 'A'; }
                        if (rec.tipo === 'ausente_justificada') { cls = 'bg-amber-100 text-amber-600'; lbl = 'J'; }
                    }
                    return `<td class="text-center"><span class="w-6 h-6 inline-flex items-center justify-center rounded text-[10px] font-black ${cls}">${lbl}</span></td>`;
                }).join('')}
            </tr>
        `).join('');
    },

    closeModal() {
        document.getElementById('grades-modal').classList.add('hidden');
        this.state.tempGrades = {};
        this.state.tempAttendance = {};
    },

    triggerImport(type) {
        const input = document.getElementById('bulk-import-input');
        input.onchange = async (e) => {
            const file = e.target.files[0];
            const text = await file.text();
            const lines = text.split('\n').filter(l => l.trim());
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const rows = lines.slice(1).map(l => {
                const vals = l.split(',');
                const obj = {};
                headers.forEach((h, i) => obj[h] = vals[i].trim());
                return obj;
            });
            const endpoint = type === 'grades' ? '/teachers/import-grades' : '/teachers/import-attendance';
            const res = await API.post(endpoint, { data: rows });
            Toast.show(`Importación exitosa: ${res.success} registros`, 'success');
            this.render();
        };
        input.click();
    }
};
