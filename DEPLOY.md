# 🚀 Guía de Deploy — PollaGol 2026

## Paso 1 — Firebase (15 min)

1. Ve a https://console.firebase.google.com → "Crear proyecto"
2. Nombre: `pollagol-2026` → Continuar sin Analytics
3. **Firestore Database**
   - Build → Firestore Database → "Create database"
   - Selecciona "Start in production mode"
   - Región: `us-central1` (o la más cercana)
4. **Authentication**
   - Build → Authentication → "Get started"
   - Sign-in method → Anonymous → Habilitar → Guardar
5. **Web App (para el frontend)**
   - Project Settings → "Add app" → Web (</>) 
   - Nombre: `pollagol-web`
   - Copia las variables → las necesitas en el `.env` del frontend
6. **Service Account (para el backend)**
   - Project Settings → Service accounts → "Generate new private key"
   - Descarga el JSON → guárdalo como `backend/serviceAccountKey.json`
   - NUNCA subas este archivo a Git (ya está en .gitignore)
7. **Deploy Firestore rules**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add    # selecciona tu proyecto
   firebase deploy --only firestore:rules,firestore:indexes
   ```

---

## Paso 2 — API-Football (5 min)

1. Ve a https://www.api-football.com/dashboard
2. Regístrate (plan gratuito: 100 req/día)
3. En Dashboard copia tu **API Key**
4. Para el Mundial 2026, el `WORLD_CUP_LEAGUE_ID` será `1` (FIFA World Cup)
5. Verifica el season con:
   ```
   GET https://v3.football.api-sports.io/leagues?id=1
   ```

---

## Paso 3 — Deploy Backend en Railway (10 min)

1. Ve a https://railway.app → "New Project" → "Deploy from GitHub repo"
2. Conecta tu repositorio
3. Railway detectará el `railway.toml` automáticamente
4. En Variables (Settings → Variables) agrega:

   ```
   NODE_ENV=production
   PORT=4000
   ALLOWED_ORIGINS=https://tu-app.vercel.app
   FIREBASE_PROJECT_ID=pollagol-2026
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@pollagol-2026.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
   API_FOOTBALL_KEY=tu_key_aqui
   API_FOOTBALL_BASE=https://v3.football.api-sports.io
   WORLD_CUP_LEAGUE_ID=1
   WORLD_CUP_SEASON=2026
   SYNC_INTERVAL_MINUTES=5
   ADMIN_UID=tu_firebase_uid_de_admin
   ```

   > ⚠️ La `FIREBASE_PRIVATE_KEY` debe tener `\n` literales (no saltos reales).
   > En el JSON descargado, copia el valor del campo `"private_key"` tal cual.

5. Copia la URL pública de Railway (ej: `https://pollagol-backend.up.railway.app`)

---

## Paso 4 — Deploy Frontend en Vercel (5 min)

1. Ve a https://vercel.com → "New Project" → importa tu repo
2. Framework: Vite (lo detecta automático)
3. Build Command: `cd frontend && npm run build`
4. Output Directory: `frontend/dist`
5. En Environment Variables agrega:

   ```
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=pollagol-2026.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=pollagol-2026
   VITE_FIREBASE_STORAGE_BUCKET=pollagol-2026.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc
   VITE_API_URL=https://pollagol-backend.up.railway.app/api
   ```

6. Deploy → obtén tu URL (ej: `https://pollagol.vercel.app`)
7. Agrega esa URL en el backend Railway como `ALLOWED_ORIGINS`

---

## Paso 5 — Primera sincronización de partidos

Una vez desplegado, llama manualmente al endpoint de sync
(necesitas el UID de administrador y su token):

```bash
# Primero abre la app, inicia sesión, copia tu Firebase UID
# Luego desde el navegador (DevTools Console):
const user = firebase.auth().currentUser
const token = await user.getIdToken()

# Con ese token:
curl -X POST https://pollagol-backend.up.railway.app/api/matches/sync \
  -H "Authorization: Bearer TU_TOKEN"
```

---

## Arquitectura de datos en Firestore

```
/users/{uid}
  displayName, groupCode, champion, topScorer, avatarColor

/groups/{code}
  code, name, creatorUid, members[], maxMembers

/matches/{fixtureId}
  homeTeam, awayTeam, scheduledAt, status, round, group, result?

/predictions/{uid_matchId}
  uid, groupCode, matchId, homeGoals, awayGoals, points

/leaderboards/{groupCode}
  entries[]: uid, displayName, totalPoints, exactResults, correctWinners, rank
```

---

## Cómo funciona el flujo completo

```
Cada 5 min (cron):
  API-Football → syncLiveResults() → Firestore /matches
                                   → recalculateAllLeaderboards() → /leaderboards

Frontend (tiempo real):
  Firestore /matches      → useMatches hook     → MatchCard components
  Firestore /leaderboards → useLeaderboard hook → LeaderboardTab
  Firestore /predictions  → useMyPredictions    → MatchCard inputs
```

---

## Costos estimados (polla de 6-20 personas)

| Servicio | Plan | Costo |
|---|---|---|
| Firebase Firestore | Spark (gratis) | $0/mes |
| Firebase Auth | Gratis | $0/mes |
| API-Football | Free | $0/mes (100 req/día) |
| Railway | Hobby | ~$5/mes |
| Vercel | Free | $0/mes |
| **Total** | | **~$5/mes** |

> Si el grupo crece o necesitas más llamadas a API-Football, el plan Essential cuesta $10/mes y da 7500 req/día.
