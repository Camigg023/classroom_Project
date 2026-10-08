export class AuditLog {
  constructor({
    id,
    solicitudId,
    accion,
    actorId,
    actorRol,
    actorCodigo,
    campo,
    valorAnterior,
    valorNuevo,
    motivo = null,
    createdAt
  }) {
    this.id = id;
    this.solicitudId = solicitudId;
    this.accion = accion;
    this.actorId = actorId;
    this.actorRol = actorRol;
    this.actorCodigo = actorCodigo || AuditLog.generarCodigoActor(actorRol, actorId);
    this.campo = campo;
    this.valorAnterior = valorAnterior;
    this.valorNuevo = valorNuevo;
    this.motivo = motivo;
    this.createdAt = createdAt || new Date();
  }

  static generarCodigoActor(rol, id) {
    const prefijos = {
      Solicitante: 'SOL',
      Agente: 'AGT',
      Coordinador: 'CRD',
      Auditor: 'AUD'
    };
    const pref = prefijos[rol] || 'USR';
    const sub = String(id || '').slice(-4).toUpperCase();
    return `${pref}-${sub || '0000'}`;
  }
}
