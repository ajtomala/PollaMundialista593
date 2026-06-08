import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import cron from 'node-cron'
import routes from './routes'
import { syncMatchesFromAPI, syncLiveResults } from './services/footballApi'
import { recalculateAllLeaderboards } from './services/leaderboard'

// ─── Init Firebase (import triggers initialization) ───
import './config/firebase'

const app = express()
const PORT = process.env.PORT || 4000

// ─── Security middleware ───────────────────────────────
app.use(helmet())
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  credentials: true,
}))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10kb' }))

// Rate limiting: 100 req / 15 min per IP
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  message: { error: 'Demasiadas solicitudes. Intenta en 15 minutos.' },
}))

// ─── Routes ───────────────────────────────────────────
app.use('/api', routes)

// 404
app.use((_, res) => res.status(404).json({ error: 'Ruta no encontrada' }))

// ─── Global error handler ─────────────────────────────
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

// ─── CRON JOBS ────────────────────────────────────────
const syncMinutes = parseInt(process.env.SYNC_INTERVAL_MINUTES || '5')

// Every N minutes: sync live match results
cron.schedule(`*/${syncMinutes} * * * *`, async () => {
  try {
    console.log(`⏱ Cron: syncing live results (every ${syncMinutes} min)`)
    await syncLiveResults()
    await recalculateAllLeaderboards()
  } catch (e) {
    console.error('Cron sync error:', e)
  }
})

// Every day at 03:00 UTC: full sync of all matches (schedule changes, new fixtures)
cron.schedule('0 3 * * *', async () => {
  try {
    console.log('🌙 Cron: full match sync')
    await syncMatchesFromAPI()
  } catch (e) {
    console.error('Full sync error:', e)
  }
})

// ─── Start server ─────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n🚀 PollaGol backend running on port ${PORT}`)
  console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`)

  // On startup: do initial match sync if in production
  if (process.env.NODE_ENV === 'production') {
    try {
      await syncMatchesFromAPI()
      console.log('✅ Initial match sync complete')
    } catch (e) {
      console.warn('⚠️  Initial sync skipped (API key not configured?):', (e as any).message)
    }
  }
})

export default app
