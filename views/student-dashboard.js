/**
 * Student Dashboard View - Analytical Intelligence
 * Visualizes academic progress and trends using Chart.js
 */

Views['student-dashboard'] = {
    async render() {
        const user = Auth.getUser();

        return `
            <div class="space-y-8 animate-fade-in">
                <!-- Dashboard Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Panel de Control Académico</h2>
                        <p class="text-slate-500 font-medium">Visualiza tu rendimiento y evolución histórica</p>
                    </div>
                    <div class="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                        <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Periodo Lectivo:</span>
                        <select id="periodo-selector" class="bg-slate-50 border-none text-xs font-bold text-indigo-600 focus:ring-0 cursor-pointer rounded-xl py-2 px-4">
                            <option value="2025-2">2025 - II (Actual)</option>
                            <option value="2025-1">2025 - I</option>
                            <option value="2024-2">2024 - II</option>
                        </select>
                    </div>
                </div>

                <!-- KPI Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="card-premium bg-white border-l-4 border-indigo-600">
                        <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Promedio Acumulado</div>
                        <div class="text-3xl font-black text-slate-900">4.12</div>
                        <div class="flex items-center gap-1 text-[10px] text-emerald-500 font-bold mt-2">
                            <i data-lucide="trending-up" class="w-3 h-3"></i> +0.15 vs semestre anterior
                        </div>
                    </div>
                    <div class="card-premium bg-white border-l-4 border-[#fab720]">
                        <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Créditos Aprobados</div>
                        <div class="text-3xl font-black text-slate-900">84 / 160</div>
                        <div class="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                            <div class="h-full bg-[#fab720]" style="width: 52.5%"></div>
                        </div>
                    </div>
                    <div class="card-premium bg-white border-l-4 border-indigo-400">
                        <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Puesto en Cohorte</div>
                        <div class="text-3xl font-black text-slate-900">12 / 145</div>
                        <div class="text-[10px] text-indigo-400 font-bold mt-2">Top 10% del programa</div>
                    </div>
                    <div class="card-premium bg-slate-900 text-white border-none">
                        <div class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Estatus Académico</div>
                        <div class="text-2xl font-black text-[#fab720]">SOBRESALIENTE</div>
                        <div class="text-[10px] text-slate-400 font-bold mt-2">Próxima matrícula: 15 Jun</div>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Progress Chart -->
                    <div class="card-premium bg-white">
                        <h3 class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <i data-lucide="line-chart" class="text-indigo-600 w-5 h-5"></i>
                            Evolución de Promedio
                        </h3>
                        <div class="h-[300px] flex items-center justify-center">
                            <canvas id="progressChart"></canvas>
                        </div>
                    </div>

                    <!-- Attendance Chart -->
                    <div class="card-premium bg-white">
                        <h3 class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <i data-lucide="bar-chart-2" class="text-[#fab720] w-5 h-5"></i>
                            Asistencia por Semestre
                        </h3>
                        <div class="h-[300px] flex items-center justify-center">
                            <canvas id="attendanceChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Predictive Action -->
                <div class="bg-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                    <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div class="max-w-xl text-center md:text-left">
                            <h4 class="text-2xl font-black mb-2">Simulación de Graduación</h4>
                            <p class="text-indigo-100 text-sm">Nuestro modelo de IA proyecta que manteniendo tu ritmo actual, te graduarás en el periodo 2027-I con mención de honor.</p>
                        </div>
                        <button class="btn-premium bg-white text-indigo-600 hover:bg-slate-100 px-8 py-4 whitespace-nowrap">
                            Ver Plan de Carrera
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    afterRender() {
        lucide.createIcons();
        this.initCharts();
    },

    initCharts() {
        // Performance Progress Chart
        const ctxProgress = document.getElementById('progressChart').getContext('2d');
        new Chart(ctxProgress, {
            type: 'line',
            data: {
                labels: ['2023-1', '2023-2', '2024-1', '2024-2', '2025-1', '2025-2'],
                datasets: [{
                    label: 'Promedio Semestral',
                    data: [3.2, 3.5, 3.4, 3.9, 4.0, 4.12],
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 4,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#4f46e5',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { min: 0, max: 5, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
            }
        });

        // Attendance Bar Chart
        const ctxAttendance = document.getElementById('attendanceChart').getContext('2d');
        new Chart(ctxAttendance, {
            type: 'bar',
            data: {
                labels: ['2023-1', '2023-2', '2024-1', '2024-2', '2025-1', '2025-2'],
                datasets: [{
                    label: 'Asistencia %',
                    data: [82, 88, 85, 92, 95, 94],
                    backgroundColor: '#fab720',
                    borderRadius: 8,
                    barThickness: 24
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { min: 0, max: 100, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
};
