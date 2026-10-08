# G01-Sprint-3-Planificacion-DefinicionDeHistoriasYPruebas-20261002-v1.0
## Modelo MAR-Z - Sprint 3: Consulta, Indicadores y Auditoría Proporcional

**Fecha:** 2026-10-02  
**Versión:** 1.0  
**Equipo / Grupo Experimental:** G01  
**Sprint Objetivo:** Sprint 3  

---

### 1. Objetivo del Sprint
Facilitar la consulta autorizada, la generación de indicadores operacionales agregados respetando los principios éticos de no-vigilancia individual, la trazabilidad proporcional de decisiones para el rol Auditor protegiendo la identidad de los actores, y la exportación segura de reportes estructurados para el Coordinador blindados contra ataques de inyección de fórmulas CSV, integrando el Cambio Controlado 2.

---

### 2. Matriz de Historias de Usuario - Sprint 3

| ID | Historia de Usuario | Criterios de Aceptación Mínimos | Puntos | Estado |
|---|---|---|---|---|
| **HU09** | Como usuario del sistema, quiero buscar y filtrar solicitudes para localizar información autorizada de manera ágil. | - Búsqueda por texto libre insensible a mayúsculas/minúsculas en título y descripción.<br>- Filtros combinables por estado, prioridad y categoría.<br>- **Aislamiento estricto en servidor:** Solicitante solo accede a sus solicitudes; Agente a sus asignadas o autorizadas; Coordinador a todas.<br>- Consistencia total entre filtros aplicados en servidor y cliente. | 5 | Implementada |
| **HU10** | Como coordinador, quiero consultar indicadores agregados para la gestión y toma de decisiones del servicio. | - Volumen de solicitudes agrupadas por estado.<br>- **Tiempo mediano de ciclo** calculado formalmente (desde creación hasta su confirmación o cierre).<br>- Filtros reproducibles por estado, prioridad y categoría.<br>- **Prohibición estricta de rankings individuales**, comparativas de desempeño o métricas por persona (política de no-vigilancia).<br>- Acceso restringido exclusivamente al rol `Coordinador`. | 8 | Implementada |
| **HU11** | Como auditor, quiero consultar el historial para verificar decisiones de forma proporcional (Cambio Controlado 2). | - Acceso exclusivo de **solo lectura** para el rol `Auditor`.<br>- Inmutabilidad absoluta: ningún rol (ni siquiera el Coordinador) puede modificar o eliminar registros.<br>- **Seudónimo de actor:** el historial muestra `actorCodigo` (ej. `SOL-XXXX`, `CRD-XXXX`, `AGT-XXXX`), protegiendo nombres reales y correos electrónicos.<br>- Proporcionalidad: incluye campo modificado, valores anterior/nuevo y fecha, **excluyendo textos libres innecesarios**.<br>- Validación estricta en servidor (HTTP 403 a roles no autorizados). | 5 | Implementada |
| **HU12** | Como coordinador, quiero exportar un reporte para análisis autorizado (Cambio Controlado 2). | - Exportación a formato CSV aplicando los filtros seleccionados.<br>- **Exclusión estricta de campos de texto libre:** No se exportan título, descripción, comentarios, justificaciones ni motivos de reapertura.<br>- Inclusión exclusiva de campos estructurados: ID, Código, Categoría, Prioridad, Estado, Fechas y Actores codificados.<br>- **Protección activa contra CSV Formula Injection (OWASP):** sanitización anteponiendo apóstrofe `'` a celdas que inicien con `=`, `+`, `-`, `@`, `\t`, `\r`.<br>- **Registro de auditoría obligatorio:** cada exportación genera un evento en `AuditLog` con actor, fecha y filtros aplicados.<br>- Acceso exclusivo del rol `Coordinador`. | 5 | Implementada |
| **CC-02** | Cambio Controlado 2: Minimización de datos y proporcionalidad en auditoría y exportación. | - Seudonimización obligatoria en auditoría (HU11).<br>- Supresión de textos libres en reportes CSV descargables (HU12).<br>- Sanitización técnica contra ejecución de fórmulas en hojas de cálculo. | - | Implementada |

---

### 3. Matriz de Pruebas de Aceptación (PA-09 a PA-12 y Regresión Completa)

- **Regresión Sprints 1 y 2 (PA-01 a PA-08):**
  - **PA-01:** Autenticación por roles (Solicitante, Agente, Coordinador, Auditor) y rechazo 401 seguro.
  - **PA-02:** Creación de solicitudes con numeración única `SOL-YYYY-XXXX` y estado `Nuevo`.
  - **PA-03:** Aislamiento estricto de requerimientos del solicitante (403 Forbidden a terceros).
  - **PA-04:** Priorización por Coordinador y validación del Cambio Controlado 1 (Justificación + Fecha objetivo en Alta).
  - **PA-05:** Asignación de solicitudes a agentes activos y despacho de notificación interna persistente.
  - **PA-06:** Registro de comentarios de trabajo cronológicos, inmutables y no vacíos.
  - **PA-07:** Flujo determinista de estados (`Asignado` -> `En Proceso` -> `Resuelta`) con auditoría.
  - **PA-08:** Confirmación de cierre y reapertura con motivo obligatorio por el solicitante propietario.

- **Pruebas Sprint 3 (PA-09 a PA-12):**
  - **PA-09 (HU09 - Buscar y Filtrar):**
    - Caso 9.1: Búsqueda por texto libre en título y descripción localiza requerimientos autorizados.
    - Caso 9.2: Filtros combinables por estado, prioridad y categoría filtran con exactitud.
    - Caso 9.3: Validación en servidor confirma que el Solicitante solo recibe sus propios registros.
  - **PA-10 (HU10 - Indicadores Agregados):**
    - Caso 10.1: Acceso exclusivo para Coordinador; rechazo con HTTP 403 a otros roles.
    - Caso 10.2: Cálculo exacto de volumen por estado y tiempo mediano de ciclo en horas/días.
    - Caso 10.3: Verificación de no-vigilancia: respuesta no contiene rankings ni métricas por persona.
  - **PA-11 (HU11 - Historial para Auditor + Cambio Controlado 2):**
    - Caso 11.1: Acceso exclusivo de solo lectura para el rol Auditor (403 a Coordinador, Agente y Solicitante).
    - Caso 11.2: Verificación de seudónimo en `actorCodigo` sin revelar correos ni nombres completos.
    - Caso 11.3: Inmutabilidad del registro de auditoría (sin rutas PUT/PATCH/DELETE).
  - **PA-12 (HU12 - Exportar Reporte CSV + Cambio Controlado 2):**
    - Caso 12.1: Acceso restringido exclusivamente al Coordinador.
    - Caso 12.2: Generación del CSV aplicando filtros de consulta seleccionados.
    - Caso 12.3: Exclusión absoluta de campos de texto libre (título, descripción, comentarios, justificación).
    - Caso 12.4: Mitigación contra CSV Formula Injection según lineamientos OWASP.
    - Caso 12.5: Registro auditable automático en `AuditLog` del evento de exportación.
