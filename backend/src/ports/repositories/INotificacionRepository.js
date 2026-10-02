export class INotificacionRepository {
  async save(notificacion) { throw new Error('Not implemented'); }
  async findByDestinatario(destinatarioId, soloNoLeidas) { throw new Error('Not implemented'); }
  async markAsRead(id, destinatarioId) { throw new Error('Not implemented'); }
}
