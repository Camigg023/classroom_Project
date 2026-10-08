import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';

export const CoordinadorDashboardPage = () => {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros y ordenamiento
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [prioridadFiltro, setPrioridadFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [busqueda, setBusqueda] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  // Modal de priorización
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [nuevaPrioridad, setNuevaPrioridad] = useState('Media');
  const [justificacion, setJustificacion] = useState('');
  const [fechaObjetivo, setFechaObjetivo] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Modal de asignación (HU05)
  const [assignTicket, setAssignTicket] = useState(null);
  const [agentesList, setAgentesList] = useState([]);
  const [selectedAgenteId, setSelectedAgenteId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState(null);

  const fetchSolicitudes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getSolicitudes({
        estado: estadoFiltro,
        prioridad: prioridadFiltro,
        categoria: categoriaFiltro,
        sortBy,
        order,
        busqueda
      });
      setSolicitudes(data);
    } catch (err) {
      setError(err.message || 'Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, [estadoFiltro, prioridadFiltro, categoriaFiltro, sortBy, order]);

  const handleExportCsv = async () => {
    setExportLoading(true);
    setError(null);
    try {
      await apiClient.exportarReporteCsv({
        estado: estadoFiltro,
        prioridad: prioridadFiltro,
        categoria: categoriaFiltro,
        busqueda
      });
    } catch (err) {
      setError(err.message || 'Error al exportar reporte CSV');
    } finally {
      setExportLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSolicitudes();
  };

  const openPrioritizeModal = (ticket) => {
    setSelectedTicket(ticket);
    setNuevaPrioridad(ticket.prioridad);
    setJustificacion(ticket.justificacionPrioridad || '');
    setFechaObjetivo(ticket.fechaObjetivo ? ticket.fechaObjetivo.split('T')[0] : '');
    setModalError(null);
  };

  const handleSavePrioridad = async (e) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    try {
      await apiClient.prioritizeSolicitud(selectedTicket.id, {
        prioridad: nuevaPrioridad,
        justificacion: nuevaPrioridad === 'Alta' ? justificacion : undefined,
        fechaObjetivo: nuevaPrioridad === 'Alta' ? fechaObjetivo : undefined
      });

      setSelectedTicket(null);
      await fetchSolicitudes();
    } catch (err) {
      setModalError(err.message || 'Error al actualizar la prioridad');
    } finally {
      setModalLoading(false);
    }
  };

  const openAssignModal = async (ticket) => {
    setAssignTicket(ticket);
    setAssignError(null);
    try {
      const data = await apiClient.getAgentesActivos();
      setAgentesList(data);
      if (data.length > 0) {
        setSelectedAgenteId(ticket.agenteAsignadoId || data[0].id);
      }
    } catch (err) {
      setAssignError(err.message || 'Error al obtener la lista de agentes');
    }
  };

  const handleSaveAssign = async (e) => {
    e.preventDefault();
    if (!selectedAgenteId || !assignTicket) return;
    setAssignLoading(true);
    setAssignError(null);
    try {
      await apiClient.asignarSolicitud(assignTicket.id, selectedAgenteId);
      setAssignTicket(null);
      await fetchSolicitudes();
    } catch (err) {
      setAssignError(err.message || 'Error al asignar agente');
    } finally {
      setAssignLoading(false);
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

  return (
    <>
      <Header title="Gestión Central de Solicitudes" />
      <div className="page-body">
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="card-title">Inventario General de Solicitudes</h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                {user.rol === 'Coordinador'
                  ? 'Prioriza requerimientos y ordena el flujo de atención del equipo.'
                  : 'Modo auditoría: consulta de solicitudes e historial de cambios.'}
              </p>
            </div>
            {user.rol === 'Coordinador' && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/coordinador/indicadores" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                  Indicadores Agregados
                </Link>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleExportCsv}
                  disabled={exportLoading}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  {exportLoading ? 'Exportando...' : 'Exportar CSV'}
                </button>
              </div>
            )}
          </div>

          {/* Barra de Filtros */}
          <form onSubmit={handleSearchSubmit} className="filter-bar">
            <div className="filter-item" style={{ flex: 2 }}>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por código, título o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="filter-item">
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

            <div className="filter-item">
              <select
                className="form-control"
                value={`${sortBy}-${order}`}
                onChange={(e) => {
                  const [field, ord] = e.target.value.split('-');
                  setSortBy(field);
                  setOrder(ord);
                }}
              >
                <option value="createdAt-desc">Fecha: Más reciente</option>
                <option value="createdAt-asc">Fecha: Más antigua</option>
                <option value="prioridad-desc">Prioridad</option>
                <option value="estado-asc">Estado</option>
              </select>
            </div>

            <button type="submit" className="btn btn-secondary">
              Buscar
            </button>
          </form>

          {error && <div className="alert alert-danger">{error}</div>}

          {/* Tabla de Resultados */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              Cargando solicitudes...
            </div>
          ) : solicitudes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
              No se encontraron solicitudes con los filtros aplicados.
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
                    <th>Agente Asignado</th>
                    <th>Fecha Registro</th>
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
                      <td style={{ fontSize: '0.84rem' }}>
                        {sol.agenteAsignadoNombre ? (
                          <span style={{ color: '#1e293b', fontWeight: 500 }}>{sol.agenteAsignadoNombre}</span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin asignar</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{formatDate(sol.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <Link to={`/solicitudes/${sol.id}`} className="btn btn-secondary btn-sm">
                            Detalle
                          </Link>
                          {user.rol === 'Coordinador' && (
                            <>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => openPrioritizeModal(sol)}
                              >
                                Priorizar
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}
                                onClick={() => openAssignModal(sol)}
                              >
                                {sol.agenteAsignadoId ? 'Reasignar' : 'Asignar'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Priorización */}
        {selectedTicket && (
          <div className="modal-overlay">
            <div className="modal-dialog">
              <div className="modal-header">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                  Priorizar Solicitud: {selectedTicket.codigo}
                </h3>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}
                  onClick={() => setSelectedTicket(null)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSavePrioridad}>
                <div className="modal-body">
                  {modalError && <div className="alert alert-danger">{modalError}</div>}

                  <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '16px' }}>
                    <strong>Asunto:</strong> {selectedTicket.titulo}
                  </p>

                  <div className="form-group">
                    <label className="form-label" htmlFor="modalPrioridad">
                      Nueva Prioridad
                    </label>
                    <select
                      id="modalPrioridad"
                      className="form-control"
                      value={nuevaPrioridad}
                      onChange={(e) => setNuevaPrioridad(e.target.value)}
                    >
                      <option value="Baja">Baja</option>
                      <option value="Media">Media</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </div>

                  {nuevaPrioridad === 'Alta' && (
                    <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '14px', borderRadius: '6px', marginBottom: '16px' }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="modalJustificacion">
                          Justificación Obligatoria <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <textarea
                          id="modalJustificacion"
                          className="form-control"
                          rows="2"
                          placeholder="Motivo por el cual amerita prioridad Alta..."
                          value={justificacion}
                          onChange={(e) => setJustificacion(e.target.value)}
                          required={nuevaPrioridad === 'Alta'}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="modalFecha">
                          Fecha Objetivo de Atención <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                          id="modalFecha"
                          type="date"
                          className="form-control"
                          value={fechaObjetivo}
                          onChange={(e) => setFechaObjetivo(e.target.value)}
                          required={nuevaPrioridad === 'Alta'}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedTicket(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={modalLoading}
                  >
                    {modalLoading ? 'Guardando...' : 'Guardar Prioridad'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Asignación de Agente (HU05) */}
        {assignTicket && (
          <div className="modal-overlay">
            <div className="modal-dialog">
              <div className="modal-header">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                  Asignar Solicitud: {assignTicket.codigo}
                </h3>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}
                  onClick={() => setAssignTicket(null)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAssign}>
                <div className="modal-body">
                  {assignError && <div className="alert alert-danger">{assignError}</div>}
                  
                  <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '14px' }}>
                    <strong>Asunto:</strong> {assignTicket.titulo}
                  </p>

                  <div className="form-group">
                    <label className="form-label" htmlFor="agenteModalSelect">
                      Agente Técnico Asignado <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select
                      id="agenteModalSelect"
                      className="form-control"
                      value={selectedAgenteId}
                      onChange={(e) => setSelectedAgenteId(e.target.value)}
                      required
                    >
                      {agentesList.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.nombre} ({ag.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setAssignTicket(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={assignLoading || !selectedAgenteId}
                  >
                    {assignLoading ? 'Asignando...' : 'Confirmar Asignación'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
