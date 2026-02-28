/**
 * User Profile View - Detailed Personal Data
 * High-fidelity "Ficha del Estudiante" with direct editing capabilities
 */

Views['profile'] = {
    isEditing: false,

    async render() {
        const user = Auth.getUser();

        return `
            <div class="max-w-6xl mx-auto py-8 animate-fade-in space-y-10">
                
                <!-- Main Header / Sidebar summary style -->
                <div class="flex flex-col lg:flex-row gap-10">
                    <div class="lg:w-1/3 space-y-6">
                        <div class="card-premium bg-white p-10 text-center shadow-xl border-t-4 border-[#032840]">
                            <h2 class="text-2xl font-black text-slate-900 leading-tight uppercase mb-2">
                                ${user.nombres || 'SANTIAGO JOSE'}<br>
                                ${user.apellidos || 'ESPINOSA/ORTIZ'}
                            </h2>
                            <p class="text-slate-500 font-bold text-xs mb-8">Número de ID: 000405330</p>
                            
                            <div class="space-y-4 text-left">
                                <div class="flex items-center gap-4 text-[11px] font-medium text-slate-600">
                                    <div class="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                                        <i data-lucide="mail" class="w-4 h-4 text-[#fab720]"></i>
                                    </div>
                                    <span class="truncate">${user.usuario}@unicatolica.edu.co</span>
                                </div>
                                <div class="flex items-center gap-4 text-[11px] font-medium text-slate-600">
                                    <div class="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                                        <i data-lucide="map-pin" class="w-4 h-4 text-[#fab720]"></i>
                                    </div>
                                    <span>CRA 94A 2 41, Cali, Valle 76001</span>
                                </div>
                                <div class="flex items-center gap-4 text-[11px] font-medium text-slate-600">
                                    <div class="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                                        <i data-lucide="phone" class="w-4 h-4 text-[#fab720]"></i>
                                    </div>
                                    <span>3012117114</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="lg:w-2/3 space-y-8">
                        <!-- Detalles Personales -->
                        <div class="card-premium bg-white">
                            <div class="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                                <h3 class="text-lg font-black text-[#032840]">Detalles personales</h3>
                                ${this.isEditing ? `
                                    <div class="flex gap-3">
                                        <button onclick="Views.profile.cancelEdit()" class="text-slate-400 text-[10px] font-black uppercase hover:text-red-500">Cancelar</button>
                                        <button onclick="Views.profile.savePersonalDetails()" class="btn-premium bg-[#fab720] text-[#032840] px-6 py-2 text-[10px]">Guardar</button>
                                    </div>
                                ` : `
                                    <button onclick="Views.profile.enableEdit()" class="flex items-center gap-2 text-[#fab720] text-xs font-black uppercase hover:scale-105 transition-transform">
                                        <i data-lucide="edit-3" class="w-4 h-4"></i> Editar
                                    </button>
                                `}
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="personal-details-form">
                                <div>
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nombre</label>
                                    ${this.isEditing ?
                `<input type="text" id="edit-nombre" class="input-premium py-1 text-sm" value="${user.nombres.split(' ')[0] || 'SANTIAGO JOSE'}">` :
                `<div class="text-sm font-bold text-slate-800">${user.nombres.split(' ')[0] || 'SANTIAGO JOSE'}</div>`
            }
                                </div>
                                <div>
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Segundo nombre</label>
                                    ${this.isEditing ?
                `<input type="text" id="edit-segundo-nombre" class="input-premium py-1 text-sm" value="-">` :
                `<div class="text-sm font-bold text-slate-800">-</div>`
            }
                                </div>
                                <div>
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Apellido</label>
                                    ${this.isEditing ?
                `<input type="text" id="edit-apellido" class="input-premium py-1 text-sm" value="${user.apellidos || 'ESPINOSA/ORTIZ'}">` :
                `<div class="text-sm font-bold text-slate-800">${user.apellidos || 'ESPINOSA/ORTIZ'}</div>`
            }
                                </div>
                                <div>
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Fecha de nacimiento</label>
                                    ${this.isEditing ?
                `<input type="date" id="edit-nacimiento" class="input-premium py-1 text-sm" value="2004-05-07">` :
                `<div class="text-sm font-bold text-slate-800">7 de mayo de 2004</div>`
            }
                                </div>
                                <div>
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Estado civil</label>
                                    ${this.isEditing ?
                `<select id="edit-civil" class="input-premium py-1 text-sm">
                                            <option value="Soltero(a)" selected>Soltero(a)</option>
                                            <option value="Casado(a)">Casado(a)</option>
                                            <option value="Union Libre">Unión Libre</option>
                                        </select>` :
                `<div class="text-sm font-bold text-slate-800">Soltero(a)</div>`
            }
                                </div>
                                <div>
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Sexo</label>
                                    ${this.isEditing ?
                `<select id="edit-sexo" class="input-premium py-1 text-sm">
                                            <option value="Masculino" selected>Masculino</option>
                                            <option value="Femenino">Femenino</option>
                                            <option value="Otro">Otro</option>
                                        </select>` :
                `<div class="text-sm font-bold text-slate-800">Masculino</div>`
            }
                                </div>
                                <div>
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nombre preferido</label>
                                    ${this.isEditing ?
                `<input type="text" id="edit-preferido" class="input-premium py-1 text-sm" value="-">` :
                `<div class="text-sm font-bold text-slate-800">-</div>`
            }
                                </div>
                                <div>
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Identificación de género</label>
                                    ${this.isEditing ?
                `<input type="text" id="edit-genero" class="input-premium py-1 text-sm" value="Masculino">` :
                `<div class="text-sm font-bold text-slate-800">Masculino</div>`
            }
                                </div>
                            </div>
                        </div>

                        <!-- Correo Electrónico -->
                        <div class="card-premium bg-white">
                            <div class="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                                <h3 class="text-lg font-black text-[#032840]">Correo electrónico</h3>
                                <button onclick="Views.profile.openAddModal('Correo Electrónico')" class="flex items-center gap-2 text-[#fab720] text-xs font-black uppercase hover:scale-105 transition-transform">
                                    <i data-lucide="plus-circle" class="w-4 h-4"></i> Agregar nueva
                                </button>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Correo Institucional</label>
                                    <div class="text-sm font-bold text-slate-800">${user.usuario}@unicatolica.edu.co</div>
                                    <div class="text-[9px] text-slate-400 font-bold mt-1">(No actualizable)</div>
                                </div>
                                <div>
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Correo Personal</label>
                                    <div class="flex items-center gap-3">
                                        <div class="text-sm font-bold text-slate-800">santiago_espinosa10@hotmail.com</div>
                                        <button onclick="Views.profile.openEditModal('Correo Personal')" class="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center"><i data-lucide="edit-2" class="w-3 h-3 text-[#fab720]"></i></button>
                                        <button onclick="Views.profile.simulateDelete('Correo')" class="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center"><i data-lucide="trash" class="w-3 h-3 text-red-500"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Número de teléfono -->
                        <div class="card-premium bg-white">
                            <div class="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                                <h3 class="text-lg font-black text-[#032840]">Número de teléfono</h3>
                                <button onclick="Views.profile.openAddModal('Número de teléfono')" class="flex items-center gap-2 text-[#fab720] text-xs font-black uppercase hover:scale-105 transition-transform">
                                    <i data-lucide="plus-circle" class="w-4 h-4"></i> Agregar nueva
                                </button>
                            </div>
                            <div>
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Celular (Principal)</label>
                                <div class="flex items-center gap-4">
                                    <div class="text-sm font-bold text-slate-800">3012117114</div>
                                    <button onclick="Views.profile.openEditModal('Teléfono')" class="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center"><i data-lucide="edit-2" class="w-3 h-3 text-[#fab720]"></i></button>
                                    <button onclick="Views.profile.simulateDelete('Teléfono')" class="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center"><i data-lucide="trash" class="w-3 h-3 text-red-500"></i></button>
                                </div>
                            </div>
                        </div>

                        <!-- Dirección -->
                        <div class="card-premium bg-white">
                            <div class="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                                <h3 class="text-lg font-black text-[#032840]">Dirección</h3>
                                <button onclick="Views.profile.openAddModal('Dirección')" class="flex items-center gap-2 text-[#fab720] text-xs font-black uppercase hover:scale-105 transition-transform">
                                    <i data-lucide="plus-circle" class="w-4 h-4"></i> Agregar nueva
                                </button>
                            </div>
                            <div>
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Residencia</label>
                                <div class="text-xs font-bold text-slate-400 mb-1">Actual</div>
                                <div class="text-xs font-medium text-slate-500 mb-1">11/02/2022 - (Sin fecha de fin)</div>
                                <div class="text-sm font-bold text-slate-800">CRA 94A 2 41</div>
                            </div>
                        </div>

                        <!-- Contacto de emergencia -->
                        <div class="card-premium bg-white">
                            <div class="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                                <h3 class="text-lg font-black text-[#032840]">Contacto de emergencia</h3>
                                <button onclick="Views.profile.openAddModal('Contacto de emergencia')" class="flex items-center gap-2 text-[#fab720] text-xs font-black uppercase hover:scale-105 transition-transform">
                                    <i data-lucide="plus-circle" class="w-4 h-4"></i> Agregar nueva
                                </button>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div class="relative group">
                                    <div class="text-sm font-black text-slate-800 mb-1">1. JANETH ORTIZ</div>
                                    <div class="text-xs font-medium text-slate-500">Acudiente</div>
                                    <div class="text-xs font-medium text-slate-500">Teléfono: 317 4169964</div>
                                    <div class="text-xs font-medium text-slate-500 uppercase">CRA 94A 2 41, Cali, Valle 76001</div>
                                    <div class="flex gap-2 mt-3">
                                        <button onclick="Views.profile.openEditModal('Contacto 1')" class="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center"><i data-lucide="edit-2" class="w-3 h-3 text-[#fab720]"></i></button>
                                        <button onclick="Views.profile.simulateDelete('Contacto')" class="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center"><i data-lucide="trash" class="w-3 h-3 text-red-500"></i></button>
                                    </div>
                                </div>
                                <div class="relative group">
                                    <div class="text-sm font-black text-slate-800 mb-1">2. DEYSON FERNANDO ESPINOSA</div>
                                    <div class="text-xs font-medium text-slate-500">Acudiente</div>
                                    <div class="text-xs font-medium text-slate-500">Teléfono: 311 7246085</div>
                                    <div class="text-xs font-medium text-slate-500 uppercase">Cali, Valle 76001</div>
                                    <div class="flex gap-2 mt-3">
                                        <button onclick="Views.profile.openEditModal('Contacto 2')" class="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center"><i data-lucide="edit-2" class="w-3 h-3 text-[#fab720]"></i></button>
                                        <button onclick="Views.profile.simulateDelete('Contacto')" class="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center"><i data-lucide="trash" class="w-3 h-3 text-red-500"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Detalles adicionales -->
                        <div class="card-premium bg-white">
                            <h3 class="text-lg font-black text-[#032840] mb-8 border-b border-slate-100 pb-4">Detalles adicionales</h3>
                            <div>
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status de discapacidad</label>
                                <div class="text-sm font-bold text-slate-500 italic">Status no disponible</div>
                            </div>
                        </div>

                        <!-- Otros -->
                        <div class="card-premium bg-slate-50 border-none">
                            <h3 class="text-lg font-black text-slate-400 mb-8 border-b border-slate-200 pb-4 uppercase tracking-tighter">Otro</h3>
                            <div class="flex justify-between items-center">
                                <a href="#" class="text-xs font-black text-[#fab720] uppercase hover:underline">Perfil del directorio</a>
                                <button class="text-xs font-black text-slate-400 uppercase hover:text-[#032840] transition-colors">Responder una encuesta</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="text-center py-10 border-t border-slate-100">
                    <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        © 2013-2021 Ellucian Company L.P. y sus afiliados. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        `;
    },

    afterRender() {
        lucide.createIcons();
    },

    enableEdit() {
        this.isEditing = true;
        this.reRender();
    },

    cancelEdit() {
        this.isEditing = false;
        this.reRender();
    },

    async reRender() {
        const content = await this.render();
        document.getElementById('view-mount').innerHTML = content;
        this.afterRender();
    },

    async savePersonalDetails() {
        const nuevoNombre = document.getElementById('edit-nombre').value;
        const nuevoApellido = document.getElementById('edit-apellido').value;

        // Simular guardado real actualizando el objeto usuario en memoria (sessionStorage)
        const user = Auth.getUser();
        user.nombres = nuevoNombre;
        user.apellidos = nuevoApellido;

        // En una app real esto sería un fetch al backend
        sessionStorage.setItem('user', JSON.stringify(user));

        Toast.success('¡Información personal actualizada con éxito!');
        this.isEditing = false;

        // Re-renderizar todo incluyendo el Shell para actualizar el nombre en la barra lateral
        Router.handleRoute();
    },

    /**
     * Open a simulation modal for editing (used for secondary items like emails/phones)
     */
    openEditModal(title) {
        const container = document.getElementById('modal-container');
        const content = document.getElementById('modal-content');

        content.innerHTML = `
            <div class="p-8">
                <div class="flex items-center justify-between mb-8">
                    <h3 class="text-xl font-bold text-slate-900 tracking-tight">Editar ${title}</h3>
                    <button onclick="Views.profile.closeModal()" class="text-slate-400 hover:text-red-500">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                
                <form id="secondary-edit-form" class="space-y-6">
                    <div class="space-y-4">
                        <div class="input-group">
                            <label class="label-premium">Nuevo Valor</label>
                            <input type="text" class="input-premium" value="" placeholder="Ingrese el nuevo dato...">
                        </div>
                    </div>

                    <div class="flex gap-4 pt-6">
                        <button type="button" onclick="Views.profile.closeModal()" class="flex-1 py-3 text-slate-500 font-bold text-sm">Cancelar</button>
                        <button type="submit" class="flex-1 btn-premium btn-primary py-3">Guardar</button>
                    </div>
                </form>
            </div>
        `;

        container.classList.remove('hidden');
        lucide.createIcons();

        document.getElementById('secondary-edit-form').onsubmit = (e) => {
            e.preventDefault();
            this.closeModal();
            Toast.success(`¡${title} actualizado correctamente!`);
        };
    },

    /**
     * Open a simulation modal for adding new records
     */
    openAddModal(title) {
        const container = document.getElementById('modal-container');
        const content = document.getElementById('modal-content');

        content.innerHTML = `
            <div class="p-8">
                <div class="flex items-center justify-between mb-8">
                    <h3 class="text-xl font-bold text-slate-900 tracking-tight">Agregar ${title}</h3>
                    <button onclick="Views.profile.closeModal()" class="text-slate-400 hover:text-red-500">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                
                <form id="add-record-form" class="space-y-6">
                    <div class="space-y-4">
                        <div class="input-group">
                            <label class="label-premium">Tipo/Etiqueta</label>
                            <input type="text" class="input-premium" placeholder="ej: Personal, Trabajo, Otro...">
                        </div>
                        <div class="input-group">
                            <label class="label-premium">Detalle / Valor</label>
                            <input type="text" class="input-premium" placeholder="Ingrese el valor...">
                        </div>
                    </div>

                    <div class="flex gap-4 pt-6">
                        <button type="button" onclick="Views.profile.closeModal()" class="flex-1 py-3 text-slate-500 font-bold text-sm">Cancelar</button>
                        <button type="submit" class="flex-1 btn-premium bg-[#fab720] text-[#032840] py-3">Agregar</button>
                    </div>
                </form>
            </div>
        `;

        container.classList.remove('hidden');
        lucide.createIcons();

        document.getElementById('add-record-form').onsubmit = (e) => {
            e.preventDefault();
            this.closeModal();
            Toast.success(`¡Nuevo registro de ${title} añadido!`);
        };
    },

    closeModal() {
        document.getElementById('modal-container').classList.add('hidden');
    },

    simulateDelete(type) {
        if (confirm(`¿Estás seguro que deseas eliminar este registro de ${type}?`)) {
            Toast.success('Registro eliminado correctamente.');
        }
    }
};
