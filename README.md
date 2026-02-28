# Plataforma Académica Institucional

Este proyecto es un prototipo funcional de un sistema de seguimiento académico inteligente con dashboards para 7 roles institucionales.

## 🚀 Cómo Iniciar el Proyecto

Para que el sistema funcione correctamente, debes iniciar tanto el **Backend** como el **Frontend**.

### 1. Preparar el Backend (API)
Abre una terminal y ejecuta:
```bash
cd backend
npm install
node database/seed.js   # Solo una vez para cargar los datos de prueba
npm start
```
*El backend correrá en http://localhost:3000*

### 2. Preparar el Frontend (SPA)
Abre **otra terminal** (sin cerrar la anterior) y ejecuta:
```bash
cd frontend
npm install
npm run dev
```
*El sitio estará disponible en http://localhost:5173*

---

## 🌐 Despliegue (Deploy)

### Frontend
La forma más sencilla de desplegar el frontend es usando **Vercel** o **Netlify**:
1. Sube la carpeta `frontend` a un repositorio de GitHub.
2. Conecta el repositorio a Vercel.
3. El comando de build será `npm run build` y la carpeta de salida `dist`.

### Backend
Puedes usar **Railway**, **Render** o **DigitalOcean**:
1. Sube el backend a GitHub.
2. Conecta a la plataforma elegida.
3. Recuerda configurar las variables de entorno (`JWT_SECRET`, etc.) en el panel de control del hosting.

---

## 🔑 Credenciales de Prueba
Consulta el archivo [walkthrough.md](file:///C:/Users/Deison/.gemini/antigravity/brain/f4ee46be-98d8-4f9f-abf5-0da788065f34/walkthrough.md) para ver la lista completa de usuarios y contraseñas.
