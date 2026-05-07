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

            const isCertificate = req.tipo.toLowerCase().includes('certificado');
            const isApproved = req.estado === 'aprobada';

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
                        <div class="flex flex-col gap-2">
                            <span class="w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[req.estado] || 'bg-slate-100'}">
                                ${req.estado.replace('_', ' ')}
                            </span>
                            ${isCertificate && isApproved ? `
                                <button onclick="Views.requests.downloadCertificate('${req.id}', '${req.tipo}')" class="flex items-center gap-1 text-indigo-600 font-bold text-[10px] hover:text-indigo-800 transition-colors">
                                    <i data-lucide="download" class="w-3 h-3"></i>
                                    DESCARGAR PDF
                                </button>
                            ` : ''}
                        </div>
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

    downloadCertificate(id, type) {
        const user = Auth.getUser();
        const date = new Date().toLocaleDateString();
        const verificationCode = Math.random().toString(36).substring(2, 10).toUpperCase();

        const certificateHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Certificado Académico - ${user.nombres}</title>
                <style>
                    body { font-family: 'Arial', sans-serif; padding: 50px; color: #333; line-height: 1.6; }
                    .header { text-align: center; border-bottom: 3px solid #032840; padding-bottom: 20px; margin-bottom: 40px; }
                    .logo-text { font-size: 28px; font-weight: 900; color: #032840; }
                    .logo-accent { color: #fab720; }
                    .title { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 50px; text-transform: uppercase; }
                    .content { font-size: 16px; text-align: justify; margin-bottom: 60px; }
                    .highlight { font-weight: bold; }
                    .footer { margin-top: 100px; text-align: center; }
                    .signature { border-top: 1px solid #333; width: 250px; margin: 0 auto; padding-top: 10px; font-weight: bold; }
                    .verification { margin-top: 50px; font-size: 10px; color: #666; text-align: center; border: 1px dashed #ccc; padding: 10px; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo-text">UNICA<span class="logo-accent">TÓLICA</span></div>
                    <div style="font-size: 12px; font-weight: bold; margin-top: 5px;">Fundación Universitaria Católica Lumine Gentium</div>
                </div>

                <div class="title">${type}</div>

                <div class="content">
                    La suscrita Directora de Registro Académico de la <span class="highlight">Fundación Universitaria Católica Lumine Gentium - UNICATÓLICA</span>,
                    <br><br>
                    <div style="text-align: center; font-size: 20px; margin: 30px 0;">CERTIFICA:</div>
                    <br>
                    Que el(la) estudiante <span class="highlight">${user.nombres.toUpperCase()} ${user.apellidos.toUpperCase()}</span>, 
                    identificado(a) con documento de identidad No. <span class="highlight">${user.documento || 'No registrado'}</span>, 
                    se encuentra actualmente matriculado(a) y con estado <span class="highlight">ACTIVO</span> en el programa de 
                    <span class="highlight">INGENIERÍA DE SISTEMAS</span> (Código SNIES 10234).
                    <br><br>
                    A la fecha, el estudiante ha cursado y aprobado satisfactoriamente los créditos correspondientes a su nivel de formación actual, 
                    manteniendo un promedio académico sobresaliente.
                    <br><br>
                    Se firma en la ciudad de Cali, a los ${new Date().getDate()} días del mes de ${new Intl.DateTimeFormat('es-ES', {month: 'long'}).format(new Date())} de ${new Date().getFullYear()}.
                </div>

                <div class="footer">
                    <div class="signature">DIRECCIÓN DE REGISTRO ACADÉMICO</div>
                    <div style="font-size: 12px; margin-top: 5px;">UNICATÓLICA - Sede Principal</div>
                </div>

                <div class="verification">
                    Código de Verificación: ${verificationCode}
                    <br>
                    Valide la autenticidad de este documento en: https://verificar.unicatolica.online
                </div>

                <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #032840; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                        IMPRIMIR / GUARDAR COMO PDF
                    </button>
                </div>
            </body>
            </html>
        `;

        const win = window.open('', '_blank');
        win.document.write(certificateHtml);
        win.document.close();
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
