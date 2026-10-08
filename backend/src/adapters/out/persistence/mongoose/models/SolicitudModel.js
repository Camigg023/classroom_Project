import mongoose from 'mongoose';
import { SOLICITUD_ESTADOS, PRIORIDADES, CATEGORIAS } from '../../../../../domain/entities/Solicitud.js';

const comentarioSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    autorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    autorNombre: { type: String, required: true },
    autorRol: { type: String, required: true },
    contenido: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const solicitudSchema = new mongoose.Schema(
  {
    codigo: { type: String, required: true, unique: true, index: true },
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, enum: CATEGORIAS },
    estado: {
      type: String,
      required: true,
      enum: Object.values(SOLICITUD_ESTADOS),
      default: SOLICITUD_ESTADOS.NUEVO,
      index: true
    },
    prioridad: {
      type: String,
      required: true,
      enum: Object.values(PRIORIDADES),
      default: PRIORIDADES.MEDIA,
      index: true
    },
    justificacionPrioridad: { type: String, default: null },
    fechaObjetivo: { type: Date, default: null },
    propietarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    propietarioNombre: { type: String, required: true },
    agenteAsignadoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    agenteAsignadoNombre: { type: String, default: null },
    asignadoPorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    asignadoPorNombre: { type: String, default: null },
    asignadoAt: { type: Date, default: null },
    motivoReapertura: { type: String, default: null },
    comentarios: [comentarioSchema]
  },
  { timestamps: true }
);

solicitudSchema.index({ titulo: 'text', descripcion: 'text' });

export const SolicitudModel = mongoose.models.Solicitud || mongoose.model('Solicitud', solicitudSchema);
