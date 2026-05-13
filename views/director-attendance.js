/**
 * Director — Asistencias del programa (periodo activo). Alertas si inasistencias > umbral.
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

function pctPresentes(presentes, total) {
  const t = Number(total);
  const p = Number(presentes);
  if (!Number.isFinite(t) || t <= 0) return null;
  return Math.round((p / t) * 100);
}

const UMBRAL_INASISTENCIAS = 3;

/**
 * Si el backend aún no expone GET /directors/attendance (404 en producción o servidor antiguo),
 * arma el mismo payload con dashboard + asistencia por estudiante (periodo activo en BD).
 */
async function loadAttendanceAggregatedFallback() {
  const dash = await API.get('/directors/dashboard');
  const studentsBase = dash.students || [];
  const rows = await Promise.all(
    studentsBase.map(async (st) => {
      const pid = st.persona_id;
      let presentes = 0;
      let inasistencias = 0;
      try {
        const list = await API.get(`/students/${pid}/attendance`, { silent: true });
        for (const r of list || []) {
          if (r.tipo === 'presente') presentes += 1;
          else if (r.tipo) inasistencias += 1;
        }
      } catch {
        /* sin datos de asistencia para este estudiante */
      }
      return {
        persona_id: pid,
        nombres: st.nombres,
        apellidos: st.apellidos,
        codigo: st.codigo,
        presentes,
        inasistencias,
        alerta_alta_inasistencia: inasistencias > UMBRAL_INASISTENCIAS,
        total_registros: presentes + inasistencias
      };
    })
  );
  rows.sort((a, b) => b.inasistencias - a.inasistencias || String(a.apellidos).localeCompare(String(b.apellidos)));
  const summary = {
    total_estudiantes: rows.length,
    estudiantes_con_alerta: rows.filter((s) => s.alerta_alta_inasistencia).length,
    total_inasistencias: rows.reduce((acc, s) => acc + s.inasistencias, 0),
    total_presentes: rows.reduce((acc, s) => acc + s.presentes, 0)
  };
  return {
    my_program: dash.my_program,
    students: rows,
    summary,
    umbral_alerta: UMBRAL_INASISTENCIAS
  };
}

async function loadDirectorAttendancePayload() {
  try {
    return await API.get('/directors/attendance', { silent: true });
  } catch (e) {
    if (e.status === 404) return loadAttendanceAggregatedFallback();
    throw e;
  }
}

Views['director-attendance'] = {
  async render() {
    try {
      const data = await loadDirectorAttendancePayload();
      const programName = data.my_program ? data.my_program.nombre : 'Sin programa asignado';
      const students = data.students || [];
      const summary = data.summary || {};
      const umbral = data.umbral_alerta ?? 3;
      const alertCount = summary.estudiantes_con_alerta ?? 0;
      const totalPct =
        summary.total_presentes + summary.total_inasistencias > 0
          ? Math.round(
              (summary.total_presentes /
                (summary.total_presentes + summary.total_inasistencias)) *
                100
            )
          : null;

      const cards = [
        {
          label: 'Estudiantes',
          value: String(summary.total_estudiantes ?? students.length),
          hint: 'Programa académico',
          icon: 'users',
          ring: 'border-indigo-100 bg-indigo-50/90 text-indigo-800'
        },
        {
          label: 'Alertas (> ' + umbral + ' inasist.)',
          value: String(alertCount),
          hint: alertCount ? 'Revisar seguimiento' : 'Sin alertas activas',
          icon: 'alert-triangle',
          ring: alertCount ? 'border-red-200 bg-red-50 text-red-900' : 'border-emerald-100 bg-emerald-50 text-emerald-800'
        },
        {
          label: 'Asistencias registradas',
          value: String(summary.total_presentes ?? 0),
          hint: 'Periodo lectivo activo',
          icon: 'check-circle',
          ring: 'border-emerald-100 bg-emerald-50 text-emerald-900'
        },
        {
          label: 'Inasistencias',
          value: String(summary.total_inasistencias ?? 0),
          hint: totalPct != null ? `Tasa asistencia global ~${totalPct}%` : 'Sin registros aún',
          icon: 'x-circle',
          ring: 'border-amber-100 bg-amber-50 text-amber-900'
        }
      ];

      const alertBanner =
        alertCount > 0
          ? `
        <div class="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 flex flex-wrap items-center gap-3 text-red-900">
          <span class="inline-flex items-center justify-center rounded-xl bg-red-100 p-2"><i data-lucide="bell-ring" class="w-5 h-5"></i></span>
          <div>
            <p class="font-black text-sm uppercase tracking-wide">Atención</p>
            <p class="text-sm font-medium">${alertCount} estudiante(s) superan ${umbral} inasistencias en el periodo activo.</p>
          </div>
        </div>`
          : '';

      const grid =
        students.length === 0
          ? `<p class="text-center text-slate-500 py-16 font-medium">No hay estudiantes en este programa o sin datos de asistencia.</p>`
          : `<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          ${students
            .map((st) => {
              const pid = st.persona_id;
              const pct = pctPresentes(st.presentes, st.total_registros);
              const alert = st.alerta_alta_inasistencia;
              return `
            <button type="button"
              class="director-att-card text-left rounded-2xl border p-4 transition-all hover:shadow-md hover:border-indigo-200 bg-white group ${
                alert ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-200'
              }"
              data-persona-id="${pid}"
              data-student-label="${escapeHtml(st.nombres + ' ' + st.apellidos)}">
              <div class="flex items-start justify-between gap-2 mb-2">
                <div class="min-w-0">
                  <p class="font-bold text-slate-900 truncate">${escapeHtml(st.nombres)} ${escapeHtml(st.apellidos)}</p>
                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">${escapeHtml(st.codigo || '—')}</p>
                </div>
                ${
                  alert
                    ? `<span class="shrink-0 inline-flex items-center gap-1 rounded-full bg-red-100 text-red-800 text-[10px] font-black uppercase px-2 py-1"><i data-lucide="alert-circle" class="w-3 h-3"></i> Alerta</span>`
                    : `<span class="shrink-0 inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase px-2 py-1">OK</span>`
                }
              </div>
              <div class="flex items-end justify-between gap-3 mt-3">
                <div>
                  <p class="text-[10px] font-black uppercase text-slate-400">Inasistencias</p>
                  <p class="text-2xl font-black ${alert ? 'text-red-600' : 'text-slate-800'}">${st.inasistencias}</p>
                </div>
                <div class="text-right">
                  <p class="text-[10px] font-black uppercase text-slate-400">% asist.</p>
                  <p class="text-lg font-black text-emerald-700">${pct != null ? pct + '%' : '—'}</p>
                </div>
              </div>
              <p class="text-[11px] text-slate-500 mt-2 font-medium">Clic para ver detalle por materia y fechas</p>
            </button>`;
            })
            .join('')}
        </div>`;

      return `
        <div id="director-attendance-root" class="space-y-8 animate-fade-in">
          <section class="relative overflow-hidden rounded-[32px] bg-slate-900 p-8 md:p-10 text-white shadow-2xl">
            <div class="absolute top-0 right-0 w-2/5 h-full bg-gradient-to-l from-teal-500/10 to-transparent"></div>
            <div class="relative z-10">
              <div class="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-teal-400/20">
                <i data-lucide="clipboard-check" class="w-3 h-3"></i> Control de asistencia
              </div>
              <h2 class="text-3xl md:text-4xl font-black mb-2 tracking-tight">${escapeHtml(programName)}</h2>
              <p class="text-slate-400 text-sm md:text-base max-w-2xl">
                Indicadores del periodo lectivo activo. Las tarjetas son compactas; el detalle se carga al hacer clic.
              </p>
            </div>
          </section>

          ${alertBanner}

          <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            ${cards
              .map(
                (c) => `
            <div class="rounded-2xl border ${c.ring} p-5 shadow-sm">
              <div class="flex items-center justify-between gap-2 mb-2">
                <span class="text-[10px] font-black uppercase tracking-widest opacity-90">${escapeHtml(c.label)}</span>
                <i data-lucide="${c.icon}" class="w-5 h-5 opacity-80"></i>
              </div>
              <p class="text-3xl font-black">${escapeHtml(c.value)}</p>
              <p class="text-xs font-medium mt-1 opacity-90">${escapeHtml(c.hint)}</p>
            </div>`
              )
              .join('')}
          </section>

          <div class="card-premium border-slate-200">
            <div class="px-6 py-5 border-b border-slate-100">
              <h3 class="text-lg font-black text-slate-900">Estudiantes</h3>
              <p class="text-sm text-slate-500">Orden: mayor número de inasistencias primero</p>
            </div>
            <div class="p-6">${grid}</div>
          </div>

          <div id="director-att-modal" class="fixed inset-0 z-[100] hidden items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" aria-hidden="true">
            <div class="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
              <div class="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div>
                  <p class="text-[10px] font-black uppercase text-slate-400 tracking-widest">Detalle de asistencias</p>
                  <h4 id="director-att-modal-title" class="text-lg font-black text-slate-900">—</h4>
                </div>
                <button type="button" id="director-att-modal-close" class="rounded-xl p-2 text-slate-500 hover:bg-slate-200 transition-colors">
                  <i data-lucide="x" class="w-5 h-5"></i>
                </button>
              </div>
              <div id="director-att-modal-body" class="overflow-y-auto p-6 text-sm text-slate-600">Cargando…</div>
            </div>
          </div>
        </div>`;
    } catch (err) {
      return `<div class="p-12 text-center text-red-600 font-bold">Error: ${escapeHtml(err.message)}</div>`;
    }
  },

  afterRender() {
    const root = document.getElementById('director-attendance-root');
    const modal = document.getElementById('director-att-modal');
    const modalBody = document.getElementById('director-att-modal-body');
    const modalTitle = document.getElementById('director-att-modal-title');
    const btnClose = document.getElementById('director-att-modal-close');

    function closeModal() {
      if (!modal) return;
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      modal.setAttribute('aria-hidden', 'true');
    }

    function openModal() {
      if (!modal) return;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      modal.setAttribute('aria-hidden', 'false');
    }

    function renderDetailRows(rows) {
      if (!Array.isArray(rows) || rows.length === 0) {
        return '<p class="text-slate-500">No hay registros de asistencia en el periodo activo.</p>';
      }
      const byMat = {};
      for (const r of rows) {
        const m = r.materia || '—';
        if (!byMat[m]) byMat[m] = [];
        byMat[m].push(r);
      }
      return Object.keys(byMat)
        .sort()
        .map((mat) => {
          const lines = byMat[mat]
            .map((r) => {
              const tipo = r.tipo || '';
              const isPres = tipo === 'presente';
              const label =
                tipo === 'ausente_justificada'
                  ? 'Ausente (just.)'
                  : tipo === 'ausente_no_justificada'
                    ? 'Ausente'
                    : isPres
                      ? 'Presente'
                      : escapeHtml(tipo);
              return `<tr class="border-b border-slate-100">
              <td class="py-2 pr-2">${escapeHtml(r.fecha || '—')}</td>
              <td class="py-2 px-2"><span class="font-semibold ${isPres ? 'text-emerald-700' : 'text-red-700'}">${label}</span></td>
            </tr>`;
            })
            .join('');
          return `
          <div class="mb-6 last:mb-0">
            <p class="text-xs font-black uppercase tracking-widest text-indigo-600 mb-2">${escapeHtml(mat)}</p>
            <table class="w-full text-left">
              <thead><tr class="text-[10px] font-black uppercase text-slate-400 border-b border-slate-200"><th class="pb-2">Fecha</th><th class="pb-2">Estado</th></tr></thead>
              <tbody>${lines}</tbody>
            </table>
          </div>`;
        })
        .join('');
    }

    btnClose?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    root?.querySelectorAll('.director-att-card').forEach((card) => {
      card.addEventListener('click', async () => {
        const id = card.getAttribute('data-persona-id');
        const label = card.getAttribute('data-student-label') || 'Estudiante';
        if (!id || !modalBody) return;
        modalTitle.textContent = label;
        modalBody.innerHTML = 'Cargando…';
        openModal();
        lucide.createIcons();
        try {
          const rows = await API.get(`/students/${id}/attendance`);
          modalBody.innerHTML = renderDetailRows(rows);
        } catch (e) {
          modalBody.innerHTML = `<p class="text-red-600 font-medium">${escapeHtml(e.message || 'Error')}</p>`;
        }
        lucide.createIcons();
      });
    });

    lucide.createIcons();
  }
};
