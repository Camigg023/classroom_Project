import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import { Header } from '../components/Header';

export const IndicadoresPage = () => {
  const [indicadores, setIndicadores] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [prioridadFiltro, setPrioridadFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');

  const fetchIndicadores = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getIndicadores({
        estado: estadoFiltro,
        prioridad: prioridadFiltro,
        categoria: categoriaFiltro
      });
      setIndicadores(data);
    } catch (err) {
      setError(err.message || 'Error al obtener indicadores agregados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicadores();
  }, [estadoFiltro, prioridadFiltro, categoriaFiltro]);

  const statusColors = {
    Nuevo: '#3b82f6',
    Asignado: '#6366f1',
    'En Proceso': '#f59e0b',
    Resuelta: '#10b981',
    Cerrada: '#64748b',
    Reabierta: '#ef4444'
  };

  return (
    <>
      <Header title="Indicadores Agregados de Gestión" />
      <div className="page-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Métricas Operativas del Servicio</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Consulta agregada de volumen y tiempo de ciclo conforme a la política de privacidad y no-vigilancia individual.
            </p>
          </div>
          <Link to="/coordinador/solicitudes" className="btn btn-secondary">
            Volver al Inventario
          </Link>
        </div>

        {/* Filtros Reproducibles */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="filter-bar" style={{ margin: 0 }}>
            <div className="filter-item">
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Filtrar por Estado
              </label>
              <select
                className="form-control"
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
              >
                <option value="">Todos los Estados</option>
                <option value="Nuevo">Nuevo</option>
                <option value="Asignado">Asignado</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Resuelta">Resuelta</option>
                <option value="Cerrada">Cerrada</option>
                <option value="Reabierta">Reabierta</option>
              </select>
            </div>

            <div className="filter-item">
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Filtrar por Prioridad
              </label>
              <select
                className="form-control"
                value={prioridadFiltro}
                onChange={(e) => setPrioridadFiltro(e.target.value)}
              >
                <option value="">Todas las Prioridades</option>
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>

            <div className="filter-item">
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Filtrar por Categoría
              </label>
              <select
                className="form-control"
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
              >
                <option value="">Todas las Categorías</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Redes y Conectividad">Redes y Conectividad</option>
                <option value="Accesos y Cuentas">Accesos y Cuentas</option>
                <option value="Sistemas de Bodega y Logística">Sistemas de Bodega y Logística</option>
              </select>
            </div>

            <div style={{ alignSelf: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEstadoFiltro('');
                  setPrioridadFiltro('');
                  setCategoriaFiltro('');
                }}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            Calculando métricas agregadas...
          </div>
        ) : indicadores ? (
          <>
            {/* Tarjetas Principales */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div className="card" style={{ padding: '20px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Total Solicitudes Analizadas
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginTop: '8px' }}>
                  {indicadores.totalSolicitudes}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                  Base muestral según los filtros seleccionados
                </p>
              </div>

              <div className="card" style={{ padding: '20px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Tiempo Mediano de Ciclo
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2563eb', marginTop: '8px' }}>
                  {indicadores.tiempoMedianoCicloHoras !== null ? `${indicadores.tiempoMedianoCicloHoras} hrs` : 'N/A'}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                  {(indicadores.totalFinalizadas ?? indicadores.totalCerradasOMedibles ?? 0)} solicitudes completadas (creación hasta cierre/confirmación)
                </p>
              </div>

              <div className="card" style={{ padding: '20px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Tasa de Finalización
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981', marginTop: '8px' }}>
                  {indicadores.totalSolicitudes > 0
                    ? `${Math.round(((indicadores.totalFinalizadas ?? indicadores.totalCerradasOMedibles ?? 0) / indicadores.totalSolicitudes) * 100)}%`
                    : '0%'}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                  Proporción de tickets resueltos o cerrados
                </p>
              </div>
            </div>

            {/* Distribución por Estado */}
            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', color: '#1e293b' }}>
                Distribución de Volumen por Estado
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                {Object.entries(indicadores.volumenPorEstado || indicadores.distribucionEstados || {}).map(([estado, cantidad]) => {
                  const pct = indicadores.totalSolicitudes > 0
                    ? Math.round((cantidad / indicadores.totalSolicitudes) * 100)
                    : 0;
                  const color = statusColors[estado] || '#64748b';

                  return (
                    <div
                      key={estado}
                      style={{
                        padding: '16px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        borderLeft: `4px solid ${color}`
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                        {estado}
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '6px 0' }}>
                        {cantidad}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {pct}% del total
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cláusula de Cumplimiento Normativo / No Vigilancia */}
            <div
              style={{
                padding: '16px 20px',
                borderRadius: '8px',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                <strong>Aviso de Privacidad y No-Vigilancia:</strong> Este módulo procesa exclusivamente métricas operativas agregadas. En estricto cumplimiento del marco ético y normativo, queda expresamente prohibida la generación de rankings individuales, comparativas de desempeño o métricas por persona.
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
};
