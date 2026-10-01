import mongoose from 'mongoose';
import { config } from '../config/env.js';

export const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      dbName: 'marz_support_db',
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[Database] MongoDB conectado en: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Fallo al conectar con MongoDB: ${error.message}`);
    process.exit(1);
  }
};
