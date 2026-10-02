# G01-Sprint-2-Planificacion-DefinicionDeHistoriasYPruebas-20261002-v1.0
## Modelo MAR-Z - Sprint 2: Asignación, Avance y Cierre Trazable

**Fecha:** 2026-10-02  
**Versión:** 1.0  
**Equipo / Grupo Experimental:** G01  
**Sprint Objetivo:** Sprint 2  

---

### 1. Objetivo del Sprint
Implementar y consolidar la gestión operativa de solicitudes: asignación formal de responsables con validación estricta de estado, documentación inmutable de notas de trabajo, control del ciclo de vida a través de una máquina de estados determinista, y cierre/reapertura controlada por el solicitante propietario, incorporando el Cambio Controlado 1 para prioridades críticas.

---

### 2. Matriz de Historias de Usuario - Sprint 2

| ID | Historia de Usuario | Criterios de Aceptación Mínimos | Puntos | Estado |
|---|---|---|---|---|
| **HU05** | Como coordinador, quiero asignar una solicitud a un agente activo para definir el responsable de la atención. | - Solo rol `Coordinador` puede asignar.<br>- Validación estricta en servidor de agente activo con rol `Agente`.<br>- Registro de quién asignó y marca de tiempo exacta en trazabilidad.<br>- Generación de notificación interna persistente dirigida al agente asignado.<br>- Rechazo formal ante agente inexistente, inactivo o solicitud no encontrada. | 5 | Implementada |
| **HU06** | Como agente, quiero registrar comentarios de trabajo para documentar avances técnicos. | - Comentario no puede estar vacío ni contener solo espacios.<br>- Inmutabilidad absoluta: autor, rol y fecha de creación bloqueados a nivel de API y persistencia (sin edición ni borrado).<br>- Visualización cronológica en el detalle de la solicitud para todos los roles autorizados. | 3 | Implementada |
| **HU07** | Como agente, quiero cambiar el estado de la solicitud para reflejar el avance real del flujo de atención. | - Validación estricta contra matriz de transiciones permitidas.<br>- Rechazo con HTTP 400 y mensaje claro ante transiciones prohibidas.<br>- Registro obligatorio en colección `AuditLog` (actor, fecha, estado anterior, estado nuevo, motivo). | 5 | Implementada |
| **HU08** | Como solicitante, quiero confirmar o reabrir la solución para validar la conformidad del soporte recibido. | - Exclusivo para el propietario de la solicitud cuando el estado es `Resuelta`.<br>- Confirmación pasa la solicitud a estado `Cerrada`.<br>- Reapertura exige obligatoriamente un motivo descriptivo y cambia el estado a `Reabierta`.<br>- Ambas acciones quedan auditadas en el historial de trazabilidad. | 5 | Implementada |
| **CC-01** | Cambio Controlado 1: Obligatoriedad de justificación y fecha objetivo para Prioridad Alta. | - Validación tanto en cliente (React) como en servidor (Node.js/Dominio) en creación (HU02) y priorización (HU04).<br>- Rechazo HTTP 400 si falta cualquiera de los dos campos cuando la prioridad es Alta. | - | Implementada |

---

### 3. Matriz de Pruebas de Aceptación (PA-05 a PA-08 y Regresión)

- **PA-01 a PA-04 (Regresión Sprint 1):**
  - PA-01: Autenticación exitosa y rechazo con 401 sin revelar usuario.
  - PA-02: Creación exitosa de solicitudes con código único y estado `Nuevo`.
  - PA-03: Aislamiento estricto de solicitudes del solicitante (403 Forbidden a terceros).
  - PA-04: Priorización autorizada para el coordinador con auditoría.

- **PA-05 (HU05 - Asignación de Solicitudes):**
  - Caso 5.1: Solicitante o usuario no coordinador intenta asignar -> Retorna HTTP 403 Forbidden.
  - Caso 5.2: Coordinador intenta asignar a un usuario que no tiene rol de Agente -> Retorna HTTP 400.
  - Caso 5.3: Coordinador asigna solicitud a agente activo -> Retorna HTTP 200, asigna responsable, actualiza estado a `Asignado` y registra auditoría.
  - Caso 5.4: Agente consulta `/api/notificaciones` y encuentra la notificación interna de asignación generada.

- **PA-06 (HU06 - Comentarios de Trabajo):**
  - Caso 6.1: Agente intenta enviar comentario con contenido vacío o espacios en blanco -> Retorna HTTP 400.
  - Caso 6.2: Agente registra comentario de avance válido -> Retorna HTTP 201, autor y fecha inmutables.
  - Caso 6.3: Comentario persiste y es consultado en el detalle de la solicitud sin opciones de edición/borrado.

- **PA-07 (HU07 - Cambiar Estado):**
  - Caso 7.1: Agente realiza transición permitida `Asignado` -> `En Proceso` -> Retorna HTTP 200 y registra en `AuditLog`.
  - Caso 7.2: Intento de transición prohibida por matriz (`En Proceso` directo a `Cerrada`) -> Retorna HTTP 400 o 403.
  - Caso 7.3: Transición permitida `En Proceso` -> `Resuelta` -> Retorna HTTP 200 y actualiza solicitud.

- **PA-08 (HU08 - Confirmar o Reabrir Solución):**
  - Caso 8.1: Solicitante intenta reabrir sin suministrar motivo -> Retorna HTTP 400 con validación.
  - Caso 8.2: Usuario ajeno intenta reabrir o cerrar solicitud -> Retorna HTTP 403 Forbidden.
  - Caso 8.3: Solicitante propietario reabre con motivo válido -> Pasa a estado `Reabierta` con motivo guardado.
  - Caso 8.4: Agente atiende solicitud reabierta hasta `Resuelta`.
  - Caso 8.5: Solicitante propietario confirma solución -> Pasa a estado final `Cerrada`.
  - Caso 8.6: Intento de modificar solicitud en estado `Cerrada` -> Rechazado por ser estado final inmutable.

- **Cambio Controlado 1:**
  - Caso CC.1: Creación de solicitud con prioridad `Alta` sin justificación o sin fecha -> Retorna HTTP 400.
  - Caso CC.2: Priorización a `Alta` sin justificación o sin fecha -> Retorna HTTP 400.
