# 📖 GUÍA COMPLETA DE PUBLICACIÓN — PollaGol 2026
# Paso a paso desde cero hasta producción

═══════════════════════════════════════════════════════════
  RESUMEN RÁPIDO
═══════════════════════════════════════════════════════════

  HERRAMIENTAS QUE USARÁS (todas gratuitas o casi):
  ┌─────────────────────────────────────────────────────┐
  │  Firebase   → Base de datos + Autenticación  $0/mes │
  │  API-Football → Resultados reales del Mundial $0/mes │
  │  Railway    → Servidor backend               ~$5/mes │
  │  Vercel     → Página web frontend             $0/mes │
  │  GitHub     → Guardar y publicar el código    $0/mes │
  └─────────────────────────────────────────────────────┘

  TIEMPO ESTIMADO: 45-60 minutos si nunca lo has hecho
  NIVEL: Principiante-intermedio (nada de experiencia
         previa necesaria si sigues esta guía)

═══════════════════════════════════════════════════════════
  PRE-REQUISITOS (instalar antes de empezar)
═══════════════════════════════════════════════════════════

  1. Node.js versión 18 o superior
     → Descarga en: https://nodejs.org (botón "LTS")
     → Verifica instalación: abrir terminal y escribir:
         node --version   (debe mostrar v18.x.x o mayor)
         npm --version    (debe mostrar 9.x o mayor)

  2. Git
     → Descarga en: https://git-scm.com/downloads
     → Verifica: git --version

  3. Una cuenta en GitHub (gratis)
     → Regístrate en: https://github.com

  4. Un editor de texto (recomendado: VS Code)
     → Descarga en: https://code.visualstudio.com

  ¿Cómo abrir la terminal?
  - Windows: tecla Windows → escribir "cmd" o "PowerShell"
  - Mac: Cmd + Espacio → escribir "Terminal"
  - Linux: Ctrl + Alt + T

═══════════════════════════════════════════════════════════
  PASO 1 — SUBIR EL PROYECTO A GITHUB (10 min)
═══════════════════════════════════════════════════════════

  GitHub es donde guardas el código. Railway y Vercel lo
  leerán de ahí automáticamente.

  1.1 Crear repositorio en GitHub
  ──────────────────────────────
  a) Ve a https://github.com → inicia sesión
  b) Clic en el botón verde "New" (arriba a la izquierda)
  c) Repository name: pollagol-2026
  d) Selecciona "Private" (para que no sea público)
  e) NO marques "Add a README file"
  f) Clic en "Create repository"
  g) GitHub te muestra una pantalla con comandos.
     Copia la URL que aparece (algo como:
     https://github.com/TU-USUARIO/pollagol-2026.git)

  1.2 Subir el código
  ───────────────────
  Abre la terminal. Navega a la carpeta del proyecto:

    Windows:  cd C:\ruta\donde\extrajiste\pollagol
    Mac/Linux: cd /ruta/donde/extrajiste/pollagol

  Luego ejecuta estos comandos uno por uno:

    git init
    git add .
    git commit -m "Initial commit - PollaGol 2026"
    git branch -M main
    git remote add origin https://github.com/TU-USUARIO/pollagol-2026.git
    git push -u origin main

  Si te pide usuario y contraseña de GitHub, ingrésalos.

  ✅ Resultado: tu código está en GitHub. Ahora puedes
     actualizarlo desde cualquier computadora.

═══════════════════════════════════════════════════════════
  PASO 2 — CONFIGURAR FIREBASE (15 min)
═══════════════════════════════════════════════════════════

  Firebase es la base de datos en tiempo real. Es gratuita
  para el volumen de una polla de oficina.

  2.1 Crear el proyecto Firebase
  ──────────────────────────────
  a) Ve a: https://console.firebase.google.com
  b) Clic en "Crear un proyecto" o "Add project"
  c) Nombre del proyecto: pollagol-2026
  d) En "Google Analytics": desactívalo (no lo necesitas)
  e) Clic en "Crear proyecto" → espera ~30 segundos

  2.2 Configurar la base de datos (Firestore)
  ───────────────────────────────────────────
  a) En el menú izquierdo: Build → Firestore Database
  b) Clic en "Create database"
  c) Selecciona "Start in production mode" → Siguiente
  d) Ubicación: nam5 (us-central) → Listo

  2.3 Activar autenticación anónima
  ─────────────────────────────────
  a) Menú izquierdo: Build → Authentication
  b) Clic en "Get started"
  c) Pestaña "Sign-in method"
  d) Busca "Anonymous" → clic → activa el toggle → Guardar

  2.4 Obtener credenciales para el FRONTEND
  ─────────────────────────────────────────
  a) Clic en el ícono ⚙️ (engranaje) → Project settings
  b) Pestaña "General" → baja hasta "Your apps"
  c) Clic en el ícono </> (web app)
  d) Nombre de la app: pollagol-web → Register app
  e) Copia los valores que aparecen. Los necesitarás así:

     VITE_FIREBASE_API_KEY = apiKey
     VITE_FIREBASE_AUTH_DOMAIN = authDomain
     VITE_FIREBASE_PROJECT_ID = projectId
     VITE_FIREBASE_STORAGE_BUCKET = storageBucket
     VITE_FIREBASE_MESSAGING_SENDER_ID = messagingSenderId
     VITE_FIREBASE_APP_ID = appId

  f) Clic en "Continue to console"

  2.5 Obtener credenciales para el BACKEND
  ─────────────────────────────────────────
  a) Clic en ⚙️ → Project settings
  b) Pestaña "Service accounts"
  c) Clic en "Generate new private key"
  d) Se descarga un archivo JSON → guárdalo bien
     (NO lo subas a GitHub, contiene claves secretas)
  e) Ábrelo con un editor de texto. Necesitarás estos valores:
     - "project_id"
     - "client_email"
     - "private_key" (el texto largo con -----BEGIN PRIVATE KEY-----)

  2.6 Aplicar reglas de seguridad de Firestore
  ─────────────────────────────────────────────
  Opción A — Desde la consola (más fácil):
  a) Ve a Firestore → Pestaña "Rules"
  b) Reemplaza todo el contenido con las reglas del
     archivo "firestore.rules" incluido en el proyecto
  c) Clic en "Publish"

  Opción B — Con Firebase CLI (más profesional):
  a) En la terminal:
       npm install -g firebase-tools
       firebase login
       firebase use --add   (selecciona tu proyecto)
       firebase deploy --only firestore:rules,firestore:indexes

═══════════════════════════════════════════════════════════
  PASO 3 — OBTENER API-FOOTBALL (5 min)
═══════════════════════════════════════════════════════════

  Esta API provee los resultados reales de los partidos.
  El plan gratuito tiene 100 peticiones/día, suficiente
  para una polla pequeña.

  a) Ve a: https://dashboard.api-football.com/register
  b) Regístrate con tu email
  c) Confirma el email
  d) En el dashboard verás tu "API Key" → cópiala
  e) Guárdala. La necesitarás en Railway.

  Nota: El ID del Mundial FIFA 2026 en esta API es 1.
  Puedes verificarlo buscando en su documentación:
  https://www.api-football.com/documentation-v3

═══════════════════════════════════════════════════════════
  PASO 4 — PUBLICAR EL BACKEND EN RAILWAY (15 min)
═══════════════════════════════════════════════════════════

  Railway es el servidor que corre tu backend Node.js.
  Detecta automáticamente el proyecto con el archivo
  railway.toml incluido.

  4.1 Crear cuenta y proyecto
  ───────────────────────────
  a) Ve a: https://railway.app
  b) Clic en "Login" → "Login with GitHub"
  c) Autoriza Railway en tu cuenta de GitHub
  d) En el dashboard: clic en "New Project"
  e) Selecciona "Deploy from GitHub repo"
  f) Busca y selecciona "pollagol-2026"
  g) Railway empieza a detectar el proyecto automáticamente

  4.2 Configurar variables de entorno
  ────────────────────────────────────
  a) En tu proyecto Railway, clic en el servicio creado
  b) Pestaña "Variables"
  c) Agrega CADA UNA de estas variables:

     NODE_ENV          = production
     PORT              = 4000
     ALLOWED_ORIGINS   = http://localhost:3000
     (luego la actualizas con la URL de Vercel)

     FIREBASE_PROJECT_ID    = [tu project_id del JSON]
     FIREBASE_CLIENT_EMAIL  = [tu client_email del JSON]
     FIREBASE_PRIVATE_KEY   = [tu private_key del JSON]
     IMPORTANTE: la private_key debe ir EXACTAMENTE como
     está en el JSON, incluyendo los \n

     API_FOOTBALL_KEY       = [tu API key de api-football]
     API_FOOTBALL_BASE      = https://v3.football.api-sports.io
     WORLD_CUP_LEAGUE_ID    = 1
     WORLD_CUP_SEASON       = 2026
     SYNC_INTERVAL_MINUTES  = 5
     ADMIN_UID              = [lo consigues en el paso 4.3]

  4.3 Obtener tu ADMIN_UID
  ─────────────────────────
  El ADMIN_UID es tu identificador único en Firebase.
  Puedes obtenerlo de dos formas:

  Forma fácil — Después de publicar el frontend:
  a) Abre tu app publicada en Vercel
  b) Abre las herramientas de desarrollador (F12)
  c) Pestaña Console
  d) Escribe: firebase.auth().currentUser.uid
  e) Copia el valor que aparece

  Forma alternativa — Desde Firebase Console:
  a) Firebase Console → Authentication → Users
  b) Ahí aparecerá tu UID cuando te registres por primera vez

  Luego actualiza esa variable en Railway.

  4.4 Verificar que el backend está funcionando
  ──────────────────────────────────────────────
  a) En Railway, pestaña "Settings" → busca la sección
     "Domains" → clic en "Generate Domain"
  b) Te da una URL como:
     https://pollagol-backend-production.up.railway.app
  c) Abre esa URL + /api/health en tu navegador:
     https://pollagol-backend-production.up.railway.app/api/health
  d) Debe mostrar: {"status":"ok","ts":"..."}
  e) Copia esa URL base (sin /api/health), la usarás en Vercel

═══════════════════════════════════════════════════════════
  PASO 5 — PUBLICAR EL FRONTEND EN VERCEL (10 min)
═══════════════════════════════════════════════════════════

  Vercel publica tu aplicación React como sitio web.
  Es gratuito y muy rápido de configurar.

  5.1 Crear cuenta y proyecto
  ───────────────────────────
  a) Ve a: https://vercel.com
  b) Clic en "Sign Up" → "Continue with GitHub"
  c) Autoriza Vercel
  d) Clic en "Add New..." → "Project"
  e) Busca "pollagol-2026" → clic en "Import"

  5.2 Configurar el proyecto
  ──────────────────────────
  Vercel detecta el vercel.json automáticamente, pero
  verifica que esté así:
  - Framework Preset: Vite
  - Root Directory: frontend
  - Build Command: npm run build
  - Output Directory: dist

  5.3 Agregar variables de entorno
  ─────────────────────────────────
  Antes de hacer clic en Deploy, expande
  "Environment Variables" y agrega:

     VITE_FIREBASE_API_KEY         = [de Firebase paso 2.4]
     VITE_FIREBASE_AUTH_DOMAIN     = [de Firebase paso 2.4]
     VITE_FIREBASE_PROJECT_ID      = [de Firebase paso 2.4]
     VITE_FIREBASE_STORAGE_BUCKET  = [de Firebase paso 2.4]
     VITE_FIREBASE_MESSAGING_SENDER_ID = [de Firebase paso 2.4]
     VITE_FIREBASE_APP_ID          = [de Firebase paso 2.4]
     VITE_API_URL = https://[TU-URL-RAILWAY].up.railway.app/api

  5.4 Deploy
  ──────────
  a) Clic en "Deploy"
  b) Espera 2-3 minutos mientras construye
  c) ¡Listo! Vercel te da una URL como:
     https://pollagol-2026.vercel.app

  5.5 Actualizar CORS en Railway
  ──────────────────────────────
  Ahora que tienes la URL de Vercel, actualiza la variable
  en Railway:
  ALLOWED_ORIGINS = https://pollagol-2026.vercel.app

  Si quieres dominio personalizado (ej: pollagol.com),
  en Vercel → Settings → Domains → Add domain.

═══════════════════════════════════════════════════════════
  PASO 6 — PRIMERA SINCRONIZACIÓN DE PARTIDOS (5 min)
═══════════════════════════════════════════════════════════

  El backend sincroniza automáticamente cada 5 minutos
  durante el Mundial, pero para el primer arranque hay
  que hacerlo manualmente.

  6.1 Obtener tu token de Firebase
  ─────────────────────────────────
  a) Abre tu app en Vercel
  b) Entra con tu nombre (esto crea tu cuenta anónima)
  c) Abre las herramientas de desarrollador (F12)
  d) Pestaña Console
  e) Pega este código y presiona Enter:

     const user = firebase.auth().currentUser;
     const token = await user.getIdToken();
     console.log(token);

  f) Copia el token largo que aparece

  6.2 Llamar al endpoint de sincronización
  ─────────────────────────────────────────
  Opción A — Con curl (terminal):

    curl -X POST \
      https://TU-BACKEND.up.railway.app/api/matches/sync \
      -H "Authorization: Bearer TU_TOKEN_AQUI"

  Opción B — Con Postman o Insomnia (app gráfica):
  a) Método: POST
  b) URL: https://TU-BACKEND.up.railway.app/api/matches/sync
  c) Headers: Authorization → Bearer TU_TOKEN
  d) Send

  Debe responder: {"synced": 48, "message": "48 partidos sincronizados"}

  Después de esto, los partidos aparecerán en la app
  automáticamente gracias a Firestore real-time.

═══════════════════════════════════════════════════════════
  SOLUCIÓN DE PROBLEMAS COMUNES
═══════════════════════════════════════════════════════════

  ❌ "Cannot find module" al ejecutar npm run dev
  ─────────────────────────────────────────────────
  Solución: ejecuta npm install dentro de la carpeta
  (cd frontend && npm install)
  (cd backend && npm install)

  ❌ La app carga pero no muestra partidos
  ─────────────────────────────────────────
  - Verifica que VITE_API_URL apunta al backend correcto
  - Verifica que el backend está corriendo (URL /api/health)
  - Ejecuta el sync manual del paso 6

  ❌ Error "Firebase: Error (auth/...)"
  ─────────────────────────────────────
  - Verifica las variables VITE_FIREBASE_* en Vercel
  - Asegúrate que Anonymous auth está activado en Firebase

  ❌ Error 401 (Unauthorized) en el backend
  ──────────────────────────────────────────
  - El token de Firebase expiró (duran 1 hora)
  - Genera uno nuevo con el método del paso 6.1

  ❌ Error "CORS" en la consola del navegador
  ───────────────────────────────────────────
  - Verifica que ALLOWED_ORIGINS en Railway tiene
    la URL exacta de tu Vercel (sin / al final)

  ❌ Railway da error al hacer build
  ───────────────────────────────────
  - Ve a Railway → tu servicio → pestaña "Deployments"
  - Clic en el deploy fallido → ver logs
  - El error más común: variables de entorno faltantes

  ❌ Los resultados no se actualizan solos
  ─────────────────────────────────────────
  - El cron corre cada 5 min durante el Mundial
  - Si la API-Football no tiene resultados aún,
    espera a que el partido termine (+5 min)
  - Verifica que API_FOOTBALL_KEY está correcta

═══════════════════════════════════════════════════════════
  FLUJO PARA ACTUALIZAR EL CÓDIGO DESPUÉS
═══════════════════════════════════════════════════════════

  Cuando quieras hacer cambios al código:

  1. Edita los archivos en tu computadora
  2. En la terminal (dentro de la carpeta pollagol):

       git add .
       git commit -m "Descripción del cambio"
       git push

  3. Railway y Vercel detectan el push automáticamente
     y se redesplegan solos en ~2-3 minutos.
  4. ¡Listo! El cambio está en producción.

═══════════════════════════════════════════════════════════
  ESTRUCTURA FINAL DE TU APP
═══════════════════════════════════════════════════════════

  Tus jugadores (en la oficina o WhatsApp):
  → Abren: https://pollagol-2026.vercel.app
  → Escriben su nombre → Crean o entran a un grupo
  → Pronostican los partidos antes del pitazo inicial
  → Los resultados se actualizan solos del API-Football
  → La tabla de posiciones se recalcula automáticamente
  → Pueden compartir su posición directo a WhatsApp

  ¡Eso es todo! Cualquier duda, revisa los logs en
  Railway (backend) y Vercel (frontend).

═══════════════════════════════════════════════════════════
  CONTACTO Y SOPORTE
═══════════════════════════════════════════════════════════

  Documentación oficial de las herramientas:
  - Firebase:      https://firebase.google.com/docs
  - Railway:       https://docs.railway.app
  - Vercel:        https://vercel.com/docs
  - API-Football:  https://www.api-football.com/documentation-v3
  - Vite + React:  https://vitejs.dev/guide

═══════════════════════════════════════════════════════════
