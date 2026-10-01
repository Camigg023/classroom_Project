import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { Header } from '../components/Header';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';

export const DetalleSolicitudPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getSolicitudById(id);
        setSolicitud(data);
      } catch (err) {
        setError(err.message || 'No fue posible cargar el detalle de la solicitud');
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Header title="Detalle de Solicitud" />
      <div className="page-body">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '18px' }}
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Cargando información de la solicitud...
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : !solicitud ? (
          <div className="alert alert-danger">Solicitud no encontrada.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Columna Izquierda: Información Principal */}
            <div>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e3a8a' }}>
                    {solicitud.codigo}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <PriorityBadge prioridad={solicitud.prioridad} />
                    <StatusBadge estado={solicitud.estado} />
                  </div>
                </div>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
                  {solicitud.titulo}
                </h2>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Descripción
                  </h3>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: '#334155',
                    whiteSpace: 'pre-wrap',
                    border: '1px solid #e2e8f0'
                  }}>
                    {solicitud.descripcion}
                  </div>
                </div>

                {solicitud.justificacionPrioridad && (
                  <div style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    padding: '14px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{ fontSize: '0.82rem', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
                      Justificación de Prioridad Alta
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#78350f' }}>
                      {solicitud.justificacionPrioridad}
                    </p>
                    {solicitud.fechaObjetivo && (
                      <p style={{ fontSize: '0.8rem', color: '#92400e', marginTop: '6px' }}>
                        <strong>Fecha Objetivo:</strong> {new Date(solicitud.fechaObjetivo).toLocaleDateString('es-CO')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Historial de Auditoría (Visible a Coordinador y Auditor) */}
              {solicitud.auditoria && solicitud.auditoria.length > 0 && (
                <div className="card">
                  <h3 className="card-title" style={{ marginBottom: '16px' }}>
                    Trazabilidad de Auditoría (Solo Lectura)
                  </h3>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Actor Codificado</th>
                          <th>Acción / Campo</th>
                          <th>Valor Anterior</th>
                          <th>Valor Nuevo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {solicitud.auditoria.map((aud) => (
                          <tr key={aud.id}>
                            <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{formatDate(aud.createdAt)}</td>
                            <td>
                              <span style={{
                                fontFamily: 'monospace',
                                backgroundColor: '#f1f5f9',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.78rem',
                                color: '#1e293b'
                              }}>
                                {aud.actorCodigo}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.85rem' }}>{aud.campo || aud.accion}</td>
                            <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{aud.valorAnterior || '-'}</td>
                            <td style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{aud.valorNuevo || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Columna Derecha: Metadatos y Responsables */}
            <div>
              <div className="card">
                <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '14px' }}>
                  Ficha Técnica
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Categoría</span>
                    <strong style={{ color: '#1e293b' }}>{solicitud.categoria}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Solicitante</span>
                    <strong style={{ color: '#1e293b' }}>{solicitud.propietarioNombre}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Agente Asignado</span>
                    <strong style={{ color: solicitud.agenteAsignadoNombre ? '#1e293b' : '#94a3b8' }}>
                      {solicitud.agenteAsignadoNombre || 'Sin asignar'}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Fecha de Creación</span>
                    <span style={{ color: '#334155' }}>{formatDate(solicitud.createdAt)}</span>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Última Modificación</span>
                    <span style={{ color: '#334155' }}>{formatDate(solicitud.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
