import { ISolicitudRepository } from '../../../../../ports/repositories/ISolicitudRepository.js';
import { SolicitudModel } from '../models/SolicitudModel.js';
import { Solicitud, SOLICITUD_ESTADOS } from '../../../../../domain/entities/Solicitud.js';
import { AuditLog } from '../../../../../domain/entities/AuditLog.js';

export class MongoSolicitudRepository extends ISolicitudRepository {
  toDomain(doc) {
    if (!doc) return null;
    const solicitud = new Solicitud({
      id: doc._id.toString(),
      codigo: doc.codigo,
      titulo: doc.titulo,
      descripcion: doc.descripcion,
      categoria: doc.categoria,
      estado: doc.estado,
      prioridad: doc.prioridad,
      justificacionPrioridad: doc.justificacionPrioridad,
      fechaObjetivo: doc.fechaObjetivo,
      propietarioId: doc.propietarioId ? doc.propietarioId.toString() : null,
      propietarioNombre: doc.propietarioNombre,
      agenteAsignadoId: doc.agenteAsignadoId ? doc.agenteAsignadoId.toString() : null,
      agenteAsignadoNombre: doc.agenteAsignadoNombre,
      asignadoPorId: doc.asignadoPorId ? doc.asignadoPorId.toString() : null,
      asignadoPorNombre: doc.asignadoPorNombre,
      asignadoAt: doc.asignadoAt,
      motivoReapertura: doc.motivoReapertura,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
    solicitud.comentarios = (doc.comentarios || []).map(c => ({
      id: c.id,
      autorId: c.autorId ? c.autorId.toString() : null,
      autorNombre: c.autorNombre,
      autorRol: c.autorRol,
      contenido: c.contenido,
      createdAt: c.createdAt
    }));
    return solicitud;
  }

  async generateNextCodigo() {
    const year = new Date().getFullYear();
    const prefix = `SOL-${year}-`;
    const latest = await SolicitudModel.findOne({ codigo: new RegExp(`^${prefix}`) }).sort({ codigo: -1 });

    let nextSeq = 1;
    if (latest && latest.codigo) {
      const parts = latest.codigo.split('-');
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq)) nextSeq = seq + 1;
    }
    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  }

  async save(solicitud) {
    const doc = await SolicitudModel.create({
      codigo: solicitud.codigo,
      titulo: solicitud.titulo,
      descripcion: solicitud.descripcion,
      categoria: solicitud.categoria,
      estado: solicitud.estado,
      prioridad: solicitud.prioridad,
      justificacionPrioridad: solicitud.justificacionPrioridad,
      fechaObjetivo: solicitud.fechaObjetivo,
      propietarioId: solicitud.propietarioId,
      propietarioNombre: solicitud.propietarioNombre,
      agenteAsignadoId: solicitud.agenteAsignadoId,
      agenteAsignadoNombre: solicitud.agenteAsignadoNombre,
      asignadoPorId: solicitud.asignadoPorId,
      asignadoPorNombre: solicitud.asignadoPorNombre,
      asignadoAt: solicitud.asignadoAt,
      motivoReapertura: solicitud.motivoReapertura,
      comentarios: []
    });
    return this.toDomain(doc);
  }

  async findById(id) {
    const doc = await SolicitudModel.findById(id);
    return this.toDomain(doc);
  }

  async findByPropietario(propietarioId) {
    const docs = await SolicitudModel.find({ propietarioId }).sort({ createdAt: -1 });
    return docs.map(doc => this.toDomain(doc));
  }

  async findAll(filtros = {}, orden = { createdAt: -1 }) {
    const query = {};
    if (filtros.estado) query.estado = filtros.estado;
    if (filtros.prioridad) query.prioridad = filtros.prioridad;
    if (filtros.categoria) query.categoria = filtros.categoria;
    if (filtros.propietarioId) query.propietarioId = filtros.propietarioId;
    if (filtros.agenteAsignadoId) query.agenteAsignadoId = filtros.agenteAsignadoId;

    if (filtros.busqueda) {
      const regex = new RegExp(filtros.busqueda, 'i');
      query.$or = [{ titulo: regex }, { descripcion: regex }, { codigo: regex }];
    }

    const docs = await SolicitudModel.find(query).sort(orden);
    return docs.map(doc => this.toDomain(doc));
  }

  async update(solicitud) {
    const doc = await SolicitudModel.findByIdAndUpdate(
      solicitud.id,
      {
        estado: solicitud.estado,
        prioridad: solicitud.prioridad,
        justificacionPrioridad: solicitud.justificacionPrioridad,
        fechaObjetivo: solicitud.fechaObjetivo,
        agenteAsignadoId: solicitud.agenteAsignadoId,
        agenteAsignadoNombre: solicitud.agenteAsignadoNombre,
        asignadoPorId: solicitud.asignadoPorId,
        asignadoPorNombre: solicitud.asignadoPorNombre,
        asignadoAt: solicitud.asignadoAt,
        motivoReapertura: solicitud.motivoReapertura
      },
      { new: true }
    );
    return this.toDomain(doc);
  }

  async addComentario(solicitudId, comentario) {
    const doc = await SolicitudModel.findByIdAndUpdate(
      solicitudId,
      {
        $push: {
          comentarios: {
            id: comentario.id,
            autorId: comentario.autorId,
            autorNombre: comentario.autorNombre,
            autorRol: comentario.autorRol,
            contenido: comentario.contenido,
            createdAt: comentario.createdAt || new Date()
          }
        }
      },
      { new: true }
    );
    return this.toDomain(doc);
  }

  async getIndicadoresAgregados(filtros = {}) {
    const query = {};
    if (filtros.categoria) query.categoria = filtros.categoria;
    if (filtros.prioridad) query.prioridad = filtros.prioridad;

    const all = await SolicitudModel.find(query);
    const totalSolicitudes = all.length;

    const volumenPorEstado = {
      [SOLICITUD_ESTADOS.NUEVO]: 0,
      [SOLICITUD_ESTADOS.ASIGNADO]: 0,
      [SOLICITUD_ESTADOS.EN_PROCESO]: 0,
      [SOLICITUD_ESTADOS.RESUELTA]: 0,
      [SOLICITUD_ESTADOS.CERRADA]: 0,
      [SOLICITUD_ESTADOS.REABIERTA]: 0
    };

    const ciclosHoras = [];

    all.forEach(s => {
      if (volumenPorEstado[s.estado] !== undefined) {
        volumenPorEstado[s.estado]++;
      }
      if (s.estado === SOLICITUD_ESTADOS.CERRADA || s.estado === SOLICITUD_ESTADOS.RESUELTA) {
        const diffMs = new Date(s.updatedAt) - new Date(s.createdAt);
        const horas = Math.max(0, diffMs / (1000 * 60 * 60));
        ciclosHoras.push(horas);
      }
    });

    let tiempoMedianoCicloHoras = 0;
    if (ciclosHoras.length > 0) {
      ciclosHoras.sort((a, b) => a - b);
      const mid = Math.floor(ciclosHoras.length / 2);
      tiempoMedianoCicloHoras =
        ciclosHoras.length % 2 !== 0
          ? ciclosHoras[mid]
          : (ciclosHoras[mid - 1] + ciclosHoras[mid]) / 2;
      tiempoMedianoCicloHoras = Number(tiempoMedianoCicloHoras.toFixed(2));
    }

    return {
      totalSolicitudes,
      volumenPorEstado,
      distribucionEstados: volumenPorEstado,
      tiempoMedianoCicloHoras
    };
  }

  async findForExport(filtros = {}) {
    const query = {};
    if (filtros.estado) query.estado = filtros.estado;
    if (filtros.prioridad) query.prioridad = filtros.prioridad;
    if (filtros.categoria) query.categoria = filtros.categoria;
    if (filtros.busqueda) {
      const regex = new RegExp(filtros.busqueda, 'i');
      query.$or = [{ titulo: regex }, { descripcion: regex }, { codigo: regex }];
    }

    const docs = await SolicitudModel.find(query).sort({ createdAt: -1 });

    return docs.map(doc => ({
      id: doc._id.toString(),
      codigo: doc.codigo,
      categoria: doc.categoria,
      prioridad: doc.prioridad,
      estado: doc.estado,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : '',
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : '',
      actorSolicitante: AuditLog.generarCodigoActor('Solicitante', doc.propietarioId),
      actorAgente: doc.agenteAsignadoId
        ? AuditLog.generarCodigoActor('Agente', doc.agenteAsignadoId)
        : 'SIN_ASIGNAR'
    }));
  }
}
