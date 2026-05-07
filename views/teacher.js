/**
 * Premium Teacher Dashboard - Dynamic Enterprise Grade
 */

Views.teacher = {
    state: {
        courses: [],
        selectedCourse: null,
        students: []
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

                <!-- Modal de Calificaciones -->
                <div id="grades-modal" class="hidden fixed inset-0 z-[60] overflow-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div class="bg-white rounded-[32px] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col transform transition-all animate-scale-up">
                        <div class="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h3 id="modal-course-title" class="text-2xl font-black text-slate-900">Gestionar Calificaciones</h3>
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
                                        <tr class="border-b border-slate-100">
                                            <th class="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estudiante</th>
                                            <th class="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Corte 1 (30%)</th>
                                            <th class="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Corte 2 (30%)</th>
                                            <th class="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Corte 3 (40%)</th>
                                            <th class="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Definitiva</th>
                                        </tr>
                                    </thead>
                                    <tbody id="students-list-body" class="divide-y divide-slate-50">
                                        <!-- Estudiantes se cargarán aquí -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button onclick="Views.teacher.closeModal()" class="btn-premium btn-ghost">Cerrar</button>
                            <button onclick="Views.teacher.closeModal()" class="btn-premium btn-primary px-8">Finalizar Sesión</button>
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
                <div class="flex justify-between items-start mb-6">
                    <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <i data-lucide="book-open" class="w-6 h-6"></i>
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

    async openAttendance(courseId, courseName, nrc) {
        this.state.selectedCourse = courseId;
        this.state.selectedNRC = nrc;
        
        const modal = document.getElementById('grades-modal');
        document.getElementById('modal-course-title').innerText = `Asistencia: ${courseName}`;
        document.getElementById('modal-course-subtitle').innerText = `NRC: ${nrc} • Selecciona la fecha y marca la asistencia`;
        modal.classList.remove('hidden');

        const body = document.getElementById('students-list-body');
        body.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-slate-400 italic">Cargando lista...</td></tr>`;

        // Añadir selector de fecha al header del modal dinámicamente si no existe
        let datePicker = document.getElementById('attendance-date-picker');
        if (!datePicker) {
            const header = document.querySelector('#grades-modal .p-8.border-b');
            const div = document.createElement('div');
            div.className = 'mt-4 flex items-center gap-2';
            div.innerHTML = `
                <div class="flex items-center gap-4">
                    <span class="text-xs font-bold text-slate-400 uppercase">Fecha:</span>
                    <input type="date" id="attendance-date-picker" value="${new Date().toISOString().split('T')[0]}" 
                           onchange="Views.teacher.refreshAttendanceList()"
                           class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm font-bold text-indigo-600 outline-none">
                </div>
                <button onclick="Views.teacher.openAttendanceReport()" class="btn-premium btn-ghost py-2 text-[10px]">
                    <i data-lucide="table" class="w-3 h-3"></i> Reporte Completo
                </button>
            `;
            header.appendChild(div);
            datePicker = document.getElementById('attendance-date-picker');
        } else {
            datePicker.parentElement.classList.remove('hidden');
        }

        try {
            this.state.students = await API.get(`/teachers/courses/${courseId}/students`);
            await this.refreshAttendanceList();
        } catch (e) {
            body.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-rose-500 font-bold">Error</td></tr>`;
        }
        lucide.createIcons();
    },

    async refreshAttendanceList() {
        const date = document.getElementById('attendance-date-picker').value;
        const courseId = this.state.selectedCourse;
        
        try {
            // Obtener asistencias ya guardadas para esta fecha
            const savedAttendance = await API.get(`/teachers/courses/${courseId}/attendance?date=${date}`);
            
            // Mapear a un objeto para fácil acceso
            const attendanceMap = {};
            savedAttendance.forEach(a => attendanceMap[a.student_id] = a.status);
            
            this.renderAttendanceList(attendanceMap);
        } catch (e) {
            Toast.error('Error al cargar asistencias del día');
        }
    },

    renderAttendanceList(attendanceMap = {}) {
        const body = document.getElementById('students-list-body');
        const thead = document.querySelector('#grades-modal thead tr');
        
        thead.innerHTML = `
            <th class="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estudiante</th>
            <th class="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado de Asistencia</th>
            <th class="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
        `;

        body.innerHTML = this.state.students.map(s => {
            const status = attendanceMap[s.institutional_id] || 'presente';
            this.state.tempAttendance = this.state.tempAttendance || {};
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
                        <button onclick="Views.teacher.saveSingleAttendance('${s.institutional_id}')" class="text-indigo-600 hover:text-indigo-800">
                            <i data-lucide="check-circle" class="w-5 h-5"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        lucide.createIcons();
    },

    async openAttendanceReport() {
        const courseId = this.state.selectedCourse;
        const body = document.getElementById('students-list-body');
        const thead = document.querySelector('#grades-modal thead tr');
        
        body.innerHTML = `<tr><td colspan="10" class="py-20 text-center text-slate-400 italic">Generando sábana de asistencias...</td></tr>`;

        try {
            const report = await API.get(`/teachers/courses/${courseId}/attendance-report`);
            
            // Renderizar cabecera con fechas
            let headerHtml = `<th class="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-white z-10">Estudiante</th>`;
            report.dates.forEach(date => {
                headerHtml += `<th class="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center min-w-[60px]">${date.split('-').slice(1).join('/')}</th>`;
            });
            thead.innerHTML = headerHtml;

            // Renderizar filas
            body.innerHTML = report.students.map(s => `
                <tr class="hover:bg-slate-50/50 transition-colors">
                    <td class="py-3 sticky left-0 bg-white/90 backdrop-blur-sm z-10 border-r border-slate-100">
                        <div class="text-xs font-bold text-slate-900">${s.name}</div>
                        <div class="text-[9px] text-slate-400 font-black">${s.student_id}</div>
                    </td>
                    ${report.dates.map(date => {
                        const rec = s.history.find(h => h.fecha === date);
                        let color = 'bg-slate-100 text-slate-300';
                        let label = '-';
                        if (rec) {
                            if (rec.tipo === 'presente') { color = 'bg-emerald-100 text-emerald-600'; label = 'P'; }
                            if (rec.tipo === 'ausente_no_justificada') { color = 'bg-rose-100 text-rose-600'; label = 'A'; }
                            if (rec.tipo === 'ausente_justificada') { color = 'bg-amber-100 text-amber-600'; label = 'J'; }
                        }
                        return `<td class="py-3 text-center">
                            <span class="w-6 h-6 inline-flex items-center justify-center rounded-md text-[10px] font-black ${color}">${label}</span>
                        </td>`;
                    }).join('')}
                </tr>
            `).join('');

        } catch (e) {
            Toast.error('Error al generar el reporte');
        }
    },

    markTempStatus(studentId, status) {
        // UI feedback local
        const btns = {
            'presente': document.getElementById(`btn-p-${studentId}`),
            'ausente_no_justificada': document.getElementById(`btn-a-${studentId}`),
            'ausente_justificada': document.getElementById(`btn-j-${studentId}`)
        };
        
        Object.values(btns).forEach(b => {
            b.classList.remove('bg-white', 'shadow-sm', 'text-emerald-600', 'text-rose-600', 'text-amber-600');
            b.classList.add('text-slate-400');
        });

        const active = btns[status];
        active.classList.remove('text-slate-400');
        active.classList.add('bg-white', 'shadow-sm');
        
        if(status === 'presente') active.classList.add('text-emerald-600');
        if(status === 'ausente_no_justificada') active.classList.add('text-rose-600');
        if(status === 'ausente_justificada') active.classList.add('text-amber-600');

        // Guardar estado en un objeto temporal si se desea guardar todo al final
        this.state.tempAttendance = this.state.tempAttendance || {};
        this.state.tempAttendance[studentId] = status;
    },

    async saveSingleAttendance(studentId) {
        const status = this.state.tempAttendance?.[studentId] || 'presente';
        const date = document.getElementById('attendance-date-picker').value;

        try {
            await API.post('/teachers/import-attendance', {
                data: [{
                    nrc: this.state.selectedNRC,
                    student_id: studentId,
                    status: status,
                    date: date
                }]
            });
            Toast.show('Asistencia guardada', 'success');
        } catch (e) {
            Toast.error('Error al guardar');
        }
    },

    async openCourse(courseId, courseName) {
        this.state.selectedCourse = courseId;
        document.getElementById('modal-course-title').innerText = courseName;
        document.getElementById('modal-course-subtitle').innerText = 'Gestión de calificaciones por corte académico';
        document.getElementById('grades-modal').classList.remove('hidden');
        
        const body = document.getElementById('students-list-body');
        body.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-slate-400 italic">Cargando lista de estudiantes...</td></tr>`;

        try {
            this.state.students = await API.get(`/teachers/courses/${courseId}/students`);
            this.renderStudents();
        } catch (e) {
            body.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-rose-500 font-bold">Error al cargar estudiantes</td></tr>`;
        }
        
        lucide.createIcons();
    },

    renderStudents() {
        const body = document.getElementById('students-list-body');
        if (!this.state.students.length) {
            body.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-slate-400 italic">No hay estudiantes matriculados en este curso.</td></tr>`;
            return;
        }

        body.innerHTML = this.state.students.map(s => {
            const def = ((s.grades['Corte 1'] || 0) * 0.3 + (s.grades['Corte 2'] || 0) * 0.3 + (s.grades['Corte 3'] || 0) * 0.4).toFixed(2);
            return `
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
                               onchange="Views.teacher.updateGrade(${s.matricula_id}, 'Corte 1', this.value)"
                               class="w-16 p-2 bg-slate-50 border border-slate-100 rounded-lg text-center font-bold text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
                    </td>
                    <td class="py-4 text-center">
                        <input type="number" step="0.1" min="0" max="5" value="${s.grades['Corte 2'] || ''}" 
                               onchange="Views.teacher.updateGrade(${s.matricula_id}, 'Corte 2', this.value)"
                               class="w-16 p-2 bg-slate-50 border border-slate-100 rounded-lg text-center font-bold text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
                    </td>
                    <td class="py-4 text-center">
                        <input type="number" step="0.1" min="0" max="5" value="${s.grades['Corte 3'] || ''}" 
                               onchange="Views.teacher.updateGrade(${s.matricula_id}, 'Corte 3', this.value)"
                               class="w-16 p-2 bg-slate-50 border border-slate-100 rounded-lg text-center font-bold text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
                    </td>
                    <td class="py-4 text-center">
                        <span class="text-lg font-black ${def >= 3 ? 'text-emerald-600' : 'text-rose-600'}">${def}</span>
                    </td>
                </tr>
            `;
        }).join('');
    },

    async updateGrade(matriculaId, corte, value) {
        if (value < 0 || value > 5) {
            Toast.error('La nota debe estar entre 0.0 y 5.0');
            return;
        }

        try {
            const res = await API.post('/teachers/update-grade', {
                matricula_id: matriculaId,
                componente: corte,
                valor: parseFloat(value)
            });

            if (res.success) {
                Toast.show('Nota guardada', 'success');
                // Actualizar estado local para recalcular definitiva
                const student = this.state.students.find(s => s.matricula_id === matriculaId);
                if (student) {
                    student.grades[corte] = parseFloat(value);
                    this.renderStudents();
                }
            }
        } catch (e) {
            Toast.error('Error al guardar la nota');
        }
    },

    closeModal() {
        document.getElementById('grades-modal').classList.add('hidden');
    },

    triggerImport(type) {
        const input = document.getElementById('bulk-import-input');
        input.onchange = (e) => this.handleFile(e, type);
        input.click();
    },

    async handleFile(e, type) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const rows = this.parseCSV(text);
            
            if (rows.length === 0) {
                Toast.error('Archivo vacío o inválido');
                return;
            }

            try {
                Toast.info('Procesando carga masiva...');
                const endpoint = type === 'grades' ? '/teachers/import-grades' : '/teachers/import-attendance';
                const res = await API.post(endpoint, { data: rows });
                
                if (res.errors && res.errors.length > 0) {
                    Toast.warning(`Cargados: ${res.success}. Errores: ${res.errors.length}`);
                    console.error('Errores de importación:', res.errors);
                } else {
                    Toast.show(`Importación exitosa: ${res.success} registros`, 'success');
                }
                this.render();
            } catch (err) {
                Toast.error('Error en el servidor al importar');
            }
        };
        reader.readAsText(file);
    },

    parseCSV(text) {
        const lines = text.split('\n').filter(l => l.trim() !== '');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj = {};
            headers.forEach((h, i) => {
                obj[h] = values[i];
            });
            return obj;
        });
    },

    afterRender() {
        lucide.createIcons();
    }
};

