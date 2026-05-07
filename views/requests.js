/**
 * View: Mis Solicitudes
 * Handles academic and financial requests with a dynamic form
 */

Views['requests'] = {
    state: {
        category: '',
        service: '',
        history: []
    },

    servicesMap: {
        'Certificados Académicos': [
            'Certificado de Estudio',
            'Certificado de Notas',
            'Certificado de Horario',
            'Certificado de Promedio Acumulado',
            'Certificado de Conducta'
        ],
        'Solicitudes Académicas': [
            'Cancelación de Semestre',
            'Reingreso',
            'Reintegro',
            'Modificación de Matrícula'
        ],
        'Solicitudes Financieras': [
            'Certificado Financiero',
            'Acuerdo de Pago',
            'Devolución de Saldo'
        ]
    },

    async render() {
        const user = Auth.getUser();
        try {
            this.state.history = await API.get(`/students/${user.id}/requests`);
        } catch (e) {
            console.error('Error loading requests history', e);
        }

        return `
            <div class="space-y-8 animate-fade-in">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Mis Solicitudes</h2>
                        <p class="text-slate-500 font-medium">Gestiona tus trámites académicos y financieros</p>
                    </div>
                    <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <i data-lucide="clipboard-list" class="text-white w-6 h-6"></i>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Formulario de Solicitud -->
                    <div class="lg:col-span-1 space-y-6">
                        <div class="card-premium bg-white shadow-xl">
                            <h3 class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <i data-lucide="plus-circle" class="text-indigo-600 w-5 h-5"></i>
                                Nueva Solicitud
                            </h3>
                            
                            <form id="request-form" class="space-y-4">
                                <div>
                                    <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Categoría *</label>
                                    <select id="req-category" class="input-premium w-full bg-slate-50 border-slate-200 text-sm font-medium" required>
                                        <option value="">-- Seleccione Categoría --</option>
                                        <option value="Certificados Académicos" ${this.state.category === 'Certificados Académicos' ? 'selected' : ''}>Certificados Académicos</option>
                                        <option value="Solicitudes Académicas" ${this.state.category === 'Solicitudes Académicas' ? 'selected' : ''}>Solicitudes Académicas</option>
                                        <option value="Solicitudes Financieras" ${this.state.category === 'Solicitudes Financieras' ? 'selected' : ''}>Solicitudes Financieras</option>
                                    </select>
                                </div>

                                <div>
                                    <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Servicio *</label>
                                    <select id="req-service" class="input-premium w-full bg-slate-50 border-slate-200 text-sm font-medium" required ${!this.state.category ? 'disabled' : ''}>
                                        <option value="">-- Seleccione Servicio --</option>
                                        ${this.getServiceOptions()}
                                    </select>
                                </div>

                                <div>
                                    <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Descripción Adicional</label>
                                    <textarea id="req-description" class="input-premium w-full bg-slate-50 border-slate-200 text-sm h-24" placeholder="Detalles de tu solicitud..."></textarea>
                                </div>

                                <button type="submit" class="btn-premium w-full py-4 bg-indigo-600 text-white shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                                    <i data-lucide="send" class="w-4 h-4"></i>
                                    Enviar Solicitud
                                </button>
                            </form>
                        </div>

                        <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                            <i data-lucide="info" class="text-amber-600 w-5 h-5 flex-shrink-0"></i>
                            <p class="text-xs text-amber-800 font-medium leading-relaxed">
                                Las solicitudes de certificados pueden tener un costo asociado. Una vez aprobada, recibirás la notificación en tu correo institucional.
                            </p>
                        </div>
                    </div>

                    <!-- Historial -->
                    <div class="lg:col-span-2">
                        <div class="card-premium bg-white shadow-sm overflow-hidden p-0">
                            <div class="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h3 class="text-lg font-bold text-slate-900">Historial de Trámites</h3>
                                <span class="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">${this.state.history.length} Registros</span>
                            </div>
                            
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead class="bg-slate-50/50">
                                        <tr>
                                            <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                                            <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo / Servicio</th>
                                            <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                            <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Respuesta</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100">
                                        ${this.renderHistoryRows()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getServiceOptions() {
        if (!this.state.category) return '';
        const services = this.servicesMap[this.state.category] || [];
        return services.map(s => `<option value="${s}">${s}</option>`).join('');
    },

    renderHistoryRows() {
        if (!this.state.history.length) {
            return `<tr><td colspan="4" class="px-6 py-10 text-center text-slate-400 font-medium italic">No has realizado ninguna solicitud aún.</td></tr>`;
        }

        return this.state.history.map(req => {
            const statusColors = {
                'pendiente': 'bg-amber-100 text-amber-700',
                'en_proceso': 'bg-blue-100 text-blue-700',
                'aprobada': 'bg-emerald-100 text-emerald-700',
                'rechazada': 'bg-rose-100 text-rose-700'
            };

            return `
                <tr class="hover:bg-slate-50/50 transition-colors">
                    <td class="px-6 py-4">
                        <div class="text-sm font-bold text-slate-700">${new Date(req.fecha).toLocaleDateString()}</div>
                        <div class="text-[10px] text-slate-400 font-medium">${new Date(req.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-sm font-bold text-slate-900">${req.tipo}</div>
                        <div class="text-xs text-slate-500 truncate max-w-[200px]">${req.descripcion || 'Sin descripción adicional'}</div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[req.estado] || 'bg-slate-100'}">
                            ${req.estado.replace('_', ' ')}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-xs text-slate-600 italic font-medium">
                            ${req.respuesta || '<span class="text-slate-300">En espera de respuesta...</span>'}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    afterRender() {
        lucide.createIcons();

        const categorySelect = document.getElementById('req-category');
        const form = document.getElementById('request-form');

        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.state.category = e.target.value;
                Router.refresh();
            });
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const user = Auth.getUser();
                const service = document.getElementById('req-service').value;
                const description = document.getElementById('req-description').value;

                try {
                    const result = await API.post(`/students/${user.id}/requests`, {
                        tipo: `${this.state.category}: ${service}`,
                        descripcion: description
                    });

                    if (result.success) {
                        Toast.show('Solicitud enviada con éxito', 'success');
                        this.state.category = '';
                        this.state.service = '';
                        Router.refresh();
                    }
                } catch (err) {
                    Toast.show('Error al enviar la solicitud', 'error');
                }
            });
        }
    }
};
