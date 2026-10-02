const API_BASE = '/api';

export const apiClient = {
  getToken() {
    return localStorage.getItem('marz_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('marz_token', token);
    } else {
      localStorage.removeItem('marz_token');
    }
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      this.setToken(null);
      localStorage.removeItem('marz_user');
      window.location.href = '/login';
      throw new Error('Sesión expirada o no autorizada');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data.message || 'Error en la operación';
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  },

  // Auth endpoints
  login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  getMe() {
    return this.request('/auth/me');
  },

  // Solicitudes endpoints
  getMisSolicitudes() {
    return this.request('/solicitudes/mis-solicitudes');
  },

  getSolicitudes(query = {}) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, val]) => {
      if (val) params.append(key, val);
    });
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/solicitudes${queryString}`);
  },

  getSolicitudById(id) {
    return this.request(`/solicitudes/${id}`);
  },

  createSolicitud(payload) {
    return this.request('/solicitudes', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  prioritizeSolicitud(id, payload) {
    return this.request(`/solicitudes/${id}/prioridad`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  asignarSolicitud(id, agenteId) {
    return this.request(`/solicitudes/${id}/asignar`, {
      method: 'PATCH',
      body: JSON.stringify({ agenteId })
    });
  },

  addComentario(id, contenido) {
    return this.request(`/solicitudes/${id}/comentarios`, {
      method: 'POST',
      body: JSON.stringify({ contenido })
    });
  },

  cambiarEstado(id, payload) {
    return this.request(`/solicitudes/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  confirmarCierre(id) {
    return this.request(`/solicitudes/${id}/confirmar-cierre`, {
      method: 'POST'
    });
  },

  reabrirSolicitud(id, motivo) {
    return this.request(`/solicitudes/${id}/reabrir`, {
      method: 'POST',
      body: JSON.stringify({ motivo })
    });
  },

  getAgentesActivos() {
    return this.request('/users/agentes');
  },

  getNotificaciones(soloNoLeidas = false) {
    const query = soloNoLeidas ? '?noLeidas=true' : '';
    return this.request(`/notificaciones${query}`);
  },

  marcarNotificacionLeida(id) {
    return this.request(`/notificaciones/${id}/leida`, {
      method: 'PATCH'
    });
  }
};
