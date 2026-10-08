import { createApp } from '../backend/src/app.js';
import { connectDatabase } from '../backend/src/infrastructure/database/mongoConnection.js';

let appInstance = null;
let dbConnected = false;

const initApp = async () => {
  if (process.env.MONGODB_URI && !dbConnected) {
    try {
      await connectDatabase();
      dbConnected = true;
    } catch (err) {
      console.error('[Vercel API] Error conectando a MongoDB:', err.message);
    }
  }

  if (!appInstance) {
    appInstance = createApp();
  }

  return appInstance;
};

export default async function handler(req, res) {
  const app = await initApp();
  return app(req, res);
}
