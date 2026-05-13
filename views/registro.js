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
    salonesData: [],
    cursosActivos: [],
    selectedSede: null,
    selectedBloque: null,
    selectedSalon: null,
    salonOcupacion: [],

    async render() {
        if (this.users.length === 0 && !this.searchQuery) {
            await this.loadUsers();
        }
        if (this.salonesData.length === 0) {
            await this.loadSalonesData();
        }

        const filteredUsers = this.users.filter(u =>
            u.nombres.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            u.apellidos.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            u.username.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            u.documento?.includes(this.searchQuery)
        );

        return `
            <div class="space-y-10 pb-24 animate-fade-in">
                
                <!-- Registro Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h2 class="text-4xl font-extrabold text-slate-900 tracking-tight">Registro Académico</h2>
                        <p class="text-slate-500 mt-2 italic font-medium">Gestión integral de la población institucional y trámites curriculares.</p>
                    </div>
                </div>

                <!-- Navigation Tabs -->
                <div class="flex border-b border-slate-200">
                    <button onclick="Views.registro.setTab('directorio')" 
                        class="px-8 py-4 text-sm font-black uppercase tracking-widest transition-all ${this.currentTab === 'directorio' ? 'border-b-4 border-[#fab720] text-[#032840]' : 'text-slate-400 hover:text-slate-600'}">
                        Directorio Central
                    </button>
                    <button onclick="Views.registro.setTab('salones')" 
                        class="px-8 py-4 text-sm font-black uppercase tracking-widest transition-all ${this.currentTab === 'salones' ? 'border-b-4 border-[#fab720] text-[#032840]' : 'text-slate-400 hover:text-slate-600'}">
                        Infraestructura y Salones
                    </button>
                    <button onclick="Views.registro.setTab('solicitudes')" 
                        class="px-8 py-4 text-sm font-black uppercase tracking-widest transition-all ${this.currentTab === 'solicitudes' ? 'border-b-4 border-[#fab720] text-[#032840]' : 'text-slate-400 hover:text-slate-600'}">
                        Solicitudes Pendientes
                    </button>
                </div>

                <!-- Tab Content -->
                <div id="registro-content" class="min-h-[600px]">
                    ${this.currentTab === 'directorio' ? this.renderDirectorio(filteredUsers) : this.currentTab === 'salones' ? this.renderSalones() : this.renderSolicitudes()}
                </div>
            </div>

            <!-- Ficha Modal -->
            <div id="ficha-modal" class="fixed inset-0 bg-[#032840]/60 backdrop-blur-md z-[100] hidden flex items-center justify-center p-4">
                <div class="bg-white rounded-[32px] w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative" id="ficha-content">
                    <!-- Loaded dynamically -->
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
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-10 py-6 font-bold text-slate-900">Santiago Espinosa</td>
                                <td class="px-10 py-6 text-slate-600">Certificado de Notas</td>
                                <td class="px-10 py-6"><span class="badge bg-red-50 text-red-600 border-red-100">Alta</span></td>
                                <td class="px-10 py-6 text-right">
                                    <button class="btn-premium bg-indigo-50 text-indigo-600 px-4 py-1.5 text-[10px]">Procesar</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
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
    },

    async loadUsers() {
        try {
            this.users = await API.get('/registro/users');
        } catch (e) {
            Toast.error('Fallo en sincronización institutional');
        }
    },

    async loadSalonesData() {
        try {
            this.salonesData = await API.get('/registro/salones/estructura');
            this.cursosActivos = await API.get('/registro/cursos/activos');
            if (this.salonesData.length > 0 && !this.selectedSede) {
                this.selectedSede = this.salonesData[0];
            }
        } catch (e) {
            console.error("Error loading salones:", e);
        }
    },

    async loadSalonOcupacion(salonId) {
        try {
            this.salonOcupacion = await API.get('/registro/salones/'+salonId+'/ocupacion');
            this.reRender();
        } catch(e) {
            console.error(e);
        }
    },

    async assignSalon(cursoId, salonId, horario) {
        try {
            await API.post('/registro/salones/asignar', { curso_id: cursoId, salon_id: salonId, horario });
            Toast.success('Asignación guardada correctamente');
            await this.loadSalonesData();
            await this.loadSalonOcupacion(salonId);
        } catch (e) {
            Toast.error(e.message || 'Error al asignar salón');
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

    selectSede(sedeId) {
        this.selectedSede = this.salonesData.find(s => s.id === sedeId);
        this.selectedBloque = null;
        this.selectedSalon = null;
        this.reRender();
    },

    selectBloque(bloqueId) {
        if (!this.selectedSede) return;
        this.selectedBloque = this.selectedSede.bloques.find(b => b.id === bloqueId);
        this.selectedSalon = null;
        this.reRender();
    },

    selectSalon(salonId) {
        if (!this.selectedBloque) return;
        this.selectedSalon = this.selectedBloque.salones.find(s => s.id === salonId);
        this.loadSalonOcupacion(salonId);
    },

    renderSalones() {
        if (!this.salonesData || this.salonesData.length === 0) {
            return `<div class="p-10 text-center text-slate-500">Cargando infraestructura...</div>`;
        }

        const sedes = this.salonesData;
        const bloques = this.selectedSede ? this.selectedSede.bloques : [];
        const salones = this.selectedBloque ? this.selectedBloque.salones : [];

        // Generar grilla de horarios
        const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const horas = ['7:30 - 9:30', '9:30 - 11:30', '11:30 - 13:30', '14:00 - 16:00', '16:00 - 18:00', '18:30 - 20:30', '19:30 - 21:30'];

        let rightPanelContent = `
            <div class="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 p-12 text-center">
                <i data-lucide="map" class="w-16 h-16 mb-4"></i>
                <p class="font-bold text-lg">Selecciona un salón para ver su estado</p>
                <p class="text-xs uppercase tracking-widest mt-2">Navega por Sede > Bloque > Salón</p>
            </div>
        `;

        if (this.selectedSalon) {
            rightPanelContent = `
                <div class="space-y-6">
                    <div class="flex items-center justify-between border-b border-slate-100 pb-6">
                        <div>
                            <h3 class="text-2xl font-black text-[#032840]">${this.selectedSalon.nombre}</h3>
                            <p class="text-xs text-slate-500 font-bold uppercase tracking-widest">${this.selectedSede.nombre} • ${this.selectedBloque.nombre}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            ${this.salonOcupacion.length > 0 
                                ? `<span class="badge bg-red-50 text-red-600 border-red-100 uppercase text-[10px] font-black px-3 py-1"><div class="w-2 h-2 rounded-full bg-red-500 inline-block mr-2"></div>Ocupado Parcialmente</span>`
                                : `<span class="badge bg-emerald-50 text-emerald-600 border-emerald-100 uppercase text-[10px] font-black px-3 py-1"><div class="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-2"></div>Libre</span>`}
                        </div>
                    </div>

                    <!-- Asignación Form -->
                    <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Nueva Asignación</h4>
                        <div class="flex gap-4">
                            <select id="asig-curso" class="input-premium py-3 text-sm flex-grow">
                                <option value="">Selecciona una asignatura (Curso)...</option>
                                ${this.cursosActivos.map(c => `
                                    <option value="${c.id}">${c.nrc} - ${c.asignatura} (${c.nombres} ${c.apellidos})</option>
                                `).join('')}
                            </select>
                            <select id="asig-horario" class="input-premium py-3 text-sm w-48">
                                <option value="">Franja Horaria...</option>
                                ${horas.flatMap(h => dias.map(d => `<option value="${d.substring(0,3)} ${h}">${d.substring(0,3)} ${h}</option>`)).join('')}
                                <option value="Lun-Mié 8:00-10:00">Lun-Mié 8:00-10:00</option>
                                <option value="Mar-Jue 10:00-12:00">Mar-Jue 10:00-12:00</option>
                                <option value="Vie 8:00-12:00">Vie 8:00-12:00</option>
                                <option value="Lun-Mié 14:00-16:00">Lun-Mié 14:00-16:00</option>
                            </select>
                            <button onclick="Views.registro.assignSalon(document.getElementById('asig-curso').value, ${this.selectedSalon.id}, document.getElementById('asig-horario').value)" class="btn-premium bg-[#032840] text-white px-6 py-3 text-xs">Asignar</button>
                        </div>
                    </div>

                    <!-- Horarios Grid -->
                    <div class="space-y-4">
                        <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ocupación Actual</h4>
                        ${this.salonOcupacion.length > 0 ? `
                            <div class="grid grid-cols-1 gap-3">
                                ${this.salonOcupacion.map(oc => `
                                    <div class="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors">
                                        <div class="flex items-center gap-4">
                                            <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs text-center leading-tight">
                                                ${oc.horario.replace(' ', '<br>')}
                                            </div>
                                            <div>
                                                <div class="font-bold text-slate-800">${oc.asignatura} <span class="text-xs text-slate-400 font-medium ml-2">NRC: ${oc.nrc}</span></div>
                                                <div class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Prof: ${oc.nombres} ${oc.apellidos}</div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="text-center p-8 bg-white border border-slate-200 border-dashed rounded-2xl text-slate-400">
                                Ningún curso asignado actualmente a este salón.
                            </div>
                        `}
                    </div>
                </div>
            `;
        }

        return `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in h-[700px]">
                
                <!-- Explorador de Infraestructura -->
                <div class="col-span-1 flex flex-col gap-4">
                    
                    <!-- Sedes -->
                    <div class="card-premium p-6 bg-white space-y-4 shadow-sm border-slate-200">
                        <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-[#032840] border-b border-slate-100 pb-2">1. Sedes</h4>
                        <div class="flex flex-wrap gap-2">
                            ${sedes.map(s => `
                                <button onclick="Views.registro.selectSede(${s.id})" class="px-4 py-2 rounded-lg text-xs font-bold transition-all ${this.selectedSede?.id === s.id ? 'bg-[#032840] text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}">
                                    ${s.nombre}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Bloques -->
                    <div class="card-premium p-6 bg-white space-y-4 shadow-sm border-slate-200 flex-grow flex flex-col ${!this.selectedSede ? 'opacity-50 pointer-events-none' : ''}">
                        <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-[#032840] border-b border-slate-100 pb-2">2. Bloques</h4>
                        <div class="grid grid-cols-2 gap-2 overflow-y-auto custom-scrollbar flex-grow pr-2">
                            ${bloques.map(b => `
                                <button onclick="Views.registro.selectBloque(${b.id})" class="px-3 py-3 rounded-lg text-xs font-bold text-left transition-all flex justify-between items-center ${this.selectedBloque?.id === b.id ? 'bg-[#fab720] text-[#032840] shadow-md border-transparent' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}">
                                    <span class="truncate">${b.nombre}</span>
                                    <span class="text-[9px] opacity-60 ml-2">${b.salones.length}</span>
                                </button>
                            `).join('')}
                            ${bloques.length === 0 ? '<div class="col-span-2 text-xs text-slate-400 p-2 text-center">Seleccione una sede</div>' : ''}
                        </div>
                    </div>

                </div>

                <!-- Salones y Detalles -->
                <div class="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    <!-- Lista de Salones -->
                    <div class="card-premium p-6 bg-white shadow-sm border-slate-200 flex flex-col ${!this.selectedBloque ? 'opacity-50 pointer-events-none' : ''}">
                        <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-[#032840] border-b border-slate-100 pb-2 mb-4">3. Salones</h4>
                        <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto custom-scrollbar pr-2 pb-4">
                            ${salones.map(s => {
                                // Basic occupation heuristic based on this.cursosActivos matching salon_id
                                const occ = this.cursosActivos.some(c => c.salon_id === s.id);
                                return `
                                <button onclick="Views.registro.selectSalon(${s.id})" class="relative p-3 rounded-xl border text-left transition-all ${this.selectedSalon?.id === s.id ? 'border-[#032840] bg-slate-50 ring-2 ring-[#032840]/10 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}">
                                    <div class="flex items-center gap-2 mb-2">
                                        <i data-lucide="door-open" class="w-4 h-4 ${occ ? 'text-red-400' : 'text-emerald-400'}"></i>
                                        <span class="font-bold text-xs text-slate-800 truncate">${s.nombre}</span>
                                    </div>
                                    <div class="text-[9px] font-black uppercase tracking-widest ${occ ? 'text-red-500' : 'text-emerald-500'}">
                                        ${occ ? 'Asignado' : 'Disponible'}
                                    </div>
                                </button>
                                `;
                            }).join('')}
                            ${salones.length === 0 ? '<div class="col-span-2 text-xs text-slate-400 p-2 text-center">Seleccione un bloque</div>' : ''}
                        </div>
                    </div>

                    <!-- Panel de Detalles del Salón -->
                    <div class="card-premium p-8 bg-white shadow-xl ring-1 ring-slate-100 flex flex-col">
                        ${rightPanelContent}
                    </div>

                </div>

            </div>
        `;
    },

    async loadUsers() {
        try {
            this.users = await API.get('/registro/users');
        } catch (e) {
            Toast.error('Fallo en sincronización institutional');
        }
    },

    setTab(tab) {
        this.currentTab = tab;
        this.render();
        // Since we are in the same view object, we need to trigger the DOM update manually if we don't use the router
        document.getElementById('view-mount').innerHTML = 'Cargando...';
        this.reRender();
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
    }
};
