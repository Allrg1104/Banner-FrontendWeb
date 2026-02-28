# Guía de Ejecución Local - UNICATÓLICA S.G.A

Sigue estos pasos para poner en marcha la plataforma en tu equipo local.

## Prerrequisitos
- **Node.js**: Asegúrate de tener instalado Node.js (v18 o superior).
- **NPM**: Viene incluido con Node.js.

## Pasos de Instalación

### 1. Preparar el Backend
Abre una terminal en la carpeta raíz del proyecto y ejecuta:
```bash
cd backend
npm install
node database/seed.js
npm start
```
> [!NOTE]
> El comando `seed.js` inicializará la base de datos SQLite con los 7 roles y datos de prueba necesarios. El backend correrá en `http://localhost:3000`.

### 2. Preparar el Frontend
Abre **otra terminal diferente** (manteniendo la del backend abierta) y ejecuta:
```bash
cd frontend
npm install
npm run dev
```
> [!TIP]
> El frontend usará **Vite** y estará disponible en `http://localhost:5173`.

---

## Credenciales de Prueba (Demo)
Puedes usar las siguientes cuentas para probar las diferentes vistas:

| Rol | Usuario | Contraseña |
| :--- | :--- | :--- |
| **Estudiante** | `santiago.espinosa01` | `Temp2024!` |
| **Docente** | `docente.test` | `Temp2024!` |
| **Admin TI** | `admin.ti` | `Admin2024!` |

---

## Características Implementadas
- [x] **Dashboard Estudiante**: Gráficas de evolución académica y asistencia (Chart.js).
- [x] **Ficha de Estudiante**: Edición de datos personales, contactos de emergencia y dirección.
- [x] **Gestión Académica**: Visualización de riesgos, promedios y descarga de facturas realistas.
- [x] **Arquitectura SPA**: Navegación rápida y fluida sin recargas de página.
- [x] **Diseño Institucional**: Colores oficiales de Unicatólica (Azul Navy y Oro).
