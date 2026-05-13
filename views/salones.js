Views.salones = {
    salonesData: [],
    cursosActivos: [],
    selectedSede: null,
    selectedBloque: null,
    selectedSalon: null,
    salonOcupacion: [],

    async render() {
        if (this.salonesData.length === 0) {
            await this.loadSalonesData();
        }

        const sedes = this.salonesData;
        const bloques = this.selectedSede ? this.selectedSede.bloques : [];
        const salones = this.selectedBloque ? this.selectedBloque.salones : [];

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
                    <div class="flex flex-col gap-2 min-w-[250px]">
                        <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Seleccionar Sede</label>
                        <div class="relative">
                            <select onchange="Views.salones.selectSede(parseInt(this.value))" class="input-premium w-full py-4 px-6 bg-slate-50 border-slate-200 text-[#032840] font-bold appearance-none cursor-pointer hover:bg-slate-100 transition-all">
                                <option value="">Seleccione una sede...</option>
                                ${sedes.map(s => `
                                    <option value="${s.id}" ${this.selectedSede?.id === s.id ? 'selected' : ''}>${s.nombre}</option>
                                `).join('')}
                            </select>
                            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <i data-lucide="map-pin" class="w-5 h-5 text-[#fab720]"></i>
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
                                        <span class="text-[9px] opacity-60">${b.salones.length} S.</span>
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
                                <div class="md:col-span-2 card-premium p-8 bg-white shadow-xl border-[#032840]/10 ring-1 ring-[#032840]/5">
                                    <div class="mb-6">
                                        <h3 class="text-2xl font-black text-[#032840]">${this.selectedSalon.nombre}</h3>
                                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Programar Nuevo Curso</p>
                                    </div>
                                    
                                    <div class="space-y-4">
                                        <div class="space-y-1.5">
                                            <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Asignatura / NRC</label>
                                            <select id="asig-curso" class="input-premium w-full py-4 text-sm bg-slate-50">
                                                <option value="">Seleccione curso...</option>
                                                ${this.cursosActivos.map(c => `
                                                    <option value="${c.id}">${c.nrc} - ${c.asignatura}</option>
                                                `).join('')}
                                            </select>
                                        </div>
                                        
                                        <div class="space-y-1.5">
                                            <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Franja Horaria</label>
                                            <select id="asig-horario" class="input-premium w-full py-4 text-sm bg-slate-50">
                                                <option value="">Seleccione horario...</option>
                                                ${horas.flatMap(h => dias.map(d => `<option value="${d.substring(0,3)} ${h}">${d.substring(0,3)} ${h}</option>`)).join('')}
                                            </select>
                                        </div>
                                        
                                        <button onclick="Views.salones.assignSalon(document.getElementById('asig-curso').value, ${this.selectedSalon.id}, document.getElementById('asig-horario').value)" class="btn-premium w-full bg-[#032840] text-white py-4 text-xs font-black shadow-lg shadow-[#032840]/20 mt-4">
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
        if (!cursoId || !horario) {
            Toast.warning('Debe seleccionar el curso y el horario');
            return;
        }
        try {
            await API.post('/registro/salones/asignar', { curso_id: cursoId, salon_id: salonId, horario });
            Toast.success('Asignación guardada correctamente');
            await this.loadSalonesData();
            await this.loadSalonOcupacion(salonId);
        } catch (e) {
            Toast.error(e.message || 'Error al asignar salón');
        }
    },

    selectSede(sedeId) {
        if (!sedeId) {
            this.selectedSede = null;
        } else {
            this.selectedSede = this.salonesData.find(s => s.id === sedeId);
        }
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

    afterRender() {
        if (window.lucide) {
            window.lucide.createIcons();
        }
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
