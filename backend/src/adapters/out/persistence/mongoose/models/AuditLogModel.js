import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    solicitudId: { type: mongoose.Schema.Types.ObjectId, ref: 'Solicitud', required: true, index: true },
    accion: { type: String, required: true, index: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actorRol: { type: String, required: true, index: true },
    actorCodigo: { type: String, required: true },
    campo: { type: String, default: null },
    valorAnterior: { type: mongoose.Schema.Types.Mixed, default: null },
    valorNuevo: { type: mongoose.Schema.Types.Mixed, default: null },
    motivo: { type: String, default: null }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLogModel = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
