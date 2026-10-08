import { IAuditRepository } from '../../../../../ports/repositories/IAuditRepository.js';
import { AuditLogModel } from '../models/AuditLogModel.js';
import { AuditLog } from '../../../../../domain/entities/AuditLog.js';

export class MongoAuditRepository extends IAuditRepository {
  toDomain(doc) {
    if (!doc) return null;
    return new AuditLog({
      id: doc._id.toString(),
      solicitudId: doc.solicitudId.toString(),
      accion: doc.accion,
      actorId: doc.actorId.toString(),
      actorRol: doc.actorRol,
      actorCodigo: doc.actorCodigo,
      campo: doc.campo,
      valorAnterior: doc.valorAnterior,
      valorNuevo: doc.valorNuevo,
      motivo: doc.motivo,
      createdAt: doc.createdAt
    });
  }

  async record(auditLog) {
    const actorCodigo =
      auditLog.actorCodigo || AuditLog.generarCodigoActor(auditLog.actorRol, auditLog.actorId);

    const doc = await AuditLogModel.create({
      solicitudId: auditLog.solicitudId,
      accion: auditLog.accion,
      actorId: auditLog.actorId,
      actorRol: auditLog.actorRol,
      actorCodigo,
      campo: auditLog.campo,
      valorAnterior: auditLog.valorAnterior,
      valorNuevo: auditLog.valorNuevo,
      motivo: auditLog.motivo
    });
    return this.toDomain(doc);
  }

  async findBySolicitudId(solicitudId) {
    const docs = await AuditLogModel.find({ solicitudId }).sort({ createdAt: -1 });
    return docs.map(doc => this.toDomain(doc));
  }

  async findAll(filtros = {}) {
    const query = {};
    if (filtros.solicitudId) query.solicitudId = filtros.solicitudId;
    if (filtros.accion) query.accion = filtros.accion;
    if (filtros.actorRol) query.actorRol = filtros.actorRol;
    if (filtros.campo) query.campo = filtros.campo;

    const docs = await AuditLogModel.find(query).sort({ createdAt: -1 });
    return docs.map(doc => this.toDomain(doc));
  }

  async findAllAuditor(filtros = {}) {
    const query = {};
    if (filtros.solicitudId) query.solicitudId = filtros.solicitudId;
    if (filtros.accion) query.accion = filtros.accion;
    if (filtros.actorRol) query.actorRol = filtros.actorRol;
    if (filtros.campo) query.campo = filtros.campo;

    if (filtros.fechaDesde || filtros.fechaHasta) {
      query.createdAt = {};
      if (filtros.fechaDesde) query.createdAt.$gte = new Date(filtros.fechaDesde);
      if (filtros.fechaHasta) query.createdAt.$lte = new Date(filtros.fechaHasta);
    }

    const docs = await AuditLogModel.find(query).sort({ createdAt: -1 });

    return docs.map(doc => ({
      id: doc._id.toString(),
      solicitudId: doc.solicitudId.toString(),
      accion: doc.accion,
      actorRol: doc.actorRol,
      actorCodigo: doc.actorCodigo,
      campo: doc.campo,
      valorAnterior: doc.valorAnterior,
      valorNuevo: doc.valorNuevo,
      motivo: doc.motivo,
      createdAt: doc.createdAt
    }));
  }
}
