import mongoose from 'mongoose';
import { config } from './src/infrastructure/config/env.js';
import { PasswordHasher } from './src/infrastructure/security/passwordHasher.js';
import { UserModel } from './src/adapters/out/persistence/mongoose/models/UserModel.js';
import { SolicitudModel } from './src/adapters/out/persistence/mongoose/models/SolicitudModel.js';
import { AuditLogModel } from './src/adapters/out/persistence/mongoose/models/AuditLogModel.js';
import { ROLES, USER_STATUS } from './src/domain/entities/User.js';
import { SOLICITUD_ESTADOS, PRIORIDADES } from './src/domain/entities/Solicitud.js';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Conectando a MongoDB...');
    await mongoose.connect(config.mongoUri);

    console.log('[Seed] Limpiando colecciones anteriores...');
    await UserModel.deleteMany({});
    await SolicitudModel.deleteMany({});
    await AuditLogModel.deleteMany({});

    console.log('[Seed] Hasheando contraseñas seguras...');
    const defaultPasswordHash = await PasswordHasher.hash('Password123!');

    const usuarios = await UserModel.insertMany([
      {
        nombre: 'Carlos Solano (Bodega Central)',
        email: 'solicitante@empresa.com',
        passwordHash: defaultPasswordHash,
        rol: ROLES.SOLICITANTE,
        estado: USER_STATUS.ACTIVO
      },
      {
        nombre: 'Mariana Duarte (Centro Distribución Medellín)',
        email: 'solicitante2@empresa.com',
        passwordHash: defaultPasswordHash,
        rol: ROLES.SOLICITANTE,
        estado: USER_STATUS.ACTIVO
      },
      {
        nombre: 'David Mendoza (Soporte Nivel 1)',
        email: 'agente1@empresa.com',
        passwordHash: defaultPasswordHash,
        rol: ROLES.AGENTE,
        estado: USER_STATUS.ACTIVO
      },
      {
        nombre: 'Laura Morales (Soporte Infraestructura)',
        email: 'agente2@empresa.com',
        passwordHash: defaultPasswordHash,
        rol: ROLES.AGENTE,
        estado: USER_STATUS.ACTIVO
      },
      {
        nombre: 'Fernando Rivas (Coordinador Nacional TI)',
        email: 'coordinador@empresa.com',
        passwordHash: defaultPasswordHash,
        rol: ROLES.COORDINADOR,
        estado: USER_STATUS.ACTIVO
      },
      {
        nombre: 'Patricia Gómez (Auditoría de Procesos)',
        email: 'auditor@empresa.com',
        passwordHash: defaultPasswordHash,
        rol: ROLES.AUDITOR,
        estado: USER_STATUS.ACTIVO
      }
    ]);

    const solicitante1 = usuarios.find(u => u.email === 'solicitante@empresa.com');
    const solicitante2 = usuarios.find(u => u.email === 'solicitante2@empresa.com');

    console.log('[Seed] Creando solicitudes iniciales de prueba (Sprint 1)...');
    const targetDateAlta = new Date();
    targetDateAlta.setDate(targetDateAlta.getDate() + 1);

    const solicitudes = await SolicitudModel.insertMany([
      {
        codigo: 'SOL-2026-0001',
        titulo: 'Falla en terminal de radiofrecuencia (Muelle 4)',
        descripcion: 'El lector láser Honeywell no sincroniza lecturas con el sistema WMS de bodega.',
        categoria: 'Hardware',
        estado: SOLICITUD_ESTADOS.NUEVO,
        prioridad: PRIORIDADES.MEDIA,
        propietarioId: solicitante1._id,
        propietarioNombre: solicitante1.nombre
      },
      {
        codigo: 'SOL-2026-0002',
        titulo: 'Error al emitir guías de despacho electrónicas',
        descripcion: 'Servicio web DIAN genera timeout al timbrar órdenes de salida de flota pesada.',
        categoria: 'Software',
        estado: SOLICITUD_ESTADOS.NUEVO,
        prioridad: PRIORIDADES.ALTA,
        justificacionPrioridad: 'Detiene la salida de 14 camiones programados para ruta intermunicipal',
        fechaObjetivo: targetDateAlta,
        propietarioId: solicitante1._id,
        propietarioNombre: solicitante1.nombre
      },
      {
        codigo: 'SOL-2026-0003',
        titulo: 'Habilitación de usuario VPN para jefe de turno',
        descripcion: 'Se requiere acceso remoto seguro para el supervisor nocturno en la sede Medellín.',
        categoria: 'Accesos y Cuentas',
        estado: SOLICITUD_ESTADOS.NUEVO,
        prioridad: PRIORIDADES.BAJA,
        propietarioId: solicitante2._id,
        propietarioNombre: solicitante2.nombre
      }
    ]);

    console.log('[Seed] Registrando auditorías iniciales...');
    for (const sol of solicitudes) {
      await AuditLogModel.create({
        solicitudId: sol._id,
        accion: 'CREACION_SOLICITUD',
        actorId: sol.propietarioId,
        actorRol: ROLES.SOLICITANTE,
        actorCodigo: `SOL-${String(sol.propietarioId).slice(-4).toUpperCase()}`,
        campo: 'estado',
        valorAnterior: null,
        valorNuevo: sol.estado
      });
    }

    console.log('\n======================================================');
    console.log('✅ Base de datos poblada exitosamente');
    console.log('Credenciales de prueba disponibles (Contraseña: Password123!):');
    console.log(' - Solicitante:   solicitante@empresa.com');
    console.log(' - Solicitante 2: solicitante2@empresa.com');
    console.log(' - Agente 1:      agente1@empresa.com');
    console.log(' - Agente 2:      agente2@empresa.com');
    console.log(' - Coordinador:   coordinador@empresa.com');
    console.log(' - Auditor:       auditor@empresa.com');
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Fallo durante la ejecución del seeder:', error);
    process.exit(1);
  }
};

seedDatabase();
