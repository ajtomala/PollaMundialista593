import admin from 'firebase-admin'
import * as dotenv from 'dotenv'
dotenv.config()

// Supports both file-based credentials and env variable credentials (for Railway/Render)
function initFirebase() {
  if (admin.apps.length > 0) return admin.apps[0]!

  const credFile = process.env.GOOGLE_APPLICATION_CREDENTIALS
  const projectId = process.env.FIREBASE_PROJECT_ID

  if (credFile) {
    // Local development: use serviceAccountKey.json
    return admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    })
  }

  if (projectId) {
    // Production: use individual env vars
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: privateKey!,
      }),
    })
  }

  throw new Error('Firebase credentials not configured. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY')
}

initFirebase()

export const db   = admin.firestore()
export const auth = admin.auth()
export default admin
