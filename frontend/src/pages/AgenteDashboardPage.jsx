import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';

export const AgenteDashboardPage = () => {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [soloMisTickets, setSoloMisTickets] = useState(true);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = {
        estado: estadoFiltro || undefined
      };
      if (soloMisTickets) {
        query.agenteAsignadoId = user.id;
      }
      const [tickets, notifs] = await Promise.all([
        apiClient.getSolicitudes(query),
        apiClient.getNotificaciones()
      ]);
      setSolicitudes(tickets);
      setNotificaciones(notifs);
    } catch (err) {
      setError(err.message || 'Error al cargar las solicitudes del agente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [estadoFiltro, soloMisTickets]);

  const handleMarcarLeida = async (notifId) => {
    try {
      await apiClient.marcarNotificacionLeida(notifId);
      setNotificaciones(prev =>
        prev.map(n => (n.id === notifId ? { ...n, leida: true } : n))
      );
    } catch (err) {
      console.error('Error al marcar leída:', err);
    }
  };

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

  const noLeidasCount = notificaciones.filter(n => !n.leida).length;

  return (
    <>
      <Header title="Bandeja de Trabajo del Agente" />
      <div className="page-body">
        {/* Panel de Notificaciones Internas (HU05) */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 className="card-title" style={{ margin: 0, fontSize: '1rem' }}>
                Notificaciones de Asignación y Eventos
              </h2>
              {noLeidasCount > 0 && (
                <span style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  {noLeidasCount} nueva{noLeidasCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowNotifPanel(!showNotifPanel)}
            >
              {showNotifPanel ? 'Ocultar Notificaciones' : `Ver Notificaciones (${notificaciones.length})`}
            </button>
          </div>

          {showNotifPanel && (
            <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
              {notificaciones.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  No tienes notificaciones registradas.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {notificaciones.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '6px',
                        backgroundColor: n.leida ? '#f8fafc' : '#eff6ff',
                        border: n.leida ? '1px solid #e2e8f0' : '1px solid #bfdbfe',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e3a8a' }}>
                          {n.titulo}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '2px' }}>
                          {n.mensaje}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {formatDate(n.createdAt)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {n.solicitudId && (
                          <Link to={`/solicitudes/${n.solicitudId}`} className="btn btn-secondary btn-sm">
                            Abrir
                          </Link>
                        )}
                        {!n.leida && (
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{ fontSize: '0.78rem', color: '#475569' }}
                            onClick={() => handleMarcarLeida(n.id)}
                          >
                            Marcar leída
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Listado de Solicitudes */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Tickets de Soporte Asignados</h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Monitorea el progreso, documenta avances de diagnóstico y actualiza el estado de atención.
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="filter-bar">
            <div className="filter-item">
              <select
                className="form-control"
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
              >
                <option value="">Todos los Estados</option>
                <option value="Asignado">Asignado</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Resuelta">Resuelta</option>
                <option value="Reabierta">Reabierta</option>
                <option value="Cerrada">Cerrada</option>
              </select>
            </div>

            <div className="filter-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={soloMisTickets}
                  onChange={(e) => setSoloMisTickets(e.target.checked)}
                />
                Solo asignados a mí
              </label>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
              Cargando solicitudes...
            </div>
          ) : solicitudes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
              No tienes solicitudes asignadas en este momento con los filtros seleccionados.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Título</th>
                    <th>Solicitante</th>
                    <th>Categoría</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Asignado Por</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((sol) => (
                    <tr key={sol.id}>
                      <td style={{ fontWeight: 600, color: '#1e3a8a' }}>{sol.codigo}</td>
                      <td style={{ fontWeight: 500, maxWidth: '240px' }}>{sol.titulo}</td>
                      <td style={{ fontSize: '0.85rem' }}>{sol.propietarioNombre}</td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#475569' }}>{sol.categoria}</span>
                      </td>
                      <td><PriorityBadge prioridad={sol.prioridad} /></td>
                      <td><StatusBadge estado={sol.estado} /></td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {sol.asignadoPorNombre || '-'}
                      </td>
                      <td>
                        <Link to={`/solicitudes/${sol.id}`} className="btn btn-primary btn-sm">
                          Atender
                        </Link>
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
