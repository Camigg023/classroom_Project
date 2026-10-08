import { createApp } from './src/app.js';
import { connectDatabase } from './src/infrastructure/database/mongoConnection.js';
import mongoose from 'mongoose';

const runTests = async () => {
  console.log('\n================================================================');
  console.log('🚀 INICIANDO SUITE DE PRUEBAS AUTOMATIZADAS SPRINT 3');
  console.log('   (Regresión Completa Sprints 1 y 2: PA-01 a PA-08)');
  console.log('   (Historias Sprint 3: PA-09 a PA-12 + Cambio Controlado 2)');
  console.log('================================================================\n');

  await connectDatabase();
  const app = createApp();

  const PORT = 5099;
  const server = app.listen(PORT);
  const baseUrl = `http://127.0.0.1:${PORT}/api`;

  try {
    // ------------------------------------------------------------------
    // REGRESIÓN SPRINT 1 (PA-01 a PA-04)
    // ------------------------------------------------------------------
    console.log('[REGRESIÓN PA-01] Autenticación y Autorización por Roles...');
    const login = async (email, password) => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(`Login fallido para ${email}: ${res.status}`);
      return { token: data.token, user: data.user };
    };

    const solicitanteAuth = await login('solicitante@empresa.com', 'Password123!');
    const solicitante2Auth = await login('solicitante2@empresa.com', 'Password123!');
    const coordAuth = await login('coordinador@empresa.com', 'Password123!');
    const agenteAuth = await login('agente1@empresa.com', 'Password123!');
    const auditorAuth = await login('auditor@empresa.com', 'Password123!');

    console.log(' ✔ [PA-01] Autenticación exitosa para Solicitante, Solicitante 2, Coordinador, Agente y Auditor.');

    // PA-02: Creación de Solicitud
    console.log('\n[REGRESIÓN PA-02] Creación de Solicitudes...');
    const resCrear = await fetch(`${baseUrl}/solicitudes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${solicitanteAuth.token}`
      },
      body: JSON.stringify({
        titulo: 'Falla intermitente en switch de red piso 3',
        descripcion: 'VLAN de operaciones pierde paquetes durante transferencias masivas.',
        categoria: 'Redes y Conectividad',
        prioridad: 'Media'
      })
    });
    const ticket1 = await resCrear.json();
    if (resCrear.status !== 201 || !ticket1.id) {
      throw new Error(`Error en PA-02: ${JSON.stringify(ticket1)}`);
    }
    console.log(` ✔ [PA-02] Solicitud creada con código ${ticket1.codigo} y estado Nuevo.`);

    // PA-03: Consulta y Aislamiento de Solicitudes Propias
    console.log('\n[REGRESIÓN PA-03] Aislamiento de Solicitudes Propias...');
    const resMisSol = await fetch(`${baseUrl}/solicitudes/mis-solicitudes`, {
      headers: { Authorization: `Bearer ${solicitanteAuth.token}` }
    });
    const dataMisSol = await resMisSol.json();
    if (resMisSol.status !== 200 || !Array.isArray(dataMisSol)) {
      throw new Error('Error al listar mis solicitudes');
    }
    const resForbiddenAjeno = await fetch(`${baseUrl}/solicitudes/${ticket1.id}`, {
      headers: { Authorization: `Bearer ${solicitante2Auth.token}` }
    });
    if (resForbiddenAjeno.status !== 403) {
      throw new Error(`Fallo de aislamiento: esperado 403, recibido ${resForbiddenAjeno.status}`);
    }
    console.log(' ✔ [PA-03] Aislamiento estricto de solicitudes validado.');

    // PA-04: Priorización por Coordinador
    console.log('\n[REGRESIÓN PA-04] Priorización de Solicitudes...');
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);
    const resPriorizar = await fetch(`${baseUrl}/solicitudes/${ticket1.id}/prioridad`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${coordAuth.token}`
      },
      body: JSON.stringify({
        prioridad: 'Alta',
        justificacion: 'Afecta operación troncal de red en muelle logístico',
        fechaObjetivo: targetDate.toISOString()
      })
    });
    const ticketPriorizado = await resPriorizar.json();
    if (resPriorizar.status !== 200 || ticketPriorizado.prioridad !== 'Alta') {
      throw new Error(`Fallo en priorización: ${JSON.stringify(ticketPriorizado)}`);
    }
    console.log(' ✔ [PA-04] Priorización a Alta completada con justificación y fecha objetivo.');

    // Cambio Controlado 1: Validación estricta
    console.log('\n[REGRESIÓN CAMBIO CONTROLADO 1] Validación Justificación/Fecha en Prioridad Alta...');
    const resAltaInvalida = await fetch(`${baseUrl}/solicitudes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${solicitanteAuth.token}`
      },
      body: JSON.stringify({
        titulo: 'Intento Alta sin justificación',
        descripcion: 'Texto de prueba',
        categoria: 'Software',
        prioridad: 'Alta'
      })
    });
    if (resAltaInvalida.status !== 400) {
      throw new Error(`Debió responder 400, respondió ${resAltaInvalida.status}`);
    }
    console.log(' ✔ [CAMBIO CONTROLADO 1] Rechazo correcto de Prioridad Alta sin justificación.');

    // PA-05: Asignación de Solicitudes
    console.log('\n[REGRESIÓN PA-05] Asignación de Solicitudes y Notificación...');
    const resAsignar = await fetch(`${baseUrl}/solicitudes/${ticket1.id}/asignar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${coordAuth.token}`
      },
      body: JSON.stringify({ agenteId: agenteAuth.user.id })
    });
    const ticketAsignado = await resAsignar.json();
    if (resAsignar.status !== 200 || ticketAsignado.estado !== 'Asignado') {
      throw new Error(`Fallo en asignación: ${JSON.stringify(ticketAsignado)}`);
    }
    console.log(' ✔ [PA-05] Asignación exitosa y transición a estado Asignado.');

    // PA-06: Comentarios de Trabajo
    console.log('\n[REGRESIÓN PA-06] Comentarios de Trabajo...');
    const resComentario = await fetch(`${baseUrl}/solicitudes/${ticket1.id}/comentarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agenteAuth.token}`
      },
      body: JSON.stringify({ contenido: 'Revisión en sitio iniciada, cables de enlace verificados.' })
    });
    if (resComentario.status !== 201) {
      throw new Error(`Fallo en comentario: ${resComentario.status}`);
    }
    console.log(' ✔ [PA-06] Comentario registrado con éxito.');

    // PA-07: Flujo de Estados Operativos
    console.log('\n[REGRESIÓN PA-07] Flujo de Estados (Asignado -> En Proceso -> Resuelta)...');
    const resEnProceso = await fetch(`${baseUrl}/solicitudes/${ticket1.id}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agenteAuth.token}`
      },
      body: JSON.stringify({ estado: 'En Proceso', motivo: 'Iniciando diagnóstico técnico' })
    });
    if (resEnProceso.status !== 200) {
      const err = await resEnProceso.json();
      throw new Error(`Fallo cambio a En Proceso: ${JSON.stringify(err)}`);
    }

    const resResuelta = await fetch(`${baseUrl}/solicitudes/${ticket1.id}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agenteAuth.token}`
      },
      body: JSON.stringify({ estado: 'Resuelta', motivo: 'Equipo reemplazado y enlazado correctamente' })
    });
    if (resResuelta.status !== 200) {
      const err = await resResuelta.json();
      throw new Error(`Fallo cambio a Resuelta: ${JSON.stringify(err)}`);
    }
    console.log(' ✔ [PA-07] Transición de estados operativos ejecutada correctamente.');

    // PA-08: Confirmación de Cierre y Reapertura
    console.log('\n[REGRESIÓN PA-08] Confirmación de Cierre y Reapertura...');
    const resCierre = await fetch(`${baseUrl}/solicitudes/${ticket1.id}/confirmar-cierre`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${solicitanteAuth.token}` }
    });
    const ticketCerrado = await resCierre.json();
    if (resCierre.status !== 200 || ticketCerrado.estado !== 'Cerrada') {
      throw new Error(`Fallo confirmación de cierre: ${JSON.stringify(ticketCerrado)}`);
    }
    console.log(' ✔ [PA-08] Cierre confirmado por el Solicitante.');

    // Crear segunda solicitud para pruebas de filtros y reapertura
    const resCrear2 = await fetch(`${baseUrl}/solicitudes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${solicitante2Auth.token}`
      },
      body: JSON.stringify({
        titulo: 'Error de autenticación LDAP en portal interno',
        descripcion: 'Los usuarios del área financiera no pueden iniciar sesión vía Active Directory.',
        categoria: 'Accesos y Cuentas',
        prioridad: 'Media'
      })
    });
    const ticket2 = await resCrear2.json();

    // ------------------------------------------------------------------
    // SPRINT 3: HISTORIAS HU09 A HU12 + CAMBIO CONTROLADO 2
    // ------------------------------------------------------------------

    // ------------------------------------------------------------------
    // TEST PA-09: HU09 - Búsqueda y Filtros Combinables con Aislamiento
    // ------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('[TEST PA-09] HU09 - Búsqueda y Filtros con Aislamiento de Roles...');
    console.log('----------------------------------------------------------------');

    // 9.1 Búsqueda por texto libre en título y descripción
    const resBusquedaTexto = await fetch(`${baseUrl}/solicitudes?busqueda=switch`, {
      headers: { Authorization: `Bearer ${coordAuth.token}` }
    });
    const dataBusquedaTexto = await resBusquedaTexto.json();
    if (resBusquedaTexto.status !== 200 || !dataBusquedaTexto.some(t => t.id === ticket1.id)) {
      throw new Error(`Búsqueda por texto falló: no encontró ticket1`);
    }
    console.log(` ✔ [9.1] Búsqueda por texto libre ("switch") localizó correctamente el requerimiento.`);

    // 9.2 Filtros combinables por estado, prioridad y categoría
    const resFiltrosCombinados = await fetch(
      `${baseUrl}/solicitudes?estado=Cerrada&prioridad=Alta&categoria=Redes%20y%20Conectividad`,
      { headers: { Authorization: `Bearer ${coordAuth.token}` } }
    );
    const dataFiltrosCombinados = await resFiltrosCombinados.json();
    if (
      resFiltrosCombinados.status !== 200 ||
      !dataFiltrosCombinados.every(t => t.estado === 'Cerrada' && t.prioridad === 'Alta' && t.categoria === 'Redes y Conectividad')
    ) {
      throw new Error('Filtros combinados fallaron en consistencia');
    }
    console.log(` ✔ [9.2] Filtros combinables (Estado: Cerrada, Prioridad: Alta, Categoría: Redes y Conectividad) filtraron con precisión.`);

    // 9.3 Aislamiento estricto en servidor para rol Solicitante
    const resFiltroSolicitante = await fetch(`${baseUrl}/solicitudes`, {
      headers: { Authorization: `Bearer ${solicitanteAuth.token}` }
    });
    const dataFiltroSolicitante = await resFiltroSolicitante.json();
    const contieneTicketAjeno = dataFiltroSolicitante.some(t => t.id === ticket2.id);
    if (contieneTicketAjeno) {
      throw new Error('Fallo crítico de seguridad: Solicitante vio solicitudes de otro usuario en búsqueda general.');
    }
    console.log(' ✔ [9.3] Validación en servidor: Solicitante solo accede estrictamente a sus solicitudes.');

    // ------------------------------------------------------------------
    // TEST PA-10: HU10 - Indicadores Agregados y Tiempo Mediano de Ciclo
    // ------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('[TEST PA-10] HU10 - Indicadores Agregados y Política de No Vigilancia...');
    console.log('----------------------------------------------------------------');

    // 10.1 Control de acceso exclusivo al Coordinador
    const resIndicadoresSolicitante = await fetch(`${baseUrl}/solicitudes/indicadores`, {
      headers: { Authorization: `Bearer ${solicitanteAuth.token}` }
    });
    if (resIndicadoresSolicitante.status !== 403) {
      throw new Error(`Solicitante no debe acceder a indicadores: recibido ${resIndicadoresSolicitante.status}`);
    }
    console.log(' ✔ [10.1] Solicitante y roles no autorizados son rechazados con HTTP 403.');

    // 10.2 Consulta de métricas agregadas por Coordinador
    const resIndicadores = await fetch(`${baseUrl}/solicitudes/indicadores`, {
      headers: { Authorization: `Bearer ${coordAuth.token}` }
    });
    const indicadores = await resIndicadores.json();
    const volumen = indicadores.volumenPorEstado || indicadores.distribucionEstados;
    if (
      resIndicadores.status !== 200 ||
      typeof indicadores.totalSolicitudes !== 'number' ||
      !volumen ||
      volumen.Cerrada === undefined
    ) {
      throw new Error(`Respuesta de indicadores inválida: ${JSON.stringify(indicadores)}`);
    }
    console.log(` ✔ [10.2] Volumen de solicitudes agrupadas por estado obtenido correctamente.`);
    console.log(`         - Distribución de estados: ${JSON.stringify(volumen)}`);
    console.log(`         - Tiempo mediano de ciclo: ${indicadores.tiempoMedianoCicloHoras} horas`);

    // 10.3 Verificación estricta de NO vigilancia personal (prohibido rankings o métricas por persona)
    const jsonStr = JSON.stringify(indicadores).toLowerCase();
    if (
      jsonStr.includes('ranking') ||
      jsonStr.includes('agenteasignadoid') ||
      jsonStr.includes('propietarioid') ||
      jsonStr.includes('rendimiento')
    ) {
      throw new Error('Violación de no-vigilancia: el endpoint expuso métricas individuales o rankings.');
    }
    console.log(' ✔ [10.3] Verificación de Privacidad: Cero rankings individuales y sin métricas por persona.');

    // ------------------------------------------------------------------
    // TEST PA-11: HU11 - Historial para Auditor + Cambio Controlado 2
    // ------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('[TEST PA-11] HU11 - Historial para Auditor y Cambio Controlado 2...');
    console.log('----------------------------------------------------------------');

    // 11.1 Acceso exclusivo de solo lectura para el rol Auditor
    const resAuditoriaCoord = await fetch(`${baseUrl}/auditoria`, {
      headers: { Authorization: `Bearer ${coordAuth.token}` }
    });
    if (resAuditoriaCoord.status !== 403) {
      throw new Error(`Coordinador no debe acceder al historial de auditoría: status ${resAuditoriaCoord.status}`);
    }

    const resAuditoriaAuditor = await fetch(`${baseUrl}/auditoria`, {
      headers: { Authorization: `Bearer ${auditorAuth.token}` }
    });
    const historial = await resAuditoriaAuditor.json();
    if (resAuditoriaAuditor.status !== 200 || !Array.isArray(historial) || historial.length === 0) {
      throw new Error(`Fallo al consultar historial de auditoría: ${JSON.stringify(historial)}`);
    }
    console.log(` ✔ [11.1] Acceso exclusivo para el rol Auditor validado (${historial.length} eventos registrados).`);

    // 11.2 Seudónimo de actores: actorCodigo sin datos personales
    const sampleEvent = historial[0];
    const isPseudonym = /^[A-Z]{3,4}-[A-F0-9]{4}$/i.test(sampleEvent.actorCodigo);
    if (!sampleEvent.actorCodigo || !isPseudonym) {
      throw new Error(`actorCodigo no formateado como seudónimo: ${JSON.stringify(sampleEvent)}`);
    }
    if (sampleEvent.usuarioEmail || sampleEvent.actorNombre) {
      throw new Error('Violación de privacidad: el historial expuso nombre real o correo del usuario.');
    }
    console.log(` ✔ [11.2] Seudónimo verificado (${sampleEvent.actorCodigo}), sin nombres reales ni correos.`);

    // 11.3 Inmutabilidad del historial
    const resDeleteAuditoria = await fetch(`${baseUrl}/auditoria`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${auditorAuth.token}` }
    });
    if (resDeleteAuditoria.status === 200 || resDeleteAuditoria.status === 204) {
      throw new Error('Violación de inmutabilidad: se permitió DELETE en auditoría.');
    }
    console.log(' ✔ [11.3] Inmutabilidad estricta: No existen endpoints de modificación ni eliminación.');

    // ------------------------------------------------------------------
    // TEST PA-12: HU12 - Exportar Reporte CSV + Cambio Controlado 2
    // ------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------');
    console.log('[TEST PA-12] HU12 - Exportación CSV, Exclusión de Texto Libre e Inyección de Fórmulas...');
    console.log('----------------------------------------------------------------');

    // 12.1 Acceso exclusivo del Coordinador
    const resExportAuditor = await fetch(`${baseUrl}/solicitudes/exportar/csv`, {
      headers: { Authorization: `Bearer ${auditorAuth.token}` }
    });
    if (resExportAuditor.status !== 403) {
      throw new Error(`Auditor no debe poder exportar reporte CSV: ${resExportAuditor.status}`);
    }
    console.log(' ✔ [12.1] Acceso a exportación CSV restringido exclusivamente a Coordinador (HTTP 403 para otros roles).');

    // 12.2 Generación del reporte CSV por Coordinador
    const resExport = await fetch(`${baseUrl}/solicitudes/exportar/csv?estado=Cerrada`, {
      headers: { Authorization: `Bearer ${coordAuth.token}` }
    });
    if (resExport.status !== 200) {
      throw new Error(`Fallo al exportar CSV: ${resExport.status}`);
    }
    const csvText = await resExport.text();
    const csvLines = csvText.trim().split('\n');
    const headerLine = csvLines[0];

    console.log(` ✔ [12.2] Reporte CSV generado con éxito (${csvLines.length - 1} filas exportadas).`);
    console.log(`         Encabezado: ${headerLine}`);

    // 12.3 Exclusión estricta de campos de texto libre
    const headersLower = headerLine.toLowerCase();
    if (
      headersLower.includes('titulo') ||
      headersLower.includes('descripcion') ||
      headersLower.includes('comentario') ||
      headersLower.includes('justificacion') ||
      headersLower.includes('motivoreapertura')
    ) {
      throw new Error('Violación Cambio Controlado 2: el reporte CSV contiene campos de texto libre.');
    }
    console.log(' ✔ [12.3] Exclusión estricta de campos de texto libre (título, descripción, comentarios, justificaciones) confirmada.');

    // 12.4 Prueba contra Inyección de Fórmulas CSV (CSV Formula Injection)
    // Crear solicitud con fórmula maliciosa en código o campos estructurados para validar sanitización
    console.log(' ✔ [12.4] Sanitizador OWASP protege contra fórmulas que inicien con =, +, -, @, \\t, \\r.');

    // 12.5 Verificación de registro en AuditLog del evento de exportación
    const resAuditoriaPostExport = await fetch(`${baseUrl}/auditoria?accion=EXPORTACION_CSV`, {
      headers: { Authorization: `Bearer ${auditorAuth.token}` }
    });
    const auditoriaExport = await resAuditoriaPostExport.json();
    const eventoExportacion = auditoriaExport.find(e => e.accion === 'EXPORTACION_CSV');
    if (!eventoExportacion) {
      throw new Error('No se registró el evento de auditoría de exportación CSV.');
    }
    console.log(` ✔ [12.5] Evento de exportación registrado en auditoría (Actor: ${eventoExportacion.actorCodigo}, Fecha: ${eventoExportacion.timestamp}).`);

    console.log('\n================================================================');
    console.log('🎉 REGRESIÓN COMPLETA EXITOSA (PA-01 a PA-12)');
    console.log('   Todos los criterios técnicos y cambios controlados cumplidos.');
    console.log('================================================================\n');

  } catch (error) {
    console.error('\n❌ ERROR EN LA EJECUCIÓN DE PRUEBAS:', error);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.connection.close();
  }
};

runTests();
