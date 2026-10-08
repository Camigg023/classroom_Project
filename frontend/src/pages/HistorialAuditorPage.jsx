import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { Header } from '../components/Header';

export const HistorialAuditorPage = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [accionFiltro, setAccionFiltro] = useState('');
  const [entidadIdFiltro, setEntidadIdFiltro] = useState('');

  const fetchHistorial = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getHistorialAuditoria({
        accion: accionFiltro,
        entidadId: entidadIdFiltro
      });
      setRegistros(data);
    } catch (err) {
      setError(err.message || 'Error al consultar historial de auditoría');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, [accionFiltro]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHistorial();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatValor = (val) => {
    if (val === null || val === undefined) return <span style={{ color: '#94a3b8' }}>-</span>;
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  return (
    <>
      <Header title="Historial y Auditoría Proporcional" />
      <div className="page-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Trazabilidad de Decisiones y Operaciones</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Acceso exclusivo de solo lectura con seudónimo de actores y exclusión de texto libre (Cambio Controlado 2).
            </p>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: '20px',
              backgroundColor: '#e0e7ff',
              color: '#3730a3'
            }}
          >
            Modo Auditor: Solo Lectura
          </span>
        </div>

        {/* Filtros de Auditoría */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <form onSubmit={handleSearch} className="filter-bar" style={{ margin: 0 }}>
            <div className="filter-item" style={{ flex: 1 }}>
              <select
                className="form-control"
                value={accionFiltro}
                onChange={(e) => setAccionFiltro(e.target.value)}
              >
                <option value="">Todas las Acciones</option>
                <option value="CREACION_SOLICITUD">Creación de Solicitud</option>
                <option value="CAMBIO_ESTADO">Cambio de Estado</option>
                <option value="PRIORIZACION">Priorización</option>
                <option value="ASIGNACION">Asignación</option>
                <option value="COMENTARIO_AGREGADO">Comentario Agregado</option>
                <option value="CONFIRMACION_CIERRE">Confirmación de Cierre</option>
                <option value="REAPERTURA">Reapertura</option>
                <option value="EXPORTACION_CSV">Exportación de Reporte CSV</option>
              </select>
            </div>

            <div className="filter-item" style={{ flex: 2 }}>
              <input
                type="text"
                className="form-control"
                placeholder="Filtrar por ID de Solicitud..."
                value={entidadIdFiltro}
                onChange={(e) => setEntidadIdFiltro(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-secondary">
              Filtrar Historial
            </button>
          </form>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Tabla de Historial Proporcional */}
        <div className="card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              Cargando eventos de auditoría...
            </div>
          ) : registros.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
              No se registraron eventos para los filtros especificados.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Acción</th>
                    <th>Actor Codificado</th>
                    <th>Rol</th>
                    <th>Campo Modificado</th>
                    <th>Valor Anterior</th>
                    <th>Valor Nuevo</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map((item) => (
                    <tr key={item.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#475569' }}>
                        {formatDate(item.timestamp)}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#f1f5f9',
                            color: '#1e293b'
                          }}
                        >
                          {item.accion}
                        </span>
                      </td>
                      <td>
                        <code
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            color: '#0f172a'
                          }}
                        >
                          {item.actorCodigo}
                        </code>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {item.actorRol}
                      </td>
                      <td style={{ fontSize: '0.82rem', fontWeight: 500, color: '#334155' }}>
                        {item.campoModificado || 'N/A'}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#b91c1c' }}>
                        {formatValor(item.valorAnterior)}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#15803d', fontWeight: 500 }}>
                        {formatValor(item.valorNuevo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
