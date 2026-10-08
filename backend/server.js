import { createApp } from './src/app.js';
import { connectDatabase } from './src/infrastructure/database/mongoConnection.js';
import { config } from './src/infrastructure/config/env.js';

const startServer = async () => {
  await connectDatabase();
  const app = createApp();

  app.listen(config.port, () => {
    console.log(`[Server] Servidor backend ejecutándose en el puerto ${config.port} (${config.nodeEnv})`);
  });
};

startServer();
