import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import { Header } from '../components/Header';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';

export const MisSolicitudesPage = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [prioridadFiltro, setPrioridadFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');

  const fetchSolicitudes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getSolicitudes({
        busqueda,
        estado: estadoFiltro,
        prioridad: prioridadFiltro,
        categoria: categoriaFiltro
      });
      setSolicitudes(data);
    } catch (err) {
      setError(err.message || 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, [estadoFiltro, prioridadFiltro, categoriaFiltro]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSolicitudes();
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
      <Header title="Mis Solicitudes de Soporte" />
      <div className="page-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Historial de requerimientos</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Consulta el estado y seguimiento de tus solicitudes registradas.</p>
          </div>
          <Link to="/nueva-solicitud" className="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Crear Solicitud
          </Link>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <form onSubmit={handleSearchSubmit} className="filter-bar" style={{ marginBottom: '20px' }}>
          <div className="filter-item" style={{ flex: 2 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar en mis solicitudes (código, título o descripción)..."
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

          <button type="submit" className="btn btn-secondary">
            Buscar
          </button>
        </form>

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        <div className="card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              Cargando tus solicitudes...
            </div>
          ) : solicitudes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ color: '#94a3b8', marginBottom: '12px' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#334155' }}>No tienes solicitudes registradas</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                Cuando requieras asistencia en hardware, software o accesos, crea una solicitud.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Título</th>
                    <th>Categoría</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Última Actualización</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((sol) => (
                    <tr key={sol.id}>
                      <td style={{ fontWeight: 600, color: '#1e3a8a' }}>{sol.codigo}</td>
                      <td style={{ fontWeight: 500, maxWidth: '280px' }}>{sol.titulo}</td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#475569' }}>{sol.categoria}</span>
                      </td>
                      <td><PriorityBadge prioridad={sol.prioridad} /></td>
                      <td><StatusBadge estado={sol.estado} /></td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{formatDate(sol.updatedAt)}</td>
                      <td>
                        <Link to={`/solicitudes/${sol.id}`} className="btn btn-secondary btn-sm">
                          Ver Detalle
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
