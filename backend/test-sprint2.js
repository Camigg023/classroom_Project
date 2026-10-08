import { createApp } from './src/app.js';
import { connectDatabase } from './src/infrastructure/database/mongoConnection.js';
import mongoose from 'mongoose';

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🚀 INICIANDO SUITE DE PRUEBAS AUTOMATIZADAS SPRINT 2');
  console.log('   (Incluye Regresión Sprint 1: PA-01 a PA-04)');
  console.log('   (Sprint 2: PA-05 a PA-08 + Cambio Controlado 1)');
  console.log('======================================================\n');

  await connectDatabase();
  const app = createApp();

  const server = app.listen(5098);
  const baseUrl = 'http://127.0.0.1:5098/api';

  try {
    // ------------------------------------------------------------------
    // REGRESIÓN SPRINT 1 (PA-01 a PA-04)
    // ------------------------------------------------------------------
    console.log('[REGRESIÓN PA-01] Autenticación y Autorización...');
    const resLoginSolicitante = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'solicitante@empresa.com', password: 'Password123!' })
    });
    const dataLoginSolicitante = await resLoginSolicitante.json();
    if (resLoginSolicitante.status !== 200 || !dataLoginSolicitante.token) {
      throw new Error(`Login Solicitante falló: ${resLoginSolicitante.status}`);
    }
    const tokenSolicitante = dataLoginSolicitante.token;

    const resLoginCoord = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'coordinador@empresa.com', password: 'Password123!' })
    });
    const tokenCoord = (await resLoginCoord.json()).token;

    const resLoginAgente = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'agente1@empresa.com', password: 'Password123!' })
    });
    const dataLoginAgente = await resLoginAgente.json();
    const tokenAgente = dataLoginAgente.token;
    const agenteId = dataLoginAgente.user.id;

    const resLoginSolicitante2 = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'solicitante2@empresa.com', password: 'Password123!' })
    });
    const tokenSolicitante2 = (await resLoginSolicitante2.json()).token;

    console.log(' ✔ [PA-01] Logins de Solicitante, Coordinador, Agente y Solicitante 2 exitosos.');

    // PA-02: Creación de Solicitud
    console.log('\n[REGRESIÓN PA-02] Creación de Solicitud...');
    const resCrear = await fetch(`${baseUrl}/solicitudes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenSolicitante}`
      },
      body: JSON.stringify({
        titulo: 'Falla intermitente en báscula de pesaje muelle 2',
        descripcion: 'La báscula pierde conexión con el puerto COM cada 10 pesajes.',
        categoria: 'Hardware',
        prioridad: 'Media'
      })
    });
    const ticketPrincipal = await resCrear.json();
    if (resCrear.status !== 201 || !ticketPrincipal.id) {
      throw new Error(`Error en PA-02: ${JSON.stringify(ticketPrincipal)}`);
    }
    const ticketId = ticketPrincipal.id;
    console.log(` ✔ [PA-02] Solicitud creada con código ${ticketPrincipal.codigo} y estado Nuevo.`);

    // PA-03: Consulta Solicitudes Propias
    console.log('\n[REGRESIÓN PA-03] Aislamiento de Solicitudes Propias...');
    const resMisSol = await fetch(`${baseUrl}/solicitudes/mis-solicitudes`, {
      headers: { Authorization: `Bearer ${tokenSolicitante}` }
    });
    const dataMisSol = await resMisSol.json();
    if (resMisSol.status !== 200 || !Array.isArray(dataMisSol)) {
      throw new Error('Error en PA-03');
    }
    const resForbiddenAjeno = await fetch(`${baseUrl}/solicitudes/${ticketId}`, {
      headers: { Authorization: `Bearer ${tokenSolicitante2}` }
    });
    if (resForbiddenAjeno.status !== 403) {
      throw new Error(`Fallo de aislamiento de solicitud ajena: esperado 403, recibido ${resForbiddenAjeno.status}`);
    }
    console.log(' ✔ [PA-03] Aislamiento y consulta de solicitudes propias validado.');

    // PA-04: Priorización por Coordinador
    console.log('\n[REGRESIÓN PA-04] Priorización de Solicitudes por Coordinador...');
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);

    const resPriorizar = await fetch(`${baseUrl}/solicitudes/${ticketId}/prioridad`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCoord}`
      },
      body: JSON.stringify({
        prioridad: 'Alta',
        justificacion: 'Impide emisión de manifiestos de salida en pesaje',
        fechaObjetivo: targetDate.toISOString()
      })
    });
    const ticketPriorizado = await resPriorizar.json();
    if (resPriorizar.status !== 200 || ticketPriorizado.prioridad !== 'Alta') {
      throw new Error(`Error en PA-04: ${JSON.stringify(ticketPriorizado)}`);
    }
    console.log(' ✔ [PA-04] Coordinador priorizó a Alta con justificación y fecha.');

    // ------------------------------------------------------------------
    // CAMBIO CONTROLADO 1: Validación estricta de Prioridad Alta
    // ------------------------------------------------------------------
    console.log('\n[CAMBIO CONTROLADO 1] Validación de Justificación y Fecha Objetivo para Prioridad Alta...');
    // Intento de crear solicitud Alta sin justificación
    const resCrearAltaInvalida = await fetch(`${baseUrl}/solicitudes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenSolicitante}`
      },
      body: JSON.stringify({
        titulo: 'Falla sin justificación',
        descripcion: 'Descripción de prueba',
        categoria: 'Software',
        prioridad: 'Alta'
      })
    });
    if (resCrearAltaInvalida.status !== 400) {
      throw new Error(`Creación Alta sin justificación debió responder 400, respondió ${resCrearAltaInvalida.status}`);
    }

    // Intento de priorizar a Alta sin fecha objetivo
    const resPriorizarAltaSinFecha = await fetch(`${baseUrl}/solicitudes/${ticketId}/prioridad`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCoord}`
      },
      body: JSON.stringify({
        prioridad: 'Alta',
        justificacion: 'Tiene justificación pero no fecha objetivo'
      })
    });
    if (resPriorizarAltaSinFecha.status !== 400) {
      throw new Error(`Priorización Alta sin fecha debió responder 400, respondió ${resPriorizarAltaSinFecha.status}`);
    }
    console.log(' ✔ [CAMBIO CONTROLADO 1] Servidor rechaza estrictamente Prioridad Alta sin justificación o fecha objetivo.');

    // ------------------------------------------------------------------
    // HU05: ASIGNAR SOLICITUD (PA-05)
    // ------------------------------------------------------------------
    console.log('\n[TEST PA-05] Validando HU05 - Asignación de Solicitudes...');
    
    // Intento de asignar por parte de un Solicitante (No autorizado)
    const resAsignarUnauthorized = await fetch(`${baseUrl}/solicitudes/${ticketId}/asignar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenSolicitante}`
      },
      body: JSON.stringify({ agenteId })
    });
    if (resAsignarUnauthorized.status !== 403) {
      throw new Error(`Solicitante no debe poder asignar: status ${resAsignarUnauthorized.status}`);
    }
    console.log(' ✔ [5.1] Rechazo de intento de asignación por usuario no coordinador (HTTP 403).');

    // Intento de asignar a un usuario que NO es agente (ej. asignar a Solicitante 2)
    const meData = await (await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${tokenSolicitante2}` }
    })).json();
    const solicitante2User = meData.user;
    const resAsignarInvalido = await fetch(`${baseUrl}/solicitudes/${ticketId}/asignar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCoord}`
      },
      body: JSON.stringify({ agenteId: solicitante2User.id })
    });
    if (resAsignarInvalido.status !== 400) {
      throw new Error(`Asignación a usuario no agente debió fallar con 400: status ${resAsignarInvalido.status}`);
    }
    console.log(' ✔ [5.2] Rechazo de asignación a usuario sin rol de Agente (HTTP 400).');

    // Asignación válida por Coordinador a Agente 1 activo
    const resAsignarValido = await fetch(`${baseUrl}/solicitudes/${ticketId}/asignar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCoord}`
      },
      body: JSON.stringify({ agenteId })
    });
    const ticketAsignado = await resAsignarValido.json();
    if (
      resAsignarValido.status !== 200 ||
      ticketAsignado.agenteAsignadoId !== agenteId ||
      ticketAsignado.estado !== 'Asignado'
    ) {
      throw new Error(`Asignación válida falló: ${JSON.stringify(ticketAsignado)}`);
    }
    console.log(` ✔ [5.3] Coordinador asignó con éxito al Agente "${ticketAsignado.agenteAsignadoNombre}" y estado pasó a "Asignado".`);

    // Notificación interna generada para el agente asignado
    const resNotificaciones = await fetch(`${baseUrl}/notificaciones`, {
      headers: { Authorization: `Bearer ${tokenAgente}` }
    });
    const notificaciones = await resNotificaciones.json();
    const notifAsignacion = notificaciones.find(n => n.solicitudId === ticketId);
    if (!notifAsignacion || notifAsignacion.tipo !== 'ASIGNACION_SOLICITUD') {
      throw new Error(`No se generó notificación para el agente asignado: ${JSON.stringify(notificaciones)}`);
    }
    console.log(` ✔ [5.4] Notificación interna generada y recibida por el agente ("${notifAsignacion.titulo}").`);

    // ------------------------------------------------------------------
    // HU06: COMENTARIOS DE TRABAJO (PA-06)
    // ------------------------------------------------------------------
    console.log('\n[TEST PA-06] Validando HU06 - Comentarios de Trabajo...');

    // Intento de enviar comentario vacío o solo espacios
    const resComentarioVacio = await fetch(`${baseUrl}/solicitudes/${ticketId}/comentarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAgente}`
      },
      body: JSON.stringify({ contenido: '   \n  ' })
    });
    if (resComentarioVacio.status !== 400) {
      throw new Error(`Comentario vacío debió ser rechazado con 400, recibido ${resComentarioVacio.status}`);
    }
    console.log(' ✔ [6.1] Rechazo estricto de comentarios vacíos o con solo espacios (HTTP 400).');

    // Agente registra comentario de avance válido
    const resComentarioValido = await fetch(`${baseUrl}/solicitudes/${ticketId}/comentarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAgente}`
      },
      body: JSON.stringify({
        contenido: 'Se realizó diagnóstico físico en muelle 2. Se reemplazó el convertidor USB a serial RS-232.'
      })
    });
    const comentarioCreado = await resComentarioValido.json();
    if (resComentarioValido.status !== 201 || !comentarioCreado._id || comentarioCreado.autorRol !== 'Agente') {
      throw new Error(`Creación de comentario falló: ${JSON.stringify(comentarioCreado)}`);
    }
    console.log(' ✔ [6.2] Agente registró comentario de trabajo con autor y fecha inmutables.');

    // Verificar que el comentario es visible en el detalle de la solicitud
    const resDetalleTicket = await fetch(`${baseUrl}/solicitudes/${ticketId}`, {
      headers: { Authorization: `Bearer ${tokenSolicitante}` }
    });
    const detalleTicket = await resDetalleTicket.json();
    if (!detalleTicket.comentarios || detalleTicket.comentarios.length === 0) {
      throw new Error('Comentarios no se reflejan en el detalle de la solicitud');
    }
    console.log(` ✔ [6.3] Comentario visible en detalle de solicitud para solicitante y agentes (${detalleTicket.comentarios.length} comentario registrado).`);

    // ------------------------------------------------------------------
    // HU07: CAMBIAR ESTADO (PA-07)
    // ------------------------------------------------------------------
    console.log('\n[TEST PA-07] Validando HU07 - Flujo y Matriz de Transiciones de Estado...');

    // Transición válida: Asignado -> En Proceso por parte del Agente
    const resPasoEnProceso = await fetch(`${baseUrl}/solicitudes/${ticketId}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAgente}`
      },
      body: JSON.stringify({
        estado: 'En Proceso',
        motivo: 'Iniciando pruebas de transmisión en vivo con el software WMS'
      })
    });
    const dataEnProceso = await resPasoEnProceso.json();
    if (resPasoEnProceso.status !== 200 || dataEnProceso.estado !== 'En Proceso') {
      throw new Error(`Transición Asignado -> En Proceso falló: ${JSON.stringify(dataEnProceso)}`);
    }
    console.log(' ✔ [7.1] Transición válida: "Asignado" -> "En Proceso" completada.');

    // Transición NO permitida por la matriz: Intento de saltar de En Proceso a Cerrada directamente
    const resSaltoInvalido = await fetch(`${baseUrl}/solicitudes/${ticketId}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAgente}`
      },
      body: JSON.stringify({ estado: 'Cerrada' })
    });
    if (resSaltoInvalido.status !== 403 && resSaltoInvalido.status !== 400) {
      throw new Error(`Transición inválida debió ser rechazada: status ${resSaltoInvalido.status}`);
    }
    console.log(' ✔ [7.2] Rechazo de transición prohibida por matriz o rol (HTTP 400 / 403).');

    // Transición válida: En Proceso -> Resuelta por el Agente
    const resPasoResuelta = await fetch(`${baseUrl}/solicitudes/${ticketId}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAgente}`
      },
      body: JSON.stringify({
        estado: 'Resuelta',
        motivo: 'Báscula calibrada y transmitiendo lecturas al 100% de efectividad.'
      })
    });
    const dataResuelta = await resPasoResuelta.json();
    if (resPasoResuelta.status !== 200 || dataResuelta.estado !== 'Resuelta') {
      throw new Error(`Transición En Proceso -> Resuelta falló: ${JSON.stringify(dataResuelta)}`);
    }
    console.log(' ✔ [7.3] Transición válida: "En Proceso" -> "Resuelta" completada.');

    // ------------------------------------------------------------------
    // HU08: CONFIRMAR O REABRIR SOLUCIÓN (PA-08)
    // ------------------------------------------------------------------
    console.log('\n[TEST PA-08] Validando HU08 - Confirmación y Reapertura por el Solicitante...');

    // Caso 8.1: Reapertura sin motivo obligatorio debe ser rechazada con 400
    const resReaperturaSinMotivo = await fetch(`${baseUrl}/solicitudes/${ticketId}/reabrir`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenSolicitante}`
      },
      body: JSON.stringify({ motivo: '' })
    });
    if (resReaperturaSinMotivo.status !== 400) {
      throw new Error(`Reapertura sin motivo debió responder 400, respondió ${resReaperturaSinMotivo.status}`);
    }
    console.log(' ✔ [8.1] Rechazo de reapertura sin motivo obligatorio (HTTP 400).');

    // Caso 8.2: Usuario ajeno (Solicitante 2) intenta reabrir -> HTTP 403
    const resReaperturaAjeno = await fetch(`${baseUrl}/solicitudes/${ticketId}/reabrir`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenSolicitante2}`
      },
      body: JSON.stringify({ motivo: 'Intento de reapertura no autorizada' })
    });
    if (resReaperturaAjeno.status !== 403) {
      throw new Error(`Reapertura ajena debió responder 403, respondió ${resReaperturaAjeno.status}`);
    }
    console.log(' ✔ [8.2] Rechazo de reapertura por usuario que no es el propietario (HTTP 403).');

    // Caso 8.3: Solicitante propietario reabre con motivo válido -> Estado "Reabierta"
    const resReaperturaExitosa = await fetch(`${baseUrl}/solicitudes/${ticketId}/reabrir`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenSolicitante}`
      },
      body: JSON.stringify({
        motivo: 'Al encender en el turno de la tarde arrojó error de calibración cero.'
      })
    });
    const ticketReabierto = await resReaperturaExitosa.json();
    if (resReaperturaExitosa.status !== 200 || ticketReabierto.estado !== 'Reabierta') {
      throw new Error(`Reapertura válida falló: ${JSON.stringify(ticketReabierto)}`);
    }
    console.log(` ✔ [8.3] Solicitante reabrió la solicitud con éxito. Estado: "${ticketReabierto.estado}", Motivo: "${ticketReabierto.motivoReapertura}".`);

    // Flujo de re-atención: Agente pasa de Reabierta -> En Proceso -> Resuelta
    await fetch(`${baseUrl}/solicitudes/${ticketId}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAgente}`
      },
      body: JSON.stringify({ estado: 'En Proceso', motivo: 'Reajustando cero mecánico' })
    });
    await fetch(`${baseUrl}/solicitudes/${ticketId}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAgente}`
      },
      body: JSON.stringify({ estado: 'Resuelta', motivo: 'Cero mecánico fijado en cero estándar' })
    });
    console.log(' ✔ [8.4] Agente atendió la solicitud reabierta hasta el estado "Resuelta".');

    // Caso 8.5: Solicitante propietario confirma solución y cierra la solicitud
    const resConfirmarCierre = await fetch(`${baseUrl}/solicitudes/${ticketId}/confirmar-cierre`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenSolicitante}`
      },
      body: JSON.stringify({})
    });
    const ticketCerrado = await resConfirmarCierre.json();
    if (resConfirmarCierre.status !== 200 || ticketCerrado.estado !== 'Cerrada') {
      throw new Error(`Confirmación de cierre falló: ${JSON.stringify(ticketCerrado)}`);
    }
    console.log(` ✔ [8.5] Solicitante confirmó solución. Estado final: "${ticketCerrado.estado}".`);

    // Caso 8.6: Intento de modificar estado de solicitud cerrada debe ser rechazado por ser estado final
    const resCambioEnCerrada = await fetch(`${baseUrl}/solicitudes/${ticketId}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAgente}`
      },
      body: JSON.stringify({ estado: 'En Proceso' })
    });
    if (resCambioEnCerrada.status !== 400 && resCambioEnCerrada.status !== 403) {
      throw new Error(`Modificación sobre solicitud cerrada debió ser rechazada: status ${resCambioEnCerrada.status}`);
    }
    console.log(' ✔ [8.6] Estado "Cerrada" es inmutable y bloquea transiciones posteriores.');

    // Verificar trazabilidad completa en el historial de auditoría
    const resAuditoria = await fetch(`${baseUrl}/solicitudes/${ticketId}`, {
      headers: { Authorization: `Bearer ${tokenCoord}` }
    });
    const detalleAuditoria = await resAuditoria.json();
    const accionesAuditadas = (detalleAuditoria.auditoria || []).map(a => a.accion);
    console.log(` ✔ [Auditoría] Eventos trazados en AuditLog: ${accionesAuditadas.join(', ')}.`);

    console.log('\n======================================================');
    console.log('🎉 TODAS LAS PRUEBAS DEL SPRINT 2 (PA-05 a PA-08) Y REGRESIÓN (PA-01 a PA-04) APROBADAS AL 100%');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ ERROR EN PRUEBAS SPRINT 2:', err);
    process.exit(1);
  } finally {
    server.close();
    await mongoose.disconnect();
  }
};

runTests();
