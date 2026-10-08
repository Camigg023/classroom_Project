# G01-Sprint-2-RegistroDeDefectos-20261002-v1.0
## Registro y Resolución de Defectos - Sprint 2 (MAR-Z Core)

**Fecha:** 2026-10-02  
**Versión:** 1.0  
**Equipo:** G01  

---

### Bitácora de Defectos Identificados y Corregidos en Pruebas

| ID Defecto | Historia / Módulo | Descripción del Hallazgo | Severidad | Causa Raíz | Acción Correctiva Aplicada | Estado Final |
|---|---|---|---|---|---|---|
| **DEF-01** | HU06 / Comentarios | Intento de registrar comentarios únicamente con espacios o saltos de línea pasaba validación inicial de longitud. | Media | No se aplicaba `.trim()` estricto antes de validar la longitud del contenido en la capa de aplicación. | Se incluyó regla en `AddComentarioUseCase`: si `!dto.contenido?.trim()` se lanza `ValidationError('El comentario no puede estar vacío ni contener solo espacios')`. | Resuelto y verificado (PA-06) |
| **DEF-02** | HU07 / Máquina de Estados | Intento de realizar transiciones desde el estado `Cerrada` no retornaba mensaje específico de estado terminal. | Media | La matriz de transiciones no definía explícitamente lista vacía para `Cerrada`. | Se declaró `TRANSICIONES_PERMITIDAS[SOLICITUD_ESTADOS.CERRADA] = []`, garantizando bloqueo terminal de solicitudes cerradas con mensaje 400. | Resuelto y verificado (PA-07 / PA-08) |
| **DEF-03** | HU08 / Cierre y Reapertura | Posible intento de reabrir solicitudes que estuvieran en estado diferente a `Resuelta` (ej. en `Nuevo` o `Asignado`). | Alta | Faltaba comprobación de precondición de estado antes de evaluar el motivo de reapertura. | Se incorporó en `Solicitud.reabrir()` y `ReabrirSolicitudUseCase` la validación estricta de que el estado actual debe ser `SOLICITUD_ESTADOS.RESUELTA`. | Resuelto y verificado (PA-08) |
| **DEF-04** | HU05 / Asignación | Asignación a usuario inactivo o con rol distinto a `Agente` no retornaba error descriptivo. | Alta | La búsqueda inicial en persistencia no validaba simultáneamente rol y estado activo del destinatario. | En `AsignarSolicitudUseCase` se implementaron tres guardas consecutivas: existencia de usuario, rol `ROLES.AGENTE` y método `agente.isActivo()`. | Resuelto y verificado (PA-05) |

---

### Métricas de Calidad del Sprint 2
- Total Defectos Reportados: 4
- Total Defectos Subsanados: 4 (100% efectividad)
- Defectos Críticos Pendientes: 0
- Cobertura de Pruebas de Aceptación: 100% (PA-01 a PA-08 y Cambio Controlado 1)
