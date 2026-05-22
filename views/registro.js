/**
 * Premium Registro Académico Dashboard - Enterprise Standard
 * Full User Lifecycle & Institutional Data Management
 */

Views.registro = {
    currentTab: 'directorio',
    users: [],
    searchQuery: '',
    selectedUser: null,
    isEditingFicha: false,
    isAddingFamiliar: false,
    solicitudes: null,

    async render() {
        // Automatically sync currentTab with the routing hash
        const hash = window.location.hash;
        if (hash === '#/registro-solicitudes') {
            this.currentTab = 'solicitudes';
        } else if (hash === '#/registro-cursos') {
            this.currentTab = 'cursos';
        } else if (hash === '#/registro-inscripcion') {
            this.currentTab = 'inscripcion';
        } else {
            this.currentTab = 'directorio';
        }

        if (this.users.length === 0 && !this.searchQuery) {
            await this.loadUsers();
        }
        if (this.currentTab === 'solicitudes' && !this.solicitudes) {
            await this.loadSolicitudes();
        }
        if (this.currentTab === 'inscripcion' && !this.cursosList) {
            await this.loadInscripcionData();
        }

        const filteredUsers = this.users.filter(u =>
            u.nombres.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            u.apellidos.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            u.username.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            u.documento?.includes(this.searchQuery)
        );

        // Header copy depending on current tab
        let headerTitle = "Directorio Central";
        let headerSubtitle = "Gestión integral de la población institucional y fichas maestras.";

        if (this.currentTab === 'solicitudes') {
            headerTitle = "Solicitudes Académicas";
            headerSubtitle = "Procesamiento de peticiones, retiros y reingresos estudiantiles.";
        } else if (this.currentTab === 'cursos') {
            headerTitle = "Programación de Cursos";
            headerSubtitle = "Oferta académica y asignación horaria para el periodo activo.";
        } else if (this.currentTab === 'inscripcion') {
            headerTitle = "Inscripción Estudiantes";
            headerSubtitle = "Matrícula directa de estudiantes a los cursos ofertados.";
        }

        return `
            <div class="space-y-10 pb-24 animate-fade-in">
                
                <!-- Registro Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                    <div>
                        <h2 class="text-4xl font-extrabold text-[#032840] tracking-tight">${headerTitle}</h2>
                        <p class="text-slate-500 mt-2 italic font-medium">${headerSubtitle}</p>
                    </div>
                </div>

                <!-- Content Area -->
                <div id="registro-content" class="min-h-[600px]">
                    ${this.currentTab === 'directorio' ? this.renderDirectorio(filteredUsers) : 
                      this.currentTab === 'solicitudes' ? this.renderSolicitudes() : 
                      this.currentTab === 'cursos' ? this.renderCursos() :
                      this.renderInscripcion()}
                </div>
            </div>

            <!-- Ficha Modal -->
            <div id="ficha-modal" class="fixed inset-0 bg-[#032840]/60 backdrop-blur-md z-[100] hidden flex items-center justify-center p-4">
                <div class="bg-white rounded-[32px] w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative" id="ficha-content">
                    <!-- Loaded dynamically -->
                </div>
            </div>

            <!-- Custom Confirm Modal -->
            <div id="custom-confirm-modal" class="fixed inset-0 bg-[#032840]/80 backdrop-blur-sm z-[200] hidden flex items-center justify-center p-4 opacity-0 transition-opacity duration-300">
                <div class="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl transform scale-95 transition-transform duration-300" id="custom-confirm-box">
                    <div class="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mx-auto mb-6" id="custom-confirm-icon-bg">
                        <i data-lucide="alert-triangle" class="w-8 h-8 text-red-500" id="custom-confirm-icon"></i>
                    </div>
                    <h3 class="text-xl font-black text-center text-[#032840] mb-2" id="custom-confirm-title">Confirmación Requerida</h3>
                    <p class="text-sm text-center text-slate-500 font-medium mb-8" id="custom-confirm-message">¿Estás seguro de continuar con esta acción?</p>
                    <div class="flex gap-4">
                        <button id="custom-confirm-cancel" class="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">Cancelar</button>
                        <button id="custom-confirm-accept" class="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all">Sí, Continuar</button>
                    </div>
                </div>
            </div>
        `;
    },

    renderDirectorio(users) {
        return `
            <div class="space-y-8 animate-fade-in">
                <!-- Search & Stats -->
                <div class="flex flex-col md:flex-row gap-6">
                    <div class="flex-grow relative">
                        <i data-lucide="search" class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input type="text" 
                            onkeyup="Views.registro.handleSearch(this.value)"
                            value="${this.searchQuery}"
                            placeholder="Buscar en el universo institucional (Nombre, ID, Cédula)..." 
                            class="input-premium pl-16 w-full h-16 text-lg">
                    </div>
                    <div class="card-premium py-4 px-8 bg-white flex items-center gap-4">
                        <div class="text-xs font-black text-slate-400 uppercase tracking-widest">Base de Datos</div>
                        <div class="text-2xl font-black text-[#032840]">${users.length} Registros</div>
                    </div>
                </div>

                <!-- Directory Table -->
                <div class="card-premium bg-white p-0 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead>
                                <tr class="text-xs text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/50">
                                    <th class="px-8 py-6 font-black">Usuario / Identidad</th>
                                    <th class="px-8 py-6 font-black">Rol Institutional</th>
                                    <th class="px-8 py-6 font-black">Documento</th>
                                    <th class="px-8 py-6 font-black">Estado</th>
                                    <th class="px-8 py-6 text-right">Ficha</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-50">
                                ${users.map(u => `
                                    <tr class="group hover:bg-slate-50 transition-all duration-300">
                                        <td class="px-8 py-5">
                                            <div class="flex items-center gap-4">
                                                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-[#032840] group-hover:text-white transition-all">
                                                    ${u.nombres[0]}
                                                </div>
                                                <div>
                                                    <div class="font-bold text-slate-900 group-hover:text-[#032840]">${u.nombres} ${u.apellidos}</div>
                                                    <div class="text-[10px] text-slate-400 font-bold uppercase">${u.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-8 py-5">
                                            <span class="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${this.getRolStyles(u.rol)}">
                                                ${u.rol === 'admin' ? 'ADMIN TI' : u.rol}
                                            </span>
                                        </td>
                                        <td class="px-8 py-5 text-sm font-medium text-slate-600">${u.documento || 'No Registrado'}</td>
                                        <td class="px-8 py-5">
                                            <div class="flex items-center gap-2">
                                                <div class="w-2 h-2 rounded-full ${u.activo ? 'bg-emerald-500' : 'bg-red-500'}"></div>
                                                <span class="text-[10px] font-black uppercase tracking-tighter text-slate-400">${u.activo ? 'Activo' : 'Inactivo'}</span>
                                            </div>
                                        </td>
                                        <td class="px-8 py-5 text-right">
                                            <button onclick="Views.registro.openFicha(${u.id})" class="btn-premium px-6 py-2 text-[10px] bg-slate-100 text-[#032840] hover:bg-[#032840] hover:text-white">
                                                VER FICHA MASTER
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    renderSolicitudes() {
        return `
            <div class="card-premium bg-white p-0 overflow-hidden animate-fade-in">
                <div class="p-10 border-b border-slate-100">
                    <h3 class="text-xl font-bold text-slate-900">Módulo de Trámites y Certificados</h3>
                    <p class="text-sm text-slate-500">Solicitudes entrantes para emisión de documentos.</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-50 bg-slate-50/20">
                                <th class="px-10 py-6 font-black">Solicitante</th>
                                <th class="px-10 py-6 font-black">Tipo de Trámite</th>
                                <th class="px-10 py-6 font-black">Prioridad</th>
                                <th class="px-10 py-6 text-right">Gestión</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(this.solicitudes || []).length === 0 ? `
                                <tr><td colspan="4" class="px-10 py-10 text-center text-slate-400 italic">No hay solicitudes pendientes</td></tr>
                            ` : (this.solicitudes || []).map(s => `
                                <tr class="hover:bg-slate-50 transition-colors">
                                    <td class="px-10 py-6 font-bold text-slate-900">${s.nombres} ${s.apellidos}</td>
                                    <td class="px-10 py-6 text-slate-600">${s.tipo} <br><span class="text-[10px] text-slate-400">${new Date(s.fecha).toLocaleDateString()}</span></td>
                                    <td class="px-10 py-6">
                                        <span class="badge ${s.estado === 'pendiente' ? 'bg-red-50 text-red-600 border-red-100' : s.estado === 'en_proceso' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'} uppercase text-[9px] px-2 py-1">
                                            ${s.estado.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td class="px-10 py-6 text-right">
                                        ${s.estado === 'pendiente' ? `
                                            <button onclick="Views.registro.procesarSolicitud(${s.id})" class="btn-premium bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all px-4 py-1.5 text-[10px]">Procesar</button>
                                        ` : `
                                            <span class="text-[10px] text-slate-400 uppercase font-bold">Atendida</span>
                                        `}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderCursos() {
        return `
            <div class="space-y-8 animate-fade-in">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-2xl font-black text-slate-900">Oferta Académica</h3>
                        <p class="text-sm text-slate-500">Crea y gestiona los cursos para el periodo actual.</p>
                    </div>
                    <button onclick="Views.registro.openCreateCourse()" class="btn-premium bg-[#032840] text-white px-8 py-4 rounded-2xl shadow-xl shadow-slate-200">
                        <i data-lucide="plus" class="w-4 h-4 mr-2"></i> Crear Nuevo Curso
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="cursos-list-container">
                    <div class="col-span-full py-20 text-center">
                        <div class="loader-small mx-auto"></div>
                        <p class="text-slate-400 text-xs font-black uppercase tracking-widest mt-4">Cargando cursos activos...</p>
                    </div>
                </div>
            </div>

            <!-- Create Course Modal -->
            <div id="course-modal" class="fixed inset-0 bg-[#032840]/60 backdrop-blur-md z-[110] hidden flex items-center justify-center p-4">
                <div class="bg-white rounded-[32px] w-full max-w-2xl p-10 shadow-2xl space-y-8">
                    <div class="flex justify-between items-center border-b border-slate-100 pb-6">
                        <h3 class="text-2xl font-black text-slate-900">Configurar Nueva Asignatura</h3>
                        <button onclick="Views.registro.closeCourseModal()" class="text-slate-300 hover:text-red-500 transition-colors">
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </button>
                    </div>

                    <form id="create-course-form" class="space-y-6" onsubmit="event.preventDefault(); Views.registro.handleCreateCourse();">
                        <div class="grid grid-cols-2 gap-6">
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asignatura (Materia)</label>
                                <select id="cc-materia" class="input-premium py-4 text-sm w-full" required>
                                    <option value="">Cargando materias...</option>
                                </select>
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Docente Asignado</label>
                                <select id="cc-docente" class="input-premium py-4 text-sm w-full" required>
                                    <option value="">Cargando docentes...</option>
                                </select>
                            </div>
                        </div>

                        <div class="grid grid-cols-3 gap-6">
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">NRC (Código de Curso)</label>
                                <input type="text" id="cc-nrc" placeholder="Ej: 14273" class="input-premium py-4 text-sm" required>
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Inicio</label>
                                <input type="date" id="cc-fecha-inicio" class="input-premium py-4 text-sm" required>
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Fin</label>
                                <input type="date" id="cc-fecha-fin" class="input-premium py-4 text-sm" required>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Configuración de Horario</label>
                            <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                <div class="flex gap-2">
                                    ${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => `
                                        <label class="flex-1">
                                            <input type="checkbox" name="cc-days" value="${d}" class="hidden peer">
                                            <div class="py-3 text-center rounded-xl bg-white border border-slate-200 text-[10px] font-black text-slate-400 peer-checked:bg-[#032840] peer-checked:text-white peer-checked:border-[#032840] transition-all cursor-pointer">
                                                ${d}
                                            </div>
                                        </label>
                                    `).join('')}
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="text-[8px] font-black text-slate-400 uppercase mb-1 block">Hora Inicio</label>
                                        <input type="time" id="cc-start" value="18:30" class="input-premium py-3 text-sm">
                                    </div>
                                    <div>
                                        <label class="text-[8px] font-black text-slate-400 uppercase mb-1 block">Hora Fin</label>
                                        <input type="time" id="cc-end" value="21:30" class="input-premium py-3 text-sm">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button type="submit" class="w-full btn-premium bg-emerald-600 text-white py-5 rounded-2xl shadow-xl shadow-emerald-100 font-black uppercase tracking-widest">
                            Publicar Curso en Oferta Académica
                        </button>
                    </form>
                </div>
            </div>
        `;
    },

    async openFicha(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        this.selectedUser = { ...user };

        // Ensure metadata is at least an empty object and parsed if string
        if (!this.selectedUser.metadata) {
            this.selectedUser.metadata = {};
        } else if (typeof this.selectedUser.metadata === 'string') {
            try {
                this.selectedUser.metadata = JSON.parse(this.selectedUser.metadata);
            } catch (e) {
                console.error("Error parsing user metadata:", e);
                this.selectedUser.metadata = {};
            }
        }

        this.isEditingFicha = false;
        this.updateFichaUI();
        document.getElementById('ficha-modal').classList.remove('hidden');
    },

    updateFichaUI() {
        const content = document.getElementById('ficha-content');
        const user = this.selectedUser;
        const meta = user.metadata || {};

        // Helper to get nested value safely
        const getMeta = (key, def = '') => meta[key] || def;

        content.innerHTML = `
            <div class="p-12 space-y-12 bg-white">
                <!-- Ficha Header -->
                <div class="flex justify-between items-start border-b border-slate-100 pb-10">
                    <div class="flex gap-8 items-center">
                        <div class="w-32 h-32 rounded-[40px] bg-slate-50 flex items-center justify-center border-4 border-[#fab720] shadow-2xl overflow-hidden group relative">
                            <i data-lucide="user" class="w-16 h-16 text-slate-300"></i>
                            <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <i data-lucide="camera" class="w-8 h-8 text-white"></i>
                            </div>
                        </div>
                        <div>
                            <div class="text-[10px] font-black text-[#fab720] uppercase tracking-[0.3em] mb-1">Unicatólica • Ficha Maestro Institucional</div>
                            <h2 class="text-5xl font-black text-[#032840] uppercase tracking-tighter leading-tight" style="font-family: 'Outfit'">
                                ${user.nombres}<br>${user.apellidos}
                            </h2>
                            <div class="flex items-center gap-4 mt-4">
                                <span class="badge bg-indigo-50 text-[#032840] font-black border-indigo-100 uppercase text-[9px] px-3">ID: ${String(user.id).padStart(6, '0')}</span>
                                <span class="badge bg-slate-100 text-slate-500 font-black border-slate-200 uppercase text-[9px] px-3">${user.rol}</span>
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 rounded-full ${user.activo ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse"></div>
                                    <span class="text-[10px] font-black uppercase text-slate-400">${user.activo ? 'Activo' : 'Inactivo'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        ${this.isEditingFicha ? `
                            <button onclick="Views.registro.cancelFichaEdit()" class="px-8 py-4 text-slate-400 font-black uppercase text-xs hover:text-red-500 transition-colors">Descartar</button>
                            <button onclick="Views.registro.saveFicha()" class="btn-premium bg-[#032840] text-white px-12 py-4 shadow-2xl hover:scale-105 transition-all text-xs font-black uppercase tracking-widest">
                                Guardar Ficha Master
                            </button>
                        ` : `
                            <button onclick="Views.registro.resetUserPassword(${user.id}, '${user.username}')" class="btn-premium bg-slate-100 text-slate-600 px-6 py-4 shadow-sm hover:scale-105 transition-all text-xs font-black uppercase tracking-widest">
                                <i data-lucide="key" class="w-4 h-4 inline-block mr-2"></i> Cambiar Contraseña
                            </button>
                            <button onclick="Views.registro.editFicha()" class="btn-premium bg-[#fab720] text-[#032840] px-10 py-4 shadow-xl hover:scale-105 transition-all text-xs font-black uppercase tracking-widest">
                                <i data-lucide="edit-3" class="w-4 h-4 inline-block mr-2"></i> Editar Información
                            </button>
                            <button onclick="Views.registro.closeFicha()" class="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                                <i data-lucide="x" class="w-6 h-6"></i>
                            </button>
                        `}
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    <!-- Left Column: Details -->
                    <div class="lg:col-span-2 space-y-12">
                        
                        <!-- 1. Detalles Personales -->
                        <section class="card-premium border-none bg-slate-50/50 p-12">
                            <h4 class="text-xs font-black uppercase tracking-[0.2em] text-[#032840] mb-12 pb-4 border-b border-slate-200/50 flex justify-between items-center">
                                1. Detalles Personales
                                <span class="text-[9px] text-slate-400 font-bold">Identidad Básica</span>
                            </h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                                <div class="space-y-3">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Primer Nombre</label>
                                    ${this.isEditingFicha ?
                `<input type="text" id="ef-nombres" class="input-premium py-4 text-sm" value="${user.nombres}">` :
                `<p class="text-base font-bold text-slate-800">${user.nombres}</p>`}
                                </div>
                                <div class="space-y-3">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Segundo Nombre</label>
                                    ${this.isEditingFicha ?
                `<input type="text" id="ef-segundo-nombre" class="input-premium py-4 text-sm" value="${getMeta('segundo_nombre', '')}">` :
                `<p class="text-base font-bold text-slate-800">${getMeta('segundo_nombre', '-')}</p>`}
                                </div>
                                <div class="space-y-3">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Apellidos</label>
                                    ${this.isEditingFicha ?
                `<input type="text" id="ef-apellidos" class="input-premium py-4 text-sm" value="${user.apellidos}">` :
                `<p class="text-base font-bold text-slate-800">${user.apellidos}</p>`}
                                </div>
                                <div class="space-y-3">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Fecha de Nacimiento</label>
                                    ${this.isEditingFicha ?
                `<input type="date" id="ef-nacimiento" class="input-premium py-4 text-sm" value="${user.fecha_nacimiento || ''}">` :
                `<p class="text-base font-bold text-slate-800">${user.fecha_nacimiento || 'No registrada'}</p>`}
                                </div>
                                <div class="space-y-3">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Estado Civil</label>
                                    ${this.isEditingFicha ?
                `<select id="ef-civil" class="input-premium py-4 text-sm">
                                            <option value="Soltero(a)" ${getMeta('estado_civil') === 'Soltero(a)' ? 'selected' : ''}>Soltero(a)</option>
                                            <option value="Casado(a)" ${getMeta('estado_civil') === 'Casado(a)' ? 'selected' : ''}>Casado(a)</option>
                                            <option value="Union Libre" ${getMeta('estado_civil') === 'Union Libre' ? 'selected' : ''}>Unión Libre</option>
                                            <option value="Divorciado(a)" ${getMeta('estado_civil') === 'Divorciado(a)' ? 'selected' : ''}>Divorciado(a)</option>
                                        </select>` :
                `<p class="text-base font-bold text-slate-800">${getMeta('estado_civil', 'Soltero(a)')}</p>`}
                                </div>
                                <div class="space-y-3">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Sexo</label>
                                    ${this.isEditingFicha ?
                `<select id="ef-sexo" class="input-premium py-4 text-sm">
                                            <option value="Masculino" ${getMeta('sexo') === 'Masculino' ? 'selected' : ''}>Masculino</option>
                                            <option value="Femenino" ${getMeta('sexo') === 'Femenino' ? 'selected' : ''}>Femenino</option>
                                            <option value="Otro" ${getMeta('sexo') === 'Otro' ? 'selected' : ''}>Otro</option>
                                        </select>` :
                `<p class="text-base font-bold text-slate-800">${getMeta('sexo', 'Masculino')}</p>`}
                                </div>
                                <div class="space-y-3">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nombre Preferido</label>
                                    ${this.isEditingFicha ?
                `<input type="text" id="ef-preferido" class="input-premium py-4 text-sm" value="${getMeta('nombre_preferido', '')}">` :
                `<p class="text-base font-bold text-slate-800">${getMeta('nombre_preferido', '-')}</p>`}
                                </div>
                                <div class="space-y-3">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Identificación de Género</label>
                                    ${this.isEditingFicha ?
                `<input type="text" id="ef-genero" class="input-premium py-4 text-sm" value="${getMeta('genero_id', 'Masculino')}">` :
                `<p class="text-base font-bold text-slate-800">${getMeta('genero_id', 'Masculino')}</p>`}
                                </div>
                            </div>
                        </section>

                        <!-- 2. Información de Contacto -->
                        <section class="card-premium border-none bg-white p-12 shadow-xl ring-1 ring-slate-100">
                            <h4 class="text-xs font-black uppercase tracking-[0.2em] text-[#032840] mb-12 pb-4 border-b border-slate-100 flex justify-between items-center">
                                2. Canales de Comunicación
                                <i data-lucide="phone-call" class="w-4 h-4 text-slate-300"></i>
                            </h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-16">
                                <div class="space-y-10">
                                    <div class="space-y-3">
                                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Correo Institucional (Único)</label>
                                        <div class="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                                            <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                                                <i data-lucide="mail" class="w-4 h-4 text-slate-400"></i>
                                            </div>
                                            <span class="text-sm font-bold text-slate-800 truncate">${user.email || (user.username + '@unicatolica.edu.co')}</span>
                                        </div>
                                    </div>
                                    <div class="space-y-3">
                                        <label class="text-[10px] font-black text-[#fab720] uppercase tracking-widest block">Correo Personal</label>
                                        <div class="relative">
                                            <div class="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                                                <i data-lucide="at-sign" class="w-3 h-3 text-[#fab720]"></i>
                                            </div>
                                            ${this.isEditingFicha ?
                `<input type="email" id="ef-email-personal" class="input-premium py-4 pl-16 text-sm" value="${getMeta('email_personal', '')}" placeholder="ejemplo@correo.com">` :
                `<div class="py-4 pl-16"><span class="text-base font-bold text-slate-800">${getMeta('email_personal', 'No registrado')}</span></div>`}
                                        </div>
                                    </div>
                                </div>
                                <div class="space-y-10">
                                    <div class="space-y-3">
                                        <label class="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">Celular (Móvil Principal)</label>
                                        <div class="relative">
                                            <div class="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <i data-lucide="smartphone" class="w-3 h-3 text-emerald-500"></i>
                                            </div>
                                            ${this.isEditingFicha ?
                `<input type="text" id="ef-telefono" class="input-premium py-4 pl-16 text-sm" value="${user.telefono || ''}" placeholder="300 000 0000">` :
                `<div class="py-4 pl-16"><span class="text-base font-bold text-slate-800">${user.telefono || 'No registrado'}</span></div>`}
                                        </div>
                                    </div>
                                    <div class="space-y-3">
                                        <label class="text-[10px] font-black text-indigo-500 uppercase tracking-widest block">Documento de Identidad</label>
                                        <div class="flex gap-4">
                                            ${this.isEditingFicha ?
                `<div class="flex gap-4 w-full">
                                                    <select id="ef-tipo-doc" class="input-premium py-4 text-xs w-28 bg-indigo-50/30">
                                                        <option value="CC" ${user.tipo_documento === 'CC' ? 'selected' : ''}>CC</option>
                                                        <option value="TI" ${user.tipo_documento === 'TI' ? 'selected' : ''}>TI</option>
                                                        <option value="CE" ${user.tipo_documento === 'CE' ? 'selected' : ''}>CE</option>
                                                    </select>
                                                    <input type="text" id="ef-documento" class="input-premium py-4 text-sm flex-grow" value="${user.documento || ''}">
                                                </div>` :
                `<div class="flex items-center gap-4 p-4 bg-indigo-50/30 rounded-2xl w-full">
                                                    <i data-lucide="credit-card" class="w-4 h-4 text-indigo-500"></i>
                                                    <span class="text-sm font-black text-indigo-900 uppercase">
                                                        <span class="text-[10px] opacity-40 mr-1">${user.tipo_documento || 'CC'}</span> 
                                                        ${user.documento || '---'}
                                                    </span>
                                                </div>`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- 5. Detalles Adicionales -->
                        <section class="card-premium border-none bg-slate-50/50 p-12">
                            <h4 class="text-xs font-black uppercase tracking-[0.2em] text-[#032840] mb-12 pb-4 border-b border-slate-200/50">5. Detalles Adicionales</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                                <div class="space-y-3">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status de Discapacidad</label>
                                    ${this.isEditingFicha ?
                `<select id="ef-discapacidad" class="input-premium py-4 text-sm">
                                            <option value="Status no disponible" ${getMeta('discapacidad') === 'Status no disponible' ? 'selected' : ''}>Status no disponible</option>
                                            <option value="Visual" ${getMeta('discapacidad') === 'Visual' ? 'selected' : ''}>Visual</option>
                                            <option value="Auditiva" ${getMeta('discapacidad') === 'Auditiva' ? 'selected' : ''}>Auditiva</option>
                                            <option value="Motora" ${getMeta('discapacidad') === 'Motora' ? 'selected' : ''}>Motora</option>
                                            <option value="Ninguna" ${getMeta('discapacidad') === 'Ninguna' ? 'selected' : ''}>Ninguna</option>
                                        </select>` :
                `<p class="text-base font-bold text-slate-800">${getMeta('discapacidad', 'Status no disponible')}</p>`}
                                </div>
                                <div class="space-y-3">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Perfil del Directorio</label>
                                    <div class="flex items-center gap-3 py-3">
                                        <div class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                                            <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-500"></i>
                                        </div>
                                        <span class="text-sm font-bold text-slate-600">Verificado / Público</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <!-- Right Column: Residence & Family -->
                    <div class="space-y-12">
                        
                        <!-- 3. Localización -->
                        <section class="card-premium border-none bg-[#032840] p-12 text-white shadow-2xl relative overflow-hidden">
                            <div class="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                            <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-12 pb-4 border-b border-white/10 flex justify-between items-center">
                                3. Localización
                                <i data-lucide="map" class="w-4 h-4"></i>
                            </h4>
                            <div class="space-y-8">
                                <div class="flex items-start gap-6">
                                    <div class="w-12 h-12 rounded-[20px] bg-white/10 flex items-center justify-center shrink-0 shadow-inner">
                                        <i data-lucide="map-pin" class="w-5 h-5 text-[#fab720]"></i>
                                    </div>
                                    <div class="flex-grow space-y-4">
                                        <div>
                                            <label class="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-2">Dirección Actual de Residencia</label>
                                            ${this.isEditingFicha ?
                `<textarea id="ef-direccion" class="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-[#fab720] outline-none transition-all placeholder-white/20" rows="3" placeholder="Calle, Carrera, Barrio, Ciudad...">${getMeta('direccion', '')}</textarea>` :
                `<p class="text-base font-bold text-white leading-relaxed">${getMeta('direccion', 'Dirección no suministrada')}</p>`}
                                        </div>
                                        <div class="pt-4 border-t border-white/5 flex gap-4">
                                            <div class="bg-white/5 rounded-lg px-3 py-2">
                                                <span class="text-[8px] font-black text-white/20 uppercase block mb-0.5">Vigencia</span>
                                                <span class="text-[10px] font-bold text-emerald-400">Actual</span>
                                            </div>
                                            <div class="bg-white/5 rounded-lg px-3 py-2">
                                                <span class="text-[8px] font-black text-white/20 uppercase block mb-0.5">Desde</span>
                                                <span class="text-[10px] font-bold text-white/60">${getMeta('direccion_desde', '11/02/2022')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- 4. Núcleo Familiar -->
                        <section class="card-premium border-none bg-white p-12 shadow-xl ring-1 ring-slate-100">
                             <div class="flex justify-between items-center mb-10 pb-4 border-b border-slate-100">
                                <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-[#032840]">4. Núcleo Familiar</h4>
                                ${this.isEditingFicha ? `
                                    <button onclick="Views.registro.addFamiliarRow()" class="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-[#fab720] hover:bg-[#fab720] hover:text-white transition-all shadow-sm group">
                                        <span class="text-[10px] font-black uppercase tracking-widest">Nuevo</span>
                                        <i data-lucide="plus" class="w-4 h-4"></i>
                                    </button>
                                ` : ''}
                             </div>
                             
                             <div class="space-y-8" id="family-list">
                                ${this.isAddingFamiliar ? `
                                    <div class="p-8 bg-slate-50 rounded-[32px] border-2 border-dashed border-amber-300 animate-slide-up space-y-6">
                                        <div class="text-[10px] font-black text-[#fab720] uppercase tracking-widest pb-3 border-b border-amber-100">Datos del Nuevo Familiar</div>
                                        
                                        <div class="space-y-4">
                                            <div class="space-y-2">
                                                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo</label>
                                                <input type="text" id="af-nombre" placeholder="Ej: Janeth Ortiz" class="input-premium py-4 text-sm bg-white">
                                            </div>
                                            
                                            <div class="grid grid-cols-1 gap-6">
                                                <div class="space-y-2">
                                                    <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Relación / Vínculo</label>
                                                    <select id="af-relacion" class="input-premium py-4 text-sm bg-white">
                                                        <option value="Madre">Madre</option>
                                                        <option value="Padre">Padre</option>
                                                        <option value="Acudiente">Acudiente</option>
                                                        <option value="Hermano(a)">Hermano(a)</option>
                                                        <option value="Otro">Otro</option>
                                                    </select>
                                                </div>
                                                <div class="space-y-2">
                                                    <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Teléfono de Contacto</label>
                                                    <input type="text" id="af-telefono" placeholder="3XX XXX XXXX" class="input-premium py-4 text-sm bg-white">
                                                </div>
                                                <div class="space-y-2">
                                                    <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dirección (Opcional)</label>
                                                    <textarea id="af-direccion" class="input-premium py-4 text-sm bg-white h-20" placeholder="Dirección completa..."></textarea>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="flex gap-4 pt-4">
                                            <button onclick="Views.registro.confirmAddFamiliar()" class="btn-premium bg-[#032840] text-white flex-grow py-4 text-[10px] uppercase font-black tracking-widest">Registrar Vínculo</button>
                                            <button onclick="Views.registro.cancelAddFamiliar()" class="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                                                <i data-lucide="x" class="w-5 h-5"></i>
                                            </button>
                                        </div>
                                    </div>
                                ` : ''}

                                ${meta.familiares?.length ? meta.familiares.map((fam, idx) => `
                                    <div class="relative group">
                                        <div class="p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 group-hover:border-amber-200 transition-all shadow-sm">
                                            <div class="flex justify-between items-start mb-4">
                                                <div class="space-y-1">
                                                    <div class="text-sm font-black text-slate-800 uppercase tracking-tight">${fam.nombre}</div>
                                                    <div class="text-[10px] font-black text-[#fab720] uppercase tracking-widest">${fam.relacion}</div>
                                                </div>
                                                ${this.isEditingFicha ?
                        `<button onclick="Views.registro.removeFamiliar(${idx})" class="w-8 h-8 rounded-full bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                                    </button>` : ''}
                                            </div>
                                            <div class="space-y-3">
                                                <div class="text-[11px] font-medium text-slate-500 flex items-center gap-3">
                                                    <div class="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                        <i data-lucide="phone" class="w-3 h-3 text-slate-400"></i>
                                                    </div>
                                                    ${fam.telefono}
                                                </div>
                                                ${fam.direccion ? `
                                                    <div class="text-[11px] font-medium text-slate-400 flex items-start gap-3">
                                                        <div class="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                                                            <i data-lucide="map-pin" class="w-3 h-3 text-slate-300"></i>
                                                        </div>
                                                        <span class="leading-relaxed">${fam.direccion}</span>
                                                    </div>
                                                ` : ''}
                                            </div>
                                        </div>
                                    </div>
                                `).join('') : `
                                    <div class="py-16 text-center">
                                        <div class="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                                            <i data-lucide="users" class="w-8 h-8 text-slate-200"></i>
                                        </div>
                                        <p class="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No hay vínculos registrados</p>
                                    </div>
                                `}
                             </div>
                        </section>
                    </div>
                </div>

                <div class="text-center pt-12 border-t border-slate-50 opacity-40">
                    <p class="text-[9px] text-slate-300 font-bold uppercase tracking-[0.5em]">Audit Grade Data • Unicatólica SIS • High Integrity Profile</p>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    async saveFicha() {
        const user = this.selectedUser;
        const meta = user.metadata || {};

        const payload = {
            nombres: document.getElementById('ef-nombres').value,
            apellidos: document.getElementById('ef-apellidos').value,
            documento: document.getElementById('ef-documento').value,
            tipo_documento: document.getElementById('ef-tipo-doc').value,
            telefono: document.getElementById('ef-telefono').value,
            fecha_nacimiento: document.getElementById('ef-nacimiento').value,
            rol: user.rol,
            activo: user.activo,
            metadata: {
                ...meta,
                segundo_nombre: document.getElementById('ef-segundo-nombre').value,
                estado_civil: document.getElementById('ef-civil').value,
                sexo: document.getElementById('ef-sexo').value,
                nombre_preferido: document.getElementById('ef-preferido').value,
                genero_id: document.getElementById('ef-genero').value,
                email_personal: document.getElementById('ef-email-personal').value,
                direccion: document.getElementById('ef-direccion').value,
                discapacidad: document.getElementById('ef-discapacidad').value,
                familiares: meta.familiares || []
            }
        };

        try {
            await API.put(`/registro/users/${user.id}`, payload);
            Toast.success('¡Ficha Maestro Sincronizada!');
            this.isEditingFicha = false;
            this.isAddingFamiliar = false;
            await this.loadUsers();
            this.selectedUser = { ...this.users.find(u => u.id === user.id) };
            if (typeof this.selectedUser.metadata === 'string') {
                this.selectedUser.metadata = JSON.parse(this.selectedUser.metadata || '{}');
            }
            this.updateFichaUI();
            this.reRender();
        } catch (e) {
            console.error(e);
            Toast.error('Error Crítico al persistir los datos.');
        }
    },

    addFamiliarRow() {
        this.isAddingFamiliar = true;
        this.updateFichaUI();
    },

    confirmAddFamiliar() {
        const nombre = document.getElementById('af-nombre').value;
        const relacion = document.getElementById('af-relacion').value;
        const tel = document.getElementById('af-telefono').value;
        const dir = document.getElementById('af-direccion').value;

        if (nombre && relacion && tel) {
            // Robust initialization of metadata components
            if (!this.selectedUser) return;
            if (!this.selectedUser.metadata) this.selectedUser.metadata = {};
            if (!this.selectedUser.metadata.familiares) this.selectedUser.metadata.familiares = [];

            this.selectedUser.metadata.familiares.push({
                nombre,
                relacion,
                telefono: tel,
                direccion: dir
            });
            this.isAddingFamiliar = false;
            this.updateFichaUI();
        } else {
            Toast.error('Nombre, vínculo y teléfono son obligatorios.');
        }
    },

    cancelAddFamiliar() {
        this.isAddingFamiliar = false;
        this.updateFichaUI();
    },

    removeFamiliar(idx) {
        this.selectedUser.metadata.familiares.splice(idx, 1);
        this.updateFichaUI();
    },

    closeFicha() {
        this.isAddingFamiliar = false;
        this.isEditingFicha = false;
        document.getElementById('ficha-modal').classList.add('hidden');
    },

    getRolStyles(rol) {
        const map = {
            'admin': 'bg-black text-white',
            'estudiante': 'bg-indigo-50 text-indigo-600',
            'docente': 'bg-purple-50 text-purple-600',
            'director': 'bg-amber-50 text-[#032840]',
            'decano': 'bg-amber-100 text-[#032840]',
            'registro': 'bg-emerald-50 text-emerald-600',
            'financiero': 'bg-slate-100 text-slate-600'
        };
        return map[rol] || 'bg-slate-50 text-slate-400';
    },

    afterRender() {
        lucide.createIcons();
        if (this.currentTab === 'cursos') {
            this.loadCursos();
        }
        // Click outside handler for manual enrollment dropdowns
        document.addEventListener('click', (e) => {
            const studentDropdown = document.getElementById('student-custom-dropdown-container');
            if (studentDropdown && !studentDropdown.contains(e.target)) {
                const panel = document.getElementById('student-panel');
                if (panel) panel.classList.add('hidden');
            }
            const courseDropdown = document.getElementById('course-custom-dropdown-container');
            if (courseDropdown && !courseDropdown.contains(e.target)) {
                const panel = document.getElementById('course-panel');
                if (panel) panel.classList.add('hidden');
            }
        });
    },

    async loadUsers() {
        try {
            this.users = await API.get('/registro/users');
        } catch (e) {
            Toast.error('Fallo en sincronización institutional');
        }
    },

    async loadSolicitudes() {
        try {
            this.solicitudes = await API.get('/registro/solicitudes');
        } catch (e) {
            Toast.error('Fallo cargando solicitudes');
            this.solicitudes = [];
        }
    },

    async procesarSolicitud(id) {
        try {
            await API.put('/registro/solicitudes/'+id+'/procesar', {});
            Toast.success('Solicitud en proceso');
            await this.loadSolicitudes();
            this.reRender();
        } catch(e) {
            Toast.error('No se pudo procesar la solicitud');
        }
    },

    async resetUserPassword(userId, username) {
        if (username === 'admin.ti') {
            Toast.error('Restricción: No se puede editar la contraseña del usuario Admin.TI');
            return;
        }
        const newPass = prompt("Ingresa la nueva contraseña temporal (mín 8 chars):", "Academia2026!");
        if (!newPass) return;

        try {
            await API.post('/registro/reset-password-user', { userId, newPassword: newPass });
            Toast.success('Contraseña reseteada con éxito');
        } catch (err) {
            Toast.error(err.message || 'Error al resetear contraseña');
        }
    },

    setTab(tab) {
        const hash = tab === 'directorio' ? '/registro' : `/registro-${tab}`;
        window.location.hash = hash;
    },

    async loadCursos() {
        try {
            const cursos = await API.get('/registro/cursos/activos');
            const container = document.getElementById('cursos-list-container');
            if (!container) return;

            if (cursos.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full py-20 text-center">
                        <i data-lucide="book-x" class="w-16 h-16 text-slate-100 mx-auto mb-4"></i>
                        <p class="text-slate-400 text-xs font-black uppercase tracking-widest">No hay cursos creados para el periodo actual</p>
                    </div>
                `;
            } else {
                container.innerHTML = cursos.map(c => `
                    <div class="card-premium bg-white p-6 border-none shadow-lg hover:shadow-xl transition-all group">
                        <div class="flex justify-between items-start mb-4 relative">
                            <div class="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <i data-lucide="book" class="w-5 h-5"></i>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">NRC: ${c.nrc}</span>
                                <div class="relative group/menu">
                                    <button class="p-1 text-slate-300 hover:text-slate-600 transition-colors cursor-pointer">
                                        <i data-lucide="more-vertical" class="w-4 h-4"></i>
                                    </button>
                                    <div class="absolute right-0 top-6 bg-white rounded-xl shadow-xl border border-slate-100 p-1 w-40 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                                        <!-- Opciones -->
                                        <button onclick="Views.registro.openEditCourse(${c.id})" class="w-full text-left px-3 py-2 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 rounded-lg">Editar Curso</button>
                                        ${c.salon_id ? `<button onclick="Views.registro.removeSalon(${c.id})" class="w-full text-left px-3 py-2 text-[10px] font-black uppercase text-[#fab720] hover:bg-amber-50 rounded-lg">Liberar Aula</button>` : ''}
                                        <div class="h-px bg-slate-100 my-1"></div>
                                        <button onclick="Views.registro.deleteCourse(${c.id})" class="w-full text-left px-3 py-2 text-[10px] font-black uppercase text-red-500 hover:bg-red-50 rounded-lg">Eliminar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <h4 class="text-base font-black text-slate-900 mb-1 truncate">${c.asignatura}</h4>
                        <p class="text-xs text-slate-500 font-medium mb-4">${c.nombres} ${c.apellidos}</p>
                        <div class="space-y-2 pt-4 border-t border-slate-50">
                            <div class="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                <i data-lucide="clock" class="w-3 h-3 text-slate-300"></i> ${c.horario}
                            </div>
                            <div class="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                <i data-lucide="calendar" class="w-3 h-3 text-slate-300"></i> ${c.fecha_inicio ? `${c.fecha_inicio} a ${c.fecha_fin}` : 'Vigencia por definir'}
                            </div>
                            <div class="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                <i data-lucide="map-pin" class="w-3 h-3 text-slate-300"></i> ${c.salon_id ? `Aula: ${c.salon}` : 'Pendiente Aula'}
                            </div>
                        </div>
                    </div>
                `).join('');
            }
            lucide.createIcons();
        } catch (e) {
            console.error(e);
        }
    },

    async openCreateCourse() {
        document.getElementById('course-modal').classList.remove('hidden');
        lucide.createIcons();
        
        // Load materias and docentes
        try {
            const [materias, docentes] = await Promise.all([
                API.get('/registro/materias'),
                API.get('/registro/docentes')
            ]);

            const matSelect = document.getElementById('cc-materia');
            const docSelect = document.getElementById('cc-docente');

            matSelect.innerHTML = '<option value="">Seleccione Materia</option>' + 
                materias.map(m => `<option value="${m.id}">${m.nombre} (${m.codigo})</option>`).join('');
            
            docSelect.innerHTML = '<option value="">Seleccione Docente</option>' + 
                docentes.map(d => `<option value="${d.id}">${d.nombres} ${d.apellidos}</option>`).join('');
            
            // Reset fields
            document.getElementById('create-course-form').reset();
            document.getElementById('cc-nrc').disabled = false;
            matSelect.disabled = false;
            
            // Change form submit handler back to create
            const form = document.getElementById('create-course-form');
            form.onsubmit = (e) => {
                e.preventDefault();
                this.handleCreateCourse();
            };

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.innerHTML = 'Publicar Curso en Oferta Académica';
            submitBtn.className = 'w-full btn-premium bg-emerald-600 text-white py-5 rounded-2xl shadow-xl shadow-emerald-100 font-black uppercase tracking-widest';

        } catch (e) {
            Toast.error('Error al cargar datos académicos');
        }
    },

    closeCourseModal() {
        document.getElementById('course-modal').classList.add('hidden');
    },

    async handleCreateCourse() {
        const materia_id = document.getElementById('cc-materia').value;
        const docente_id = document.getElementById('cc-docente').value;
        const nrc = document.getElementById('cc-nrc').value;
        const fecha_inicio = document.getElementById('cc-fecha-inicio').value;
        const fecha_fin = document.getElementById('cc-fecha-fin').value;
        const start = document.getElementById('cc-start').value;
        const end = document.getElementById('cc-end').value;

        const selectedDays = Array.from(document.querySelectorAll('input[name="cc-days"]:checked')).map(cb => cb.value);

        if (selectedDays.length === 0) {
            Toast.error('Seleccione al menos un día');
            return;
        }

        // Format to 12-hour AM/PM
        const formatTo12 = (time24) => {
            if (!time24) return '';
            let [hours, minutes] = time24.split(':').map(Number);
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            const minutesStr = minutes < 10 ? '0' + minutes : minutes;
            const hoursStr = hours < 10 ? '0' + hours : hours;
            return `${hoursStr}:${minutesStr} ${ampm}`;
        };

        const start12 = formatTo12(start);
        const end12 = formatTo12(end);

        // Format: "Lun-Mié 18:30-21:30" or "Lun,Mar 18:30-21:30"
        let daysStr = "";
        if (selectedDays.length === 2 && (
            (selectedDays[0] === 'Lun' && selectedDays[1] === 'Mié') ||
            (selectedDays[0] === 'Mar' && selectedDays[1] === 'Jue')
        )) {
            daysStr = `${selectedDays[0]}-${selectedDays[1]}`;
        } else {
            daysStr = selectedDays.join(',');
        }

        const horario = `${daysStr} ${start12} - ${end12}`;

        try {
            const res = await API.post('/registro/cursos', { 
                materia_id, 
                docente_id, 
                nrc, 
                horario, 
                fecha_inicio, 
                fecha_fin 
            });
            if (res.success) {
                Toast.success('¡Curso publicado exitosamente!');
                this.closeCourseModal();
                this.loadCursos();
            }
        } catch (e) {
            Toast.error(e.error || 'Error al crear el curso');
        }
    },

    async reRender() {
        const content = await this.render();
        document.getElementById('view-mount').innerHTML = content;
        this.afterRender();
    },

    editFicha() {
        this.isEditingFicha = true;
        this.updateFichaUI();
    },

    cancelFichaEdit() {
        this.isEditingFicha = false;
        this.updateFichaUI();
    },

    handleSearch(val) {
        this.searchQuery = val;
        // Simple throttle for UI smoothness
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => this.reRender(), 300);
    },

    async loadInscripcionData() {
        try {
            this.cursosList = await API.get('/registro/cursos/activos');
        } catch (e) {
            Toast.error('Fallo cargando cursos activos');
            this.cursosList = [];
        }
    },

    renderInscripcion() {
        const students = this.users.filter(u => u.rol === 'estudiante');
        const courses = this.cursosList || [];

        return `
            <div class="card-premium bg-white p-10 shadow-xl border-[#032840]/10 ring-1 ring-[#032840]/5 max-w-4xl mx-auto animate-slide-up rounded-[32px]" style="overflow: visible !important;">
                <div class="mb-8 border-b border-slate-100 pb-6">
                    <h3 class="text-2xl font-black text-[#032840]">Inscripción Académica Manual</h3>
                    <p class="text-slate-500 mt-1 italic text-xs font-medium">Registra o vincula cualquier estudiante a una asignatura/curso activo de este periodo.</p>
                </div>
                
                <div class="space-y-6">
                    <!-- Dropdown Estudiante -->
                    <div class="space-y-1.5 relative" id="student-custom-dropdown-container">
                        <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Seleccionar Estudiante</label>
                        <!-- Trigger -->
                        <button onclick="Views.registro.toggleStudentDropdown()" id="student-trigger" class="input-premium w-full py-4 px-6 text-sm bg-slate-50 text-left flex justify-between items-center font-bold text-slate-700 rounded-2xl border border-slate-100 hover:bg-slate-100/50 transition-all">
                            <span id="student-trigger-text" class="text-slate-400 italic">Buscar y seleccionar estudiante...</span>
                            <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400"></i>
                        </button>
                        
                        <!-- Panel -->
                        <div id="student-panel" class="absolute left-0 right-0 mt-2 bg-white rounded-3xl border border-slate-100 shadow-2xl z-[120] p-4 hidden space-y-3">
                            <div class="relative">
                                <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"></i>
                                <input type="text" id="student-search" oninput="Views.registro.filterStudentDropdown(this.value)" placeholder="Buscar estudiante por nombre, usuario o cédula..." class="input-premium w-full pl-11 py-3 text-xs bg-slate-50 border border-slate-100">
                            </div>
                            
                            <div class="max-h-60 overflow-y-auto space-y-1.5 custom-scrollbar" id="student-options">
                                ${students.map(s => `
                                    <div onclick="Views.registro.selectStudentDropdown('${s.id}', '${s.nombres.replace(/'/g, "\\'")}', '${s.apellidos.replace(/'/g, "\\'")}', '${s.documento || ''}')" 
                                         class="flex items-center justify-between p-3 rounded-2xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all cursor-pointer group">
                                        <div>
                                            <div class="text-xs font-black text-slate-800 group-hover:text-indigo-900">${s.nombres} ${s.apellidos}</div>
                                            <div class="text-[9px] font-bold text-slate-400 mt-0.5">${s.email || s.username}</div>
                                        </div>
                                        <span class="text-[9px] font-black bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-700 px-2 py-1 rounded-xl shrink-0">${s.documento || 'CC Pendiente'}</span>
                                    </div>
                                `).join('')}
                                ${students.length === 0 ? `<div class="text-center py-6 text-slate-400 text-xs italic">No hay estudiantes registrados</div>` : ''}
                            </div>
                        </div>
                        <input type="hidden" id="selected-student-id" value="">
                    </div>

                    <!-- Dropdown Curso -->
                    <div class="space-y-1.5 relative" id="course-custom-dropdown-container">
                        <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Seleccionar Curso / NRC</label>
                        <!-- Trigger -->
                        <button onclick="Views.registro.toggleCourseDropdown()" id="course-trigger" class="input-premium w-full py-4 px-6 text-sm bg-slate-50 text-left flex justify-between items-center font-bold text-slate-700 rounded-2xl border border-slate-100 hover:bg-slate-100/50 transition-all">
                            <span id="course-trigger-text" class="text-slate-400 italic">Buscar y seleccionar curso...</span>
                            <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400"></i>
                        </button>
                        
                        <!-- Panel -->
                        <div id="course-panel" class="absolute left-0 right-0 mt-2 bg-white rounded-3xl border border-slate-100 shadow-2xl z-[120] p-4 hidden space-y-3">
                            <div class="relative">
                                <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"></i>
                                <input type="text" id="course-search" oninput="Views.registro.filterCourseDropdown(this.value)" placeholder="Buscar curso por asignatura o NRC..." class="input-premium w-full pl-11 py-3 text-xs bg-slate-50 border border-slate-100">
                            </div>
                            
                            <div class="max-h-60 overflow-y-auto space-y-1.5 custom-scrollbar" id="course-options">
                                ${courses.map(c => `
                                    <div onclick="Views.registro.selectCourseDropdown('${c.id}', '${c.nrc}', '${c.asignatura.replace(/'/g, "\\'")}', '${c.nombres.replace(/'/g, "\\'")} ${c.apellidos.replace(/'/g, "\\'")}')" 
                                         class="flex items-center justify-between p-3 rounded-2xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all cursor-pointer group">
                                        <div class="pr-2">
                                            <div class="text-xs font-black text-slate-800 group-hover:text-indigo-900 line-clamp-1">${c.asignatura}</div>
                                            <div class="text-[9px] font-bold text-slate-400 mt-0.5">Profesor: ${c.nombres} ${c.apellidos} | Horario: ${c.horario}</div>
                                        </div>
                                        <span class="text-[9px] font-black bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-700 px-2 py-1 rounded-xl uppercase shrink-0">NRC ${c.nrc}</span>
                                    </div>
                                `).join('')}
                                ${courses.length === 0 ? `<div class="text-center py-6 text-slate-400 text-xs italic">No hay cursos creados activos</div>` : ''}
                            </div>
                        </div>
                        <input type="hidden" id="selected-course-id" value="">
                    </div>

                    <!-- Botón de Envío -->
                    <button onclick="Views.registro.enrollStudentSubmit()" class="btn-premium w-full bg-[#032840] text-white py-4 text-xs font-black shadow-lg shadow-[#032840]/20 mt-4 rounded-2xl flex justify-center items-center gap-2">
                        COMPLETAR MATRÍCULA
                        <i data-lucide="check-circle" class="w-4 h-4"></i>
                    </button>
                </div>

                <!-- Lista de cursos matriculados (se llena dinámicamente) -->
                <div id="student-courses-container" class="mt-12 hidden">
                </div>
            </div>
        `;
    },

    toggleStudentDropdown() {
        const panel = document.getElementById('student-panel');
        if (panel) {
            panel.classList.toggle('hidden');
            if (!panel.classList.contains('hidden')) {
                const search = document.getElementById('student-search');
                if (search) {
                    search.value = '';
                    search.focus();
                    this.filterStudentDropdown('');
                }
            }
        }
    },

    filterStudentDropdown(query) {
        const q = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const options = document.getElementById('student-options').children;
        for (const opt of options) {
            const text = opt.innerText.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            opt.style.display = text.includes(q) ? 'flex' : 'none';
        }
    },

    selectStudentDropdown(id, name, lastname, doc) {
        const hiddenInput = document.getElementById('selected-student-id');
        const triggerText = document.getElementById('student-trigger-text');
        const panel = document.getElementById('student-panel');
        if (hiddenInput && triggerText && panel) {
            hiddenInput.value = id;
            triggerText.innerHTML = `<span class="font-black text-slate-800">${name} ${lastname} ${doc ? `(${doc})` : ''}</span>`;
            panel.classList.add('hidden');
            this.loadStudentCourses(id);
        }
    },

    toggleCourseDropdown() {
        const panel = document.getElementById('course-panel');
        if (panel) {
            panel.classList.toggle('hidden');
            if (!panel.classList.contains('hidden')) {
                const search = document.getElementById('course-search');
                if (search) {
                    search.value = '';
                    search.focus();
                    this.filterCourseDropdown('');
                }
            }
        }
    },

    filterCourseDropdown(query) {
        const q = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const options = document.getElementById('course-options').children;
        for (const opt of options) {
            const text = opt.innerText.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            opt.style.display = text.includes(q) ? 'flex' : 'none';
        }
    },

    selectCourseDropdown(id, nrc, name, teacher) {
        const hiddenInput = document.getElementById('selected-course-id');
        const triggerText = document.getElementById('course-trigger-text');
        const panel = document.getElementById('course-panel');
        if (hiddenInput && triggerText && panel) {
            hiddenInput.value = id;
            triggerText.innerHTML = `<span class="font-black text-slate-800">NRC ${nrc} - ${name} (${teacher})</span>`;
            panel.classList.add('hidden');
        }
    },

    async enrollStudentSubmit() {
        const studentId = document.getElementById('selected-student-id').value;
        const cursoId = document.getElementById('selected-course-id').value;

        if (!studentId) {
            Toast.warning('Debe seleccionar un estudiante');
            return;
        }
        if (!cursoId) {
            Toast.warning('Debe seleccionar un curso');
            return;
        }

        try {
            await API.post('/registro/cursos/inscribir-estudiante', { student_id: studentId, curso_id: cursoId });
            Toast.success('¡Estudiante matriculado con éxito!');
            
            // Reset fields
            document.getElementById('selected-student-id').value = '';
            document.getElementById('selected-course-id').value = '';
            document.getElementById('student-trigger-text').innerHTML = '<span class="text-slate-400 italic">Buscar y seleccionar estudiante...</span>';
            document.getElementById('course-trigger-text').innerHTML = '<span class="text-slate-400 italic">Buscar y seleccionar curso...</span>';
            
            // Refresh local state lists
            this.cursosList = await API.get('/registro/cursos/activos');
            this.loadStudentCourses(studentId); // Reload student's courses to show new one
        } catch (e) {
            Toast.error(e.error || e.message || 'Error al matricular estudiante');
        }
    },

    async loadStudentCourses(studentId) {
        const container = document.getElementById('student-courses-container');
        if (!container) return;
        
        container.classList.remove('hidden');
        container.innerHTML = `<div class="text-center py-4"><div class="loader-small mx-auto"></div></div>`;
        
        try {
            const courses = await API.get(`/registro/estudiantes/${studentId}/cursos`);
            
            if (courses.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <i data-lucide="inbox" class="w-8 h-8 text-slate-300 mx-auto mb-2"></i>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">El estudiante no tiene cursos matriculados</p>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="flex justify-between items-center mb-4 px-2">
                        <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-[#032840]">Cursos Matriculados Actualmente</h4>
                        <button onclick="Views.registro.unenrollAllCourses(${studentId})" class="text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors border border-transparent hover:border-red-100 flex items-center gap-1">
                            <i data-lucide="trash-2" class="w-3 h-3"></i> Retirar de Todos
                        </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${courses.map(c => `
                            <div class="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-lg transition-all group h-full">
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                        <i data-lucide="book" class="w-4 h-4 text-indigo-500"></i>
                                    </div>
                                    <div>
                                        <div class="text-sm font-black text-slate-800">${c.asignatura} <span class="text-[9px] bg-indigo-100/50 text-indigo-700 px-2 py-0.5 rounded-lg ml-2">NRC ${c.nrc}</span></div>
                                        <div class="text-[10px] font-bold text-slate-400 mt-1">${c.horario} | ${c.nombres} ${c.apellidos}</div>
                                    </div>
                                </div>
                                <button onclick="Views.registro.unenrollCourse(${studentId}, ${c.id})" class="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Retirar de este curso">
                                    <i data-lucide="user-minus" class="w-4 h-4"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            lucide.createIcons();
        } catch (e) {
            container.innerHTML = `<div class="text-center py-4 text-xs font-bold text-red-500">Error cargando cursos del estudiante</div>`;
        }
    },

    async unenrollCourse(studentId, cursoId) {
        const confirmed = await this.customConfirm('¿Estás seguro de que deseas retirar a este estudiante del curso seleccionado?', 'Confirmar Retiro', true);
        if (!confirmed) return;
        try {
            await API.delete(`/registro/estudiantes/${studentId}/cursos/${cursoId}`);
            Toast.success('Estudiante retirado del curso exitosamente');
            this.loadStudentCourses(studentId);
        } catch (e) {
            Toast.error('Error al retirar estudiante');
        }
    },

    async unenrollAllCourses(studentId) {
        const confirmed = await this.customConfirm('⚠️ ALERTA CRÍTICA: ¿Estás TOTALMENTE seguro de retirar al estudiante de TODOS sus cursos activos? Esta acción es irreversible.', 'Retiro Total', true);
        if (!confirmed) return;
        try {
            await API.delete(`/registro/estudiantes/${studentId}/cursos`);
            Toast.success('Estudiante retirado de todos los cursos exitosamente');
            this.loadStudentCourses(studentId);
        } catch (e) {
            Toast.error('Error al retirar estudiante');
        }
    },

    async openEditCourse(id) {
        const course = this.cursosList.find(c => c.id === id);
        if (!course) return;

        document.getElementById('course-modal').classList.remove('hidden');
        lucide.createIcons();
        
        // Load materias and docentes
        try {
            const [materias, docentes] = await Promise.all([
                API.get('/registro/materias'),
                API.get('/registro/docentes')
            ]);

            const matSelect = document.getElementById('cc-materia');
            const docSelect = document.getElementById('cc-docente');

            matSelect.innerHTML = '<option value="">Seleccione Materia</option>' + 
                materias.map(m => `<option value="${m.id}" ${course.materia_id === m.id ? 'selected' : ''}>${m.nombre} (${m.codigo})</option>`).join('');
            
            docSelect.innerHTML = '<option value="">Seleccione Docente</option>' + 
                docentes.map(d => `<option value="${d.id}" ${course.docente_id === d.id ? 'selected' : ''}>${d.nombres} ${d.apellidos}</option>`).join('');
            
            // Pre-fill
            document.getElementById('cc-nrc').value = course.nrc;
            document.getElementById('cc-nrc').disabled = true; // No se puede cambiar el NRC
            matSelect.disabled = true; // Tampoco la materia
            
            document.getElementById('cc-fecha-inicio').value = course.fecha_inicio || '';
            document.getElementById('cc-fecha-fin').value = course.fecha_fin || '';
            
            // Parse horario
            const parts = course.horario.split(' ');
            if (parts.length >= 2) {
                const days = parts[0].split('-');
                const times = parts[1].split('-');
                
                document.querySelectorAll('input[name="cc-days"]').forEach(cb => {
                    cb.checked = days.includes(cb.value);
                });
                
                if (times.length === 2) {
                    document.getElementById('cc-start').value = times[0];
                    document.getElementById('cc-end').value = times[1];
                }
            }

            // Change form submit handler to update instead of create
            const form = document.getElementById('create-course-form');
            form.onsubmit = (e) => {
                e.preventDefault();
                this.handleUpdateCourse(id);
            };

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.innerHTML = 'Actualizar Datos del Curso';
            submitBtn.className = 'w-full btn-premium bg-[#fab720] text-[#032840] py-5 rounded-2xl shadow-xl shadow-amber-100 font-black uppercase tracking-widest';

        } catch (e) {
            Toast.error('Error al cargar datos académicos');
        }
    },

    async handleUpdateCourse(id) {
        const docente_id = document.getElementById('cc-docente').value;
        const fecha_inicio = document.getElementById('cc-fecha-inicio').value;
        const fecha_fin = document.getElementById('cc-fecha-fin').value;
        const start = document.getElementById('cc-start').value;
        const end = document.getElementById('cc-end').value;

        const selectedDays = Array.from(document.querySelectorAll('input[name="cc-days"]:checked')).map(cb => cb.value);

        if (selectedDays.length === 0) {
            Toast.error('Seleccione al menos un día');
            return;
        }

        const horario = `${selectedDays.join('-')} ${start}-${end}`;

        try {
            await API.put(`/registro/cursos/${id}`, {
                docente_id,
                horario,
                fecha_inicio,
                fecha_fin
            });
            Toast.success('Curso actualizado correctamente');
            this.closeCourseModal();
            this.loadCursos();
        } catch (e) {
            Toast.error('Error al actualizar curso');
        }
    },

    async deleteCourse(id) {
        const confirmed = await this.customConfirm('¿Estás seguro de que deseas eliminar (desactivar) este curso de la oferta académica?', 'Eliminar Curso', true);
        if (!confirmed) return;
        try {
            await API.delete(`/registro/cursos/${id}`);
            Toast.success('Curso eliminado de la oferta académica');
            this.loadCursos();
        } catch (e) {
            Toast.error('Error al eliminar curso');
        }
    },

    async removeSalon(id) {
        const confirmed = await this.customConfirm('¿Liberar el aula asignada a este curso?', 'Liberar Aula', false);
        if (!confirmed) return;
        try {
            await API.put(`/registro/cursos/${id}/quitar-salon`);
            Toast.success('Aula liberada correctamente');
            this.loadCursos();
        } catch (e) {
            Toast.error('Error al liberar aula');
        }
    },

    customConfirm(message, title = "Confirmación Requerida", isCritical = false) {
        return new Promise((resolve) => {
            const modal = document.getElementById('custom-confirm-modal');
            const box = document.getElementById('custom-confirm-box');
            document.getElementById('custom-confirm-message').innerText = message;
            document.getElementById('custom-confirm-title').innerText = title;
            
            const acceptBtn = document.getElementById('custom-confirm-accept');
            const iconBg = document.getElementById('custom-confirm-icon-bg');
            const icon = document.getElementById('custom-confirm-icon');
            
            if (isCritical) {
                acceptBtn.classList.remove('bg-[#032840]', 'shadow-[#032840]/30', 'hover:bg-[#032840]/90');
                acceptBtn.classList.add('bg-red-500', 'shadow-red-500/30', 'hover:bg-red-600');
                iconBg.classList.remove('bg-indigo-50');
                iconBg.classList.add('bg-red-50');
                icon.classList.remove('text-[#032840]');
                icon.classList.add('text-red-500');
                icon.setAttribute('data-lucide', 'alert-triangle');
            } else {
                acceptBtn.classList.remove('bg-red-500', 'shadow-red-500/30', 'hover:bg-red-600');
                acceptBtn.classList.add('bg-[#032840]', 'shadow-[#032840]/30', 'hover:bg-[#032840]/90');
                iconBg.classList.remove('bg-red-50');
                iconBg.classList.add('bg-indigo-50');
                icon.classList.remove('text-red-500');
                icon.classList.add('text-[#032840]');
                icon.setAttribute('data-lucide', 'help-circle');
            }
            lucide.createIcons();

            modal.classList.remove('hidden');
            // Trigger reflow
            void modal.offsetWidth;
            modal.classList.remove('opacity-0');
            box.classList.remove('scale-95');

            const cleanup = () => {
                modal.classList.add('opacity-0');
                box.classList.add('scale-95');
                setTimeout(() => modal.classList.add('hidden'), 300);
                document.getElementById('custom-confirm-cancel').removeEventListener('click', onCancel);
                acceptBtn.removeEventListener('click', onAccept);
            };

            const onCancel = () => { cleanup(); resolve(false); };
            const onAccept = () => { cleanup(); resolve(true); };

            document.getElementById('custom-confirm-cancel').addEventListener('click', onCancel);
            acceptBtn.addEventListener('click', onAccept);
        });
    }
};
