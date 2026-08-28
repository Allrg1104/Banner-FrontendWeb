/**
 * Reset Password View - Premium Recovery Flow
 */

Views['reset-password'] = {
    getTokenFromUrl() {
        // 1. Check in hash: #/reset-password?token=xxx
        const hashParts = window.location.hash.split('?');
        if (hashParts.length > 1) {
            const params = new URLSearchParams(hashParts[1]);
            const token = params.get('token');
            if (token) return token.trim();
        }
        // 2. Check in search: ?token=xxx#/reset-password
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.has('token')) {
            return searchParams.get('token').trim();
        }
        return null;
    },

    async render() {
        const token = this.getTokenFromUrl();

        if (!token) {
            return `
                <div class="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                    <div class="absolute -top-40 -right-40 w-96 h-96 bg-[#032840]/5 rounded-full blur-3xl"></div>
                    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-[#fab720]/10 rounded-full blur-3xl"></div>
                    
                    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-2xl relative z-10 border border-slate-100 animate-slide-up text-center">
                        <div class="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100">
                            <i data-lucide="alert-triangle" class="w-10 h-10"></i>
                        </div>
                        <h2 class="text-2xl font-black text-slate-900 tracking-tight" style="font-family: 'Outfit'">Enlace Inválido o Expirado</h2>
                        <p class="mt-3 text-sm font-medium text-slate-500">No se encontró un token válido en el enlace de recuperación. Solicita un nuevo enlace desde el inicio de sesión.</p>
                        
                        <div class="mt-8">
                            <a href="#/login" class="w-full inline-flex justify-center items-center gap-2 btn-premium bg-[#032840] text-[#fab720] py-4 text-sm tracking-widest uppercase font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-200">
                                <i data-lucide="arrow-left" class="w-4 h-4"></i>
                                Ir al Inicio de Sesión
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <!-- Background Decoration -->
                <div class="absolute -top-40 -right-40 w-96 h-96 bg-[#032840]/5 rounded-full blur-3xl"></div>
                <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-[#fab720]/10 rounded-full blur-3xl"></div>
                
                <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-2xl relative z-10 border border-slate-100 animate-slide-up">
                    <div class="text-center">
                        <div class="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-indigo-100">
                            <i data-lucide="key-round" class="w-10 h-10"></i>
                        </div>
                        <h2 class="text-3xl font-black text-slate-900 tracking-tight" style="font-family: 'Outfit'">Restablecer Clave</h2>
                        <p class="mt-3 text-sm font-medium text-slate-500">Crea una nueva contraseña segura para tu cuenta institucional.</p>
                    </div>

                    <form id="reset-password-form" class="mt-10 space-y-6">
                        <div class="space-y-4">
                            <div>
                                <label for="new_password" class="label-premium">Nueva Contraseña</label>
                                <div class="relative mt-1">
                                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <i data-lucide="lock" class="w-5 h-5"></i>
                                    </span>
                                    <input type="password" id="new_password" required minlength="8"
                                        class="input-premium pl-12 pr-12 w-full" placeholder="••••••••">
                                    <button type="button" id="toggle-new-password" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none">
                                        <i data-lucide="eye" class="w-5 h-5"></i>
                                    </button>
                                </div>
                                <p class="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-2">Mínimo 8 caracteres requeridos</p>
                            </div>

                            <div>
                                <label for="confirm_password" class="label-premium">Confirmar Contraseña</label>
                                <div class="relative mt-1">
                                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <i data-lucide="lock-keyhole" class="w-5 h-5"></i>
                                    </span>
                                    <input type="password" id="confirm_password" required minlength="8"
                                        class="input-premium pl-12 pr-12 w-full" placeholder="••••••••">
                                    <button type="button" id="toggle-confirm-password" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none">
                                        <i data-lucide="eye" class="w-5 h-5"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button type="submit" class="w-full btn-premium bg-[#032840] text-[#fab720] py-4 text-sm tracking-widest uppercase font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-200">
                            Actualizar Credenciales
                            <i data-lucide="arrow-right" class="w-4 h-4 ml-2 inline-block"></i>
                        </button>
                        
                        <div class="text-center mt-6">
                            <a href="#/login" class="text-[11px] font-black uppercase text-slate-400 hover:text-indigo-600 tracking-widest transition-colors flex items-center justify-center gap-2">
                                <i data-lucide="arrow-left" class="w-3 h-3"></i>
                                Volver al Portal de Acceso
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    afterRender() {
        lucide.createIcons();
        const form = document.getElementById('reset-password-form');
        if (!form) return;

        // Toggle password visibility helper
        const setupToggle = (btnId, inputId) => {
            const btn = document.getElementById(btnId);
            const input = document.getElementById(inputId);
            if (btn && input) {
                btn.addEventListener('click', () => {
                    const isPassword = input.type === 'password';
                    input.type = isPassword ? 'text' : 'password';
                    btn.innerHTML = `<i data-lucide="${isPassword ? 'eye-off' : 'eye'}" class="w-5 h-5"></i>`;
                    lucide.createIcons();
                });
            }
        };

        setupToggle('toggle-new-password', 'new_password');
        setupToggle('toggle-confirm-password', 'confirm_password');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newPassword = document.getElementById('new_password').value;
            const confirmPassword = document.getElementById('confirm_password').value;

            if (newPassword !== confirmPassword) {
                return Toast.error('Las contraseñas no coinciden. Intenta de nuevo.');
            }

            if (newPassword.length < 8) {
                return Toast.error('La contraseña debe tener al menos 8 caracteres.');
            }

            const token = Views['reset-password'].getTokenFromUrl();

            if (!token) {
                return Toast.error('Enlace de recuperación inválido o inexistente.');
            }

            const btn = form.querySelector('button[type="submit"]');
            const originalHtml = btn.innerHTML;

            try {
                btn.disabled = true;
                btn.innerHTML = '<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block align-middle mr-2"></div> PROCESANDO...';

                await API.post('/auth/confirm-password-change', { token, newPassword });

                Toast.success('¡Contraseña actualizada exitosamente!');
                setTimeout(() => {
                    Router.navigate('/login');
                }, 1500);
            } catch (err) {
                Toast.error(err.message || 'Error procesando tu solicitud.');
                btn.disabled = false;
                btn.innerHTML = originalHtml;
                lucide.createIcons();
            }
        });
    }
};
