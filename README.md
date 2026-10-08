# MAR-Z Core - Plataforma de Gestión de Soporte Interno

Plataforma colaborativa para la gestión, asignación, trazabilidad y resolución de solicitudes de soporte interno con arquitectura hexagonal estricta.

---

## Tecnologías Utilizadas

- **Frontend:** React 18, React Router DOM, Vite, CSS modular nativo (sin frameworks sobrecargados).
- **Backend:** Node.js (v18+), Express.js, JWT, bcryptjs.
- **Base de Datos:** MongoDB Community Server con Mongoose ODM.
- **Arquitectura:** Arquitectura Hexagonal (Ports & Adapters) con dominio puro e inyección de dependencias en el Composition Root.

---

## Arquitectura del Sistema

```
backend/src/
├── domain/             # Entidades puras, reglas de negocio y excepciones de dominio
│   ├── entities/       # Solicitud, User, AuditLog, Notificacion
│   └── exceptions/     # DomainError, ValidationError, ForbiddenError, NotFoundError
├── ports/              # Interfaces de entrada y salida (contratos abstractos)
│   └── repositories/   # ISolicitudRepository, IUserRepository, IAuditRepository, INotificacionRepository
├── application/        # Casos de uso y DTOs de aplicación
│   ├── dtos/           # AuthDTOs, SolicitudDTOs
│   └── usecases/       # Casos de uso por contexto (auth, solicitudes, users, notificaciones)
├── adapters/           # Adaptadores primarios (in) y secundarios (out)
│   ├── in/http/        # Controladores Express, middlewares de auth/roles, routers
│   └── out/persistence/# Modelos y repositorios concretos de Mongoose
└── infrastructure/     # Conexión a MongoDB, configuración de entorno y seguridad
```

---

## Matriz de Transición de Estados (HU07)

El ciclo de vida de una solicitud se encuentra gobernado por una máquina de estados estricta en el dominio (`Solicitud.js`), validando transiciones permitidas según el rol del actor:

| Estado Actual | Estados Permitidos Siguientes | Rol Autorizado | Acción / Criterio |
|---|---|---|---|
| **Nuevo** | `Asignado`, `En Proceso` | Coordinador / Agente | Asignación de agente por Coordinador (HU05) o toma directa de caso. |
| **Asignado** | `En Proceso` | Agente Asignado / Coordinador | Inicio de labores y diagnóstico técnico por el agente. |
| **En Proceso** | `Resuelta` | Agente Asignado / Coordinador | Culminación de pruebas y propuesta de solución técnica. |
| **Resuelta** | `Cerrada` | Solicitante (Propietario) | HU08: El solicitante valida y acepta la solución cerrando el caso. |
| **Resuelta** | `Reabierta` | Solicitante (Propietario) | HU08: El solicitante reabre el caso aportando un motivo obligatorio. |
| **Reabierta** | `En Proceso`, `Asignado` | Agente Asignado / Coordinador | Retoma de diagnóstico correctivo para solucionar la novedad. |
| **Cerrada** | *(Ninguno)* | *(Estado Final)* | Estado final inmutable; no admite transiciones posteriores. |

Cualquier transición fuera de la matriz es rechazada con código HTTP 400 y mensaje explicativo descriptivo.

---

## Alcance Implementado

### Sprint 1
- **HU01:** Autenticación con JWT, control de acceso por roles (`Solicitante`, `Agente`, `Coordinador`, `Auditor`), passwords con bcrypt.
- **HU02:** Creación de solicitudes con generación de código correlativo `SOL-YYYY-XXXX`.
- **HU03:** Consulta y aislamiento estricto de solicitudes propias por el solicitante (HTTP 403 ante solicitudes ajenas).
- **HU04:** Priorización de solicitudes por el Coordinador con registro de auditoría.

### Sprint 2
- **HU05:** Asignación de solicitudes exclusivamente por el Coordinador. Validación de agente activo, registro de asignador con timestamp y generación de notificación interna.
- **HU06:** Registro de notas y comentarios de avance de trabajo. Inmutabilidad garantizada (sin edición ni borrado en API y persistencia).
- **HU07:** Cambio de estado con validación estricta de matriz de transiciones y trazabilidad en `AuditLog`.
- **HU08:** Confirmación de cierre y reapertura con motivo obligatorio reservadas al solicitante propietario.
- **Cambio Controlado 1:** Validación obligatoria en cliente y servidor de justificación y fecha objetivo cuando la prioridad sea **Alta** (tanto en creación como en priorización).

### Sprint 3
- **HU09:** Búsqueda libre en título/descripción y filtros combinables por estado, prioridad y categoría con aislamiento estricto por rol en servidor.
- **HU10:** Indicadores operacionales agregados para Coordinador: volumen por estado y tiempo mediano de ciclo (horas/días) con cumplimiento estricto de la política de no-vigilancia personal (prohibición total de rankings o métricas por persona).
- **HU11:** Historial de auditoría proporcional y de solo lectura exclusivo para el rol Auditor. Seudonimización obligatoria de actores (`actorCodigo`), protección de datos personales (sin correos ni nombres reales) y exclusión de textos libres (Cambio Controlado 2).
- **HU12:** Exportación de reportes estructurados en formato CSV para el Coordinador. Exclusión total de campos de texto libre, protección activa contra inyección de fórmulas CSV (`CSV Formula Injection` OWASP) y registro automático en auditoría (Cambio Controlado 2).
- **Cambio Controlado 2:** Proporcionalidad y minimización de datos en trazabilidad y reportes descargables.

---

## Endpoints de la API

### Autenticación (`/api/auth`)
- `POST /api/auth/login`: Autenticación con credenciales seguras.
- `GET /api/auth/me`: Datos del usuario autenticado.

### Solicitudes (`/api/solicitudes`)
- `POST /api/solicitudes`: Crear solicitud (Solicitante).
- `GET /api/solicitudes/mis-solicitudes`: Listar solicitudes del solicitante autenticado.
- `GET /api/solicitudes`: Listado, búsqueda y filtros combinables con aislamiento de roles (HU09).
- `GET /api/solicitudes/indicadores`: Indicadores operacionales y tiempo mediano de ciclo (Coordinador - HU10).
- `GET /api/solicitudes/exportar/csv`: Exportar reporte estructurado CSV sanitizado (Coordinador - HU12).
- `GET /api/solicitudes/:id`: Detalle completo con comentarios e historial de auditoría.
- `PATCH /api/solicitudes/:id/prioridad`: Actualizar prioridad (Coordinador).
- `PATCH /api/solicitudes/:id/asignar`: Asignar solicitud a un agente activo (Coordinador - HU05).
- `POST /api/solicitudes/:id/comentarios`: Agregar comentario de trabajo inmutable (HU06).
- `PATCH /api/solicitudes/:id/estado`: Cambiar estado según matriz (Agente/Coordinador - HU07).
- `POST /api/solicitudes/:id/confirmar-cierre`: Confirmar solución y cerrar solicitud (Solicitante - HU08).
- `POST /api/solicitudes/:id/reabrir`: Reabrir solicitud con motivo obligatorio (Solicitante - HU08).

### Auditoría y Trazabilidad (`/api/auditoria`)
- `GET /api/auditoria`: Consulta de historial proporcional con actores seudonimizados (Exclusivo Auditor - HU11).

### Usuarios y Notificaciones
- `GET /api/users/agentes`: Listar agentes activos disponibles para asignación (Coordinador/Auditor).
- `GET /api/notificaciones`: Consultar notificaciones del usuario autenticado.
- `PATCH /api/notificaciones/:id/leida`: Marcar notificación como leída.

---

## Puesta en Marcha y Pruebas

### 1. Variables de Entorno
Configurar `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/marz_support_db
JWT_SECRET=marz_super_secret_jwt_key_2026_production_ready
JWT_EXPIRES_IN=8h
CLIENT_URL=http://localhost:5173
```

### 2. Poblar Base de Datos (Seed)
```bash
cd backend
npm run seed
```

**Credenciales iniciales (Contraseña general: `Password123!`):**
- Solicitante: `solicitante@empresa.com`
- Solicitante 2: `solicitante2@empresa.com`
- Agente 1: `agente1@empresa.com`
- Agente 2: `agente2@empresa.com`
- Coordinador: `coordinador@empresa.com`
- Auditor: `auditor@empresa.com`

### 3. Ejecutar Pruebas Automatizadas
```bash
cd backend
# Ejecutar suite completa con regresión integral (PA-01 a PA-12)
npm test

# Ejecutar específicamente Sprint 3
npm run test:sprint3

# Ejecutar suites previas
npm run test:sprint2
npm run test:sprint1
```

### 4. Ejecutar Aplicación
```bash
# Backend (puerto 5000)
cd backend
npm run dev

# Frontend (puerto 5173)
cd frontend
npm run dev
```
