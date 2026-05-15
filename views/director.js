/**
 * Director dashboard: métricas en cards y plantel con despliegue progresivo (datos desde API/BD).
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

function fmtProm(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v.toFixed(1) : '—';
}

function avgProgramProm(students) {
  const vals = (students || [])
    .map((st) => Number(st.promedio_acumulado))
    .filter((v) => Number.isFinite(v));
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function countMatriculasActivas(students) {
  return (students || []).reduce((acc, st) => acc + (Array.isArray(st.courses) ? st.courses.length : 0), 0);
}

function countByEstado(students) {
  const m = {};
  for (const st of students || []) {
    const k = st.estado || 'sin_registro';
    m[k] = (m[k] || 0) + 1;
  }
  return m;
}

/** Una tarjeta de estudiante (HTML) para el plantel del director. */
function buildDirectorStudentCardHtml(st) {
  const pid = st.persona_id;
  const courses = Array.isArray(st.courses) ? st.courses : [];
  const coursesRows = courses
    .map(
      (c) => `
                    <tr class="border-b border-slate-100 last:border-0">
                      <td class="py-3 pr-3 text-sm font-semibold text-slate-800">${escapeHtml(c.materia)}</td>
                      <td class="py-3 px-2 text-xs text-slate-500">${escapeHtml(c.nrc || '—')}</td>
                      <td class="py-3 px-2 text-xs text-slate-600 hidden sm:table-cell">${escapeHtml(c.docente || '—')}</td>
                      <td class="py-3 pl-2 text-right text-sm font-black ${Number(c.promedio) < 3 ? 'text-red-600' : 'text-slate-900'}">${fmtProm(c.promedio)}</td>
                    </tr>`
    )
    .join('');

  return `
                <article class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden" data-director-student-card="${pid}">
                  <button type="button" class="director-student-toggle w-full text-left px-5 py-4 flex items-start justify-between gap-3 hover:bg-slate-50/80 transition-colors" data-persona-id="${pid}" aria-expanded="false">
                    <div class="min-w-0 flex-1">
                      <p class="font-bold text-slate-900 truncate">${escapeHtml(st.nombres)} ${escapeHtml(st.apellidos)}</p>
                      <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Código ${escapeHtml(st.codigo || '—')} · Sem. ${escapeHtml(String(st.semestre_actual ?? '—'))} · ${escapeHtml(st.estado || '—')}</p>
                    </div>
                    <div class="flex items-center gap-3 shrink-0">
                      <div class="text-right">
                        <p class="text-[10px] font-black uppercase text-slate-400">Prom. acum.</p>
                        <p class="text-xl font-black ${Number(st.promedio_acumulado) < 3 ? 'text-red-600' : 'text-emerald-600'}">${fmtProm(st.promedio_acumulado)}</p>
                      </div>
                      <i data-lucide="chevron-down" class="director-stu-chev w-5 h-5 text-slate-400 transition-transform"></i>
                    </div>
                  </button>
                  <div id="director-student-body-${pid}" class="hidden border-t border-slate-100 bg-slate-50/40">
                    <div class="px-5 py-4">
                      <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Cursos (periodo activo)</p>
                      ${
                        courses.length === 0
                          ? '<p class="text-sm text-slate-500">Sin matrículas en el periodo activo.</p>'
                          : `<div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                          <table class="w-full text-left min-w-[320px]">
                            <thead>
                              <tr class="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                <th class="py-2 pl-3">Materia</th>
                                <th class="py-2 px-2">NRC</th>
                                <th class="py-2 px-2 hidden sm:table-cell">Docente</th>
                                <th class="py-2 pr-3 text-right">Prom.</th>
                              </tr>
                            </thead>
                            <tbody>${coursesRows}</tbody>
                          </table>
                        </div>`
                      }
                      <div class="mt-4">
                        <button type="button" class="director-grades-toggle inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800" data-persona-id="${pid}" aria-expanded="false">
                          <i data-lucide="list" class="w-4 h-4"></i>
                          <span>Notas por componente (detalle)</span>
                          <i data-lucide="chevron-down" class="director-grades-chev w-4 h-4 transition-transform"></i>
                        </button>
                        <div id="director-grades-wrap-${pid}" class="hidden mt-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                          <div id="director-grades-${pid}" class="director-grades-content text-slate-500 text-sm">Cargando…</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>`;
}

Views.director = {
  async render() {
    try {
      const data = await API.get('/directors/dashboard');
      const programName = data.my_program ? data.my_program.nombre : 'Sin programa asignado';
      const students = data.students || [];
      Views.director._plantelStudents = students;
      const avgProg = avgProgramProm(students);
      const totalMatriculas = countMatriculasActivas(students);
      const estadoProg = countByEstado(students);
      const activos = estadoProg.activo ?? 0;

      const metricCards = [
        {
          label: 'Estudiantes en el programa',
          value: String(students.length),
          hint: data.my_program ? 'Registrados en este programa' : 'Sin programa vinculado al director',
          icon: 'users',
          tone: 'indigo'
        },
        {
          label: 'Promedio acumulado (programa)',
          value: avgProg != null ? fmtProm(avgProg) : '—',
          hint: 'Media de promedio_acumulado en BD',
          icon: 'trending-up',
          tone: 'emerald'
        },
        {
          label: 'Matrículas periodo activo',
          value: String(totalMatriculas),
          hint: 'Inscripciones en cursos del periodo lectivo activo',
          icon: 'book-open',
          tone: 'amber'
        },
        {
          label: 'Estudiantes activos',
          value: String(activos),
          hint: 'Estado académico "activo" en BD',
          icon: 'user-check',
          tone: 'slate'
        }
      ];

      const toneRing = {
        indigo: 'border-indigo-100 bg-indigo-50/80 text-indigo-700',
        emerald: 'border-emerald-100 bg-emerald-50/80 text-emerald-700',
        amber: 'border-amber-100 bg-amber-50/80 text-amber-800',
        slate: 'border-slate-200 bg-slate-50 text-slate-700'
      };

      return `
            <div id="director-dashboard-root" class="space-y-10 animate-fade-in">
                <section class="relative overflow-hidden rounded-[40px] bg-slate-900 p-10 md:p-12 text-white shadow-3xl">
                    <div class="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent"></div>
                    <div class="relative z-10">
                        <div class="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-emerald-400/20">
                            <i data-lucide="shield-check" class="w-3 h-3"></i> Dirección académica
                        </div>
                        <h2 class="text-3xl md:text-5xl font-black mb-3 tracking-tight leading-tight">Resumen de <span class="text-[#fab720]">${escapeHtml(programName)}</span></h2>
                        <p class="text-slate-400 text-base md:text-lg max-w-2xl">
                            Indicadores consolidados desde la base de datos. El detalle del plantel se consulta al desplegar cada bloque.
                        </p>
                    </div>
                </section>

                <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    ${metricCards
                      .map(
                        (m) => `
                    <div class="rounded-2xl border ${toneRing[m.tone]} p-5 shadow-sm flex flex-col gap-2">
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-[10px] font-black uppercase tracking-widest opacity-80">${escapeHtml(m.label)}</span>
                            <span class="rounded-lg bg-white/70 p-2 border border-black/5"><i data-lucide="${m.icon}" class="w-4 h-4"></i></span>
                        </div>
                        <p class="text-3xl font-black tracking-tight">${escapeHtml(m.value)}</p>
                        <p class="text-xs font-medium opacity-90 leading-snug">${escapeHtml(m.hint)}</p>
                    </div>`
                      )
                      .join('')}
                </section>

                <div class="card-premium border-slate-200 overflow-hidden">
                    <div class="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 hover:bg-slate-50/80 transition-colors border-b border-slate-100/80">
                        <button type="button" id="director-toggle-plantel" class="min-w-0 flex-1 text-left" aria-expanded="false" aria-controls="director-plantel-panel">
                            <h3 class="text-xl font-bold text-slate-900">Plantel estudiantil</h3>
                            <p id="director-plantel-subtitle" class="text-sm text-slate-500 mt-1" data-total="${students.length}">${students.length} estudiante(s) · despliega para ver promedios y notas</p>
                        </button>
                        <div class="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                            <label class="relative block w-full sm:w-64">
                                <span class="sr-only">Buscar estudiante</span>
                                <i data-lucide="search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"></i>
                                <input type="search" id="director-plantel-search" autocomplete="off" placeholder="Buscar por nombre, código o ID…" class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-slate-800 shadow-sm outline-none ring-indigo-500/0 transition-shadow placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20" />
                            </label>
                            <button type="button" id="director-plantel-chevron-btn" class="inline-flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-700 sm:self-auto" aria-expanded="false" aria-controls="director-plantel-panel" aria-label="Desplegar o contraer plantel estudiantil">
                                <i data-lucide="chevron-down" id="director-plantel-chevron" class="h-6 w-6 transition-transform"></i>
                            </button>
                        </div>
                    </div>
                    <div id="director-plantel-panel" class="hidden border-t border-slate-100 bg-white">
                        <div id="director-plantel-grid" class="min-h-[4rem]"></div>
                        <div id="director-plantel-footer" class="hidden border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:px-6">
                            <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div class="flex flex-wrap items-center gap-2">
                                    <label for="director-plantel-page-size" class="text-[10px] font-black uppercase tracking-widest text-slate-500">Mostrar</label>
                                    <select id="director-plantel-page-size" class="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 shadow-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20">
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="100">100</option>
                                    </select>
                                    <span class="text-xs font-medium text-slate-500">por página</span>
                                </div>
                                <div id="director-plantel-pagination" class="flex flex-wrap items-center justify-center gap-2 lg:justify-end"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    } catch (err) {
      return `<div class="p-20 text-center text-red-500 font-bold">Error cargando dashboard: ${escapeHtml(err.message)}</div>`;
    }
  },

  afterRender() {
    const root = document.getElementById('director-dashboard-root');
    if (!root) {
      lucide.createIcons();
      return;
    }

    const plantelBtn = document.getElementById('director-toggle-plantel');
    const plantelChevronBtn = document.getElementById('director-plantel-chevron-btn');
    const plantelPanel = document.getElementById('director-plantel-panel');
    const plantelChev = document.getElementById('director-plantel-chevron');
    const plantelGrid = document.getElementById('director-plantel-grid');
    const plantelFooter = document.getElementById('director-plantel-footer');
    const plantelPagination = document.getElementById('director-plantel-pagination');
    const plantelSearch = document.getElementById('director-plantel-search');
    const plantelPageSize = document.getElementById('director-plantel-page-size');
    const plantelSubtitle = document.getElementById('director-plantel-subtitle');
    const gradesLoaded = new Set();

    const cached = Views.director._plantelStudents;
    let allStudents = Array.isArray(cached) ? cached : [];

    const totalInProgram = Number(plantelSubtitle?.getAttribute('data-total')) || allStudents.length;

    const plantelState = {
      page: 1,
      pageSize: 10,
      query: ''
    };

    function directorStudentMatchesQuery(st, q) {
      if (!q || !String(q).trim()) return true;
      const needle = String(q).trim().toLowerCase();
      const blob = [
        st.nombres,
        st.apellidos,
        [st.nombres, st.apellidos].filter(Boolean).join(' '),
        st.codigo,
        st.persona_id != null ? String(st.persona_id) : ''
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return blob.includes(needle);
    }

    function getFilteredStudents() {
      return (allStudents || []).filter((st) => directorStudentMatchesQuery(st, plantelState.query));
    }

    function renderGradesHtml(rows) {
      if (!Array.isArray(rows) || rows.length === 0) {
        return '<p class="text-slate-500">No hay calificaciones registradas en el periodo activo.</p>';
      }
      const byMateria = {};
      for (const r of rows) {
        const mat = r.materia || '—';
        if (!byMateria[mat]) byMateria[mat] = [];
        byMateria[mat].push(r);
      }
      return Object.keys(byMateria)
        .sort()
        .map((mat) => {
          const list = byMateria[mat]
            .map(
              (g) => `
            <tr class="border-b border-slate-100 last:border-0">
              <td class="py-2 pr-2 text-xs font-semibold text-slate-700">${escapeHtml(g.componente || '—')}</td>
              <td class="py-2 px-2 text-right font-black text-slate-900">${fmtProm(g.valor)}</td>
              <td class="py-2 pl-2 text-xs text-slate-500 whitespace-nowrap">${escapeHtml(g.fecha || '—')}</td>
            </tr>`
            )
            .join('');
          return `
          <div class="mb-4 last:mb-0">
            <p class="text-xs font-black uppercase tracking-widest text-indigo-600 mb-2">${escapeHtml(mat)}</p>
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                  <th class="pb-1">Componente</th>
                  <th class="pb-1 text-right">Nota</th>
                  <th class="pb-1 pl-2">Fecha</th>
                </tr>
              </thead>
              <tbody>${list}</tbody>
            </table>
          </div>`;
        })
        .join('');
    }

    function setPlantelExpanded(expanded) {
      if (!plantelPanel) return;
      plantelPanel.classList.toggle('hidden', !expanded);
      plantelBtn?.setAttribute('aria-expanded', String(expanded));
      plantelChevronBtn?.setAttribute('aria-expanded', String(expanded));
      if (plantelChev) plantelChev.classList.toggle('rotate-180', expanded);
      if (expanded) renderPlantel();
      lucide.createIcons();
    }

    function togglePlantelPanel() {
      if (!plantelPanel) return;
      const expanded = plantelPanel.classList.contains('hidden');
      setPlantelExpanded(expanded);
    }

    function renderPaginationControls(totalPages, currentPage, totalFiltered) {
      if (!plantelPagination) return;
      if (totalPages <= 1 && totalFiltered <= plantelState.pageSize) {
        plantelPagination.innerHTML = `<span class="text-xs font-medium text-slate-500">${totalFiltered === 0 ? '' : `Mostrando ${totalFiltered} estudiante(s)`}</span>`;
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
          `<button type="button" data-director-page="${p}" class="min-w-[2.25rem] rounded-lg px-2 py-2 text-sm font-bold transition-colors ${
            active
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'border border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/60'
          }">${p}</button>`
        );
      }

      plantelPagination.innerHTML = `
        <div class="flex w-full max-w-full flex-wrap items-center justify-center gap-2 sm:justify-end">
        <button type="button" data-director-page-nav="prev" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm transition-colors hover:border-indigo-200 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40" ${prevDisabled ? 'disabled' : ''}>Anterior</button>
        <div class="flex flex-wrap items-center justify-center gap-1">${pages.join('')}</div>
        <button type="button" data-director-page-nav="next" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm transition-colors hover:border-indigo-200 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40" ${nextDisabled ? 'disabled' : ''}>Siguiente</button>
        <span class="w-full basis-full text-center text-xs font-medium text-slate-500 sm:basis-auto sm:w-auto sm:text-left">Página ${currentPage} de ${totalPages} · ${totalFiltered} estudiante(s)</span>
        </div>`;
    }

    function renderPlantel() {
      if (!plantelGrid) return;
      gradesLoaded.clear();

      const filtered = getFilteredStudents();
      const totalFiltered = filtered.length;
      const totalPages = Math.max(1, Math.ceil(totalFiltered / plantelState.pageSize) || 1);
      if (plantelState.page > totalPages) plantelState.page = totalPages;
      if (plantelState.page < 1) plantelState.page = 1;

      const start = (plantelState.page - 1) * plantelState.pageSize;
      const pageSlice = filtered.slice(start, start + plantelState.pageSize);

      if (plantelSubtitle) {
        const q = plantelState.query.trim();
        if (q) {
          plantelSubtitle.textContent = `${totalFiltered} coincidencia(s) de ${totalInProgram} estudiante(s) en el programa · despliega para ver promedios y notas`;
        } else {
          plantelSubtitle.textContent = `${totalInProgram} estudiante(s) · despliega para ver promedios y notas`;
        }
      }

      if (totalInProgram === 0) {
        plantelGrid.innerHTML =
          '<p class="px-6 py-10 text-center text-slate-500 font-medium">No hay estudiantes asignados a este programa aún.</p>';
        if (plantelFooter) plantelFooter.classList.add('hidden');
        lucide.createIcons();
        return;
      }

      if (totalFiltered === 0) {
        plantelGrid.innerHTML =
          '<p class="px-6 py-10 text-center text-slate-500 font-medium">Ningún estudiante coincide con la búsqueda.</p>';
        if (plantelFooter) plantelFooter.classList.add('hidden');
        lucide.createIcons();
        return;
      }

      plantelGrid.innerHTML = `<div class="grid gap-4 p-6 pt-4 md:grid-cols-2">${pageSlice.map((st) => buildDirectorStudentCardHtml(st)).join('')}</div>`;
      if (plantelFooter) plantelFooter.classList.remove('hidden');
      renderPaginationControls(totalPages, plantelState.page, totalFiltered);
      lucide.createIcons();
    }

    plantelBtn?.addEventListener('click', togglePlantelPanel);
    plantelChevronBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      togglePlantelPanel();
    });

    if (plantelPageSize) {
      plantelPageSize.value = String(plantelState.pageSize);
      plantelPageSize.addEventListener('change', () => {
        const v = Number(plantelPageSize.value);
        plantelState.pageSize = [10, 20, 100].includes(v) ? v : 10;
        plantelState.page = 1;
        if (plantelPanel && !plantelPanel.classList.contains('hidden')) renderPlantel();
      });
    }

    let searchDebounce;
    plantelSearch?.addEventListener('input', () => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        plantelState.query = plantelSearch.value || '';
        plantelState.page = 1;
        if (plantelPanel && !plantelPanel.classList.contains('hidden')) renderPlantel();
        else {
          const filtered = getFilteredStudents();
          const q = plantelState.query.trim();
          if (plantelSubtitle) {
            if (q) {
              plantelSubtitle.textContent = `${filtered.length} coincidencia(s) de ${totalInProgram} estudiante(s) en el programa · despliega para ver promedios y notas`;
            } else {
              plantelSubtitle.textContent = `${totalInProgram} estudiante(s) · despliega para ver promedios y notas`;
            }
          }
        }
      }, 200);
    });

    plantelPagination?.addEventListener('click', (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const nav = t.closest('[data-director-page-nav]');
      const pageBtn = t.closest('[data-director-page]');
      const filtered = getFilteredStudents();
      const totalPages = Math.max(1, Math.ceil(filtered.length / plantelState.pageSize));

      if (nav) {
        const dir = nav.getAttribute('data-director-page-nav');
        if (dir === 'prev' && plantelState.page > 1) plantelState.page -= 1;
        if (dir === 'next' && plantelState.page < totalPages) plantelState.page += 1;
      } else if (pageBtn) {
        const p = Number(pageBtn.getAttribute('data-director-page'));
        if (Number.isFinite(p) && p >= 1 && p <= totalPages) plantelState.page = p;
      } else return;

      if (plantelPanel && !plantelPanel.classList.contains('hidden')) renderPlantel();
    });

    root.addEventListener('click', (e) => {
      const stToggle = e.target instanceof Element ? e.target.closest('.director-student-toggle') : null;
      if (stToggle && root.contains(stToggle)) {
        const id = stToggle.getAttribute('data-persona-id');
        const body = document.getElementById(`director-student-body-${id}`);
        const chev = stToggle.querySelector('.director-stu-chev');
        if (!body) return;
        const willOpen = body.classList.contains('hidden');
        body.classList.toggle('hidden', !willOpen);
        stToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        if (chev) chev.classList.toggle('rotate-180', willOpen);
        lucide.createIcons();
        return;
      }

      const gradesBtn = e.target instanceof Element ? e.target.closest('.director-grades-toggle') : null;
      if (gradesBtn && root.contains(gradesBtn)) {
        const id = gradesBtn.getAttribute('data-persona-id');
        const wrap = document.getElementById(`director-grades-wrap-${id}`);
        const box = document.getElementById(`director-grades-${id}`);
        const chev = gradesBtn.querySelector('.director-grades-chev');
        if (!wrap || !box) return;

        const willOpen = wrap.classList.contains('hidden');
        if (!willOpen) {
          wrap.classList.add('hidden');
          gradesBtn.setAttribute('aria-expanded', 'false');
          if (chev) chev.classList.remove('rotate-180');
          return;
        }

        wrap.classList.remove('hidden');
        gradesBtn.setAttribute('aria-expanded', 'true');
        if (chev) chev.classList.add('rotate-180');

        if (!gradesLoaded.has(id)) {
          box.innerHTML = 'Cargando…';
          (async () => {
            try {
              const rows = await API.get(`/students/${id}/grades`);
              gradesLoaded.add(id);
              box.innerHTML = renderGradesHtml(rows);
            } catch (err) {
              box.innerHTML = `<p class="text-red-600 font-medium">${escapeHtml(err.message || 'Error al cargar notas')}</p>`;
            }
            lucide.createIcons();
          })();
        }
        lucide.createIcons();
      }
    });

    if (plantelPanel && !plantelPanel.classList.contains('hidden')) renderPlantel();

    lucide.createIcons();
  }
};
