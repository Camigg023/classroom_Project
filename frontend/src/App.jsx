import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LoginPage } from './pages/LoginPage';
import { MisSolicitudesPage } from './pages/MisSolicitudesPage';
import { NuevaSolicitudPage } from './pages/NuevaSolicitudPage';
import { CoordinadorDashboardPage } from './pages/CoordinadorDashboardPage';
import { AgenteDashboardPage } from './pages/AgenteDashboardPage';
import { DetalleSolicitudPage } from './pages/DetalleSolicitudPage';
import { IndicadoresPage } from './pages/IndicadoresPage';
import { HistorialAuditorPage } from './pages/HistorialAuditorPage';

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748b' }}>Cargando aplicación...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user.rol === 'Solicitante') {
    return <Navigate to="/mis-solicitudes" replace />;
  }
  if (user.rol === 'Agente') {
    return <Navigate to="/agente/solicitudes" replace />;
  }
  if (user.rol === 'Auditor') {
    return <Navigate to="/auditor/historial" replace />;
  }
  return <Navigate to="/coordinador/solicitudes" replace />;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas Protegidas dentro del AppLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<RootRedirect />} />

              {/* Rol Solicitante */}
              <Route element={<ProtectedRoute allowedRoles={['Solicitante']} />}>
                <Route path="/mis-solicitudes" element={<MisSolicitudesPage />} />
                <Route path="/nueva-solicitud" element={<NuevaSolicitudPage />} />
              </Route>

              {/* Rol Coordinador */}
              <Route element={<ProtectedRoute allowedRoles={['Coordinador']} />}>
                <Route path="/coordinador/indicadores" element={<IndicadoresPage />} />
              </Route>

              {/* Rol Coordinador y Auditor */}
              <Route element={<ProtectedRoute allowedRoles={['Coordinador', 'Auditor']} />}>
                <Route path="/coordinador/solicitudes" element={<CoordinadorDashboardPage />} />
              </Route>

              {/* Rol Auditor */}
              <Route element={<ProtectedRoute allowedRoles={['Auditor']} />}>
                <Route path="/auditor/historial" element={<HistorialAuditorPage />} />
              </Route>

              {/* Rol Agente */}
              <Route element={<ProtectedRoute allowedRoles={['Agente']} />}>
                <Route path="/agente/solicitudes" element={<AgenteDashboardPage />} />
              </Route>

              {/* Detalle compartido (con autorización de backend) */}
              <Route path="/solicitudes/:id" element={<DetalleSolicitudPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
