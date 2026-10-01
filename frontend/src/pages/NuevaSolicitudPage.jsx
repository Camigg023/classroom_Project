import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import { Header } from '../components/Header';

const CATEGORIAS = [
  'Hardware',
  'Software',
  'Redes y Conectividad',
  'Accesos y Cuentas',
  'Sistemas de Bodega y Logística'
];

export const NuevaSolicitudPage = () => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [prioridad, setPrioridad] = useState('Media');
  const [justificacionPrioridad, setJustificacionPrioridad] = useState('');
  const [fechaObjetivo, setFechaObjetivo] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        titulo,
        descripcion,
        categoria,
        prioridad,
        justificacionPrioridad: prioridad === 'Alta' ? justificacionPrioridad : undefined,
        fechaObjetivo: prioridad === 'Alta' ? fechaObjetivo : undefined
      };

      await apiClient.createSolicitud(payload);
      navigate('/mis-solicitudes');
    } catch (err) {
      setError(err.message || 'Error al crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Crear Solicitud de Soporte" />
      <div className="page-body">
        <div className="card" style={{ maxWidth: '680px' }}>
          <div className="card-header">
            <h2 className="card-title">Detalles del Requerimiento</h2>
            <Link to="/mis-solicitudes" className="btn btn-secondary btn-sm">
              Cancelar
            </Link>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="titulo">
                Título o Asunto <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                id="titulo"
                type="text"
                className="form-control"
                placeholder="Ej. Falla de conexión en lector Honeywell de bodega"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="categoria">
                Categoría de Soporte <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                id="categoria"
                className="form-control"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                required
              >
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prioridad">
                Prioridad Sugerida
              </label>
              <select
                id="prioridad"
                className="form-control"
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value)}
              >
                <option value="Baja">Baja - No afecta operaciones normales</option>
                <option value="Media">Media - Dificulta actividades sin paralizar</option>
                <option value="Alta">Alta - Paralización o riesgo operativo crítico</option>
              </select>
            </div>

            {prioridad === 'Alta' && (
              <div style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#92400e', marginBottom: '12px' }}>
                  Requisitos para Prioridad Alta (Normativa MAR-Z)
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="justificacion">
                    Justificación de Impacto Crítico <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <textarea
                    id="justificacion"
                    className="form-control"
                    rows="2"
                    placeholder="Explica qué proceso logístico o distribución se encuentra bloqueado..."
                    value={justificacionPrioridad}
                    onChange={(e) => setJustificacionPrioridad(e.target.value)}
                    required={prioridad === 'Alta'}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="fechaObjetivo">
                    Fecha Objetivo de Atención Requerida <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="fechaObjetivo"
                    type="date"
                    className="form-control"
                    value={fechaObjetivo}
                    onChange={(e) => setFechaObjetivo(e.target.value)}
                    required={prioridad === 'Alta'}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="descripcion">
                Descripción Detallada <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                id="descripcion"
                className="form-control"
                rows="4"
                placeholder="Describe el comportamiento observado, sede o muelle, y pasos para reproducir el fallo..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
              />
              <div className="form-helper">
                Sé lo más preciso posible. No incluyas información confidencial ni contraseñas personales.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
              <Link to="/mis-solicitudes" className="btn btn-secondary">
                Volver
              </Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Registrando...' : 'Enviar Solicitud'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
