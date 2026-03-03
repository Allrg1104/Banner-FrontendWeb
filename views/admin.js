/**
 * Admin TI Dashboard - Enterprise management console overhaul
 */

Views.admin = {
    async render() {
        const stats = await API.get('/admin/system-stats');

        return `
        <div class="p-8 space-y-10 max-w-7xl mx-auto pb-24 animate-in fade-in duration-700">

            <!-- Header Section -->
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div class="space-y-2">
                    <h1 class="text-5xl font-black text-[#032840] tracking-tight leading-tight" style="font-family: 'Outfit'">
                        Panel de <span class="text-[#fab720]">Administración</span>
                    </h1>
                    <p class="text-slate-800 font-bold text-lg flex items-center gap-2">
                        <span class="w-8 h-[2px] bg-[#fab720] rounded-full"></span>
                        Gestión total de infraestructura y usuarios institucionales.
                    </p>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="Views.admin.openCreateModal()"
                        class="btn-premium btn-logout shadow-2xl shadow-amber-600/40 px-8 py-4 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group">
                        <i data-lucide="user-plus" class="group-hover:rotate-12 transition-transform"></i>
                        <span class="font-bold uppercase tracking-widest text-xs">Nuevo Usuario Alta</span>
                    </button>
                </div>
            </div>

            <!-- KPI Cards: Institutional Focus -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                ${this.renderStatCard('Estudiantes', stats.total_students || 0, 'book-open', 'from-blue-500/10 to-blue-600/20 text-blue-400', 'blue')}
                ${this.renderStatCard('Docentes', stats.total_teachers || 0, 'presentation', 'from-[#fab720]/10 to-[#fab720]/20 text-[#fab720]', 'gold')}
                ${this.renderStatCard('Total Usuarios', stats.total_users || 0, 'users', 'from-[#032840]/10 to-[#032840]/20 text-[#032840]', 'navy')}
                ${this.renderStatCard('Usuarios Activos', stats.active_users || 0, 'activity', 'from-emerald-500/10 to-emerald-600/20 text-emerald-400', 'emerald')}
            </div>

            <!-- Main Workspace: User Management -->
            <div class="card-premium p-0 shadow-xl border-slate-200 bg-white relative">
                <div class="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50/50">
                    <div class="relative">
                        <h3 class="text-2xl font-bold text-slate-900 mb-1">Directorio Institucional</h3>
                        <p class="text-sm text-slate-500">Control maestro de perfiles, permisos y auditoría de accesos personales.</p>
                    </div>

                    <div class="flex items-center gap-4 flex-grow max-w-lg">
                        <div class="relative flex-grow group">
                            <i data-lucide="search" class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors"></i>
                            <input type="text" id="user-search" onkeyup="Views.admin.handleSearch(this.value)"
                                class="input-premium pl-14 bg-white border-slate-200 w-full h-14 text-slate-900 focus:border-indigo-600 transition-all font-medium"
                                placeholder="Buscar por nombre o ID...">
                        </div>
                        <button onclick="Views.admin.refreshTable()"
                            class="btn-premium p-4 bg-white border-slate-200 hover:bg-slate-50 transition-all active:scale-90 group">
                            <i data-lucide="refresh-cw" class="w-5 h-5 text-slate-400 group-hover:rotate-180 transition-transform duration-500"></i>
                        </button>
                    </div>
                </div>

                <!-- Table Container: Excel-style "Freeze Panes" -->
                <div class="table-scroll-container">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100 bg-slate-50/30">
                                <th class="px-10 py-6 w-16">
                                    <input type="checkbox" id="select-all" onchange="Views.admin.toggleSelectAll(this)" class="w-5 h-5 rounded-md border-slate-300 bg-white checked:bg-indigo-600 transition-all cursor-pointer">
                                </th>
                                <th class="px-6 py-6 font-black">Identidad</th>
                                <th class="px-6 py-6 font-black">Información de Contacto</th>
                                <th class="px-6 py-6 font-black text-center">Nivel de Acceso</th>
                                <th class="px-6 py-6 font-black text-center">Estado de Cuenta</th>
                                <th class="px-10 py-6 text-right">Mantenimiento</th>
                            </tr>
                        </thead>
                        <tbody id="user-table-body" class="divide-y divide-slate-100 bg-white">
                            <!-- Data will be loaded via JS -->
                        </tbody>
                    </table>
                </div>

                <!-- Bulk Actions Footer -->
                <div id="bulk-actions" class="hidden p-4 bg-indigo-600 text-white flex items-center justify-between animate-slide-up">
                    <div class="flex items-center gap-4 ml-4">
                        <span id="selected-count" class="font-bold text-sm">0 seleccionados</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <button onclick="Views.admin.openBulkReset()" class="btn-premium bg-white/20 hover:bg-white/30 text-white border-white/20 py-2 text-xs">
                            <i data-lucide="key-round" class="w-4 h-4"></i>
                            Resetear Contraseñas
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    },

    renderStatCard(label, value, icon, gradient, colorName) {
        return `
      <div class="card-premium p-8 hover-scale transition-all group overflow-hidden relative border-slate-200 bg-white cursor-default shadow-md">
        <div class="absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500"></div>
        <div class="relative z-10 flex justify-between items-start mb-6">
          <div class="w-16 h-16 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 group-hover:border-indigo-600/50 group-hover:bg-indigo-50 transition-all duration-500 shadow-inner">
            <i data-lucide="${icon}" class="w-8 h-8 ${colorName === 'emerald' ? 'text-emerald-500' : 'text-indigo-600'} group-hover:scale-110 transition-transform"></i>
          </div>
          <div class="flex flex-col items-end">
            <span id="stat-value-${label}" class="text-4xl font-black text-slate-900 leading-none mb-1" style="font-family: 'Outfit'">${value}</span>
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuarios</span>
          </div>
        </div>
        <div class="relative z-10">
          <h4 class="text-slate-500 font-black text-xs tracking-widest uppercase opacity-90">${label}</h4>
          <div class="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div class="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full rounded-full transition-all duration-1000 w-[65%]" id="stat-bar-${label}"></div>
          </div>
        </div>
      </div>
    `;
    },

    async afterRender() {
        this.refreshTable();
        this.updateStats(); // New method to ensure stats are refreshed
        lucide.createIcons();
    },

    async updateStats() {
        try {
            const stats = await API.get('/admin/system-stats');
            console.log('[DEBUG] Updating dashboard stats:', stats);

            const mapping = {
                'Estudiantes': stats.total_students,
                'Docentes': stats.total_teachers,
                'Total Usuarios': stats.total_users,
                'Usuarios Activos': stats.active_users
            };

            for (const [label, value] of Object.entries(mapping)) {
                const el = document.getElementById(`stat-value-${label}`);
                if (el) {
                    el.innerText = value || 0;
                    // Animate the bar
                    const bar = document.getElementById(`stat-bar-${label}`);
                    if (bar) bar.style.width = '75%';
                }
            }
        } catch (err) {
            console.error('Error updating stats:', err);
        }
    },

    async refreshTable(search = '') {
        const tbody = document.getElementById('user-table-body');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="6" class="p-24 text-center"><div class="loader mx-auto ring-4 ring-indigo-500/20 border-indigo-500"></div><p class="mt-4 text-slate-500 font-medium animate-pulse">Sincronizando registros...</p></td></tr>';

        try {
            const users = await API.get(`/admin/users?search=${encodeURIComponent(search)}`);

            if (users.length === 0) {
                tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="p-24 text-center">
                        <div class="flex flex-col items-center gap-4 text-slate-500">
                            <i data-lucide="user-x" class="w-16 h-16 opacity-20"></i>
                            <p class="font-bold text-lg">No se encontraron usuarios</p>
                            <p class="text-xs uppercase tracking-widest opacity-60">Intenta con otros criterios de búsqueda</p>
                        </div>
                    </td>
                </tr>
                `;
                lucide.createIcons();
                return;
            }

            tbody.innerHTML = users.map(user => {
                const userJson = JSON.stringify(user).replace(/"/g, '&quot;');
                return `
                <tr class="hover:bg-slate-50 transition-all duration-300 group cursor-default">
                    <td class="px-10 py-6">
                        <input type="checkbox" name="user-select" value="${user.id}" 
                            onchange="Views.admin.updateBulkState()" 
                            class="user-check w-5 h-5 rounded-md border-slate-200 bg-white checked:bg-indigo-600 transition-all cursor-pointer">
                    </td>
                    <td class="px-6 py-6">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:border-indigo-600/50 transition-all">
                                <span class="text-slate-400 font-black text-lg group-hover:text-indigo-600">${user.nombres[0]}</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors">${user.username}</span>
                                <span class="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">ID Institucional: ${String(user.id).padStart(5, '0')}</span>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-6">
                        <div class="flex flex-col">
                            <span class="font-medium text-slate-600">${user.nombres} ${user.apellidos}</span>
                            <span class="text-xs text-slate-400 flex items-center gap-2 mt-1">
                                <i data-lucide="mail" class="w-3 h-3"></i>
                                ${user.email}
                            </span>
                        </div>
                    </td>
                    <td class="px-6 py-6 text-center">
                        <span class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${this.getRolStyles(user.rol)} shadow-sm group-hover:shadow-md transition-all">
                            ${user.rol}
                        </span>
                    </td>
                    <td class="px-6 py-6">
                        <div class="flex items-center justify-center gap-2">
                            <div class="relative flex h-3 w-3">
                                <span class="relative inline-flex rounded-full h-3 w-3 ${user.activo ? 'bg-emerald-500' : 'bg-red-500'} shadow-sm"></span>
                            </div>
                            <span class="text-xs font-black text-slate-500 uppercase tracking-tighter">${user.activo ? 'Activo' : 'Inactivo'}</span>
                        </div>
                    </td>
                    <td class="px-10 py-6 text-right">
                        <div class="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform">
                            <button onclick="Views.admin.openEditModal(${userJson})" 
                                class="p-2.5 rounded-xl bg-slate-50 text-slate-400 border border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm">
                                <i data-lucide="edit-3" class="w-4 h-4"></i>
                            </button>
                            <button onclick="Views.admin.openResetOne(${user.id}, '${user.username}')" 
                                class="p-2.5 rounded-xl bg-slate-50 text-slate-400 border border-slate-200 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all shadow-sm">
                                <i data-lucide="key" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </td>
                </tr>
                `;
            }).join('');

            lucide.createIcons();
        } catch (err) {
            tbody.innerHTML = `
            <tr>
                <td colspan="6" class="p-24 text-center">
                    <div class="card-premium inline-block p-10 bg-red-500/10 border-red-500/20 text-red-400">
                        <i data-lucide="alert-triangle" class="w-12 h-12 mx-auto mb-4 opacity-50"></i>
                        <p class="font-black uppercase tracking-widest text-sm mb-2">Error de Enlace</p>
                        <p class="text-xs font-medium">${err.message}</p>
                        <button onclick="Views.admin.refreshTable()" class="mt-6 btn-premium btn-ghost border-white/10 text-white text-[10px] uppercase font-bold tracking-widest px-6">Reintentar Conexión</button>
                    </div>
                </td>
            </tr>
            `;
            lucide.createIcons();
        }
    },

    getRolStyles(rol) {
        const map = {
            'admin': 'bg-red-500/10 text-red-400 border-red-500/20',
            'estudiante': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'docente': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            'director': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            'registro': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'financiero': 'bg-slate-500/10 text-slate-400 border-slate-500/20'
        };
        return map[rol] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    },

    searchTimeout: null,
    handleSearch(val) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => this.refreshTable(val), 400);
    },

    toggleSelectAll(cb) {
        const checks = document.querySelectorAll('.user-check');
        checks.forEach(c => c.checked = cb.checked);
        this.updateBulkState();
    },

    updateBulkState() {
        const selected = document.querySelectorAll('.user-check:checked');
        const bulkBar = document.getElementById('bulk-actions');
        const countDisplay = document.getElementById('selected-count');

        if (selected.length > 0) {
            bulkBar?.classList.remove('hidden');
            if (countDisplay) countDisplay.innerText = `${selected.length} usuarios seleccionados`;
        } else {
            bulkBar?.classList.add('hidden');
        }
    },

    openCreateModal() {
        this.showUserModal(null);
    },

    openEditModal(user) {
        this.showUserModal(user);
    },

    showUserModal(user = null) {
        const isEdit = !!user;
        const modalContent = document.getElementById('modal-content');
        const container = document.getElementById('modal-container');
        if (!modalContent || !container) return;

        // Expand modal for this view
        modalContent.className = 'bg-white rounded-[2.5rem] shadow-2xl max-w-6xl w-full transform transition-all overflow-hidden border border-slate-100';

        // Parse metadata with defaults matching the user's required list
        let metadata = {
            segundo_nombre: '-',
            estado_civil: 'Soltero(a)',
            sexo: 'Masculino',
            nombre_preferido: '-',
            identificacion_genero: 'Masculino',
            email_personal: '',
            direccion: 'CRA 94A 2 41',
            emergencia: [
                { nombre: 'JANETH ORTIZ', parentesco: 'Acudiente', telefono: '317 4169964', direccion: 'CRA 94A 2 41, Cali, Valle 76001' },
                { nombre: 'DEYSON FERNANDO ESPINOSA', parentesco: 'Acudiente', telefono: '311 7246085', direccion: 'Cali, Valle 76001' }
            ],
            discapacidad: 'Status no disponible'
        };

        if (isEdit && user.metadata) {
            try {
                const parsed = typeof user.metadata === 'string' ? JSON.parse(user.metadata) : user.metadata;
                metadata = { ...metadata, ...parsed };
            } catch (e) { console.error('Error parsing metadata', e); }
        }

        modalContent.innerHTML = `
        <div class="max-h-[85vh] overflow-y-auto custom-scrollbar">
            <!-- Modal Header -->
            <div class="sticky top-0 bg-white z-20 px-10 py-8 border-b border-slate-100 flex items-center justify-between">
                <div class="flex items-center gap-6">
                    <div class="w-16 h-16 rounded-2xl bg-[#032840] flex items-center justify-center text-[#fab720] shadow-xl">
                        <i data-lucide="${isEdit ? 'user-cog' : 'user-plus'}" class="w-8 h-8"></i>
                    </div>
                    <div>
                        <h2 class="text-3xl font-black text-slate-900 leading-tight" style="font-family: 'Outfit'">
                            ${isEdit ? 'Expediente Institucional' : 'Registro de Nuevo Integrante'}
                        </h2>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 italic">
                            Administración Usuarios / Gestión de Identidades Globales
                        </p>
                    </div>
                </div>
                <button onclick="document.getElementById('modal-container').classList.add('hidden')" 
                    class="w-12 h-12 rounded-full flex items-center justify-center hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all group">
                    <i data-lucide="x" class="w-6 h-6 group-hover:rotate-90 transition-transform"></i>
                </button>
            </div>

            <form id="user-form" class="p-10 space-y-12 pb-24">
                
                <!-- SECCIÓN 1: DETALLES PERSONALES -->
                <div class="space-y-8">
                    <div class="flex items-center gap-4">
                        <div class="h-8 w-1.5 bg-[#fab720] rounded-full"></div>
                        <h3 class="text-xs font-black uppercase tracking-[0.3em] text-[#032840]">Detalles Personales</h3>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <label class="label-premium">Nombre</label>
                            <input type="text" id="m-nombres" value="${isEdit ? user.nombres : ''}" class="input-premium" required placeholder="Santiago">
                        </div>
                        <div>
                            <label class="label-premium">Segundo nombre</label>
                            <input type="text" id="m-segundo-nombre" value="${metadata.segundo_nombre}" class="input-premium" placeholder="-">
                        </div>
                        <div>
                            <label class="label-premium">Apellido</label>
                            <input type="text" id="m-apellidos" value="${isEdit ? user.apellidos : ''}" class="input-premium" required placeholder="Espinosa Ruiz">
                        </div>
                        <div>
                            <label class="label-premium">Fecha de nacimiento</label>
                            <input type="text" id="m-nacimiento-text" value="${isEdit && user.fecha_nacimiento ? user.fecha_nacimiento : '7 de mayo de 2004'}" class="input-premium" placeholder="ej: 7 de mayo de 2004">
                        </div>
                        <div>
                            <label class="label-premium">Estado civil</label>
                            <select id="m-estado-civil" class="input-premium">
                                <option value="Soltero(a)" ${metadata.estado_civil === 'Soltero(a)' ? 'selected' : ''}>Soltero(a)</option>
                                <option value="Casado(a)" ${metadata.estado_civil === 'Casado(a)' ? 'selected' : ''}>Casado(a)</option>
                                <option value="Union Libre" ${metadata.estado_civil === 'Union Libre' ? 'selected' : ''}>Unión Libre</option>
                            </select>
                        </div>
                        <div>
                            <label class="label-premium">Sexo</label>
                            <select id="m-sexo" class="input-premium">
                                <option value="Masculino" ${metadata.sexo === 'Masculino' ? 'selected' : ''}>Masculino</option>
                                <option value="Femenino" ${metadata.sexo === 'Femenino' ? 'selected' : ''}>Femenino</option>
                                <option value="Otro" ${metadata.sexo === 'Otro' ? 'selected' : ''}>Otro</option>
                            </select>
                        </div>
                        <div>
                            <label class="label-premium">Nombre preferido</label>
                            <input type="text" id="m-preferido" value="${metadata.nombre_preferido}" class="input-premium" placeholder="-">
                        </div>
                        <div>
                            <label class="label-premium">Identificación de género</label>
                            <input type="text" id="m-genero-id" value="${metadata.identificacion_genero}" class="input-premium" placeholder="Masculino">
                        </div>
                        <div>
                            <label class="label-premium">Tipo Documento</label>
                            <select id="m-tipo-doc" class="input-premium">
                                <option value="CC" ${user?.tipo_documento === 'CC' ? 'selected' : ''}>CC</option>
                                <option value="TI" ${user?.tipo_documento === 'TI' ? 'selected' : ''}>TI</option>
                                <option value="CE" ${user?.tipo_documento === 'CE' ? 'selected' : ''}>CE</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- SECCIÓN 2: CORREO Y TELÉFONO -->
                <div class="space-y-8 border-t border-slate-100 pt-10">
                    <div class="flex items-center gap-4">
                        <div class="h-8 w-1.5 bg-blue-500 rounded-full"></div>
                        <h3 class="text-xs font-black uppercase tracking-[0.3em] text-[#032840]">Comunicación Institucional</h3>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label class="label-premium text-indigo-600">Correo Institucional</label>
                            <div class="relative group">
                                <i data-lucide="mail" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300"></i>
                                <input type="email" id="m-email" value="${isEdit ? user.email : ''}" class="input-premium pl-12 ${isEdit ? 'bg-slate-50 cursor-not-allowed font-bold' : ''}" ${isEdit ? 'readonly' : ''} placeholder="usuario@unicatolica.edu.co">
                            </div>
                            <p class="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-widest">${isEdit ? '(Solo lectura para perfiles existentes)' : '(Se generará automáticamente al escribir el usuario)'}</p>
                        </div>
                        <div>
                            <label class="label-premium">Correo Personal</label>
                            <input type="email" id="m-email-personal" value="${metadata.email_personal || 'santiago_espinosa10@hotmail.com'}" class="input-premium" placeholder="ejemplo@correo.com">
                        </div>
                        <div>
                            <label class="label-premium">Celular (Principal)</label>
                            <div class="relative">
                                <i data-lucide="phone" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300"></i>
                                <input type="text" id="m-telefono" value="${isEdit && user.telefono ? user.telefono : '3012117114'}" class="input-premium pl-12" placeholder="301...">
                            </div>
                        </div>
                        <div>
                            <label class="label-premium">Documento / Cédula</label>
                            <input type="text" id="m-doc" value="${isEdit ? user.documento : ''}" class="input-premium" placeholder="1005234...">
                        </div>
                    </div>
                </div>

                <!-- SECCIÓN 3: LOCALIZACIÓN Y ACCESO -->
                <div class="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200 space-y-8">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-xl bg-[#032840] flex items-center justify-center text-white">
                                <i data-lucide="map-pin" class="w-5 h-5"></i>
                            </div>
                            <h3 class="text-xs font-black uppercase tracking-[0.3em] text-[#032840]">Residencia y Sistema</h3>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado:</span>
                            <div class="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                                <input type="checkbox" id="m-activo" ${isEdit && user.activo ? 'checked' : 'checked'} ${isEdit && user.username === 'admin.ti' ? 'disabled' : ''} class="w-4 h-4 rounded-md border-slate-300 text-emerald-500 focus:ring-emerald-500">
                                <label for="m-activo" class="text-[10px] font-black uppercase text-slate-700 cursor-pointer">Activo</label>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="col-span-2">
                            <label class="label-premium">Dirección de Residencia</label>
                            <input type="text" id="m-direccion" value="${metadata.direccion}" class="input-premium bg-white" placeholder="CRA 94A 2 41">
                        </div>
                        <div>
                            <label class="label-premium text-indigo-600 italic">Nombre de Usuario (Login ID)</label>
                            <div class="relative">
                                <i data-lucide="fingerprint" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300"></i>
                                <input type="text" id="m-user" value="${isEdit ? user.username : ''}" class="input-premium pl-12 bg-white ${isEdit ? 'opacity-60 cursor-not-allowed font-bold' : ''}" required ${isEdit ? 'readonly' : ''}>
                            </div>
                        </div>
                        <div>
                            <label class="label-premium">Rol Institucional</label>
                            <select id="m-rol" class="input-premium bg-white">
                                <option value="estudiante" ${user?.rol === 'estudiante' ? 'selected' : ''}>Estudiante</option>
                                <option value="docente" ${user?.rol === 'docente' ? 'selected' : ''}>Docente</option>
                                <option value="admin" ${user?.rol === 'admin' ? 'selected' : ''}>Admin TI</option>
                                <option value="registro" ${user?.rol === 'registro' ? 'selected' : ''}>Registro Académico</option>
                                <option value="financiero" ${user?.rol === 'financiero' ? 'selected' : ''}>Gestión Financiera</option>
                                <option value="director" ${user?.rol === 'director' ? 'selected' : ''}>Director / Decano</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- SECCIÓN 4: CONTACTOS DE EMERGENCIA -->
                <div class="space-y-8 border-t border-slate-100 pt-10">
                    <div class="flex items-center gap-4">
                        <div class="h-8 w-1.5 bg-red-500 rounded-full"></div>
                        <h3 class="text-xs font-black uppercase tracking-[0.3em] text-[#032840]">Contactos de Emergencia</h3>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <!-- Contacto 1 -->
                        <div class="p-8 border-2 border-dashed border-slate-100 rounded-[2.5rem] space-y-6 hover:border-red-100 transition-colors bg-white">
                            <div class="flex items-center gap-3">
                                <span class="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-black text-xs">1</span>
                                <span class="text-xs font-black text-slate-500 uppercase">Contacto Primario</span>
                            </div>
                            <div class="space-y-4">
                                <div>
                                    <label class="label-premium opacity-60">Nombre Completo</label>
                                    <input type="text" id="m-emer-1-nombre" value="${metadata.emergencia?.[0]?.nombre || ''}" class="input-premium py-2 text-sm" placeholder="JANETH ORTIZ">
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="label-premium opacity-60">Parentesco</label>
                                        <input type="text" id="m-emer-1-rel" value="${metadata.emergencia?.[0]?.parentesco || ''}" class="input-premium py-2 text-sm" placeholder="Acudiente">
                                    </div>
                                    <div>
                                        <label class="label-premium opacity-60">Teléfono</label>
                                        <input type="text" id="m-emer-1-tel" value="${metadata.emergencia?.[0]?.telefono || ''}" class="input-premium py-2 text-sm" placeholder="317 4169964">
                                    </div>
                                </div>
                                <div>
                                    <label class="label-premium opacity-60">Dirección</label>
                                    <input type="text" id="m-emer-1-dir" value="${metadata.emergencia?.[0]?.direccion || ''}" class="input-premium py-2 text-sm" placeholder="CRA 94A 2 41...">
                                </div>
                            </div>
                        </div>

                        <!-- Contacto 2 -->
                        <div class="p-8 border-2 border-dashed border-slate-100 rounded-[2.5rem] space-y-6 hover:border-red-100 transition-colors bg-white">
                            <div class="flex items-center gap-3">
                                <span class="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-black text-xs">2</span>
                                <span class="text-xs font-black text-slate-500 uppercase">Contacto Secundario</span>
                            </div>
                            <div class="space-y-4">
                                <div>
                                    <label class="label-premium opacity-60">Nombre Completo</label>
                                    <input type="text" id="m-emer-2-nombre" value="${metadata.emergencia?.[1]?.nombre || ''}" class="input-premium py-2 text-sm" placeholder="DEYSON FERNANDO ESPINOSA">
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="label-premium opacity-60">Parentesco</label>
                                        <input type="text" id="m-emer-2-rel" value="${metadata.emergencia?.[1]?.parentesco || ''}" class="input-premium py-2 text-sm" placeholder="Acudiente">
                                    </div>
                                    <div>
                                        <label class="label-premium opacity-60">Teléfono</label>
                                        <input type="text" id="m-emer-2-tel" value="${metadata.emergencia?.[1]?.telefono || ''}" class="input-premium py-2 text-sm" placeholder="311 7246085">
                                    </div>
                                </div>
                                <div>
                                    <label class="label-premium opacity-60">Dirección</label>
                                    <input type="text" id="m-emer-2-dir" value="${metadata.emergencia?.[1]?.direccion || ''}" class="input-premium py-2 text-sm" placeholder="Cali, Valle 76001">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SECCIÓN 5: OTROS DETALLES -->
                <div class="space-y-8 border-t border-slate-100 pt-10">
                    <div class="flex items-center gap-4">
                        <div class="h-8 w-1.5 bg-slate-400 rounded-full"></div>
                        <h3 class="text-xs font-black uppercase tracking-[0.3em] text-[#032840]">Información Adicional</h3>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label class="label-premium">Status de discapacidad</label>
                            <input type="text" id="m-discapacidad" value="${metadata.discapacidad}" class="input-premium" placeholder="Status no disponible">
                        </div>
                    </div>
                </div>

                <!-- Botones de Acción -->
                <div class="sticky bottom-[-10px] bg-white/90 backdrop-blur-md pt-8 pb-4 border-t border-slate-100 flex justify-end gap-6 z-20">
                    <button type="button" onclick="document.getElementById('modal-container').classList.add('hidden'); document.getElementById('modal-content').className='bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all';" 
                        class="px-10 py-5 font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-slate-600 transition-all">Cerrar sin guardar</button>
                    <button type="submit" class="btn-premium bg-[#032840] text-[#fab720] px-20 py-5 shadow-2xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all">
                        <span class="font-black uppercase tracking-widest text-xs">${isEdit ? 'Actualizar Expediente Global' : 'Confirmar Alta en el Sistema'}</span>
                    </button>
                </div>
            </form>
        </div>
        `;

        // Update close button in header too
        const closeBtn = modalContent.querySelector('button[onclick*="modal-container"]');
        if (closeBtn) {
            closeBtn.setAttribute('onclick', "document.getElementById('modal-container').classList.add('hidden'); document.getElementById('modal-content').className='bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all';");
        }

        container.classList.remove('hidden');
        lucide.createIcons();

        // Auto-populate email for new users
        if (!isEdit) {
            const userInput = document.getElementById('m-user');
            const emailInput = document.getElementById('m-email');
            userInput.addEventListener('input', (e) => {
                const user = e.target.value.trim().toLowerCase();
                emailInput.value = user ? `${user}@unicatolica.edu.co` : '';
            });
        }

        document.getElementById('user-form').onsubmit = async (e) => {
            e.preventDefault();

            // Reconstruct full metadata object
            const metadataObj = {
                segundo_nombre: document.getElementById('m-segundo-nombre').value,
                estado_civil: document.getElementById('m-estado-civil').value,
                sexo: document.getElementById('m-sexo').value,
                nombre_preferido: document.getElementById('m-preferido').value,
                identificacion_genero: document.getElementById('m-genero-id').value,
                email_personal: document.getElementById('m-email-personal').value,
                direccion: document.getElementById('m-direccion').value,
                discapacidad: document.getElementById('m-discapacidad').value,
                emergencia: [
                    {
                        nombre: document.getElementById('m-emer-1-nombre').value,
                        parentesco: document.getElementById('m-emer-1-rel').value,
                        telefono: document.getElementById('m-emer-1-tel').value,
                        direccion: document.getElementById('m-emer-1-dir').value
                    },
                    {
                        nombre: document.getElementById('m-emer-2-nombre').value,
                        parentesco: document.getElementById('m-emer-2-rel').value,
                        telefono: document.getElementById('m-emer-2-tel').value,
                        direccion: document.getElementById('m-emer-2-dir').value
                    }
                ]
            };

            const payload = {
                nombres: document.getElementById('m-nombres').value,
                apellidos: document.getElementById('m-apellidos').value,
                email: document.getElementById('m-email').value,
                rol: document.getElementById('m-rol').value,
                documento: document.getElementById('m-doc').value,
                tipo_documento: document.getElementById('m-tipo-doc').value,
                telefono: document.getElementById('m-telefono').value,
                fecha_nacimiento: document.getElementById('m-nacimiento-text').value,
                metadata: metadataObj,
                activo: document.getElementById('m-activo').checked
            };

            if (!isEdit) {
                payload.username = document.getElementById('m-user').value;
                payload.password = prompt("Asigna una contraseña inicial para el nuevo usuario:", "Academia2024!");
                if (!payload.password) return;
            }

            try {
                if (isEdit) {
                    await API.put(`/admin/users/${user.id}`, payload);
                    Toast.success('Ficha global actualizada correctamente');
                } else {
                    await API.post('/admin/users', payload);
                    Toast.success('Nuevo integrante dado de alta en el sistema');
                }
                document.getElementById('modal-content').className = 'bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all';
                container.classList.add('hidden');
                this.refreshTable();
            } catch (err) {
                Toast.error(err.message);
            }
        };
    },

    async openResetOne(id, username) {
        if (!confirm(`¿Estás seguro de resetear la contraseña de ${username}? Deberá cambiarla en su siguiente inicio.`)) return;

        const newPass = prompt("Ingresa la nueva contraseña temporal (mín 8 chars):", "Academia2026!");
        if (!newPass) return;

        try {
            await API.post('/admin/reset-password-bulk', { userIds: [id], newPassword: newPass });
            Toast.success('Contraseña reseteada con éxito');
        } catch (err) {
            Toast.error(err.message);
        }
    },

    async openBulkReset() {
        const selected = Array.from(document.querySelectorAll('.user-check:checked')).map(c => parseInt(c.value));
        if (selected.length === 0) return;

        const newPass = prompt(`Reset masivo para ${selected.length} usuarios. Nueva contraseña institucional:`, "UniCatolica2026!");
        if (!newPass) return;

        try {
            await API.post('/admin/reset-password-bulk', { userIds: selected, newPassword: newPass });
            Toast.success(`¡Hecho! ${selected.length} contraseñas actualizadas.`);
            this.refreshTable();
            document.getElementById('select-all').checked = false;
            this.updateBulkState();
        } catch (err) {
            Toast.error(err.message);
        }
    }
};
