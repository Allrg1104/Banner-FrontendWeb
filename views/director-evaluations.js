/**
 * Director — Evaluación de Docentes (Dashboard de KPIs)
 */

function escapeHtml(s) {
  if (s == null || s === '') return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildDirectorTeacherCardHtml(t) {
  const puntaje = t.puntaje != null ? Number(t.puntaje).toFixed(1) : '—';
  const participacion = t.participacion || 0;
  return `
    <article class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden director-eval-card hover:shadow-md transition-shadow" data-search-hay="${escapeHtml(t.nombres + ' ' + t.apellidos).toLowerCase()}">
      <div class="px-5 py-4 flex flex-col gap-3">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <p class="font-bold text-slate-900 truncate">${escapeHtml(t.nombres)} ${escapeHtml(t.apellidos)}</p>
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">${escapeHtml(t.departamento || 'Docente')}</p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-[10px] font-black uppercase text-slate-400">Puntaje</p>
            <p class="text-2xl font-black ${t.puntaje >= 4.0 ? 'text-emerald-600' : t.puntaje >= 3.0 ? 'text-amber-500' : 'text-red-600'}">${puntaje}</p>
          </div>
        </div>
        <div class="border-t border-slate-100 pt-3">
          <div class="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700">
            <i data-lucide="message-square" class="w-4 h-4 text-indigo-500"></i> Comentarios
          </div>
          <p class="text-sm text-slate-600 italic">"${escapeHtml(t.comentarios || 'Sin comentarios registrados.')}"</p>
          <div class="mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span class="inline-flex items-center gap-1"><i data-lucide="users" class="w-3 h-3"></i> ${participacion} participaciones</span>
          </div>
        </div>
      </div>
    </article>
  `;
}

Views['director-evaluations'] = {
  async render() {
    try {
      const data = await API.get('/directors/evaluations');
      const programName = data.my_program ? data.my_program.nombre : 'Sin programa asignado';

      let teachers = data.teachers || [];

      // Ordenamiento por defecto: Alfabético ascendente (A-Z)
      teachers.sort((a, b) => {
        const nameA = `${a.nombres || ''} ${a.apellidos || ''}`.trim().toLowerCase();
        const nameB = `${b.nombres || ''} ${b.apellidos || ''}`.trim().toLowerCase();
        return nameA.localeCompare(nameB);
      });

      Views['director-evaluations']._teachers = teachers;

      // KPIs
      const totalTeachers = teachers.length;
      let totalPuntaje = 0;
      let totalParticipacion = 0;
      let ratedTeachers = 0;

      for (const t of teachers) {
        if (t.puntaje != null) {
          totalPuntaje += Number(t.puntaje);
          ratedTeachers++;
        }
        if (t.participacion) {
          totalParticipacion += Number(t.participacion);
        }
      }

      const avgPuntaje = ratedTeachers > 0 ? (totalPuntaje / ratedTeachers).toFixed(1) : '—';

      const metricCards = [
        {
          label: 'Docentes Evaluados',
          value: String(totalTeachers),
          hint: 'Docentes asignados al programa',
          icon: 'users',
          tone: 'indigo'
        },
        {
          label: 'Promedio Docentes Evaluados',
          value: String(avgPuntaje),
          hint: 'Media de evaluaciones',
          icon: 'star',
          tone: 'emerald'
        },
        {
          label: 'Participación Estudiantil',
          value: String(totalParticipacion),
          hint: 'Total de evaluaciones recibidas',
          icon: 'message-square-check',
          tone: 'amber'
        }
      ];

      const toneRing = {
        indigo: 'border-indigo-100 bg-indigo-50/80 text-indigo-700',
        emerald: 'border-emerald-100 bg-emerald-50/80 text-emerald-700',
        amber: 'border-amber-100 bg-amber-50/80 text-amber-800'
      };

      return `
        <div id="director-evals-root" class="space-y-10 animate-fade-in">
          <section class="relative overflow-hidden rounded-[40px] bg-slate-900 p-10 md:p-12 text-white shadow-3xl">
              <div class="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent"></div>
              <div class="relative z-10">
                  <div class="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-emerald-400/20">
                      <i data-lucide="award" class="w-3 h-3"></i> Calidad Académica
                  </div>
                  <h2 class="text-3xl md:text-5xl font-black mb-3 tracking-tight leading-tight">Evaluación <span class="text-[#fab720]">Docente</span></h2>
                  <p class="text-slate-400 text-base md:text-lg max-w-2xl">
                      Métricas y resultados de las encuestas de evaluación docente para el programa <strong>${escapeHtml(programName)}</strong> en el periodo activo.
                  </p>
              </div>
          </section>

          <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
              ${metricCards.map((m) => `
              <div class="rounded-2xl border ${toneRing[m.tone]} p-6 shadow-sm flex flex-col gap-2">
                  <div class="flex items-center justify-between gap-2">
                      <span class="text-[10px] font-black uppercase tracking-widest opacity-80">${escapeHtml(m.label)}</span>
                      <span class="rounded-lg bg-white/70 p-2 border border-black/5"><i data-lucide="${m.icon}" class="w-5 h-5"></i></span>
                  </div>
                  <p class="text-4xl font-black tracking-tight">${escapeHtml(m.value)}</p>
                  <p class="text-xs font-medium opacity-90 leading-snug">${escapeHtml(m.hint)}</p>
              </div>`).join('')}
          </section>

          <div class="card-premium border-slate-200 overflow-hidden">
              <div class="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 border-b border-slate-100/80">
                  <div class="min-w-0 flex-1">
                      <h3 class="text-xl font-bold text-slate-900">Listado de Docentes</h3>
                      <p id="evals-subtitle" class="text-sm text-slate-500 mt-1" data-total="${teachers.length}">${teachers.length} docente(s) evaluados</p>
                  </div>
                  <div class="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                      <label class="relative block w-full sm:w-80">
                          <span class="sr-only">Buscar docente</span>
                          <i data-lucide="search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"></i>
                          <input type="search" id="evals-search-input" autocomplete="off" placeholder="Buscar por nombre o apellido…" class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-slate-800 shadow-sm outline-none ring-indigo-500/0 transition-shadow placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20" />
                      </label>
                  </div>
              </div>
              
              <div class="p-6 bg-slate-50/40 min-h-[20rem]">
                  ${teachers.length === 0
          ? '<p class="text-center text-slate-500 py-10">No se encontraron evaluaciones para los docentes de este programa.</p>'
          : `<div id="evals-grid" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          ${teachers.map(t => buildDirectorTeacherCardHtml(t)).join('')}
                         </div>
                         <p id="evals-empty-msg" class="hidden text-center text-slate-500 py-10">Ningún docente coincide con la búsqueda.</p>`
        }
              </div>
              
              ${teachers.length > 10 ? `
              <div id="evals-footer" class="border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:px-6">
                  <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div class="flex flex-wrap items-center gap-2">
                          <label for="evals-page-size" class="text-[10px] font-black uppercase tracking-widest text-slate-500">Mostrar</label>
                          <select id="evals-page-size" class="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 shadow-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20">
                              <option value="10">10</option>
                              <option value="20">20</option>
                              <option value="50">50</option>
                              <option value="100">100</option>
                          </select>
                          <span class="text-xs font-medium text-slate-500">por página</span>
                      </div>
                      <div id="evals-pagination" class="flex flex-wrap items-center justify-center gap-2 lg:justify-end"></div>
                  </div>
              </div>` : ''}
          </div>
        </div>
      `;
    } catch (err) {
      return `<div class="p-20 text-center text-red-500 font-bold">Error cargando evaluaciones: ${escapeHtml(err.message)}</div>`;
    }
  },

  afterRender() {
    const searchInput = document.getElementById('evals-search-input');
    const grid = document.getElementById('evals-grid');
    const emptyMsg = document.getElementById('evals-empty-msg');
    const subtitle = document.getElementById('evals-subtitle');
    const pageSizeSelect = document.getElementById('evals-page-size');
    const paginationContainer = document.getElementById('evals-pagination');
    const footer = document.getElementById('evals-footer');
    
    const allTeachers = Views['director-evaluations']._teachers || [];
    const totalTeachers = Number(subtitle?.getAttribute('data-total')) || allTeachers.length;

    const evalsState = {
      page: 1,
      pageSize: 10,
      query: ''
    };

    function getFilteredTeachers() {
      return allTeachers.filter(t => {
        if (!evalsState.query) return true;
        const hay = `${t.nombres} ${t.apellidos}`.toLowerCase();
        return hay.includes(evalsState.query);
      });
    }

    function renderPaginationControls(totalPages, currentPage, totalFiltered) {
      if (!paginationContainer) return;
      
      if (totalPages <= 1 && totalFiltered <= evalsState.pageSize) {
        paginationContainer.innerHTML = `<span class="text-xs font-medium text-slate-500">${totalFiltered === 0 ? '' : `Mostrando ${totalFiltered} docente(s)`}</span>`;
        return;
      }

      const prevDisabled = currentPage <= 1;
      const nextDisabled = currentPage >= totalPages;
      const pages = [];
      const maxButtons = 5;
      let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
      let end = Math.min(totalPages, start + maxButtons - 1);
      if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);

      for (let p = start; p <= end; p += 1) {
        const active = p === currentPage;
        pages.push(
          `<button type="button" data-evals-page="${p}" class="min-w-[2.25rem] rounded-lg px-2 py-2 text-sm font-bold transition-colors ${active
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'border border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/60'
          }">${p}</button>`
        );
      }

      paginationContainer.innerHTML = `
        <div class="flex w-full max-w-full flex-wrap items-center justify-center gap-2 sm:justify-end">
        <button type="button" data-evals-page-nav="prev" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm transition-colors hover:border-indigo-200 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40" ${prevDisabled ? 'disabled' : ''}>Anterior</button>
        <div class="flex flex-wrap items-center justify-center gap-1">${pages.join('')}</div>
        <button type="button" data-evals-page-nav="next" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm transition-colors hover:border-indigo-200 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40" ${nextDisabled ? 'disabled' : ''}>Siguiente</button>
        <span class="w-full basis-full text-center text-xs font-medium text-slate-500 sm:basis-auto sm:w-auto sm:text-left">Página ${currentPage} de ${totalPages} · ${totalFiltered} docente(s)</span>
        </div>`;
    }

    function renderEvals() {
      if (!grid) return;

      const filtered = getFilteredTeachers();
      const totalFiltered = filtered.length;
      const totalPages = Math.max(1, Math.ceil(totalFiltered / evalsState.pageSize) || 1);
      
      if (evalsState.page > totalPages) evalsState.page = totalPages;
      if (evalsState.page < 1) evalsState.page = 1;

      const start = (evalsState.page - 1) * evalsState.pageSize;
      const pageSlice = filtered.slice(start, start + evalsState.pageSize);

      if (subtitle) {
        const q = evalsState.query.trim();
        if (q) {
          subtitle.textContent = `${totalFiltered} coincidencia(s) de ${totalTeachers} docente(s) evaluados`;
        } else {
          subtitle.textContent = `${totalTeachers} docente(s) evaluados`;
        }
      }

      if (totalTeachers === 0) {
        grid.innerHTML = '<p class="text-center text-slate-500 py-10">No se encontraron evaluaciones para los docentes de este programa.</p>';
        if (footer) footer.classList.add('hidden');
        lucide.createIcons();
        return;
      }

      if (totalFiltered === 0) {
        grid.innerHTML = '';
        emptyMsg?.classList.remove('hidden');
        if (footer) footer.classList.add('hidden');
        lucide.createIcons();
        return;
      }

      emptyMsg?.classList.add('hidden');
      grid.innerHTML = pageSlice.map(t => buildDirectorTeacherCardHtml(t)).join('');
      
      if (footer && totalTeachers > 10) {
        footer.classList.remove('hidden');
        renderPaginationControls(totalPages, evalsState.page, totalFiltered);
      }
      
      lucide.createIcons();
    }

    let debounce;
    searchInput?.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        evalsState.query = searchInput.value.trim().toLowerCase();
        evalsState.page = 1;
        renderEvals();
      }, 200);
    });

    if (pageSizeSelect) {
      pageSizeSelect.value = String(evalsState.pageSize);
      pageSizeSelect.addEventListener('change', () => {
        const v = Number(pageSizeSelect.value);
        evalsState.pageSize = [10, 20, 50, 100].includes(v) ? v : 10;
        evalsState.page = 1;
        renderEvals();
      });
    }

    paginationContainer?.addEventListener('click', (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const nav = t.closest('[data-evals-page-nav]');
      const pageBtn = t.closest('[data-evals-page]');
      const filtered = getFilteredTeachers();
      const totalPages = Math.max(1, Math.ceil(filtered.length / evalsState.pageSize));

      if (nav) {
        const dir = nav.getAttribute('data-evals-page-nav');
        if (dir === 'prev' && evalsState.page > 1) evalsState.page -= 1;
        if (dir === 'next' && evalsState.page < totalPages) evalsState.page += 1;
      } else if (pageBtn) {
        const p = Number(pageBtn.getAttribute('data-evals-page'));
        if (Number.isFinite(p) && p >= 1 && p <= totalPages) evalsState.page = p;
      } else return;

      renderEvals();
    });

    renderEvals();
    lucide.createIcons();
  }
};
