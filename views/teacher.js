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
                        <p class="text-slate-500 mt-1">Gestión integral de tus cursos y calificaciones en tiempo real.</p>
                    </div>
                    <div class="flex gap-3">
                        <button class="btn-premium btn-ghost" onclick="Views.teacher.render()">
                            <i data-lucide="refresh-cw" class="w-4 h-4"></i> Actualizar
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
                <p class="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">${course.codigo} • ${course.periodo}</p>
                
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

                <button onclick="Views.teacher.openCourse(${course.id}, '${course.materia}')" class="btn-premium btn-primary w-full py-3">
                    Gestionar Calificaciones
                </button>
            </div>
        `).join('');
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
                                <div class="text-[10px] text-slate-400 font-medium">${s.username}</div>
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

    afterRender() {
        lucide.createIcons();
    }
};

