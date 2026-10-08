import { ForbiddenError } from '../../../domain/exceptions/DomainError.js';
import { ROLES } from '../../../domain/entities/User.js';
import { AuditLog } from '../../../domain/entities/AuditLog.js';

export class ExportarReporteCsvUseCase {
  constructor(solicitudRepository, auditRepository) {
    this.solicitudRepository = solicitudRepository;
    this.auditRepository = auditRepository;
  }

  sanitizeCsvField(val) {
    if (val === null || val === undefined) return '';
    let str = String(val).trim();

    // Mitigación estricta contra CSV Formula Injection (OWASP)
    if (/^[=+\-@\t\r]/.test(str)) {
      str = `'${str}`;
    }

    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      str = `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  async execute(queryParams = {}, usuarioAuth) {
    if (usuarioAuth.rol !== ROLES.COORDINADOR) {
      throw new ForbiddenError('Acceso restringido: Solo el Coordinador tiene autorización para exportar reportes');
    }

    const filtros = {};
    if (queryParams.estado) filtros.estado = queryParams.estado;
    if (queryParams.prioridad) filtros.prioridad = queryParams.prioridad;
    if (queryParams.categoria) filtros.categoria = queryParams.categoria;
    if (queryParams.busqueda) filtros.busqueda = queryParams.busqueda;

    const registros = await this.solicitudRepository.findForExport(filtros);

    // Encabezados estrictamente estructurados (Sin campos de texto libre)
    const headers = [
      'ID',
      'Codigo',
      'Categoria',
      'Prioridad',
      'Estado',
      'FechaCreacion',
      'FechaActualizacion',
      'ActorSolicitante',
      'ActorAgente'
    ];

    const rows = registros.map((r) => [
      this.sanitizeCsvField(r.id),
      this.sanitizeCsvField(r.codigo),
      this.sanitizeCsvField(r.categoria),
      this.sanitizeCsvField(r.prioridad),
      this.sanitizeCsvField(r.estado),
      this.sanitizeCsvField(r.createdAt),
      this.sanitizeCsvField(r.updatedAt),
      this.sanitizeCsvField(r.actorSolicitante),
      this.sanitizeCsvField(r.actorAgente)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(','))
    ].join('\r\n');

    // Registro obligatorio en auditoría
    const filtroStr = Object.entries(filtros)
      .map(([k, v]) => `${k}=${v}`)
      .join('&') || 'sin_filtros';

    await this.auditRepository.record(
      new AuditLog({
        solicitudId: null,
        accion: 'EXPORTACION_CSV',
        actorId: usuarioAuth.id,
        actorRol: usuarioAuth.rol,
        campo: 'reporte',
        valorAnterior: null,
        valorNuevo: `${registros.length} registros exportados`,
        motivo: `Filtros aplicados: ${filtroStr}`
      })
    );

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `reporte_solicitudes_${timestamp}.csv`;

    return {
      filename,
      csvContent,
      totalRegistros: registros.length
    };
  }
}
