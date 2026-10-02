import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';

export const DetalleSolicitudPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Comentarios (HU06)
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [comentarioLoading, setComentarioLoading] = useState(false);
  const [comentarioError, setComentarioError] = useState(null);

  // Asignación de Agente (HU05)
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [agentes, setAgentes] = useState([]);
  const [selectedAgenteId, setSelectedAgenteId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState(null);

  // Cambio de Estado (HU07)
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [motivoEstado, setMotivoEstado] = useState('');
  const [estadoLoading, setEstadoLoading] = useState(false);
  const [estadoError, setEstadoError] = useState(null);

  // Cierre y Reapertura (HU08)
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [motivoReaperturaInput, setMotivoReaperturaInput] = useState('');
  const [reopenLoading, setReopenLoading] = useState(false);
  const [reopenError, setReopenError] = useState(null);
  const [cierreLoading, setCierreLoading] = useState(false);
  const [cierreError, setCierreError] = useState(null);

  const loadDetail = async () => {
    try {
      const data = await apiClient.getSolicitudById(id);
      setSolicitud(data);
    } catch (err) {
      setError(err.message || 'No fue posible cargar el detalle de la solicitud');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
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

  // Abrir modal de asignación y cargar agentes activos
  const handleOpenAssignModal = async () => {
    setAssignError(null);
    setShowAssignModal(true);
    try {
      const data = await apiClient.getAgentesActivos();
      setAgentes(data);
      if (data.length > 0) {
        setSelectedAgenteId(solicitud.agenteAsignadoId || data[0].id);
      }
    } catch (err) {
      setAssignError(err.message || 'Error al cargar agentes activos');
    }
  };

  const handleSaveAssign = async (e) => {
    e.preventDefault();
    if (!selectedAgenteId) return;
    setAssignLoading(true);
    setAssignError(null);
    try {
      await apiClient.asignarSolicitud(solicitud.id, selectedAgenteId);
      setShowAssignModal(false);
      await loadDetail();
    } catch (err) {
      setAssignError(err.message || 'Error al asignar agente');
    } finally {
      setAssignLoading(false);
    }
  };

  // Enviar comentario de trabajo (HU06)
  const handleAddComentario = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) {
      setComentarioError('El comentario no puede estar vacío');
      return;
    }
    setComentarioLoading(true);
    setComentarioError(null);
    try {
      await apiClient.addComentario(solicitud.id, nuevoComentario);
      setNuevoComentario('');
      await loadDetail();
    } catch (err) {
      setComentarioError(err.message || 'Error al registrar el comentario');
    } finally {
      setComentarioLoading(false);
    }
  };

  // Cambio de estado según matriz (HU07)
  const handleCambiarEstado = async (e) => {
    e.preventDefault();
    if (!nuevoEstado) return;
    setEstadoLoading(true);
    setEstadoError(null);
    try {
      await apiClient.cambiarEstado(solicitud.id, {
        estado: nuevoEstado,
        motivo: motivoEstado || undefined
      });
      setNuevoEstado('');
      setMotivoEstado('');
      await loadDetail();
    } catch (err) {
      setEstadoError(err.message || 'Error al cambiar estado');
    } finally {
      setEstadoLoading(false);
    }
  };

  // Confirmar Cierre (HU08)
  const handleConfirmarCierre = async () => {
    setCierreLoading(true);
    setCierreError(null);
    try {
      await apiClient.confirmarCierre(solicitud.id);
      await loadDetail();
    } catch (err) {
      setCierreError(err.message || 'Error al confirmar solución');
    } finally {
      setCierreLoading(false);
    }
  };

  // Reabrir Solicitud (HU08)
  const handleReabrirSolicitud = async (e) => {
    e.preventDefault();
    if (!motivoReaperturaInput.trim()) {
      setReopenError('El motivo de reapertura es obligatorio');
      return;
    }
    setReopenLoading(true);
    setReopenError(null);
    try {
      await apiClient.reabrirSolicitud(solicitud.id, motivoReaperturaInput);
      setShowReopenModal(false);
      setMotivoReaperturaInput('');
      await loadDetail();
    } catch (err) {
      setReopenError(err.message || 'Error al reabrir solicitud');
    } finally {
      setReopenLoading(false);
    }
  };

  // Estados destinos permitidos según rol y estado actual
  const getEstadosDestinoDisponibles = () => {
    if (!solicitud) return [];
    const actual = solicitud.estado;
    if (user.rol === 'Agente' || user.rol === 'Coordinador') {
      if (actual === 'Asignado') return ['En Proceso'];
      if (actual === 'En Proceso') return ['Resuelta'];
      if (actual === 'Reabierta') return ['En Proceso'];
      if (actual === 'Nuevo' && user.rol === 'Coordinador') return ['Asignado', 'En Proceso'];
    }
    return [];
  };

  const estadosDisponibles = getEstadosDestinoDisponibles();
  const isPropietario = user?.id === solicitud?.propietarioId;

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
          <div>
            {/* Banner de Acción HU08: Confirmación o Reapertura por Solicitante */}
            {isPropietario && solicitud.estado === 'Resuelta' && (
              <div className="action-banner action-banner-success">
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#065f46', marginBottom: '4px' }}>
                    Solución propuesta por el equipo de soporte
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#047857' }}>
                    Por favor valida si la falla técnica reportada fue resuelta a entera satisfacción. Puedes confirmar el cierre definitivo o reabrir el caso si el problema persiste.
                  </p>
                </div>
                {cierreError && <div className="alert alert-danger" style={{ margin: 0 }}>{cierreError}</div>}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: '#059669', borderColor: '#047857' }}
                    onClick={handleConfirmarCierre}
                    disabled={cierreLoading}
                  >
                    {cierreLoading ? 'Confirmando...' : '✓ Aceptar Solución y Cerrar'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#b91c1c', borderColor: '#fca5a5', backgroundColor: '#ffffff' }}
                    onClick={() => {
                      setReopenError(null);
                      setShowReopenModal(true);
                    }}
                  >
                    ↺ Reabrir Solicitud
                  </button>
                </div>
              </div>
            )}

            {/* Banner de Estado Reabierto */}
            {solicitud.estado === 'Reabierta' && (
              <div className="action-banner action-banner-warning">
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
                  Solicitud Reabierta por el Usuario
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#78350f' }}>
                  <strong>Motivo de reapertura:</strong> {solicitud.motivoReapertura || 'No especificado'}
                </p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              {/* Columna Izquierda: Información Principal y Comentarios */}
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

                {/* Sección HU06: Comentarios de Trabajo (Inmutables) */}
                <div className="card">
                  <h3 className="card-title" style={{ marginBottom: '16px' }}>
                    Registro de Comentarios y Avances de Trabajo
                  </h3>

                  {(!solicitud.comentarios || solicitud.comentarios.length === 0) ? (
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
                      Aún no se han registrado notas de trabajo en esta solicitud.
                    </p>
                  ) : (
                    <div className="comment-list">
                      {solicitud.comentarios.map((c) => (
                        <div key={c._id} className="comment-item">
                          <div className="comment-header">
                            <span className="comment-author">
                              {c.autorNombre}
                              <span className="role-tag" style={{ fontSize: '0.72rem' }}>
                                {c.autorRol}
                              </span>
                            </span>
                            <span className="comment-date">{formatDate(c.createdAt)}</span>
                          </div>
                          <div className="comment-body">{c.contenido}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulario para agregar nuevo comentario */}
                  {solicitud.estado !== 'Cerrada' && (
                    <form onSubmit={handleAddComentario} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                      {comentarioError && <div className="alert alert-danger">{comentarioError}</div>}
                      <div className="form-group">
                        <label className="form-label" htmlFor="contenidoComentario">
                          Agregar Nota o Avance Técnico
                        </label>
                        <textarea
                          id="contenidoComentario"
                          className="form-control"
                          rows="3"
                          placeholder="Documenta el diagnóstico, piezas sustituidas o avances del caso..."
                          value={nuevoComentario}
                          onChange={(e) => setNuevoComentario(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm"
                          disabled={comentarioLoading}
                        >
                          {comentarioLoading ? 'Guardando...' : 'Registrar Comentario'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Historial de Auditoría (Coordinador y Auditor) */}
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

              {/* Columna Derecha: Ficha Técnica y Controles de Estado/Asignación */}
              <div>
                {/* Control de Asignación (HU05) para Coordinador */}
                {user.rol === 'Coordinador' && solicitud.estado !== 'Cerrada' && (
                  <div className="card" style={{ marginBottom: '20px' }}>
                    <h3 className="card-title" style={{ fontSize: '0.95rem', marginBottom: '12px' }}>
                      Gestión de Responsable (HU05)
                    </h3>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%' }}
                      onClick={handleOpenAssignModal}
                    >
                      {solicitud.agenteAsignadoId ? 'Reasignar Agente' : 'Asignar Agente'}
                    </button>
                  </div>
                )}

                {/* Control de Cambio de Estado (HU07) para Agente / Coordinador */}
                {estadosDisponibles.length > 0 && (
                  <div className="card" style={{ marginBottom: '20px' }}>
                    <h3 className="card-title" style={{ fontSize: '0.95rem', marginBottom: '12px' }}>
                      Flujo de Atención (HU07)
                    </h3>
                    {estadoError && <div className="alert alert-danger">{estadoError}</div>}
                    <form onSubmit={handleCambiarEstado}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="nuevoEstadoSelect">
                          Siguiente Estado Permitido
                        </label>
                        <select
                          id="nuevoEstadoSelect"
                          className="form-control"
                          value={nuevoEstado}
                          onChange={(e) => setNuevoEstado(e.target.value)}
                          required
                        >
                          <option value="">Seleccionar estado...</option>
                          {estadosDisponibles.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="motivoEstadoInput">
                          Motivo / Nota de Transición
                        </label>
                        <input
                          id="motivoEstadoInput"
                          type="text"
                          className="form-control"
                          placeholder="Ej. Diagnóstico confirmado..."
                          value={motivoEstado}
                          onChange={(e) => setMotivoEstado(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%' }}
                        disabled={estadoLoading || !nuevoEstado}
                      >
                        {estadoLoading ? 'Actualizando...' : 'Actualizar Estado'}
                      </button>
                    </form>
                  </div>
                )}

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

                    {solicitud.asignadoPorNombre && (
                      <div>
                        <span style={{ color: '#64748b', display: 'block' }}>Asignado Por</span>
                        <span style={{ color: '#334155' }}>
                          {solicitud.asignadoPorNombre} ({formatDate(solicitud.asignadoAt)})
                        </span>
                      </div>
                    )}

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
          </div>
        )}

        {/* Modal de Asignación de Agente (HU05) */}
        {showAssignModal && (
          <div className="modal-overlay">
            <div className="modal-dialog">
              <div className="modal-header">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                  Asignar Solicitud a Agente
                </h3>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}
                  onClick={() => setShowAssignModal(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAssign}>
                <div className="modal-body">
                  {assignError && <div className="alert alert-danger">{assignError}</div>}
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px' }}>
                    Selecciona un agente activo en el sistema para asignarle la atención de esta solicitud.
                  </p>

                  <div className="form-group">
                    <label className="form-label" htmlFor="agenteSelector">
                      Agente Destino <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select
                      id="agenteSelector"
                      className="form-control"
                      value={selectedAgenteId}
                      onChange={(e) => setSelectedAgenteId(e.target.value)}
                      required
                    >
                      {agentes.map((ag) => (
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
                    onClick={() => setShowAssignModal(false)}
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

        {/* Modal de Reapertura de Solicitud (HU08) */}
        {showReopenModal && (
          <div className="modal-overlay">
            <div className="modal-dialog">
              <div className="modal-header">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#991b1b' }}>
                  Reapertura de Solicitud
                </h3>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}
                  onClick={() => setShowReopenModal(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleReabrirSolicitud}>
                <div className="modal-body">
                  {reopenError && <div className="alert alert-danger">{reopenError}</div>}
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '14px' }}>
                    Indica detalladamente por qué la solución propuesta no resolvió la incidencia o qué novedad se presentó.
                  </p>

                  <div className="form-group">
                    <label className="form-label" htmlFor="motivoReapertura">
                      Motivo Obligatorio de Reapertura <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <textarea
                      id="motivoReapertura"
                      className="form-control"
                      rows="3"
                      placeholder="Explica qué persiste o falló nuevamente..."
                      value={motivoReaperturaInput}
                      onChange={(e) => setMotivoReaperturaInput(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowReopenModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ backgroundColor: '#dc2626', borderColor: '#b91c1c' }}
                    disabled={reopenLoading}
                  >
                    {reopenLoading ? 'Reabriendo...' : 'Confirmar Reapertura'}
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
