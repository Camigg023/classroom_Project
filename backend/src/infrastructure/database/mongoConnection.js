import mongoose from 'mongoose';
import { config } from '../config/env.js';

export const connectDatabase = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      dbName: 'marz_support_db',
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[Database] MongoDB conectado en: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Fallo al conectar con MongoDB: ${error.message}`);
    if (!process.env.VERCEL && config.nodeEnv !== 'production') {
      process.exit(1);
    }
    throw error;
  }
};
