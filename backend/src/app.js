import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './infrastructure/config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { errorHandler } from './adapters/in/http/middlewares/errorHandler.js';

// Repositorios (Adaptadores de salida)
import { MongoUserRepository } from './adapters/out/persistence/mongoose/repositories/MongoUserRepository.js';
import { MongoSolicitudRepository } from './adapters/out/persistence/mongoose/repositories/MongoSolicitudRepository.js';
import { MongoAuditRepository } from './adapters/out/persistence/mongoose/repositories/MongoAuditRepository.js';

// Casos de Uso (Aplicación)
import { LoginUseCase } from './application/usecases/auth/LoginUseCase.js';
import { CreateSolicitudUseCase } from './application/usecases/solicitudes/CreateSolicitudUseCase.js';
import { GetMisSolicitudesUseCase } from './application/usecases/solicitudes/GetMisSolicitudesUseCase.js';
import { GetSolicitudByIdUseCase } from './application/usecases/solicitudes/GetSolicitudByIdUseCase.js';
import { GetSolicitudesForCoordinadorUseCase } from './application/usecases/solicitudes/GetSolicitudesForCoordinadorUseCase.js';
import { PrioritizeSolicitudUseCase } from './application/usecases/solicitudes/PrioritizeSolicitudUseCase.js';

// Controladores y Rutas (Adaptadores de entrada)
import { AuthController } from './adapters/in/http/controllers/AuthController.js';
import { SolicitudController } from './adapters/in/http/controllers/SolicitudController.js';
import { createAuthRouter } from './adapters/in/http/routes/authRoutes.js';
import { createSolicitudRouter } from './adapters/in/http/routes/solicitudRoutes.js';

export const createApp = () => {
  const app = express();

  app.use(cors({
    origin: config.clientUrl,
    credentials: true
  }));
  app.use(express.json());

  // Inicialización de Dependencias (Composition Root)
  const userRepository = new MongoUserRepository();
  const solicitudRepository = new MongoSolicitudRepository();
  const auditRepository = new MongoAuditRepository();

  const loginUseCase = new LoginUseCase(userRepository);
  const createSolicitudUseCase = new CreateSolicitudUseCase(solicitudRepository, auditRepository);
  const getMisSolicitudesUseCase = new GetMisSolicitudesUseCase(solicitudRepository);
  const getSolicitudByIdUseCase = new GetSolicitudByIdUseCase(solicitudRepository, auditRepository);
  const getSolicitudesForCoordinadorUseCase = new GetSolicitudesForCoordinadorUseCase(solicitudRepository);
  const prioritizeSolicitudUseCase = new PrioritizeSolicitudUseCase(solicitudRepository, auditRepository);

  const authController = new AuthController(loginUseCase);
  const solicitudController = new SolicitudController({
    createSolicitudUseCase,
    getMisSolicitudesUseCase,
    getSolicitudByIdUseCase,
    getSolicitudesForCoordinadorUseCase,
    prioritizeSolicitudUseCase
  });

  // Rutas
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', createAuthRouter(authController));
  app.use('/api/solicitudes', createSolicitudRouter(solicitudController));

  // Servir frontend compilado en producción
  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }

  // Middleware global de errores
  app.use(errorHandler);

  return app;
};
