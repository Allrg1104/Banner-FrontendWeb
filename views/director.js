/**
 * Premium Director Dashboard - Enterprise Executive Standard
 */

Views.director = {
  async render() {
    return Layout.shell(`
            <div class="space-y-10">
                
                <!-- Executive Hero -->
                <section class="relative overflow-hidden rounded-[40px] bg-slate-900 p-12 text-white shadow-3xl">
                    <div class="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent"></div>
                    <div class="relative z-10">
                        <div class="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-400/20">
                            <i data-lucide="shield-check" class="w-3 h-3"></i> Reporte Consolidado Académico
                        </div>
                        <h2 class="text-5xl font-black mb-6 tracking-tight leading-tight">Métricas <br/> <span class="text-indigo-400">Estratégicas</span> SIS.</h2>
                        <p class="text-slate-400 text-lg max-w-2xl">
                            Visualización de KPIs institucionales, tendencia de retención y análisis de desempeño por facultad en tiempo real.
                        </p>
                    </div>
                </section>

                <!-- Strategic KPIs Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    ${[
        { label: 'Matrículas Totales', val: '12,482', up: '2.4%', color: 'indigo' },
        { label: 'Tasa Retención', val: '86.4%', up: '0.8%', color: 'emerald' },
        { label: 'Eficacia Notas', val: '3.42', up: '1.2%', color: 'blue' },
        { label: 'Riesgo Crítico', val: '4.2%', down: '0.5%', color: 'rose' }
      ].map(kpi => `
                        <div class="card-premium">
                            <div class="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">${kpi.label}</div>
                            <div class="text-4xl font-black text-slate-900 mb-4">${kpi.val}</div>
                            <div class="flex items-center gap-2">
                                ${kpi.up ? `
                                    <span class="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        <i data-lucide="trending-up" class="w-3 h-3"></i> ${kpi.up}
                                    </span>
                                ` : ''}
                                ${kpi.down ? `
                                    <span class="flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                                        <i data-lucide="trending-down" class="w-3 h-3"></i> ${kpi.down}
                                    </span>
                                ` : ''}
                                <span class="text-[10px] text-slate-400 font-bold uppercase">vs. 2024-II</span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Main Charts Section -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    <!-- Performance Chart -->
                    <div class="lg:col-span-2 card-premium">
                        <div class="flex items-center justify-between mb-8">
                            <h3 class="text-2xl font-bold text-slate-900">Rendimiento por Programa</h3>
                            <select class="bg-slate-50 border-none text-xs font-bold text-slate-500 rounded-lg px-3 py-2 outline-none">
                                <option>Todo el Periodo</option>
                                <option>Último Mes</option>
                            </select>
                        </div>
                        <div style="height: 350px;">
                            <canvas id="directorChart"></canvas>
                        </div>
                    </div>

                    <!-- Side Analytics -->
                    <div class="lg:col-span-1 space-y-8">
                        <div class="card-premium bg-white">
                            <h3 class="text-lg font-bold mb-6">Estado de Alertas</h3>
                            <div class="space-y-6">
                                ${[
        { label: 'Sin Riesgo', pct: 72, color: 'bg-emerald-500' },
        { label: 'Riesgo Medio', pct: 18, color: 'bg-orange-500' },
        { label: 'Riesgo Crítico', pct: 10, color: 'bg-rose-500' }
      ].map(alert => `
                                    <div>
                                        <div class="flex justify-between text-xs font-bold mb-2">
                                            <span class="text-slate-600">${alert.label}</span>
                                            <span class="text-slate-900">${alert.pct}%</span>
                                        </div>
                                        <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div class="h-full ${alert.color} rounded-full" style="width: ${alert.pct}%"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <button class="btn-premium btn-ghost w-full mt-10 py-3">Ver Listado Completo</button>
                        </div>
                    </div>
                </div>
            </div>
        `);
  },

  afterRender() {
    lucide.createIcons();

    const ctx = document.getElementById('directorChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Ing. Sistemas', 'Administración', 'Contaduría', 'Derecho', 'Psicología', 'Medicina'],
        datasets: [{
          label: 'Promedio General',
          data: [4.1, 3.8, 3.5, 3.2, 4.0, 4.3],
          backgroundColor: 'rgba(79, 70, 229, 0.8)',
          borderRadius: 12,
          borderSkipped: false,
          barThickness: 32
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, max: 5, border: { display: false }, grid: { color: '#f1f5f9' } },
          x: { border: { display: false }, grid: { display: false } }
        }
      }
    });
  }
};
