import { ForbiddenError, NotFoundError, ValidationError } from '../../../domain/exceptions/DomainError.js';
import { ROLES } from '../../../domain/entities/User.js';
import { AuditLog } from '../../../domain/entities/AuditLog.js';

export class AddComentarioUseCase {
  constructor(solicitudRepository, auditRepository) {
    this.solicitudRepository = solicitudRepository;
    this.auditRepository = auditRepository;
  }

  async execute(solicitudId, dto, usuarioAuth) {
    const rawDoc = await this.solicitudRepository.findRawById(solicitudId);
    if (!rawDoc) {
      throw new NotFoundError('Solicitud no encontrada');
    }

    if (usuarioAuth.rol === ROLES.SOLICITANTE && rawDoc.propietarioId.toString() !== usuarioAuth.id) {
      throw new ForbiddenError('No tienes autorización para agregar comentarios a esta solicitud');
    }

    if (!dto.contenido || !dto.contenido.trim()) {
      throw new ValidationError('El comentario no puede estar vacío ni contener solo espacios');
    }

    const comentarioData = {
      autorId: usuarioAuth.id,
      autorNombre: usuarioAuth.nombre,
      autorRol: usuarioAuth.rol,
      contenido: dto.contenido.trim()
    };

    const updatedDoc = await this.solicitudRepository.addComentario(solicitudId, comentarioData);

    await this.auditRepository.record(
      new AuditLog({
        solicitudId,
        accion: 'NUEVO_COMENTARIO',
        actorId: usuarioAuth.id,
        actorRol: usuarioAuth.rol,
        campo: 'comentarios',
        valorAnterior: null,
        valorNuevo: `Comentario registrado por ${usuarioAuth.nombre} (${usuarioAuth.rol})`
      })
    );

    const comentarios = updatedDoc.comentarios || [];
    return comentarios[comentarios.length - 1];
  }
}
