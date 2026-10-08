import { INotificacionRepository } from '../../../../../ports/repositories/INotificacionRepository.js';
import { NotificacionModel } from '../models/NotificacionModel.js';
import { Notificacion } from '../../../../../domain/entities/Notificacion.js';

export class MongoNotificacionRepository extends INotificacionRepository {
  toDomain(doc) {
    if (!doc) return null;
    return new Notificacion({
      id: doc._id.toString(),
      destinatarioId: doc.destinatarioId.toString(),
      tipo: doc.tipo,
      titulo: doc.titulo,
      mensaje: doc.mensaje,
      solicitudId: doc.solicitudId ? doc.solicitudId.toString() : null,
      codigoSolicitud: doc.codigoSolicitud,
      leida: doc.leida,
      createdAt: doc.createdAt
    });
  }

  async save(notificacion) {
    const doc = await NotificacionModel.create({
      destinatarioId: notificacion.destinatarioId,
      tipo: notificacion.tipo,
      titulo: notificacion.titulo,
      mensaje: notificacion.mensaje,
      solicitudId: notificacion.solicitudId,
      codigoSolicitud: notificacion.codigoSolicitud,
      leida: notificacion.leida
    });
    return this.toDomain(doc);
  }

  async findByDestinatario(destinatarioId, soloNoLeidas = false) {
    const query = { destinatarioId };
    if (soloNoLeidas) {
      query.leida = false;
    }
    const docs = await NotificacionModel.find(query).sort({ createdAt: -1 });
    return docs.map(doc => this.toDomain(doc));
  }

  async markAsRead(id, destinatarioId) {
    const doc = await NotificacionModel.findOneAndUpdate(
      { _id: id, destinatarioId },
      { leida: true },
      { new: true }
    );
    return this.toDomain(doc);
  }
}
