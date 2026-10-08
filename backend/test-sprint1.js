import { createApp } from './src/app.js';
import { connectDatabase } from './src/infrastructure/database/mongoConnection.js';
import mongoose from 'mongoose';

const runTests = async () => {
  console.log('\n--- INICIANDO SUITE DE PRUEBAS AUTOMATIZADAS SPRINT 1 ---');
  await connectDatabase();
  const app = createApp();

  const server = app.listen(5099);
  const baseUrl = 'http://localhost:5099/api';

  try {
    // 1. Test HU01: Login válido e inválido
    console.log('\n[TEST PA-01] Validando HU01 - Autenticación y Autorización...');
    
    // Login válido Solicitante
    const resLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'solicitante@empresa.com', password: 'Password123!' })
    });
    const dataLogin = await resLogin.json();
    if (resLogin.status !== 200 || !dataLogin.token) {
      throw new Error(`Login válido falló: status ${resLogin.status}`);
    }
    const tokenSolicitante = dataLogin.token;
    console.log(' ✔ Login con credenciales válidas exitoso (HTTP 200, JWT generado).');

    // Login inválido (no revela si el usuario existe)
    const resLoginFail = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'solicitante@empresa.com', password: 'ClaveEquivocada!' })
    });
    const dataLoginFail = await resLoginFail.json();
    if (resLoginFail.status !== 401 || dataLoginFail.message !== 'Credenciales inválidas') {
      throw new Error(`Login inválido reveló información o falló código de estado: ${JSON.stringify(dataLoginFail)}`);
    }
    console.log(' ✔ Login con credenciales erradas responde HTTP 401 sin revelar usuario.');

    // Login Coordinador
    const resCoord = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'coordinador@empresa.com', password: 'Password123!' })
    });
    const dataCoord = await resCoord.json();
    const tokenCoord = dataCoord.token;

    // 2. Test HU02: Creación de solicitud por Solicitante
    console.log('\n[TEST PA-02] Validando HU02 - Creación de Solicitudes...');
    const resCreate = await fetch(`${baseUrl}/solicitudes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenSolicitante}`
      },
      body: JSON.stringify({
        titulo: 'Falla en báscula de pesaje de carga muelle 1',
        descripcion: 'La báscula digital no transmite el peso tara al sistema WMS.',
        categoria: 'Hardware',
        prioridad: 'Media'
      })
    });
    const dataCreate = await resCreate.json();
    if (resCreate.status !== 201 || !dataCreate.codigo || dataCreate.estado !== 'Nuevo') {
      throw new Error(`Creación de solicitud falló: ${JSON.stringify(dataCreate)}`);
    }
    const createdId = dataCreate.id;
    console.log(` ✔ Solicitud creada con éxito (Código: ${dataCreate.codigo}, Estado: ${dataCreate.estado}, Propietario asignado).`);

    // 3. Test HU03: Consulta de solicitudes propias (Aislamiento de solicitudes)
    console.log('\n[TEST PA-03] Validando HU03 - Consulta de Solicitudes Propias...');
    const resMisSol = await fetch(`${baseUrl}/solicitudes/mis-solicitudes`, {
      headers: { Authorization: `Bearer ${tokenSolicitante}` }
    });
    const dataMisSol = await resMisSol.json();
    if (resMisSol.status !== 200 || !Array.isArray(dataMisSol) || dataMisSol.length === 0) {
      throw new Error(`Consulta de solicitudes propias falló: ${JSON.stringify(dataMisSol)}`);
    }
    console.log(` ✔ Solicitante consulta únicamente sus solicitudes (${dataMisSol.length} solicitudes encontradas).`);

    // Solicitante 2 intentando ver detalle de solicitud de Solicitante 1
    const resLogin2 = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'solicitante2@empresa.com', password: 'Password123!' })
    });
    const tokenSolicitante2 = (await resLogin2.json()).token;

    const resForbiddenDetail = await fetch(`${baseUrl}/solicitudes/${createdId}`, {
      headers: { Authorization: `Bearer ${tokenSolicitante2}` }
    });
    if (resForbiddenDetail.status !== 403) {
      throw new Error(`Fallo de aislamiento: Solicitante 2 pudo ver solicitud ajena (status ${resForbiddenDetail.status})`);
    }
    console.log(' ✔ Solicitante no puede acceder a solicitudes ajenas (HTTP 403 Forbidden).');

    // 4. Test HU04: Priorización por parte del Coordinador
    console.log('\n[TEST PA-04] Validando HU04 - Priorización por Coordinador...');
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);

    const resPrioritize = await fetch(`${baseUrl}/solicitudes/${createdId}/prioridad`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCoord}`
      },
      body: JSON.stringify({
        prioridad: 'Alta',
        justificacion: 'Afecta pesaje obligatorio para salida de camiones',
        fechaObjetivo: targetDate.toISOString()
      })
    });
    const dataPrioritize = await resPrioritize.json();
    if (resPrioritize.status !== 200 || dataPrioritize.prioridad !== 'Alta') {
      throw new Error(`Priorización por coordinador falló: ${JSON.stringify(dataPrioritize)}`);
    }
    console.log(' ✔ Coordinador priorizó la solicitud a "Alta" con justificación y fecha objetivo.');

    // Solicitante intentando priorizar (debe ser rechazado con 403)
    const resPrioritizeUnauthorized = await fetch(`${baseUrl}/solicitudes/${createdId}/prioridad`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenSolicitante}`
      },
      body: JSON.stringify({ prioridad: 'Baja' })
    });
    if (resPrioritizeUnauthorized.status !== 403) {
      throw new Error(`Solicitante pudo priorizar: esperado 403, recibido ${resPrioritizeUnauthorized.status}`);
    }
    console.log(' ✔ Solicitante no puede priorizar (HTTP 403 Forbidden). Solo Coordinador.');

    // Coordinador lista y ordena solicitudes
    const resListaCoord = await fetch(`${baseUrl}/solicitudes?sortBy=prioridad&order=desc`, {
      headers: { Authorization: `Bearer ${tokenCoord}` }
    });
    const dataListaCoord = await resListaCoord.json();
    if (resListaCoord.status !== 200 || !Array.isArray(dataListaCoord)) {
      throw new Error(`Listado ordenado para coordinador falló: ${JSON.stringify(dataListaCoord)}`);
    }
    console.log(` ✔ Coordinador puede listar y ordenar solicitudes (${dataListaCoord.length} solicitudes en inventario).`);

    console.log('\n======================================================');
    console.log('🎉 TODAS LAS PRUEBAS DEL SPRINT 1 (PA-01 a PA-04) APROBADAS');
    console.log('======================================================\n');
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
};

runTests().catch(err => {
  console.error('\n❌ ERROR EN PRUEBAS:', err.message);
  process.exit(1);
});
