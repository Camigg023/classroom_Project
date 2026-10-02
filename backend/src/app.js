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
import { MongoNotificacionRepository } from './adapters/out/persistence/mongoose/repositories/MongoNotificacionRepository.js';

// Casos de Uso (Aplicación)
import { LoginUseCase } from './application/usecases/auth/LoginUseCase.js';
import { CreateSolicitudUseCase } from './application/usecases/solicitudes/CreateSolicitudUseCase.js';
import { GetMisSolicitudesUseCase } from './application/usecases/solicitudes/GetMisSolicitudesUseCase.js';
import { GetSolicitudByIdUseCase } from './application/usecases/solicitudes/GetSolicitudByIdUseCase.js';
import { GetSolicitudesForCoordinadorUseCase } from './application/usecases/solicitudes/GetSolicitudesForCoordinadorUseCase.js';
import { PrioritizeSolicitudUseCase } from './application/usecases/solicitudes/PrioritizeSolicitudUseCase.js';
import { AsignarSolicitudUseCase } from './application/usecases/solicitudes/AsignarSolicitudUseCase.js';
import { AddComentarioUseCase } from './application/usecases/solicitudes/AddComentarioUseCase.js';
import { CambiarEstadoUseCase } from './application/usecases/solicitudes/CambiarEstadoUseCase.js';
import { ConfirmarCierreUseCase } from './application/usecases/solicitudes/ConfirmarCierreUseCase.js';
import { ReabrirSolicitudUseCase } from './application/usecases/solicitudes/ReabrirSolicitudUseCase.js';
import { GetAgentesActivosUseCase } from './application/usecases/users/GetAgentesActivosUseCase.js';
import { GetNotificacionesUseCase, MarcarNotificacionLeidaUseCase } from './application/usecases/notificaciones/NotificacionesUseCases.js';

// Controladores y Rutas (Adaptadores de entrada)
import { AuthController } from './adapters/in/http/controllers/AuthController.js';
import { SolicitudController } from './adapters/in/http/controllers/SolicitudController.js';
import { UserController } from './adapters/in/http/controllers/UserController.js';
import { NotificacionController } from './adapters/in/http/controllers/NotificacionController.js';
import { createAuthRouter } from './adapters/in/http/routes/authRoutes.js';
import { createSolicitudRouter } from './adapters/in/http/routes/solicitudRoutes.js';
import { createUserRouter } from './adapters/in/http/routes/userRoutes.js';
import { createNotificacionRouter } from './adapters/in/http/routes/notificacionRoutes.js';

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
  const notificacionRepository = new MongoNotificacionRepository();

  const loginUseCase = new LoginUseCase(userRepository);
  const createSolicitudUseCase = new CreateSolicitudUseCase(solicitudRepository, auditRepository);
  const getMisSolicitudesUseCase = new GetMisSolicitudesUseCase(solicitudRepository);
  const getSolicitudByIdUseCase = new GetSolicitudByIdUseCase(solicitudRepository, auditRepository);
  const getSolicitudesForCoordinadorUseCase = new GetSolicitudesForCoordinadorUseCase(solicitudRepository);
  const prioritizeSolicitudUseCase = new PrioritizeSolicitudUseCase(solicitudRepository, auditRepository);
  const asignarSolicitudUseCase = new AsignarSolicitudUseCase(solicitudRepository, userRepository, auditRepository, notificacionRepository);
  const addComentarioUseCase = new AddComentarioUseCase(solicitudRepository, auditRepository);
  const cambiarEstadoUseCase = new CambiarEstadoUseCase(solicitudRepository, auditRepository);
  const confirmarCierreUseCase = new ConfirmarCierreUseCase(solicitudRepository, auditRepository);
  const reabrirSolicitudUseCase = new ReabrirSolicitudUseCase(solicitudRepository, auditRepository);
  const getAgentesActivosUseCase = new GetAgentesActivosUseCase(userRepository);
  const getNotificacionesUseCase = new GetNotificacionesUseCase(notificacionRepository);
  const marcarNotificacionLeidaUseCase = new MarcarNotificacionLeidaUseCase(notificacionRepository);

  const authController = new AuthController(loginUseCase);
  const userController = new UserController({ getAgentesActivosUseCase });
  const notificacionController = new NotificacionController({
    getNotificacionesUseCase,
    marcarNotificacionLeidaUseCase
  });
  const solicitudController = new SolicitudController({
    createSolicitudUseCase,
    getMisSolicitudesUseCase,
    getSolicitudByIdUseCase,
    getSolicitudesForCoordinadorUseCase,
    prioritizeSolicitudUseCase,
    asignarSolicitudUseCase,
    addComentarioUseCase,
    cambiarEstadoUseCase,
    confirmarCierreUseCase,
    reabrirSolicitudUseCase
  });

  // Rutas
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', createAuthRouter(authController));
  app.use('/api/users', createUserRouter(userController));
  app.use('/api/notificaciones', createNotificacionRouter(notificacionController));
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
