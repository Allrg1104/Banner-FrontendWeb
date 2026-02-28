/**
 * Premium Financial Dashboard - Enterprise Standard
 */

Views.financial = {
    async render() {
        return `
            <div class="space-y-10">
                
                <!-- Financial Summary Hero -->
                <div class="card-premium bg-slate-900 border-none p-10 overflow-hidden relative shadow-2xl">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                        <div class="space-y-6">
                            <div class="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-400/20">
                                <i data-lucide="trending-up" class="w-3 h-3"></i> Recaudación sobre la meta (104%)
                            </div>
                            <h2 class="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">Gestión de <br/><span class="text-indigo-400">Cartera & Facturación</span></h2>
                            <p class="text-slate-400 max-w-lg">Control administrativo de ingresos, pasarelas de pago y estados de morosidad institucional en tiempo real.</p>
                        </div>
                        
                        <!-- High-Level KPIs -->
                        <div class="grid grid-cols-2 gap-6 w-full lg:w-auto">
                            <div class=" glass-dark p-6 rounded-3xl border-indigo-500/20 min-w-[180px]">
                                <div class="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">Ingresos Mes</div>
                                <div class="text-3xl font-black text-white">$1.24B</div>
                                <div class="text-[10px] text-emerald-400 font-bold mt-1">+12.5% vs. anterior</div>
                            </div>
                            <div class="glass-dark p-6 rounded-3xl border-indigo-500/20 min-w-[180px]">
                                <div class="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">Morosidad</div>
                                <div class="text-3xl font-black text-rose-400">3.8%</div>
                                <div class="text-[10px] text-rose-400/50 font-bold mt-1">-0.4% mejorado</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Financial Modules -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    <!-- Retention Control -->
                    <div class="lg:col-span-1 space-y-8">
                        <div class="card-premium bg-white">
                            <h3 class="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <i data-lucide="shield-alert" class="text-indigo-600 w-5 h-5"></i>
                                Control de Retenciones
                            </h3>
                            <div class="space-y-4">
                                ${['Facturas Vencidas', 'Acuerdos de Pago', 'Compensaciones'].map(label => `
                                    <div class="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                                        <span class="text-sm font-bold text-slate-700">${label}</span>
                                        <span class="badge badge-warning">24 Pendientes</span>
                                    </div>
                                `).join('')}
                            </div>
                            <button class="btn-premium btn-primary w-full mt-10">Gestionar Bloqueos SIS</button>
                        </div>
                    </div>

                    <!-- Revenue Graph -->
                    <div class="lg:col-span-2 card-premium">
                        <div class="flex items-center justify-between mb-8">
                            <h3 class="text-xl font-bold text-slate-900">Histórico de Ingresos (6 Meses)</h3>
                            <div class="flex gap-2">
                                <button class="p-2 hover:bg-slate-100 rounded-lg"><i data-lucide="refresh-cw" class="w-4 h-4 text-slate-400"></i></button>
                                <button class="p-2 hover:bg-slate-100 rounded-lg"><i data-lucide="more-vertical" class="w-4 h-4 text-slate-400"></i></button>
                            </div>
                        </div>
                        <div style="height: 300px;">
                            <canvas id="financialChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Invoice Management Table -->
                <div class="card-premium bg-white">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h3 class="text-2xl font-bold text-slate-900">Facturación Reciente</h3>
                            <p class="text-slate-500 text-sm">Listado de las últimas 500 transacciones institucionales.</p>
                        </div>
                        <div class="flex bg-slate-50 p-1 rounded-xl">
                            <button class="px-4 py-2 bg-white shadow-sm rounded-lg text-xs font-black text-indigo-600">Pendientes</button>
                            <button class="px-4 py-2 text-xs font-bold text-slate-400">Todas</button>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead>
                                <tr class="text-xs text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <th class="pb-4 font-black">Estudiante</th>
                                    <th class="pb-4 font-black">Concepto</th>
                                    <th class="pb-4 font-black">Valor</th>
                                    <th class="pb-4 font-black">Vencimiento</th>
                                    <th class="pb-4 font-black text-right">Estado</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm">
                                ${[
                { name: 'Valentina García', ref: 'FACT-0012', amt: '$2.85M', date: '05 Jul 2025', status: 'warning', label: 'Retención' },
                { name: 'Carlos Herrera', ref: 'FACT-0015', amt: '$1.12M', date: 'Vencida', status: 'error', label: 'Vencida' },
                { name: 'Juan Pablo M.', ref: 'FACT-0008', amt: '$2.85M', date: '20 Jul 2025', status: 'success', label: 'Pagada' }
            ].map(row => `
                                    <tr class="group hover:bg-slate-50 transition-colors">
                                        <td class="py-5">
                                            <div class="font-bold text-slate-900">${row.name}</div>
                                            <div class="text-[10px] text-slate-400 font-bold uppercase">${row.ref}</div>
                                        </td>
                                        <td class="py-5 text-slate-600">Matrícula Pregrado</td>
                                        <td class="py-5 font-black text-slate-900">${row.amt}</td>
                                        <td class="py-5 text-slate-500 text-xs">${row.date}</td>
                                        <td class="py-5 text-right"><span class="badge badge-${row.status}">${row.label}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    afterRender() {
        lucide.createIcons();

        const ctx = document.getElementById('financialChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Recaudación (M)',
                    data: [850, 920, 1100, 1050, 1240, 1180],
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#4f46e5',
                    pointBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { border: { display: false }, grid: { color: '#f1f5f9' } },
                    x: { border: { display: false }, grid: { display: false } }
                }
            }
        });
    }
};
