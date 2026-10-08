import mongoose from 'mongoose';
import { NOTIFICACION_TIPOS } from '../../../../../domain/entities/Notificacion.js';

const notificacionSchema = new mongoose.Schema(
  {
    destinatarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tipo: { type: String, required: true, enum: Object.values(NOTIFICACION_TIPOS) },
    titulo: { type: String, required: true, trim: true },
    mensaje: { type: String, required: true, trim: true },
    solicitudId: { type: mongoose.Schema.Types.ObjectId, ref: 'Solicitud', default: null },
    codigoSolicitud: { type: String, default: null },
    leida: { type: Boolean, default: false, index: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const NotificacionModel = mongoose.models.Notificacion || mongoose.model('Notificacion', notificacionSchema);
