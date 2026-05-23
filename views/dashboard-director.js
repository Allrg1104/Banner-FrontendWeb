/**
 * Dashboard del Director - Vista gráfica completa con métricas, alertas y gráficas
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

function countByEstado(students) {
  const m = {};
  for (const st of students || []) {
    const k = st.estado || 'sin_registro';
    m[k] = (m[k] || 0) + 1;
  }
  return m;
}

function countMatriculasActivas(students) {
  return (students || []).reduce((acc, st) => acc + (Array.isArray(st.courses) ? st.courses.length : 0), 0);
}

Views.dashboardDirector = {
  async render() {
    try {
      // Cargar datos de múltiples endpoints
      const [dashboardData, attendanceData, evalsData] = await Promise.all([
        API.get('/directors/dashboard'),
        API.get('/directors/attendance').catch(() => ({ students: [], summary: {} })),
        API.get('/directors/evaluations').catch(() => ({ teachers: [] }))
      ]);

      const programName = dashboardData.my_program ? dashboardData.my_program.nombre : 'Sin programa asignado';
      const students = dashboardData.students || [];
      const attendanceStudents = attendanceData.students || [];
      const attendanceSummary = attendanceData.summary || {};
      const teachers = evalsData.teachers || [];

      // Cálculos de métricas
      const avgProg = avgProgramProm(students);
      const totalMatriculas = countMatriculasActivas(students);
      const estadoProg = countByEstado(students);
      const activos = estadoProg.activo ?? 0;
      const inactivos = estadoProg.inactivo ?? 0;
      const riesgo = estadoProg.riesgo ?? 0;

      // Métricas de asistencia
      const totalInasistencias = attendanceSummary.total_inasistencias ?? 0;
      const totalPresentes = attendanceSummary.total_presentes ?? 0;
      const estudiantesConAlerta = attendanceSummary.estudiantes_con_alerta ?? 0;
      const asistenciaGlobal = totalPresentes + totalInasistencias > 0 
        ? Math.round((totalPresentes / (totalPresentes + totalInasistencias)) * 100) 
        : 0;

      // Métricas de evaluación docente
      const totalTeachers = teachers.length;
      let totalPuntaje = 0;
      let ratedTeachers = 0;
      for (const t of teachers) {
        if (t.puntaje != null) {
          totalPuntaje += Number(t.puntaje);
          ratedTeachers++;
        }
      }
      const avgPuntaje = ratedTeachers > 0 ? (totalPuntaje / ratedTeachers).toFixed(1) : '—';

      // Alertas
      const alertas = [];
      if (riesgo > 0) {
        alertas.push({ tipo: 'warning', icon: 'alert-triangle', mensaje: `${riesgo} estudiante(s) en riesgo académico` });
      }
      if (estudiantesConAlerta > 0) {
        alertas.push({ tipo: 'danger', icon: 'bell-ring', mensaje: `${estudiantesConAlerta} estudiante(s) con alta inasistencia` });
      }
      if (avgPuntaje !== '—' && avgPuntaje < 3.5) {
        alertas.push({ tipo: 'warning', icon: 'trending-down', mensaje: `Promedio evaluación docente bajo (${avgPuntaje})` });
      }
      if (asistenciaGlobal < 80 && (totalPresentes + totalInasistencias) > 0) {
        alertas.push({ tipo: 'warning', icon: 'activity', mensaje: `Tasa de asistencia global: ${asistenciaGlobal}%` });
      }

      // Cards de métricas principales
      const metricCards = [
        { label: 'Estudiantes Activos', value: String(activos), hint: 'Estado académico activo', icon: 'users', color: 'indigo' },
        { label: 'Promedio Programa', value: avgProg != null ? fmtProm(avgProg) : '—', hint: 'Media de promedios acumulados', icon: 'trending-up', color: 'emerald' },
        { label: 'Matrículas Activas', value: String(totalMatriculas), hint: 'Cursos del periodo', icon: 'book-open', color: 'amber' },
        { label: 'Asistencia Global', value: `${asistenciaGlobal}%`, hint: 'Tasa de asistencia', icon: 'check-circle', color: asistenciaGlobal >= 80 ? 'emerald' : 'amber' },
        { label: 'Docentes Evaluados', value: String(totalTeachers), hint: 'Evaluaciones docentes', icon: 'award', color: 'indigo' },
        { label: 'Promedio Docente', value: avgPuntaje, hint: 'Media de evaluaciones', icon: 'star', color: avgPuntaje !== '—' && avgPuntaje >= 4.0 ? 'emerald' : avgPuntaje !== '—' && avgPuntaje >= 3.0 ? 'amber' : 'red' }
      ];

      const colorMap = {
        indigo: 'border-indigo-100 bg-indigo-50/90 text-indigo-800',
        emerald: 'border-emerald-100 bg-emerald-50/90 text-emerald-800',
        amber: 'border-amber-100 bg-amber-50/90 text-amber-800',
        red: 'border-red-100 bg-red-50/90 text-red-800'
      };

      // Banner de alertas
      const alertBanner = alertas.length > 0 ? `
        <div class="space-y-3">
          ${alertas.map(a => `
            <div class="rounded-2xl border ${a.tipo === 'danger' ? 'border-red-200 bg-red-50 text-red-900' : 'border-amber-200 bg-amber-50 text-amber-900'} px-5 py-4 flex items-center gap-3">
              <span class="inline-flex items-center justify-center rounded-xl ${a.tipo === 'danger' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'} p-2">
                <i data-lucide="${a.icon}" class="w-5 h-5"></i>
              </span>
              <div>
                <p class="font-black text-sm uppercase tracking-wide">${a.tipo === 'danger' ? 'Alerta Crítica' : 'Atención Requerida'}</p>
                <p class="text-sm font-medium">${a.mensaje}</p>
              </div>
            </div>
          `).join('')}
        </div>
      ` : '';

      return `
        <div id="director-dashboard-root" class="space-y-8 animate-fade-in">
          <!-- Header -->
          <section class="relative overflow-hidden rounded-[40px] bg-slate-900 p-8 md:p-12 text-white shadow-3xl">
            <div class="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent"></div>
            <div class="relative z-10">
              <div class="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-emerald-400/20">
                <i data-lucide="layout-dashboard" class="w-3 h-3"></i> Dashboard Director
              </div>
              <h2 class="text-3xl md:text-5xl font-black mb-3 tracking-tight leading-tight">Panel de Control <span class="text-[#fab720]">${escapeHtml(programName)}</span></h2>
              <p class="text-slate-400 text-base md:text-lg max-w-2xl">
                Vista consolidada de métricas académicas, asistencia y evaluación docente en tiempo real.
              </p>
            </div>
          </section>

          <!-- Alertas -->
          ${alertBanner}

          <!-- Métricas Principales -->
          <section class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            ${metricCards.map(m => `
              <div class="rounded-2xl border ${colorMap[m.color]} p-4 shadow-sm flex flex-col gap-2">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-[9px] font-black uppercase tracking-widest opacity-80">${escapeHtml(m.label)}</span>
                  <i data-lucide="${m.icon}" class="w-4 h-4 opacity-70"></i>
                </div>
                <p class="text-2xl font-black tracking-tight">${escapeHtml(m.value)}</p>
                <p class="text-[10px] font-medium opacity-90 leading-snug">${escapeHtml(m.hint)}</p>
              </div>
            `).join('')}
          </section>

          <!-- Gráficas -->
          <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Distribución de Estados -->
            <div class="card-premium border-slate-200 p-6">
              <h3 class="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <i data-lucide="pie-chart" class="w-5 h-5 text-indigo-500"></i>
                Distribución de Estados
              </h3>
              <div class="h-64">
                <canvas id="chart-estados"></canvas>
              </div>
            </div>

            <!-- Tendencia de Asistencia -->
            <div class="card-premium border-slate-200 p-6">
              <h3 class="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <i data-lucide="bar-chart-2" class="w-5 h-5 text-emerald-500"></i>
                Asistencia vs Inasistencia
              </h3>
              <div class="h-64">
                <canvas id="chart-asistencia"></canvas>
              </div>
            </div>

            <!-- Distribución de Promedios -->
            <div class="card-premium border-slate-200 p-6">
              <h3 class="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <i data-lucide="line-chart" class="w-5 h-5 text-amber-500"></i>
                Distribución de Promedios
              </h3>
              <div class="h-64">
                <canvas id="chart-promedios"></canvas>
              </div>
            </div>

            <!-- Evaluación Docente -->
            <div class="card-premium border-slate-200 p-6">
              <h3 class="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <i data-lucide="award" class="w-5 h-5 text-[#fab720]"></i>
                Evaluación Docente
              </h3>
              <div class="h-64">
                <canvas id="chart-docentes"></canvas>
              </div>
            </div>
          </section>

          <!-- Resumen de Datos Clave -->
          <section class="card-premium border-slate-200 p-6">
            <h3 class="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <i data-lucide="database" class="w-5 h-5 text-slate-500"></i>
              Resumen de Datos
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p class="text-[10px] font-black uppercase text-slate-400 mb-1">Total Estudiantes</p>
                <p class="text-2xl font-black text-slate-900">${students.length}</p>
              </div>
              <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p class="text-[10px] font-black uppercase text-slate-400 mb-1">Estados Registrados</p>
                <p class="text-2xl font-black text-slate-900">${Object.keys(estadoProg).length}</p>
              </div>
              <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p class="text-[10px] font-black uppercase text-slate-400 mb-1">Total Inasistencias</p>
                <p class="text-2xl font-black text-slate-900">${totalInasistencias}</p>
              </div>
              <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p class="text-[10px] font-black uppercase text-slate-400 mb-1">Docentes con Evaluación</p>
                <p class="text-2xl font-black text-slate-900">${ratedTeachers}</p>
              </div>
            </div>
          </section>
        </div>
      `;
    } catch (err) {
      return `<div class="p-20 text-center text-red-500 font-bold">Error cargando dashboard: ${escapeHtml(err.message)}</div>`;
    }
  },

  afterRender() {
    lucide.createIcons();

    // Cargar datos para gráficas
    Promise.all([
      API.get('/directors/dashboard'),
      API.get('/directors/attendance').catch(() => ({ students: [], summary: {} })),
      API.get('/directors/evaluations').catch(() => ({ teachers: [] }))
    ]).then(([dashboardData, attendanceData, evalsData]) => {
      const students = dashboardData.students || [];
      const attendanceSummary = attendanceData.summary || {};
      const teachers = evalsData.teachers || [];

      // Gráfica de Distribución de Estados
      const estadoProg = {};
      for (const st of students) {
        const k = st.estado || 'sin_registro';
        estadoProg[k] = (estadoProg[k] || 0) + 1;
      }

      const ctxEstados = document.getElementById('chart-estados');
      if (ctxEstados) {
        new Chart(ctxEstados, {
          type: 'doughnut',
          data: {
            labels: Object.keys(estadoProg).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
            datasets: [{
              data: Object.values(estadoProg),
              backgroundColor: [
                '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { font: { size: 11 }, padding: 15 }
              }
            }
          }
        });
      }

      // Gráfica de Asistencia
      const ctxAsistencia = document.getElementById('chart-asistencia');
      if (ctxAsistencia) {
        new Chart(ctxAsistencia, {
          type: 'bar',
          data: {
            labels: ['Presentes', 'Inasistencias'],
            datasets: [{
              label: 'Registros',
              data: [attendanceSummary.total_presentes || 0, attendanceSummary.total_inasistencias || 0],
              backgroundColor: ['#10b981', '#ef4444'],
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      }

      // Gráfica de Distribución de Promedios
      const promedios = students.map(s => s.promedio_acumulado).filter(p => p != null);
      const rangos = { '0-2.9': 0, '3.0-3.9': 0, '4.0-4.5': 0, '4.6-5.0': 0 };
      for (const p of promedios) {
        if (p < 3.0) rangos['0-2.9']++;
        else if (p < 4.0) rangos['3.0-3.9']++;
        else if (p < 4.6) rangos['4.0-4.5']++;
        else rangos['4.6-5.0']++;
      }

      const ctxPromedios = document.getElementById('chart-promedios');
      if (ctxPromedios) {
        new Chart(ctxPromedios, {
          type: 'bar',
          data: {
            labels: Object.keys(rangos),
            datasets: [{
              label: 'Estudiantes',
              data: Object.values(rangos),
              backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'],
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      }

      // Gráfica de Evaluación Docente
      const puntajes = teachers.map(t => t.puntaje).filter(p => p != null);
      const rangosDocentes = { '0-2.9': 0, '3.0-3.9': 0, '4.0-4.5': 0, '4.6-5.0': 0 };
      for (const p of puntajes) {
        if (p < 3.0) rangosDocentes['0-2.9']++;
        else if (p < 4.0) rangosDocentes['3.0-3.9']++;
        else if (p < 4.6) rangosDocentes['4.0-4.5']++;
        else rangosDocentes['4.6-5.0']++;
      }

      const ctxDocentes = document.getElementById('chart-docentes');
      if (ctxDocentes) {
        new Chart(ctxDocentes, {
          type: 'bar',
          data: {
            labels: Object.keys(rangosDocentes),
            datasets: [{
              label: 'Docentes',
              data: Object.values(rangosDocentes),
              backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'],
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      }
    }).catch(err => {
      console.error('Error cargando gráficas:', err);
    });
  }
};
