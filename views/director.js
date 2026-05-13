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

Views.director = {
  async render() {
    try {
      const data = await API.get('/directors/dashboard');
      const programName = data.my_program ? data.my_program.nombre : 'Sin programa asignado';
      const students = data.students || [];
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

      const studentsHtml =
        students.length === 0
          ? `<p class="px-6 py-10 text-center text-slate-500 font-medium">No hay estudiantes asignados a este programa aún.</p>`
          : `<div class="grid gap-4 md:grid-cols-2 p-6 pt-0">
              ${students
                .map((st) => {
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
                })
                .join('')}
            </div>`;

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
                    <button type="button" id="director-toggle-plantel" class="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-slate-50/80 transition-colors" aria-expanded="false" aria-controls="director-plantel-panel">
                        <div>
                            <h3 class="text-xl font-bold text-slate-900">Plantel estudiantil</h3>
                            <p class="text-sm text-slate-500 mt-1">${students.length} estudiante(s) · despliega para ver promedios y notas</p>
                        </div>
                        <i data-lucide="chevron-down" id="director-plantel-chevron" class="w-6 h-6 text-slate-400 shrink-0 transition-transform"></i>
                    </button>
                    <div id="director-plantel-panel" class="hidden border-t border-slate-100 bg-white">
                        ${studentsHtml}
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
    const plantelPanel = document.getElementById('director-plantel-panel');
    const plantelChev = document.getElementById('director-plantel-chevron');
    const gradesLoaded = new Set();

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

    plantelBtn?.addEventListener('click', () => {
      plantelPanel.classList.toggle('hidden');
      const expanded = !plantelPanel.classList.contains('hidden');
      plantelBtn.setAttribute('aria-expanded', String(expanded));
      if (plantelChev) plantelChev.classList.toggle('rotate-180', expanded);
      lucide.createIcons();
    });

    root.querySelectorAll('.director-student-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-persona-id');
        const body = document.getElementById(`director-student-body-${id}`);
        const chev = btn.querySelector('.director-stu-chev');
        if (!body) return;
        const willOpen = body.classList.contains('hidden');
        body.classList.toggle('hidden', !willOpen);
        btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        if (chev) chev.classList.toggle('rotate-180', willOpen);
        lucide.createIcons();
      });
    });

    root.querySelectorAll('.director-grades-toggle').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-persona-id');
        const wrap = document.getElementById(`director-grades-wrap-${id}`);
        const box = document.getElementById(`director-grades-${id}`);
        const chev = btn.querySelector('.director-grades-chev');
        if (!wrap || !box) return;

        const willOpen = wrap.classList.contains('hidden');
        if (!willOpen) {
          wrap.classList.add('hidden');
          btn.setAttribute('aria-expanded', 'false');
          if (chev) chev.classList.remove('rotate-180');
          return;
        }

        wrap.classList.remove('hidden');
        btn.setAttribute('aria-expanded', 'true');
        if (chev) chev.classList.add('rotate-180');

        if (!gradesLoaded.has(id)) {
          box.innerHTML = 'Cargando…';
          try {
            const rows = await API.get(`/students/${id}/grades`);
            gradesLoaded.add(id);
            box.innerHTML = renderGradesHtml(rows);
          } catch (e) {
            box.innerHTML = `<p class="text-red-600 font-medium">${escapeHtml(e.message || 'Error al cargar notas')}</p>`;
          }
        }
        lucide.createIcons();
      });
    });

    lucide.createIcons();
  }
};
