# G01-Sprint-3-RegistroDeDefectos-20261002-v1.0
## Registro y Resolución de Defectos - Sprint 3 (MAR-Z Core)

**Fecha:** 2026-10-02  
**Versión:** 1.0  
**Equipo:** G01  

---

### Bitácora de Defectos Identificados y Corregidos en Pruebas

| ID Defecto | Historia / Módulo | Descripción del Hallazgo | Severidad | Causa Raíz | Acción Correctiva Aplicada | Estado Final |
|---|---|---|---|---|---|---|
| **DEF-05** | HU09 / Búsqueda y Filtros | Las opciones del filtro de categoría en interfaces frontend contenían valores simplificados (`Red`, `Acceso`) que no coincidían con el enum canónico de dominio `CATEGORIAS`. | Media | Discrepancia entre opciones estáticas en el cliente y el enum estricto de Mongoose y entidad de dominio. | Se normalizaron las opciones en `IndicadoresPage`, `CoordinadorDashboardPage` y `MisSolicitudesPage` con las categorías oficiales del sistema (`Redes y Conectividad`, `Accesos y Cuentas`, `Hardware`, `Software`, `Sistemas de Bodega y Logística`). | Resuelto y verificado (PA-09) |
| **DEF-06** | HU11 / Historial Auditor | La ruta `/api/auditoria` permitía acceso inicial al rol `Coordinador` en la definición del router Express, a pesar de que el caso de uso restringía su consumo. | Alta | Inconsistencia entre middleware `requireRoles` y los requerimientos estrictos de acceso exclusivo de solo lectura para el rol `Auditor`. | Se restringió el router exclusivamente a `requireRoles(ROLES.AUDITOR)` y se sincronizó el caso de uso `GetHistorialAuditorUseCase` para retornar HTTP 403 Forbidden a cualquier otro rol. | Resuelto y verificado (PA-11) |
| **DEF-07** | HU12 / Exportación CSV | La acción registrada en `AuditLog` por el caso de uso `ExportarReporteCsvUseCase` utilizaba una etiqueta inconsistente (`EXPORTACION_REPORTE_CSV` en lugar del identificador estándar `EXPORTACION_CSV`). | Baja | Divergencia en la convención de nombres de eventos de auditoría. | Se estandarizó la acción a `EXPORTACION_CSV` tanto en el caso de uso como en la matriz de eventos auditables, facilitando la consulta filtrada del Auditor. | Resuelto y verificado (PA-12) |
| **DEF-08** | HU11 / Trazabilidad | El modelo de auditoría persistía el campo temporal como `createdAt`, mientras que algunas vistas esperaban el alias `timestamp`. | Baja | Mapeo incompleto en la proyección del repositorio de auditoría hacia el DTO de salida para el auditor. | Se agregó el alias `timestamp: d.createdAt` en `MongoAuditRepository.findAllAuditor`, asegurando compatibilidad transparente con clientes web y herramientas externas. | Resuelto y verificado (PA-11) |

---

### Métricas de Calidad del Sprint 3
- Total Defectos Reportados: 4
- Total Defectos Subsanados: 4 (100% efectividad)
- Defectos Críticos Pendientes: 0
- Cobertura de Pruebas de Regresión y Aceptación: 100% (PA-01 a PA-12)
