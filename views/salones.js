Views.salones = {
    sedes: [],
    bloques: [],
    salones: [],
    cursosActivos: [],
    selectedSede: null,
    selectedBloque: null,
    selectedSalon: null,
    salonOcupacion: [],

    async render() {
        if (this.sedes.length === 0) {
            await this.loadSedes();
        }
        if (this.cursosActivos.length === 0) {
            this.cursosActivos = await API.get('/registro/cursos/activos');
        }

        const sedes = this.sedes;
        const bloques = this.bloques;
        const salones = this.salones;

        // Horarios para asignación
        const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const horas = ['7:30 - 9:30', '9:30 - 11:30', '11:30 - 13:30', '14:00 - 16:00', '16:00 - 18:00', '18:30 - 20:30', '19:30 - 21:30'];

        return `
            <div class="space-y-8 animate-fade-in pb-24">
                <!-- Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                    <div>
                        <h2 class="text-4xl font-extrabold text-[#032840] tracking-tight">Sedes y Salones</h2>
                        <p class="text-slate-500 mt-2 italic font-medium">Gestión de la infraestructura física e inventario de espacios.</p>
                    </div>
                    
                    <!-- Sede Selector (Dropdown) -->
                    <div class="flex flex-col gap-2 min-w-[250px]" id="sede-custom-dropdown-container">
                        <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Seleccionar Sede</label>
                        <div class="relative w-full" id="sede-custom-dropdown">
                            <!-- Trigger Button -->
                            <button onclick="Views.salones.toggleSedeDropdown()" id="sede-trigger" class="input-premium w-full py-4 px-6 text-sm bg-slate-50 text-left flex justify-between items-center font-bold text-slate-700 rounded-2xl border border-slate-100 hover:bg-slate-100/50 transition-all">
                                <span id="sede-trigger-text" class="text-[#032840] font-bold">
                                    ${this.selectedSede ? this.selectedSede.nombre : '<span class="text-slate-400 italic">Seleccione una sede...</span>'}
                                </span>
                                <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400"></i>
                            </button>
                            
                            <!-- Dropdown Panel -->
                            <div id="sede-panel" class="absolute right-0 mt-2 bg-white rounded-3xl border border-slate-100 shadow-2xl z-[120] p-4 hidden min-w-[250px] space-y-3 animate-slide-up">
                                <!-- Search Input -->
                                <div class="relative text-slate-800">
                                    <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"></i>
                                    <input type="text" id="sede-search" oninput="Views.salones.filterSedeDropdown(this.value)" placeholder="Buscar sede..." class="input-premium w-full pl-11 py-3 text-xs bg-slate-50 border border-slate-100">
                                </div>
                                
                                <!-- Options Container -->
                                <div class="max-h-60 overflow-y-auto space-y-1.5 custom-scrollbar" id="sede-options">
                                    ${sedes.map(s => `
                                        <div onclick="Views.salones.selectSedeDropdown('${s.id}', '${s.nombre.replace(/'/g, "\\'")}')" 
                                             class="flex items-center justify-between p-3 rounded-2xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all cursor-pointer group">
                                            <div class="text-xs font-black text-slate-800 group-hover:text-indigo-900 line-clamp-1">${s.nombre}</div>
                                            <i data-lucide="map-pin" class="w-3 h-3 text-slate-300 group-hover:text-indigo-500"></i>
                                        </div>
                                    `).join('')}
                                    ${sedes.length === 0 ? `
                                        <div class="text-center py-6 text-slate-400 text-xs italic">No hay sedes creadas</div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <!-- Left Sidebar: Bloques -->
                    <div class="col-span-1 flex flex-col gap-6">
                        <div class="card-premium p-6 bg-white shadow-sm border-slate-200 flex-grow ${!this.selectedSede ? 'opacity-50 pointer-events-none' : ''}">
                            <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                                <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-[#032840]">2. Bloques</h4>
                                <span class="bg-[#fab720]/10 text-[#032840] text-[10px] font-black px-2 py-1 rounded-md">${bloques.length}</span>
                            </div>
                            <div class="flex flex-col gap-2 overflow-y-auto custom-scrollbar max-h-[500px] pr-2">
                                ${bloques.map(b => `
                                    <button onclick="Views.salones.selectBloque(${b.id})" class="group px-4 py-4 rounded-2xl text-xs font-bold transition-all flex justify-between items-center ${this.selectedBloque?.id === b.id ? 'bg-[#032840] text-white shadow-xl translate-x-1' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}">
                                        <div class="flex items-center gap-3">
                                            <div class="w-2 h-2 rounded-full ${this.selectedBloque?.id === b.id ? 'bg-[#fab720]' : 'bg-slate-300 group-hover:bg-[#fab720]'} transition-colors"></div>
                                            <span class="truncate">${b.nombre}</span>
                                        </div>
                                        <span class="text-[9px] opacity-60">${b.total_salones} S.</span>
                                    </button>
                                `).join('')}
                                ${bloques.length === 0 ? '<div class="text-xs text-slate-400 p-8 text-center border border-dashed rounded-3xl">Seleccione una sede para ver los bloques</div>' : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Main Content: Salones Table -->
                    <div class="col-span-1 lg:col-span-3 flex flex-col gap-6">
                        
                        <div class="card-premium p-0 bg-white shadow-sm border-slate-200 overflow-hidden ${!this.selectedBloque ? 'opacity-50 pointer-events-none' : ''}">
                            <div class="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                                <div>
                                    <h4 class="text-sm font-black uppercase tracking-widest text-[#032840]">
                                        3. Salones en ${this.selectedBloque ? this.selectedBloque.nombre : '...'}
                                    </h4>
                                    <p class="text-[10px] text-slate-400 font-bold mt-1">Gestión individual de espacios académicos</p>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                                        <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Libre
                                    </span>
                                    <span class="flex items-center gap-1 text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                                        <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Ocupado
                                    </span>
                                </div>
                            </div>
                            <div class="overflow-x-auto max-h-[450px] overflow-y-auto custom-scrollbar">
                                <table class="w-full text-left">
                                    <thead class="sticky top-0 bg-white shadow-sm z-10">
                                        <tr class="text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                            <th class="px-8 py-5 font-black">Identificador</th>
                                            <th class="px-8 py-5 font-black">Estado / Disponibilidad</th>
                                            <th class="px-8 py-5 font-black">Cursos Activos</th>
                                            <th class="px-8 py-5 text-right font-black">Operación</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-50">
                                        ${salones.map(s => {
                                            const cursosAsignados = this.cursosActivos.filter(c => c.salon_id === s.id);
                                            const isOccupied = cursosAsignados.length > 0;
                                            
                                            return `
                                                <tr class="hover:bg-slate-50/80 transition-colors group ${this.selectedSalon?.id === s.id ? 'bg-[#fab720]/5' : ''}">
                                                    <td class="px-8 py-5">
                                                        <div class="flex items-center gap-4">
                                                            <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#032840] group-hover:bg-[#032840] group-hover:text-white transition-all">
                                                                <i data-lucide="door-open" class="w-5 h-5"></i>
                                                            </div>
                                                            <span class="font-extrabold text-slate-800">${s.nombre}</span>
                                                        </div>
                                                    </td>
                                                    <td class="px-8 py-5">
                                                        ${isOccupied 
                                                            ? '<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black border border-indigo-100 ring-4 ring-indigo-50/50"><div class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div> OCUPADO</div>'
                                                            : '<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-100"><div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> DISPONIBLE</div>'
                                                        }
                                                    </td>
                                                    <td class="px-8 py-5">
                                                        <div class="flex flex-wrap gap-1">
                                                            ${cursosAsignados.map(c => `
                                                                <span class="bg-white border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm text-slate-600">${c.nrc}</span>
                                                            `).join('') || '<span class="text-slate-300 text-[10px] italic">Sin asignación</span>'}
                                                        </div>
                                                    </td>
                                                    <td class="px-8 py-5 text-right">
                                                        <button onclick="Views.salones.selectSalon(${s.id})" class="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${this.selectedSalon?.id === s.id ? 'bg-[#032840] text-white' : 'bg-slate-100 text-slate-600 hover:bg-[#032840] hover:text-white'}">
                                                            Gestionar
                                                        </button>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                        ${salones.length === 0 ? '<tr><td colspan="4" class="px-8 py-20 text-center text-slate-400 text-xs italic">No hay salones disponibles en este bloque</td></tr>' : ''}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Assignment & Detail Panel -->
                        ${this.selectedSalon ? `
                            <div class="grid grid-cols-1 md:grid-cols-5 gap-6 animate-slide-up">
                                <!-- Form -->
                                <div class="md:col-span-2 card-premium p-8 bg-white shadow-xl border-[#032840]/10 ring-1 ring-[#032840]/5" style="overflow: visible !important;">
                                    <div class="mb-6">
                                        <img src="https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=400&h=200" alt="Salón" class="w-full h-32 object-cover rounded-xl mb-4 shadow-sm">
                                        <div class="flex items-center justify-between">
                                            <h3 class="text-2xl font-black text-[#032840]">${this.selectedSalon.nombre}</h3>
                                            <span class="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">${this.selectedSalon.tipo || 'Aula'}</span>
                                        </div>
                                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Detalles del Espacio y Asignación</p>
                                    </div>
                                    
                                    <div class="space-y-4">
                                        <div class="space-y-1.5">
                                            <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Asignatura / NRC</label>
                                            <div class="relative w-full" id="asig-curso-custom-dropdown">
                                                <!-- Trigger Button -->
                                                <button onclick="Views.salones.toggleCustomDropdown()" id="asig-curso-trigger" class="input-premium w-full py-4 px-6 text-sm bg-slate-50 text-left flex justify-between items-center font-bold text-slate-700 rounded-2xl border border-slate-100 hover:bg-slate-100/50 transition-all">
                                                    <span id="asig-curso-trigger-text" class="text-slate-400 italic">Seleccione curso...</span>
                                                    <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400"></i>
                                                </button>
                                                
                                                <!-- Dropdown Panel -->
                                                <div id="asig-curso-panel" class="absolute left-0 right-0 mt-2 bg-white rounded-3xl border border-slate-100 shadow-2xl z-[120] p-4 hidden space-y-3 animate-slide-up">
                                                    <!-- Search Input -->
                                                    <div class="relative">
                                                        <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"></i>
                                                        <input type="text" id="asig-curso-search" oninput="Views.salones.filterCustomDropdown(this.value)" placeholder="Buscar por NRC o Asignatura..." class="input-premium w-full pl-11 py-3 text-xs bg-slate-50 border border-slate-100">
                                                    </div>
                                                    
                                                    <!-- Options Container -->
                                                    <div class="max-h-60 overflow-y-auto space-y-1.5 custom-scrollbar" id="asig-curso-options">
                                                        ${this.cursosActivos.filter(c => !c.salon_id).map(c => `
                                                            <div onclick="Views.salones.selectCustomDropdown('${c.id}', '${c.nrc}', '${c.asignatura.replace(/'/g, "\\'")}', '${c.horario}')" 
                                                                 class="flex items-center justify-between p-3 rounded-2xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all cursor-pointer group">
                                                                <div class="pr-2">
                                                                    <div class="text-xs font-black text-slate-800 group-hover:text-indigo-900 line-clamp-1">${c.asignatura}</div>
                                                                    <div class="text-[9px] font-bold text-slate-400 mt-0.5">${c.horario}</div>
                                                                </div>
                                                                <span class="text-[9px] font-black bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-700 px-2 py-1 rounded-xl uppercase shrink-0">NRC ${c.nrc}</span>
                                                            </div>
                                                        `).join('')}
                                                        ${this.cursosActivos.filter(c => !c.salon_id).length === 0 ? `
                                                            <div class="text-center py-6 text-slate-400 text-xs italic">No hay cursos disponibles para asignar</div>
                                                        ` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- Hidden Input for logic integration -->
                                            <input type="hidden" id="asig-curso" value="">
                                        </div>

                                        <div id="curso-horario-info" class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 hidden">
                                            <label class="text-[8px] font-black text-slate-400 uppercase block">Horario Predefinido del Curso</label>
                                            <div id="curso-horario-val" class="text-xs font-bold text-slate-700"></div>
                                        </div>
                                        
                                        <button onclick="Views.salones.assignSalon(document.getElementById('asig-curso').value, ${this.selectedSalon.id})" class="btn-premium w-full bg-[#032840] text-white py-4 text-xs font-black shadow-lg shadow-[#032840]/20 mt-4">
                                            GUARDAR ASIGNACIÓN
                                            <i data-lucide="save" class="w-4 h-4"></i>
                                        </button>
                                    </div>
                                </div>

                                <!-- Schedule -->
                                <div class="md:col-span-3 card-premium p-8 bg-white border-slate-200">
                                    <div class="flex items-center justify-between mb-6">
                                        <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ocupación Cronológica</h4>
                                        <span class="text-[10px] font-bold text-[#fab720] bg-[#fab720]/10 px-2 py-1 rounded">${this.salonOcupacion.length} Sesiones</span>
                                    </div>
                                    
                                    <div class="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                                        ${this.salonOcupacion.length > 0 ? this.salonOcupacion.map(oc => `
                                            <div class="flex items-center gap-5 p-5 bg-slate-50 border border-slate-100 rounded-3xl group hover:bg-white hover:shadow-md hover:border-[#fab720] transition-all">
                                                <div class="w-16 h-16 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center border border-slate-100 group-hover:bg-[#fab720] transition-colors">
                                                    <span class="text-[10px] font-black text-[#032840]">${oc.horario.split(' ')[0]}</span>
                                                    <span class="text-[9px] font-bold text-slate-400 group-hover:text-[#032840]">${oc.horario.split(' ')[1]}</span>
                                                </div>
                                                <div class="flex-grow">
                                                    <div class="flex items-center justify-between">
                                                        <span class="text-sm font-black text-[#032840]">${oc.asignatura}</span>
                                                        <span class="text-[10px] font-black text-slate-400">NRC ${oc.nrc}</span>
                                                    </div>
                                                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">Docente: ${oc.nombres} ${oc.apellidos}</p>
                                                </div>
                                            </div>
                                        `).join('') : `
                                            <div class="h-[200px] border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center text-slate-300 gap-3">
                                                <i data-lucide="calendar-x" class="w-10 h-10"></i>
                                                <span class="text-xs font-bold italic">No hay clases programadas</span>
                                            </div>
                                        `}
                                    </div>
                                </div>
                            </div>
                        ` : `
                            <div class="card-premium p-12 bg-slate-50 border-dashed border-2 border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-4 opacity-70">
                                <i data-lucide="mouse-pointer-2" class="w-12 h-12"></i>
                                <div class="text-center">
                                    <p class="font-black text-xs uppercase tracking-widest">Selección Requerida</p>
                                    <p class="text-[10px] italic mt-1">Haga clic en 'Gestionar' para ver o editar la ocupación de un salón.</p>
                                </div>
                            </div>
                        `}

                    </div>
                </div>
            </div>
        `;
    },

    async loadSedes() {
        try {
            this.sedes = await API.get('/registro/sedes');
        } catch (e) {
            console.error("Error loading sedes:", e);
        }
    },

    async loadBloques(sedeId) {
        try {
            this.bloques = await API.get('/registro/sedes/'+sedeId+'/bloques');
        } catch (e) {
            console.error("Error loading bloques:", e);
        }
    },

    async loadSalones(bloqueId) {
        try {
            this.salones = await API.get('/registro/bloques/'+bloqueId+'/salones');
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

    async assignSalon(cursoId, salonId) {
        if (!cursoId) {
            Toast.warning('Debe seleccionar el curso');
            return;
        }
        try {
            await API.post('/registro/salones/asignar', { curso_id: cursoId, salon_id: salonId });
            Toast.success('Asignación guardada correctamente');
            this.cursosActivos = await API.get('/registro/cursos/activos');
            await this.loadSalonOcupacion(salonId);
        } catch (e) {
            Toast.error(e.error || e.message || 'Error al asignar salón');
        }
    },

    toggleSedeDropdown() {
        const panel = document.getElementById('sede-panel');
        if (panel) {
            panel.classList.toggle('hidden');
            if (!panel.classList.contains('hidden')) {
                const search = document.getElementById('sede-search');
                if (search) {
                    search.value = '';
                    search.focus();
                    this.filterSedeDropdown('');
                }
            }
        }
    },

    filterSedeDropdown(query) {
        const q = query.toLowerCase();
        const options = document.getElementById('sede-options').children;
        for (const opt of options) {
            const text = opt.innerText.toLowerCase();
            opt.style.display = text.includes(q) ? 'flex' : 'none';
        }
    },

    async selectSedeDropdown(id, name) {
        const triggerText = document.getElementById('sede-trigger-text');
        const panel = document.getElementById('sede-panel');
        if (triggerText && panel) {
            triggerText.innerHTML = `<span class="text-[#032840] font-bold">${name}</span>`;
            panel.classList.add('hidden');
            await this.selectSede(parseInt(id));
        }
    },

    toggleCustomDropdown() {
        const panel = document.getElementById('asig-curso-panel');
        if (panel) {
            panel.classList.toggle('hidden');
            if (!panel.classList.contains('hidden')) {
                const search = document.getElementById('asig-curso-search');
                if (search) {
                    search.value = '';
                    search.focus();
                    this.filterCustomDropdown('');
                }
            }
        }
    },

    filterCustomDropdown(query) {
        const q = query.toLowerCase();
        const options = document.getElementById('asig-curso-options').children;
        for (const opt of options) {
            if (opt.id === 'no-options') continue;
            const text = opt.innerText.toLowerCase();
            if (text.includes(q)) {
                opt.style.display = 'flex';
            } else {
                opt.style.display = 'none';
            }
        }
    },

    selectCustomDropdown(id, nrc, name, horario) {
        const hiddenInput = document.getElementById('asig-curso');
        const triggerText = document.getElementById('asig-curso-trigger-text');
        const panel = document.getElementById('asig-curso-panel');
        
        if (hiddenInput && triggerText && panel) {
            hiddenInput.value = id;
            triggerText.innerHTML = `<span class="font-black text-slate-800">${nrc} - ${name}</span>`;
            panel.classList.add('hidden');
            this.handleCursoChange(id);
        }
    },

    handleCursoChange(cursoId) {
        const infoDiv = document.getElementById('curso-horario-info');
        const valSpan = document.getElementById('curso-horario-val');
        if (!cursoId) {
            if (infoDiv) infoDiv.classList.add('hidden');
            return;
        }
        const curso = this.cursosActivos.find(c => c.id == cursoId);
        if (curso && infoDiv && valSpan) {
            valSpan.innerText = curso.horario;
            infoDiv.classList.remove('hidden');
        } else if (infoDiv) {
            infoDiv.classList.add('hidden');
        }
    },

    async selectSede(sedeId) {
        if (!sedeId) {
            this.selectedSede = null;
            this.bloques = [];
        } else {
            this.selectedSede = this.sedes.find(s => s.id === sedeId);
            await this.loadBloques(sedeId);
        }
        this.selectedBloque = null;
        this.salones = [];
        this.selectedSalon = null;
        this.salonOcupacion = [];
        this.reRender();
    },

    async selectBloque(bloqueId) {
        if (!this.selectedSede) return;
        this.selectedBloque = this.bloques.find(b => b.id === bloqueId);
        await this.loadSalones(bloqueId);
        this.selectedSalon = null;
        this.salonOcupacion = [];
        this.reRender();
    },

    selectSalon(salonId) {
        if (!this.selectedBloque) return;
        this.selectedSalon = this.salones.find(s => s.id === salonId);
        this.loadSalonOcupacion(salonId);
    },

    afterRender() {
        if (window.lucide) {
            window.lucide.createIcons();
        }
        // Click outside handler for custom dropdowns
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('asig-curso-custom-dropdown');
            if (dropdown && !dropdown.contains(e.target)) {
                const panel = document.getElementById('asig-curso-panel');
                if (panel) panel.classList.add('hidden');
            }
            const SedeDropdown = document.getElementById('sede-custom-dropdown-container');
            if (SedeDropdown && !SedeDropdown.contains(e.target)) {
                const panel = document.getElementById('sede-panel');
                if (panel) panel.classList.add('hidden');
            }
        });
    },

    async reRender() {
        const content = await this.render();
        const mount = document.getElementById('view-mount');
        if (mount) {
            mount.innerHTML = content;
            this.afterRender();
        }
    }
};
