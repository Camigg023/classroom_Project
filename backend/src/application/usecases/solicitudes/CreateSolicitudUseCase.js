import { Solicitud, PRIORIDADES } from '../../../domain/entities/Solicitud.js';
import { AuditLog } from '../../../domain/entities/AuditLog.js';
import { ForbiddenError } from '../../../domain/exceptions/DomainError.js';
import { ROLES } from '../../../domain/entities/User.js';

export class CreateSolicitudUseCase {
  constructor(solicitudRepository, auditRepository) {
    this.solicitudRepository = solicitudRepository;
    this.auditRepository = auditRepository;
  }

  async execute(dto, usuarioAuth) {
    if (usuarioAuth.rol !== ROLES.SOLICITANTE) {
      throw new ForbiddenError('Solo los solicitantes pueden crear solicitudes de soporte');
    }

    const codigo = await this.solicitudRepository.generateNextCodigo();

    const solicitud = new Solicitud({
      codigo,
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      categoria: dto.categoria,
      prioridad: dto.prioridad || PRIORIDADES.MEDIA,
      justificacionPrioridad: dto.justificacionPrioridad || null,
      fechaObjetivo: dto.fechaObjetivo || null,
      propietarioId: usuarioAuth.id,
      propietarioNombre: usuarioAuth.nombre
    });

    if (solicitud.prioridad === PRIORIDADES.ALTA) {
      solicitud.setPrioridad(
        PRIORIDADES.ALTA,
        dto.justificacionPrioridad,
        dto.fechaObjetivo
      );
    }

    const saved = await this.solicitudRepository.save(solicitud);

    await this.auditRepository.record(
      new AuditLog({
        solicitudId: saved.id,
        accion: 'CREACION_SOLICITUD',
        actorId: usuarioAuth.id,
        actorRol: usuarioAuth.rol,
        campo: 'estado',
        valorAnterior: null,
        valorNuevo: saved.estado
      })
    );

    return saved;
  }
}
