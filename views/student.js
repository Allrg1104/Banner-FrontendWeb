/**
 * Premium Student Dashboard - Enterprise Architect Edition
 * High-end analytics, risk feedback, and modern card grid
 */

Views.student = {
    async render() {
        const user = Auth.getUser();
        let studentData, riskData;

        try {
            studentData = await API.get(`/students/${user.id}/dashboard`);
            // We'll also fetch comprehensive risk info for each course
            riskData = await API.get(`/risk/${user.id}`);
        } catch (e) {
            Toast.error('No se pudo cargar la información académica');
        }

        const riskColor = (score) => {
            if (score > 80) return 'text-red-600 bg-red-50 border-red-200';
            if (score > 50) return 'text-orange-600 bg-orange-50 border-orange-200';
            return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        };

        const riskGlow = (score) => {
            if (score > 80) return 'shadow-[0_0_20px_rgba(239,68,68,0.2)]';
            if (score > 50) return 'shadow-[0_0_20px_rgba(245,158,11,0.2)]';
            return 'shadow-[0_0_20px_rgba(16,185,129,0.2)]';
        };

        return `
            <div class="space-y-10">
                
                <!-- Welcome Hero: High-End Header -->
                <div class="relative overflow-hidden rounded-[32px] bg-slate-900 p-8 lg:p-12 text-white shadow-2xl">
                    <div class="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-indigo-600/20 to-transparent"></div>
                    <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div>
                            <div class="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-400/20">
                                <i data-lucide="award" class="w-3 h-3"></i> Periodo 2025-II Activo
                            </div>
                            <h2 class="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">Hola, ${(user.nombres || 'Estudiante').split(' ')[0]} 👋</h2>
                            <p class="text-slate-400 text-lg max-w-xl">
                                Tu rendimiento este semestre es <span class="text-indigo-400 font-bold">Sobresaliente</span>. 
                                Has cumplido con el 92% de las actividades propuestas.
                            </p>
                        </div>
                        <div class="flex gap-4">
                            <div class="glass-dark p-6 rounded-3xl border-indigo-500/30 w-32 text-center">
                                <div class="text-3xl font-black text-white">3.8</div>
                                <div class="text-[10px] text-slate-400 uppercase tracking-widest">Promedio</div>
                            </div>
                            <div class="glass-dark p-6 rounded-3xl border-indigo-500/30 w-32 text-center">
                                <div class="text-3xl font-black text-indigo-400">5°</div>
                                <div class="text-[10px] text-slate-400 uppercase tracking-widest">Semestre</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Academic Risk Summary: The "Brain" of the SIS -->
                <section>
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h3 class="text-2xl font-bold text-slate-900">Análisis Predictivo</h3>
                            <p class="text-slate-500 text-sm">Probabilidad de éxito basada en asistencia y parciales</p>
                        </div>
                        <button onclick="Views.student.openSim()" class="btn-premium btn-primary py-2 px-6">
                            <i data-lucide="cpu" class="w-4 h-4"></i>
                            Simulador IA
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${(studentData?.matriculas || []).map(m => `
                            <div class="group card-premium ${riskGlow(m.risk?.score || 10)} bg-white">
                                <div class="flex justify-between items-start mb-6">
                                    <div class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        <i data-lucide="book-open" class="w-6 h-6"></i>
                                    </div>
                                    <div class="px-3 py-1 rounded-lg border font-bold text-[10px] uppercase tracking-tighter ${riskColor(m.risk?.score || 10)}">
                                         Riesgo: ${m.risk?.score || 10}%
                                    </div>
                                </div>
                                <h4 class="text-xl font-bold text-slate-900 mb-1 truncate">${m.materia}</h4>
                                <p class="text-slate-400 text-xs mb-6">${m.docente}</p>
                                
                                <div class="space-y-4">
                                    <div>
                                        <div class="flex justify-between text-xs font-bold mb-2">
                                            <span class="text-slate-500">Progreso Académico</span>
                                            <span class="text-slate-900">${m.promedio.toFixed(1)} / 5.0</span>
                                        </div>
                                        <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div class="h-full bg-indigo-600 rounded-full transition-all duration-1000" style="width: ${(m.promedio / 5) * 100}%"></div>
                                        </div>
                                    </div>
                                    
                                        <div class="flex items-center justify-between pt-4 border-t border-slate-50">
                                            <div class="flex items-center gap-2 text-xs">
                                                <i data-lucide="calendar" class="w-3 h-3 text-slate-400"></i>
                                                <span class="text-slate-500">Asistencia:</span>
                                                <span class="font-bold text-slate-700">${m.asistencia.porcentaje}%</span>
                                            </div>
                                            <button onclick="Views.student.openDetails('${m.materia}')" class="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800">Ver Detalles</button>
                                        </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>

                <!-- Activity & Finance Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    <!-- Finance Card: Dark Mode Premium -->
                    <div class="lg:col-span-1 rounded-[32px] bg-slate-900 p-8 text-white relative overflow-hidden shadow-xl">
                        <div class="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12"></div>
                        <h3 class="text-xl font-bold mb-8 flex items-center gap-3">
                            <i data-lucide="wallet" class="text-indigo-400 w-6 h-6"></i>
                             Estado Financiero
                        </h3>
                        
                        <div class="space-y-6">
                            <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <div class="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Total a Pagar</div>
                                <div class="text-3xl font-black text-white">$2.850.000</div>
                                <div class="text-[10px] text-emerald-400 font-bold mt-2 flex items-center gap-1">
                                    <i data-lucide="check-circle" class="w-3 h-3"></i> Sin moras pendientes
                                </div>
                            </div>
                            
                            <button onclick="Views.student.showHighFidInvoice()" class="btn-premium w-full bg-white text-slate-900 hover:bg-slate-100 py-3">
                                Descargar Factura
                            </button>
                        </div>
                    </div>

                    <!-- Recent Activity: Clean Table -->
                    <div class="lg:col-span-2 card-premium bg-white">
                        <h3 class="text-xl font-bold mb-6 flex items-center gap-3">
                            <i data-lucide="history" class="text-indigo-600 w-6 h-6"></i>
                             Última Actividad
                        </h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead>
                                    <tr class="text-xs text-slate-400 uppercase tracking-widest border-bottom border-slate-100">
                                        <th class="pb-4 font-black">Actividad</th>
                                        <th class="pb-4 font-black text-center">Fecha</th>
                                        <th class="pb-4 font-black text-right">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody class="text-sm">
                                    <tr class="group hover:bg-slate-50 transition-colors">
                                        <td class="py-4 font-bold text-slate-700">Calificación: Parcial 2 - Cálculo</td>
                                        <td class="py-4 text-center text-slate-400">Hoy, 10:30 AM</td>
                                        <td class="py-4 text-right font-black text-indigo-600">4.1 / 5.0</td>
                                    </tr>
                                    <tr class="group hover:bg-slate-50 transition-colors">
                                        <td class="py-4 font-bold text-slate-700">Asistencia: Fundamentos Prog</td>
                                        <td class="py-4 text-center text-slate-400">Ayer, 08:00 AM</td>
                                        <td class="py-4 text-right"><span class="badge badge-success">Presente</span></td>
                                    </tr>
                                    <tr class="group hover:bg-slate-50 transition-colors">
                                        <td class="py-4 font-bold text-slate-700">Solicitud: Certificado Notas</td>
                                        <td class="py-4 text-center text-slate-400">24 Feb, 2026</td>
                                        <td class="py-4 text-right"><span class="badge badge-warning">Procesando</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    afterRender() {
        lucide.createIcons();
    },

    openSim() {
        const modal = document.getElementById('modal-container');
        const content = document.getElementById('modal-content');

        content.innerHTML = `
            <div class="p-8">
                <div class="flex justify-between items-start mb-8">
                    <div>
                        <h3 class="text-2xl font-bold text-slate-900">Simulador de Riesgo IA</h3>
                        <p class="text-slate-500 text-sm">Proyecta tu nota final basado en escenarios</p>
                    </div>
                    <button onclick="Views.student.closeModal()" class="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <i data-lucide="x" class="w-6 h-6 text-slate-400"></i>
                    </button>
                </div>

                <form id="sim-form" class="space-y-6">
                    <div class="input-group">
                        <label class="label-premium">Nota Esperada en el Final</label>
                        <input type="number" id="sim-nota" step="0.1" min="0" max="5" class="input-premium" placeholder="ej: 4.5" required>
                    </div>
                    <div class="input-group">
                        <label class="label-premium">Compromiso de Asistencia (%)</label>
                        <input type="range" id="sim-asis" min="0" max="100" value="90" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600">
                        <div class="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                            <span>0%</span>
                            <span id="asis-val" class="text-indigo-600">90%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    <button type="submit" class="btn-premium btn-primary w-full py-4 mt-4">
                        Calcular Proyección
                    </button>
                </form>

                <div id="sim-result" class="mt-8 hidden animate-fade-in">
                    <div class="p-6 rounded-3xl bg-indigo-50 border border-indigo-100">
                        <div class="text-center mb-4">
                            <div class="text-4xl font-black text-indigo-600" id="res-nota">--</div>
                            <div class="text-xs uppercase tracking-widest font-bold text-indigo-400">Nota Final Proyectada</div>
                        </div>
                        <p class="text-slate-600 text-sm text-center italic" id="res-msg"></p>
                    </div>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        lucide.createIcons();

        // Handle Form
        document.getElementById('sim-asis').addEventListener('input', (e) => {
            document.getElementById('asis-val').innerText = e.target.value + '%';
        });

        document.getElementById('sim-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            btn.disabled = true;
            btn.innerText = 'Calculando...';

            // Simulate API logic locally for instant feedback
            const nota = parseFloat(document.getElementById('sim-nota').value);
            const asis = parseInt(document.getElementById('sim-asis').value);

            setTimeout(() => {
                const resDiv = document.getElementById('sim-result');
                const proy = (3.2 * 0.7 + nota * 0.3).toFixed(2); // Mock logic

                document.getElementById('res-nota').innerText = proy;
                document.getElementById('res-msg').innerText = proy >= 3.0
                    ? "¡Excelente! Con este escenario lograrías aprobar la materia con éxito."
                    : "Atención: Aún con este esfuerzo el promedio es insuficiente. Considera tutoría.";

                resDiv.classList.remove('hidden');
                btn.disabled = false;
                btn.innerText = 'Recalcular Proyección';
            }, 800);
        });
    },

    closeModal() {
        document.getElementById('modal-container').classList.add('hidden');
    },

    openDetails(materia) {
        const modal = document.getElementById('modal-container');
        const content = document.getElementById('modal-content');

        content.innerHTML = `
            <div class="p-10">
                <div class="flex justify-between items-start mb-10">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 rounded-[20px] bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                            <i data-lucide="book-open" class="w-7 h-7"></i>
                        </div>
                        <div>
                            <h3 class="text-2xl font-black text-slate-900 tracking-tight">${materia}</h3>
                            <p class="text-slate-400 text-sm font-bold uppercase tracking-widest">Seguimiento Académico Detallado</p>
                        </div>
                    </div>
                    <button onclick="Views.student.closeModal()" class="p-3 hover:bg-slate-100 rounded-full transition-all group">
                        <i data-lucide="x" class="w-6 h-6 text-slate-300 group-hover:text-slate-900"></i>
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="space-y-8">
                        <div class="card-premium bg-slate-50 border-none shadow-none p-6">
                            <h4 class="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Distribución de Notas</h4>
                            <div class="space-y-6">
                                ${[
                { label: 'Corte 1 (30%)', val: 3.8, status: 'Completed' },
                { label: 'Corte 2 (30%)', val: 4.2, status: 'Completed' },
                { label: 'Corte 3 (40%)', val: '--', status: 'Pending' }
            ].map(n => `
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <div class="text-sm font-bold text-slate-900">${n.label}</div>
                                            <div class="text-[10px] ${n.status === 'Pending' ? 'text-amber-500' : 'text-emerald-500'} font-black uppercase tracking-tighter">${n.status}</div>
                                        </div>
                                        <div class="text-xl font-black ${n.val === '--' ? 'text-slate-300' : 'text-indigo-600'}">${n.val}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="space-y-8">
                        <div class="card-premium bg-slate-900 text-white border-none shadow-xl p-6">
                            <h4 class="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Asistencia & Participación</h4>
                            <div class="flex items-end gap-3 mb-4">
                                <div class="text-4xl font-black">94%</div>
                                <div class="text-xs text-emerald-400 font-bold mb-1 flex items-center gap-1">
                                    <i data-lucide="trending-up" class="w-3 h-3"></i> Excelente
                                </div>
                            </div>
                            <p class="text-slate-400 text-xs leading-relaxed">Has asistido a 14 de 15 sesiones programadas. Tu participación activa es un factor clave en tu rendimiento proyectado.</p>
                        </div>
                    </div>
                </div>

                <div class="mt-10 flex gap-4">
                    <button class="btn-premium btn-primary flex-1 py-4">Ver Programa del Curso</button>
                    <button class="btn-premium btn-ghost flex-1 py-4">Contactar Docente</button>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        lucide.createIcons();
    },

    showHighFidInvoice() {
        const user = Auth.getUser();
        const modal = document.getElementById('modal-container');
        const content = document.getElementById('modal-content');

        // High Fidelity Unicatólica Invoice Template
        content.innerHTML = `
            <div class="bg-white p-0 overflow-hidden rounded-[24px] max-w-4xl mx-auto shadow-2xl">
                <!-- Invoice Toolbar -->
                <div class="bg-slate-100 p-4 border-b flex justify-between items-center no-print">
                    <div class="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                        <i data-lucide="file-text" class="w-4 h-4"></i> Vista Previa de Factura
                    </div>
                    <div class="flex gap-2">
                        <button onclick="window.print()" class="btn-premium btn-primary py-1.5 px-4 text-xs font-black">
                            <i data-lucide="printer" class="w-3 h-3"></i> Imprimir
                        </button>
                        <button onclick="Views.student.closeModal()" class="btn-premium btn-ghost py-1.5 px-4 text-xs font-black">
                            Cerrar
                        </button>
                    </div>
                </div>

                <!-- Real Invoice Content -->
                <div class="p-10 font-sans text-[11px] leading-tight text-slate-900 border-[1px] border-slate-200">
                    <!-- Header -->
                    <div class="flex justify-between items-start mb-8 gap-8">
                        <div class="w-1/3">
                            <div class="flex items-center gap-2 mb-2">
                                <div class="w-8 h-8 bg-[#032840] flex items-center justify-center p-1">
                                    <i data-lucide="graduation-cap" class="text-white w-6 h-6"></i>
                                </div>
                                <div class="leading-none">
                                    <div class="font-black text-[#032840] text-sm">UNICATÓLICA</div>
                                    <div class="text-[6px] text-slate-400 font-bold">LUMEN GENTIUM • SNIES 2731</div>
                                </div>
                            </div>
                        </div>
                        <div class="w-1/3 text-center">
                            <div class="font-bold">NIT: 800.185.664-6</div>
                            <div class="uppercase">SEDE: SEDE PANCE</div>
                        </div>
                        <div class="w-1/3 text-right">
                            <div class="font-black text-xs uppercase">Orden de Pago Matricula No. 21053243</div>
                            <div class="font-bold text-slate-500 mt-1 uppercase">Pregrado - Ingeniería de Sistemas</div>
                        </div>
                    </div>

                    <!-- Personal Data Table -->
                    <div class="grid grid-cols-6 border-[1px] border-slate-900 mb-6 font-mono">
                        <div class="col-span-1 p-2 border-r border-slate-900 bg-slate-50 font-bold uppercase">Año</div>
                        <div class="col-span-1 p-2 border-r border-slate-900 bg-slate-50 font-bold uppercase">Mes</div>
                        <div class="col-span-1 p-2 border-r border-slate-900 bg-slate-50 font-bold uppercase">Día</div>
                        <div class="col-span-1 p-2 border-r border-slate-900 bg-slate-50 font-bold uppercase">Periodo</div>
                        <div class="col-span-2 p-2 bg-slate-50 font-bold uppercase">Estudiante ID / CC</div>
                        
                        <div class="col-span-1 p-2 border-t border-r border-slate-900">2026</div>
                        <div class="col-span-1 p-2 border-t border-r border-slate-900">12</div>
                        <div class="col-span-1 p-2 border-t border-r border-slate-900">19</div>
                        <div class="col-span-1 p-2 border-t border-r border-slate-900">202610</div>
                        <div class="col-span-2 p-2 border-t border-slate-900 font-bold">000405330 - CC ${user.id || '1112038873'}</div>

                        <div class="col-span-4 p-2 border-t border-r border-slate-900">
                            <span class="font-bold uppercase">${user.nombres || 'SANTIAGO JOSE ESPINOSA ORTIZ'}</span>
                        </div>
                        <div class="col-span-2 p-2 border-t border-slate-900 bg-slate-50 font-bold uppercase">Responsable Pagador</div>
                        
                        <div class="col-span-4 p-2 border-t border-r border-slate-900 text-slate-300">DOMICILIO: CALLE 10 # 5-12 • CALI, VALLE</div>
                        <div class="col-span-2 p-2 border-t border-slate-900 uppercase font-bold">${user.nombres || 'SANTIAGO JOSE ESPINOSA'}</div>
                    </div>

                    <!-- Concepts Table -->
                    <table class="w-full border-[1px] border-slate-900 mb-0 font-mono text-[10px]">
                        <thead>
                            <tr class="bg-slate-50 border-b border-slate-900">
                                <th class="p-2 text-left border-r border-slate-900 w-1/2 uppercase">Conceptos</th>
                                <th class="p-2 text-right border-r border-slate-900 uppercase">Cargos</th>
                                <th class="p-2 text-right border-r border-slate-900 uppercase">Pagos</th>
                                <th class="p-2 text-right uppercase">Balances</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-slate-100">
                                <td class="p-2 border-r border-slate-900">Matrícula Semestre CPT P1</td>
                                <td class="p-2 text-right border-r border-slate-900">$4,212,950</td>
                                <td class="p-2 text-right border-r border-slate-900">$0</td>
                                <td class="p-2 text-right">$4,212,950</td>
                            </tr>
                            <tr class="border-b border-slate-100">
                                <td class="p-2 border-r border-slate-900">Impuesto Pro-Cultura Cali 1.5%</td>
                                <td class="p-2 text-right border-r border-slate-900">$63,194</td>
                                <td class="p-2 text-right border-r border-slate-900">$0</td>
                                <td class="p-2 text-right">$63,194</td>
                            </tr>
                            <tr class="border-b border-slate-100">
                                <td class="p-2 border-r border-slate-900">Poliza Medica Semestral</td>
                                <td class="p-2 text-right border-r border-slate-900">$36,243</td>
                                <td class="p-2 text-right border-r border-slate-900">$0</td>
                                <td class="p-2 text-right">$36,243</td>
                            </tr>
                            <tr class="border-b border-slate-100 italic">
                                <td class="p-2 border-r border-slate-900">DCTS CONV Caja Comfandi</td>
                                <td class="p-2 text-right border-r border-slate-900">-$210,648</td>
                                <td class="p-2 text-right border-r border-slate-900">$0</td>
                                <td class="p-2 text-right">-$210,648</td>
                            </tr>
                             <tr class="border-b border-slate-900 font-bold">
                                <td class="p-2 border-r border-slate-900 uppercase">Totales</td>
                                <td class="p-2 text-right border-r border-slate-900">$4,101,739</td>
                                <td class="p-2 text-right border-r border-slate-900">$210,648</td>
                                <td class="p-2 text-right">$3,891,091</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Payment Schedule -->
                    <div class="border-[1px] border-slate-900 border-t-0 p-0 mb-8 font-mono">
                        <div class="flex justify-between p-2 border-b border-slate-900 font-bold">
                            <span class="uppercase">Fecha de Pago Hasta 19.12.2025</span>
                            <span>$3,891,091</span>
                        </div>
                        <div class="flex justify-between p-2 border-b border-slate-100">
                            <span class="uppercase">Fecha de Pago Hasta 16.01.2026</span>
                            <span>$4,101,739</span>
                        </div>
                        <div class="flex justify-between p-2 text-slate-400 italic">
                            <span class="uppercase">Fecha de Pago Hasta 23.01.2026 (Extemporáneo)</span>
                            <span>$4,438,775</span>
                        </div>
                    </div>

                    <!-- Footer Instructions -->
                    <div class="text-[8px] space-y-2 mb-10 text-slate-400">
                        <p>PAGO PSE: https://www.avalpaycenter.com/wps/portal/portal-de-pagos/web/pagos-aval/resultado-busqueda</p>
                        <p>Los descuentos o apoyos no son acumulables entre si, después de realizado el pago no serán aplicados.</p>
                        <p>Si va a realizar pago mixto, debe acercarse a la caja de la sede meléndez para realizar un primer pago.</p>
                    </div>

                    <!-- Barcode Section (Visual Simulation) -->
                    <div class="border-t-[2px] border-dashed border-slate-300 pt-8 mt-10 flex items-center justify-between gap-10">
                        <div class="w-1/3">
                             <div class="font-bold uppercase mb-2">Orden de Pago Matricula</div>
                             <div class="text-[9px] mb-4">Realice su pago en: Bancos de Bogotá, Gane, Cooperativa Minuto de Dios, PSE, etc.</div>
                             <table class="w-full border border-slate-900">
                                 <tr class="bg-slate-50 border-b border-slate-900"><th class="p-1 uppercase">Fecha</th><th class="p-1 uppercase">Total a Pagar</th></tr>
                                 <tr class="border-b border-slate-900"><td class="p-1">19.12.2025</td><td class="p-1 font-bold text-right">$3,891,091</td></tr>
                                 <tr><td class="p-1">16.01.2026</td><td class="p-1 font-bold text-right">$4,101,739</td></tr>
                             </table>
                        </div>
                        <div class="w-2/3">
                            <div class="bg-slate-900 h-16 w-full flex items-center justify-center text-white font-mono text-xs tracking-[10px] overflow-hidden">
                                |||||||||||||||||||||||||||||||||||||||||||||||||||||||||
                            </div>
                            <div class="text-center font-mono text-[8px] mt-2">(415) 7705998009553 (8020) 00040533000000021053243 (3900) 03891091 (96) 20251219</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        lucide.createIcons();
    }
};
