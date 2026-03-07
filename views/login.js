/**
 * Premium Login View - Enterprise Architect Standard
 * Immersive split-screen with high-end interactions
 */

Views.login = {
    async render() {
        return `
            <div class="premium-bg"></div>
            <div class="flex min-h-screen items-center justify-center p-6 bg-slate-50/50">
                
                <div class="flex w-full max-w-6xl glass shadow-premium rounded-[32px] overflow-hidden animate-slide-up" style="min-height: 700px;">
                    
                    <!-- Left Side: Immersive Visuals -->
                    <div class="hidden lg:flex flex-1 relative bg-slate-900 p-12 flex-col justify-between overflow-hidden">
                        <!-- Abstract Visual Layer -->
                        <div class="absolute inset-0 opacity-40">
                            <div class="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#032840] rounded-full blur-[120px]"></div>
                            <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#fab720] rounded-full blur-[100px]"></div>
                        </div>
                        
                        <div class="relative z-10">
                            <div class="flex items-center gap-3 mb-10">
                                <img src="https://www.unicatolica.edu.co/wp-content/uploads/2021/03/logo-unicatolica.png" alt="Unicatólica Logo" class="h-16 w-auto brightness-0 invert">
                            </div>
                            
                            <h1 class="text-5xl font-extrabold text-white leading-tight mb-6">
                                Inteligencia <br/>
                                <span class="text-[#fab720]">Académica</span> <br/>
                                de Siguiente Nivel.
                            </h1>
                            <p class="text-slate-400 text-lg max-w-md">
                                Plataforma institucional con arquitectura de microservicios y modelos predictivos para el éxito estudiantil.
                            </p>
                        </div>
                        
                        <div class="relative z-10">
                            <div class="flex gap-8 mb-4">
                                <div>
                                    <div class="text-3xl font-bold text-white">98%</div>
                                    <div class="text-xs text-slate-500 uppercase tracking-widest font-bold">Retención</div>
                                </div>
                                <div>
                                    <div class="text-3xl font-bold text-white">12k+</div>
                                    <div class="text-xs text-slate-500 uppercase tracking-widest font-bold">Estudiantes</div>
                                </div>
                                <div>
                                    <div class="text-3xl font-bold text-white">AI</div>
                                    <div class="text-xs text-slate-500 uppercase tracking-widest font-bold">Powered</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Side: Professional Login Form -->
                    <div class="flex-1 bg-white p-12 lg:p-20 flex flex-col justify-center">
                        <div class="mb-10 lg:hidden flex items-center gap-3">
                             <img src="https://www.unicatolica.edu.co/wp-content/uploads/2021/03/logo-unicatolica.png" alt="Unicatólica Logo" class="h-12 w-auto">
                        </div>

                        <div class="mb-10">
                            <h2 class="text-3xl font-bold text-slate-900 mb-2">Bienvenido de nuevo</h2>
                            <p class="text-slate-500">Ingresa tus credenciales institucionales para acceder.</p>
                        </div>

                        <form id="login-form" class="space-y-6">
                            <div class="input-group">
                                <label class="label-premium">Usuario o Correo</label>
                                <div class="relative">
                                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <i data-lucide="user" class="w-5 h-5"></i>
                                    </span>
                                    <input type="text" id="username" class="input-premium pl-12" placeholder="ej: santiago.espinosa01" required>
                                </div>
                            </div>

                            <div class="input-group">
                                <div class="flex justify-between items-center mb-2">
                                    <label class="label-premium mb-0">Contraseña</label>
                                    <a href="#" class="text-xs font-bold text-[#032840] hover:text-[#021a2b] transition-colors">¿Olvidaste tu contraseña?</a>
                                </div>
                                <div class="relative">
                                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <i data-lucide="lock" class="w-5 h-5"></i>
                                    </span>
                                    <input type="password" id="password" class="input-premium pl-12" placeholder="••••••••" required>
                                </div>
                            </div>

                            <div class="flex items-center gap-2 mb-8">
                                <input type="checkbox" id="remember" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                                <label for="remember" class="text-sm font-medium text-slate-600">Mantener sesión iniciada</label>
                            </div>

                            <button type="submit" class="btn-premium btn-logout w-full py-4 text-lg">
                                Acceder al Portal
                                <i data-lucide="arrow-right" class="w-5 h-5"></i>
                            </button>
                        </form>

                        </form>
                    </div>
                </div>
            </div>
        `;
    },

    afterRender() {
        const form = document.getElementById('login-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const originalContent = btn.innerHTML;

            btn.disabled = true;
            btn.innerHTML = '<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Autenticando...';

            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;

            try {
                const response = await Auth.login(user, pass);
                if (response.success) {
                    Toast.success('Bienvenido, ' + response.user.nombres);
                    setTimeout(() => {
                        Router.redirectToDashboard();
                    }, 1000);
                    return; // Keep button disabled during redirect
                } else {
                    Toast.error(response.error || 'Credenciales inválidas');
                }
            } catch (err) {
                console.error('Login Error:', err);
                Toast.error('Error de conexión con el servidor');
            } finally {
                // Only reset if we didn't succeed (if we succeeded, we want it to look busy until redirect)
                const userNow = Auth.getUser();
                if (!userNow) {
                    btn.disabled = false;
                    btn.innerHTML = originalContent;
                }
            }
        });

        // Add mouse movement effect to visual side
        const container = document.querySelector('.glass');
        if (container) {
            container.addEventListener('mousemove', (e) => {
                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                container.style.setProperty('--mouse-x', `${x}px`);
                container.style.setProperty('--mouse-y', `${y}px`);

                // Subtle tilt
                const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 1;
                const rotateX = ((rect.height / 2 - y) / (rect.height / 2)) * 1;
                container.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            container.addEventListener('mouseleave', () => {
                container.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
            });
        }
    }
};
