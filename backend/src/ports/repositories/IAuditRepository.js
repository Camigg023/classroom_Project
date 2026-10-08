export class IAuditRepository {
  async record(auditLog) { throw new Error('Not implemented'); }
  async findBySolicitudId(solicitudId) { throw new Error('Not implemented'); }
  async findAll(filtros) { throw new Error('Not implemented'); }
  async findAllAuditor(filtros) { throw new Error('Not implemented'); }
}
