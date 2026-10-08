# G01-Sprint-2-MatrizDeTrazabilidad-20261002-v1.0
## Matriz de Trazabilidad de Requisitos - Sprint 2 (MAR-Z Core)

**Fecha:** 2026-10-02  
**Versión:** 1.0  
**Equipo:** G01  

---

### Matriz Integral de Trazabilidad (HU05 a HU08 + CC-01)

| Requisito / HU | Capa de Dominio | Caso de Uso (Application) | Puertos (Ports) | Adaptadores de Persistencia | Controlador y Endpoint HTTP | Componente / Vista Frontend | Prueba Automatizada | Estado |
|---|---|---|---|---|---|---|---|---|
| **HU05 - Asignar solicitud** | `Solicitud.asignarAgente()`, `Notificacion` | `AsignarSolicitudUseCase`, `GetAgentesActivosUseCase` | `ISolicitudRepository`, `IUserRepository`, `INotificacionRepository` | `MongoSolicitudRepository`, `MongoUserRepository`, `MongoNotificacionRepository` | `SolicitudController.asignar` (`PATCH /api/solicitudes/:id/asignar`), `UserController.getAgentesActivos` (`GET /api/users/agentes`) | `CoordinadorDashboardPage` (Modal Asignación), `DetalleSolicitudPage` | `PA-05` (Casos 5.1 a 5.4) | Verificado / Aprobado |
| **HU06 - Comentarios de trabajo** | `comentarioSchema` (inmutable), validación no-vacío | `AddComentarioUseCase` | `ISolicitudRepository` | `MongoSolicitudRepository.addComentario` | `SolicitudController.addComentario` (`POST /api/solicitudes/:id/comentarios`) | `DetalleSolicitudPage` (Sección Comentarios y formulario) | `PA-06` (Casos 6.1 a 6.3) | Verificado / Aprobado |
| **HU07 - Cambiar estado** | `TRANSICIONES_PERMITIDAS`, `Solicitud.cambiarEstado()` | `CambiarEstadoUseCase` | `ISolicitudRepository`, `IAuditRepository` | `MongoSolicitudRepository`, `MongoAuditRepository` | `SolicitudController.cambiarEstado` (`PATCH /api/solicitudes/:id/estado`) | `DetalleSolicitudPage` (Selector Flujo de Atención), `AgenteDashboardPage` | `PA-07` (Casos 7.1 a 7.3) | Verificado / Aprobado |
| **HU08 - Confirmar o reabrir solución** | `Solicitud.confirmarCierre()`, `Solicitud.reabrir()` | `ConfirmarCierreUseCase`, `ReabrirSolicitudUseCase` | `ISolicitudRepository`, `IAuditRepository` | `MongoSolicitudRepository`, `MongoAuditRepository` | `SolicitudController.confirmarCierre` (`POST /api/solicitudes/:id/confirmar-cierre`), `SolicitudController.reabrir` (`POST /api/solicitudes/:id/reabrir`) | `DetalleSolicitudPage` (Banners de Aceptación y Modal Reapertura) | `PA-08` (Casos 8.1 a 8.6) | Verificado / Aprobado |
| **CC-01 - Prioridad Alta Obligatoria** | `Solicitud.setPrioridad()` | `CreateSolicitudUseCase`, `PrioritizeSolicitudUseCase` | `ISolicitudRepository`, `IAuditRepository` | `MongoSolicitudRepository`, `MongoAuditRepository` | `POST /api/solicitudes`, `PATCH /api/solicitudes/:id/prioridad` | `NuevaSolicitudPage`, `CoordinadorDashboardPage` (Modal Priorización) | `test-sprint2.js` (Casos CC.1 y CC.2) | Verificado / Aprobado |

---

### Resumen de Cumplimiento de Criterios
- **Aislamiento de Dominio:** 100% independiente del framework web y la base de datos.
- **Inmutabilidad de Trazabilidad:** Auditoría y comentarios bloqueados contra modificación y eliminación.
- **Validación Bidireccional:** Reglas de validación idénticas tanto en cliente React como en servidor Node.js.
