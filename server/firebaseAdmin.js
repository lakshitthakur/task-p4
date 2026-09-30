const { initializeApp, cert } = require('firebase-admin/app');

const { getFirestore } = require('firebase-admin/firestore');

const projectId = process.env.FIREBASE_PROJECT_ID;

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    'Firebase Admin environment variables are missing.'
  );
}

initializeApp({
  credential: cert({
    projectId,
    clientEmail,
    privateKey
  })
});

const db = getFirestore();

module.exports = { db };