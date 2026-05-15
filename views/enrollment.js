/**
 * View: Enrollment & Schedule
 * Allows students to search and register courses, and see their weekly schedule.
 */

Views['enrollment'] = {
    state: {
        searchResults: [],
        schedule: [],
        isSearching: false
    },

    async render() {
        const user = Auth.getUser();
        
        // Initial schedule load
        try {
            this.state.schedule = await API.get(`/students/${user.id}/schedule`);
        } catch (e) {
            console.error('Error loading schedule', e);
        }

        return `
            <div class="space-y-10 animate-fade-in pb-20">
                <!-- Header Section -->
                <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div class="max-w-2xl">
                        <h2 class="text-4xl font-black text-slate-900 tracking-tight mb-2">Centro de Inscripciones</h2>
                        <p class="text-slate-500 font-medium leading-relaxed">
                            Busca asignaturas por nombre o NRC para agregarlas a tu semestre actual. 
                            El sistema validará automáticamente los cupos disponibles.
                        </p>
                    </div>
                    <div class="flex-shrink-0">
                        <div class="bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-xl shadow-indigo-200 flex items-center gap-3">
                            <i data-lucide="info" class="w-5 h-5 opacity-80"></i>
                            <div>
                                <div class="text-[10px] font-black uppercase tracking-widest opacity-70">Límite Permitido</div>
                                <div class="text-lg font-black">18 Créditos</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Search & Registration Section -->
                <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <!-- Left: Search Engine -->
                    <div class="xl:col-span-4 space-y-6">
                        <div class="card-premium bg-white p-6 sticky top-24 border-none shadow-2xl shadow-slate-200/50">
                            <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Buscador de Asignaturas</h3>
                            
                            <div class="relative group">
                                <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors"></i>
                                <input type="text" id="course-search-input" 
                                    class="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm"
                                    placeholder="Nombre de curso o NRC...">
                            </div>

                            <div id="search-results-container" class="mt-8 space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                <div class="text-center py-10">
                                    <i data-lucide="search-code" class="w-12 h-12 text-slate-200 mx-auto mb-4"></i>
                                    <p class="text-slate-400 text-xs font-bold uppercase tracking-widest leading-loose">Ingresa términos de búsqueda para comenzar</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Weekly Schedule Visualization -->
                    <div class="xl:col-span-8 space-y-6">
                        <div class="card-premium bg-white p-8 border-none shadow-xl shadow-slate-200/50">
                            <div class="flex items-center justify-between mb-8">
                                <h3 class="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <i data-lucide="calendar" class="w-5 h-5"></i>
                                    </div>
                                    Visualización Semanal de Horario
                                </h3>
                                <button class="btn-premium bg-slate-900 text-white text-xs px-6 py-2.5 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-slate-200">
                                    <i data-lucide="download" class="w-4 h-4 mr-2"></i> Descargar Horario
                                </button>
                            </div>

                            <!-- Calendar Container -->
                            <div class="overflow-x-auto rounded-2xl border border-slate-100">
                                <div class="min-w-[800px] bg-white">
                                    <!-- Days Header -->
                                    <div class="grid grid-cols-[80px_repeat(7,1fr)] bg-slate-50 border-b border-slate-100">
                                        <div class="p-4 border-r border-slate-100"></div>
                                        ${['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => `
                                            <div class="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 last:border-none">${day}</div>
                                        `).join('')}
                                    </div>

                                    <!-- Grid with Hours -->
                                    <div class="relative" id="schedule-grid-container">
                                        ${this.renderScheduleGrid()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

                .schedule-cell { height: 60px; border-bottom: 1px dashed #f1f5f9; border-right: 1px solid #f8fafc; }
                .hour-label { height: 60px; border-right: 1px solid #f1f5f9; }
                
                .course-block {
                    position: absolute;
                    left: 2px;
                    right: 2px;
                    padding: 8px;
                    border-radius: 8px;
                    font-size: 9px;
                    font-weight: 800;
                    overflow: hidden;
                    text-transform: uppercase;
                    line-height: 1.2;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    z-index: 10;
                }
                .course-block:hover { transform: scale(1.02); z-index: 20; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
            </style>
        `;
    },

    renderScheduleGrid() {
        const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6:00 to 21:00
        let html = '';

        hours.forEach(hour => {
            html += `
                <div class="grid grid-cols-[80px_repeat(7,1fr)]">
                    <div class="hour-label flex items-center justify-center text-[10px] font-black text-slate-300">
                        ${hour}:00
                    </div>
                    ${Array.from({ length: 7 }).map(() => `<div class="schedule-cell"></div>`).join('')}
                </div>
            `;
        });

        // Overlay of course blocks
        const blocksHtml = this.state.schedule.map((course, idx) => {
            return this.generateCourseBlocks(course, idx);
        }).join('');

        return html + `<div class="absolute inset-0 top-0 left-[80px] pointer-events-none">${blocksHtml}</div>`;
    },

    generateCourseBlocks(course, index) {
        if (!course.horario) return '';
        
        // Example format: "Lun-Mié 08:00-10:00" or "Vie 14:00-18:00"
        const parts = course.horario.split(' ');
        if (parts.length < 2) return '';

        const daysPart = parts[0];
        const timePart = parts[1];

        const [startStr, endStr] = timePart.split('-');
        const startHour = parseInt(startStr.split(':')[0]);
        const startMin = parseInt(startStr.split(':')[1]);
        const endHour = parseInt(endStr.split(':')[0]);
        const endMin = parseInt(endStr.split(':')[1]);

        // Calculate Y position (base hour 6:00)
        const top = ((startHour - 6) * 60) + startMin;
        const height = ((endHour - startHour) * 60) + (endMin - startMin);

        // Day mapping
        const dayMap = { 'Lun': 0, 'Mar': 1, 'Mié': 2, 'Jue': 3, 'Vie': 4, 'Sáb': 5, 'Dom': 6 };
        let targetDays = [];

        if (daysPart.includes('-')) {
            const [startDay, endDay] = daysPart.split('-');
            const startIdx = dayMap[startDay];
            const endIdx = dayMap[endDay];
            for (let i = startIdx; i <= endIdx; i++) targetDays.push(i);
        } else {
            daysPart.split(',').forEach(d => {
                if (dayMap[d.trim()]) targetDays.push(dayMap[d.trim()]);
            });
        }

        const colors = [
            'bg-indigo-500 text-white border-indigo-600',
            'bg-emerald-500 text-white border-emerald-600',
            'bg-amber-500 text-white border-amber-600',
            'bg-rose-500 text-white border-rose-600',
            'bg-violet-500 text-white border-violet-600',
            'bg-cyan-500 text-white border-cyan-600'
        ];
        const colorClass = colors[index % colors.length];

        return targetDays.map(dayIdx => {
            const left = (dayIdx * (100 / 7)) + '%';
            const width = (100 / 7) + '%';
            
            return `
                <div class="course-block ${colorClass} pointer-events-auto" 
                    style="top: ${top}px; height: ${height}px; left: ${left}; width: calc(${width} - 4px); margin-left: 2px;">
                    <div class="truncate">${course.materia}</div>
                    <div class="text-[7px] opacity-80 mt-1">${course.salon || 'Salón por definir'}</div>
                    <div class="text-[7px] opacity-80">${course.nrc}</div>
                </div>
            `;
        }).join('');
    },

    async afterRender() {
        lucide.createIcons();
        const searchInput = document.getElementById('course-search-input');
        const resultsContainer = document.getElementById('search-results-container');

        if (searchInput) {
            let debounceTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(async () => {
                    const query = e.target.value.trim();
                    if (query.length < 2) return;
                    
                    this.state.isSearching = true;
                    resultsContainer.innerHTML = '<div class="text-center py-10"><div class="loader-small mx-auto"></div></div>';
                    
                    try {
                        const results = await API.get(`/students/courses/search?q=${query}`);
                        this.state.searchResults = results;
                        this.renderSearchResults(resultsContainer);
                    } catch (e) {
                        console.error('Search error', e);
                    }
                }, 300);
            });
        }
    },

    renderSearchResults(container) {
        if (this.state.searchResults.length === 0) {
            container.innerHTML = `
                <div class="text-center py-10">
                    <p class="text-slate-400 text-xs font-black uppercase tracking-widest">No se encontraron resultados</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.state.searchResults.map(c => `
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all group shadow-sm hover:shadow-md">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1 pr-4">
                        <h4 class="text-xs font-black text-slate-900 mb-1 truncate">${c.materia}</h4>
                        <div class="flex items-center gap-3">
                            <span class="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">NRC: ${c.nrc}</span>
                            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">${c.creditos} Créditos</span>
                        </div>
                    </div>
                    <button class="enroll-btn btn-premium bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 p-2 rounded-xl transition-all shadow-sm" data-id="${c.curso_id}">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                    </button>
                </div>
                <div class="flex items-center gap-4 text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                    <div class="flex items-center gap-1.5"><i data-lucide="clock" class="w-3 h-3"></i> ${c.horario}</div>
                    <div class="flex items-center gap-1.5"><i data-lucide="map-pin" class="w-3 h-3"></i> ${c.salon || 'Salón Pendiente'}</div>
                </div>
            </div>
        `).join('');

        lucide.createIcons();

        // Add event listeners to enroll buttons
        container.querySelectorAll('.enroll-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const cursoId = btn.getAttribute('data-id');
                const user = Auth.getUser();
                
                try {
                    btn.innerHTML = '<div class="loader-small w-4 h-4"></div>';
                    const response = await API.post(`/students/${user.id}/enroll`, { cursoId });
                    
                    if (response.success) {
                        Toast.success('¡Materia inscrita exitosamente!');
                        await Router.refresh();
                    } else {
                        Toast.error(response.error || 'Error al inscribir');
                        btn.innerHTML = '<i data-lucide="plus" class="w-4 h-4"></i>';
                        lucide.createIcons();
                    }
                } catch (e) {
                    Toast.error(e.error || 'Error de conexión');
                    btn.innerHTML = '<i data-lucide="plus" class="w-4 h-4"></i>';
                    lucide.createIcons();
                }
            });
        });
    }
};
