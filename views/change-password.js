/**
 * Premium Change Password View - Enterprise Standard
 * Required for users with must_change_password flag
 */

Views['change-password'] = {
  async render() {
    const user = Auth.getUser();
    return `
            <div class="premium-bg"></div>
            <div class="flex min-h-screen items-center justify-center p-6 bg-slate-50/50">
                
                <div class="card-premium max-w-md w-full p-10 animate-slide-up shadow-premium">
                    <div class="text-center mb-10">
                        <div class="w-20 h-20 bg-indigo-600/10 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <i data-lucide="shield-alert" class="w-10 h-10"></i>
                        </div>
                        <h2 class="text-3xl font-black text-slate-900 tracking-tight" style="font-family: 'Outfit'">Actualización <br/> de Seguridad</h2>
                        <p class="text-slate-500 mt-4 text-sm leading-relaxed">
                            Por políticas de seguridad institucional, debes actualizar tu contraseña temporal para continuar.
                        </p>
                    </div>

                    <form id="change-pwd-form" class="space-y-6">
                        <div class="input-group">
                            <label class="label-premium">Nueva Contraseña</label>
                            <div class="relative">
                                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <i data-lucide="key-round" class="w-5 h-5"></i>
                                </span>
                                <input type="password" id="new-password" class="input-premium pl-12" placeholder="Mínimo 8 caracteres" required minlength="8">
                            </div>
                        </div>

                        <div class="input-group">
                            <label class="label-premium">Confirmar Nueva Contraseña</label>
                            <div class="relative">
                                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <i data-lucide="check-circle-2" class="w-5 h-5"></i>
                                </span>
                                <input type="password" id="confirm-password" class="input-premium pl-12" placeholder="Repite la contraseña" required minlength="8">
                            </div>
                        </div>

                        <div class="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 mb-8">
                             <div class="flex gap-3">
                                 <i data-lucide="info" class="w-5 h-5 text-indigo-600 shrink-0"></i>
                                 <p class="text-[11px] text-indigo-700 leading-tight">
                                     Tu nueva contraseña debe ser diferente a las anteriores y contener letras, números y símbolos.
                                 </p>
                             </div>
                        </div>

                        <button type="submit" class="btn-premium btn-primary w-full py-4 text-lg">
                            Finalizar y Entrar
                            <i data-lucide="arrow-right" class="w-5 h-5"></i>
                        </button>
                    </form>
                </div>
            </div>
        `;
  },

  afterRender() {
    lucide.createIcons();
    const form = document.getElementById('change-pwd-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button');
      const originalContent = btn.innerHTML;

      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;

      if (newPassword !== confirmPassword) {
        return Toast.error('Las contraseñas no coinciden');
      }

      btn.disabled = true;
      btn.innerHTML = '<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Actualizando...';

      try {
        // En este prototipo simulamos el cambio exitoso
        // En producción aquí iría el llamado a confirm-password-change

        Toast.success('Seguridad actualizada. Bienvenido.');

        const user = Auth.getUser();
        user.must_change_password = false;
        Auth.login(Auth.getToken(), user); // Update session

        setTimeout(() => {
          Router.redirectToDashboard();
        }, 1200);

      } catch (err) {
        Toast.error('Error al actualizar seguridad');
        btn.disabled = false;
        btn.innerHTML = originalContent;
      }
    });
  }
};
