# ⚽ PollaGol 2026 — Fullstack App

Polla mundialista con grupos privados, pronósticos en tiempo real y tabla de posiciones compartida.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js + Express + TypeScript |
| Base de datos | Firebase Firestore (tiempo real) |
| Auth | Firebase Authentication (anónima) |
| API externa | API-Football (resultados reales) |
| Deploy Frontend | Vercel |
| Deploy Backend | Railway / Render |

## Estructura

```
pollagol/
├── frontend/          # React app
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Screens
│   │   ├── hooks/         # Custom hooks (useGroup, useMatches, etc.)
│   │   ├── services/      # Firebase + API calls
│   │   ├── store/         # Zustand global state
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Helpers
│   └── ...
└── backend/           # Express API
    ├── src/
    │   ├── routes/        # API routes
    │   ├── controllers/   # Business logic
    │   ├── services/      # Firebase Admin + API-Football
    │   ├── middleware/     # Auth, validation, rate limit
    │   └── config/        # Firebase, env config
    └── ...
```

## Setup rápido

### 1. Firebase
- Crear proyecto en https://console.firebase.google.com
- Activar Firestore + Authentication (Anonymous)
- Descargar `serviceAccountKey.json` para el backend

### 2. API-Football
- Registrarse en https://www.api-football.com
- Plan gratuito: 100 requests/día (suficiente para MVP)

### 3. Frontend
```bash
cd frontend
cp .env.example .env     # llenar con tus keys de Firebase
npm install
npm run dev
```

### 4. Backend
```bash
cd backend
cp .env.example .env     # llenar con todas las keys
npm install
npm run dev
```

## Variables de entorno necesarias

Ver `.env.example` en cada carpeta.

## Deploy

- **Frontend → Vercel**: conectar repo, agregar env vars
- **Backend → Railway**: conectar repo, carpeta `/backend`, agregar env vars
"# PollaMundialista593" 
"# PollaMundialista593" 
