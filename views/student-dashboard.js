/**
 * Student Dashboard View - Analytical Intelligence
 * Visualizes academic progress and trends using Chart.js
 */

Views['student-dashboard'] = {
    state: { periodId: null },
    charts: {},

    async render() {
        const user = Auth.getUser();
        let studentData, periods;
        
        // Use the selected period or the default active one
        const selectedPeriodId = this.state.periodId || '';

        try {
            // Pre-fetch data for the initial render
            const [data, per] = await Promise.all([
                API.get(`/students/${user.id}/dashboard?periodoId=${selectedPeriodId}`),
                API.get('/students/periodos')
            ]);
            studentData = data;
            periods = per;
        } catch (e) {
            console.error('Initial load error', e);
        }

        const activePeriod = periods?.find(p => selectedPeriodId ? p.id == selectedPeriodId : p.activo === 1) || periods?.[0] || { nombre: 'Cargando...' };

        return `
            <div class="space-y-8 animate-fade-in">
                <!-- Dashboard Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Panel Académico Dinámico (v16)</h2>
                        <p class="text-slate-500 font-medium">Visualiza tu rendimiento y evolución histórica</p>
                    </div>
                    <div class="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                        <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Periodo Lectivo:</span>
                        <select id="dashboard-periodo-selector" class="bg-slate-50 border-none text-xs font-bold text-indigo-600 focus:ring-0 cursor-pointer rounded-xl py-2 px-4">
                            ${periods?.map(p => `<option value="${p.id}" ${p.id == activePeriod.id ? 'selected' : ''}>${p.nombre} ${p.activo ? '(Actual)' : ''}</option>`).join('') || ''}
                        </select>
                    </div>
                </div>

                <!-- KPI Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="card-premium bg-white border-l-4 border-indigo-600">
                        <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Promedio Periodo</div>
                        <div id="kpi-promedio" class="text-3xl font-black text-slate-900">${studentData?.resumen?.promedio_periodo?.toFixed(2) || '0.00'}</div>
                        <div class="flex items-center gap-1 text-[10px] text-indigo-500 font-bold mt-2">
                            <i data-lucide="award" class="w-3 h-3"></i> Rendimiento Actual
                        </div>
                    </div>
                    <div class="card-premium bg-white border-l-4 border-[#fab720]">
                        <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Créditos Inscritos</div>
                        <div class="text-3xl font-black text-slate-900">${studentData?.matriculas?.length * 3 || 0} / 18</div>
                        <div class="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                            <div class="h-full bg-[#fab720]" style="width: ${(studentData?.matriculas?.length / 6) * 100}%"></div>
                        </div>
                    </div>
                    <div class="card-premium bg-white border-l-4 border-indigo-400">
                        <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Semestre Actual</div>
                        <div class="text-3xl font-black text-slate-900">${studentData?.resumen?.semestre_actual || '1'}°</div>
                        <div class="text-[10px] text-indigo-400 font-bold mt-2">Nivel de formación</div>
                    </div>
                    <div class="card-premium bg-slate-900 text-white border-none">
                        <div class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Estatus Académico</div>
                        <div class="text-2xl font-black text-[#fab720]">${(studentData?.resumen?.promedio_periodo >= 4.0) ? 'SOBRESALIENTE' : 'ACTIVO'}</div>
                        <div class="text-[10px] text-slate-400 font-bold mt-2">Periodo ${activePeriod.nombre}</div>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="card-premium bg-white">
                        <h3 class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <i data-lucide="line-chart" class="text-indigo-600 w-5 h-5"></i>
                            Evolución de Promedio
                        </h3>
                        <div class="h-[300px]">
                            <canvas id="progressChart"></canvas>
                        </div>
                    </div>

                    <div class="card-premium bg-white">
                        <h3 class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <i data-lucide="bar-chart-2" class="text-[#fab720] w-5 h-5"></i>
                            Asistencia por Materia
                        </h3>
                        <div class="h-[300px]">
                            <canvas id="attendanceChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    async afterRender() {
        lucide.createIcons();
        const user = Auth.getUser();
        
        // Listener for period changes
        const selector = document.getElementById('dashboard-periodo-selector');
        if (selector) {
            selector.addEventListener('change', async (e) => {
                this.state.periodId = e.target.value;
                // Refresh only the current view components
                await Router.refresh(); 
            });
        }

        // Fetch current data and update charts
        const selectedPeriodId = this.state.periodId || '';
        try {
            const studentData = await API.get(`/students/${user.id}/dashboard?periodoId=${selectedPeriodId}`);
            this.initCharts(studentData);
        } catch (e) {
            console.error('Error loading charts data', e);
        }
    },

    initCharts(data) {
        // Destroy existing charts
        if (this.charts.progress) this.charts.progress.destroy();
        if (this.charts.attendance) this.charts.attendance.destroy();

        const matriculas = data?.matriculas || [];
        const labels = matriculas.length > 0 ? matriculas.map(m => m.materia) : ['Sin datos'];
        const gpas = matriculas.length > 0 ? matriculas.map(m => m.promedio || 0) : [0];
        const attendance = matriculas.length > 0 ? matriculas.map(m => m.asistencia?.porcentaje || 0) : [0];

        // Progress Chart
        const ctxProgress = document.getElementById('progressChart').getContext('2d');
        this.charts.progress = new Chart(ctxProgress, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Promedio',
                    data: gpas,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 4,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#4f46e5'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { min: 0, max: 5, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
            }
        });

        // Attendance Chart
        const ctxAttendance = document.getElementById('attendanceChart').getContext('2d');
        this.charts.attendance = new Chart(ctxAttendance, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Asistencia %',
                    data: attendance,
                    backgroundColor: '#fab720',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { min: 0, max: 100, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
};
