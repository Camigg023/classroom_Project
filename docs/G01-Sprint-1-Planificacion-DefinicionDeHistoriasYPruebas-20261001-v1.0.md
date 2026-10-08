# G01-Sprint-1-Planificacion-DefinicionDeHistoriasYPruebas-20261001-v1.0
## Modelo MAR-Z - Sprint 1: Creación de Acceso Seguro y Flujo Inicial

**Fecha:** 2026-10-01  
**Versión:** 1.0  
**Equipo / Grupo Experimental:** G01  
**Sprint Objetivo:** Sprint 1  

---

### 1. Objetivo del Sprint
Establecer el núcleo de seguridad, autenticación basada en roles y el flujo inicial de registro, consulta y priorización de solicitudes de soporte interno, bajo arquitectura hexagonal y sin exposición de datos sensibles.

---

### 2. Matriz de Historias de Usuario - Sprint 1

| ID | Historia de Usuario | Criterios de Aceptación Mínimos | Puntos | Estado |
|---|---|---|---|---|
| **HU01** | Como usuario, quiero iniciar sesión para acceder solo a las funciones de mi rol. | - Credenciales válidas retornan token JWT.<br>- Credenciales inválidas no revelan si el usuario existe.<br>- Contraseñas nunca se almacenan en texto plano (bcrypt).<br>- Cierre de sesión y control de acceso por roles (`Solicitante`, `Agente`, `Coordinador`, `Auditor`). | 5 | Implementada |
| **HU02** | Como solicitante, quiero crear una solicitud para pedir soporte. | - Título, descripción y categoría obligatorios.<br>- Autogenera código único (`SOL-YYYY-XXXX`), fecha, estado `Nuevo` y propietario.<br>- Validación de prioridad (si es Alta, justificación y fecha objetivo). | 5 | Implementada |
| **HU03** | Como solicitante, quiero consultar mis solicitudes para conocer su estado. | - Lista exclusivamente las solicitudes del solicitante autenticado.<br>- Permite abrir detalle con estado y última actualización.<br>- Prohibido el acceso a solicitudes de terceros (403 Forbidden). | 3 | Implementada |
| **HU04** | Como coordinador, quiero priorizar solicitudes para ordenar la atención. | - Prioridad válida (`Baja`, `Media`, `Alta`).<br>- Cambio 100% trazable en log de auditoría.<br>- Lista ordenable por prioridad, estado y fecha.<br>- Exclusivo para rol `Coordinador`. | 3 | Implementada |

---

### 3. Matriz de Pruebas de Aceptación (PA-01 a PA-04)

- **PA-01 (HU01 - Autenticación y Autorización):**
  - Caso 1.1: Login con `solicitante@empresa.com` y clave correcta -> Retorna HTTP 200, JWT y datos de rol.
  - Caso 1.2: Login con credencial inexistente o clave errada -> Retorna HTTP 401 con mensaje genérico: `"Credenciales inválidas"`.
  - Caso 1.3: Solicitante intenta acceder a endpoint de priorización de coordinador -> Retorna HTTP 403 Forbidden.

- **PA-02 (HU02 - Creación de Solicitud):**
  - Caso 2.1: Solicitante envía título, descripción y categoría -> Retorna HTTP 201, estado `Nuevo`, código generado y propietario asignado.
  - Caso 2.2: Solicitante omite título o descripción -> Retorna HTTP 400 con validación descriptiva.

- **PA-03 (HU03 - Consulta de Solicitudes Propias):**
  - Caso 3.1: Solicitante 1 consulta `/api/solicitudes/mis-solicitudes` -> Retorna únicamente sus solicitudes.
  - Caso 3.2: Solicitante 1 intenta consultar por ID una solicitud del Solicitante 2 -> Retorna HTTP 403 Forbidden.

- **PA-04 (HU04 - Priorización de Solicitudes):**
  - Caso 4.1: Coordinador actualiza prioridad a `Alta` con justificación y fecha -> Retorna HTTP 200 y registra evento en colección `AuditLog`.
  - Caso 4.2: Coordinador intenta marcar `Alta` sin justificación -> Retorna HTTP 400.
  - Caso 4.3: Agente o Solicitante intenta priorizar -> Retorna HTTP 403 Forbidden.
