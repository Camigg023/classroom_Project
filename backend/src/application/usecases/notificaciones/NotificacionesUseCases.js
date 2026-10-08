export class GetNotificacionesUseCase {
  constructor(notificacionRepository) {
    this.notificacionRepository = notificacionRepository;
  }

  async execute(usuarioAuth, soloNoLeidas = false) {
    return this.notificacionRepository.findByDestinatario(usuarioAuth.id, soloNoLeidas);
  }
}

export class MarcarNotificacionLeidaUseCase {
  constructor(notificacionRepository) {
    this.notificacionRepository = notificacionRepository;
  }

  async execute(notificacionId, usuarioAuth) {
    return this.notificacionRepository.markAsRead(notificacionId, usuarioAuth.id);
  }
}
