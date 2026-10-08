# G01-Sprint-3-MatrizDeTrazabilidad-20261002-v1.0
## Matriz de Trazabilidad de Requisitos - Sprint 3 (MAR-Z Core)

**Fecha:** 2026-10-02  
**Versión:** 1.0  
**Equipo:** G01  

---

### Matriz Integral de Trazabilidad (HU09 a HU12 + CC-02)

| Requisito / HU | Capa de Dominio | Caso de Uso (Application) | Puertos (Ports) | Adaptadores de Persistencia | Controlador y Endpoint HTTP | Componente / Vista Frontend | Prueba Automatizada | Estado |
|---|---|---|---|---|---|---|---|---|
| **HU09 - Buscar y filtrar** | Scoping por rol en entidades `User` y `Solicitud` | `BuscarSolicitudesUseCase` | `ISolicitudRepository` | `MongoSolicitudRepository.buscar` | `SolicitudController.getAllCoordinador` (`GET /api/solicitudes`) | `CoordinadorDashboardPage`, `MisSolicitudesPage`, `AgenteDashboardPage` (Filtros combinados) | `PA-09` (Casos 9.1 a 9.3) | Verificado / Aprobado |
| **HU10 - Indicadores agregados** | Métricas operacionales, cálculo mediano de ciclo, política no-vigilancia | `GetIndicadoresAgregadosUseCase` | `ISolicitudRepository` | `MongoSolicitudRepository.getIndicadoresAgregados` | `SolicitudController.getIndicadores` (`GET /api/solicitudes/indicadores`) | `IndicadoresPage` (`/coordinador/indicadores`) | `PA-10` (Casos 10.1 a 10.3) | Verificado / Aprobado |
| **HU11 - Historial para auditor (CC-02)** | Seudonimización `AuditLog.actorCodigo`, principio de proporcionalidad | `GetHistorialAuditorUseCase` | `IAuditRepository` | `MongoAuditRepository.findAllAuditor` | `AuditoriaController.getHistorial` (`GET /api/auditoria`) | `HistorialAuditorPage` (`/auditor/historial`) | `PA-11` (Casos 11.1 a 11.3) | Verificado / Aprobado |
| **HU12 - Exportar reporte CSV (CC-02)** | Sanitización OWASP CSV, exclusión texto libre, auditoría obligatoria | `ExportarReporteCsvUseCase` | `ISolicitudRepository`, `IAuditRepository` | `MongoSolicitudRepository.findForExport`, `MongoAuditRepository.record` | `SolicitudController.exportarCsv` (`GET /api/solicitudes/exportar/csv`) | `CoordinadorDashboardPage` (Botón "Exportar CSV") | `PA-12` (Casos 12.1 a 12.5) | Verificado / Aprobado |
| **CC-02 - Proporcionalidad y Minimización** | Generador de seudónimos de actor, sanitizador de inyección de fórmulas | `GetHistorialAuditorUseCase`, `ExportarReporteCsvUseCase` | `IAuditRepository`, `ISolicitudRepository` | `MongoAuditRepository`, `MongoSolicitudRepository` | `GET /api/auditoria`, `GET /api/solicitudes/exportar/csv` | `HistorialAuditorPage`, `CoordinadorDashboardPage` | `test-sprint3.js` (Casos 11.2, 12.3, 12.4) | Verificado / Aprobado |

---

### Resumen de Cumplimiento Arquitectónico y Normativo
- **Arquitectura Hexagonal Pura:** Las reglas de negocio de agregación, cálculo de medianas, seudonimización y mitigación contra inyección de fórmulas residen en la capa de aplicación y dominio, desacopladas de Express y Mongoose.
- **Principio de Privacidad y Proporcionalidad:** En cumplimiento de la directriz de no-vigilancia, no existen endpoints ni campos en base de datos que expongan métricas de productividad o rankings por individuo.
- **Seguridad en la Exportación:** Mitigación activa contra vectores de ataque de inyección de fórmulas en hojas de cálculo según estándares OWASP.
