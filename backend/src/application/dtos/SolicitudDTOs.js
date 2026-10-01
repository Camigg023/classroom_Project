export class CreateSolicitudDTO {
  constructor({ titulo, descripcion, categoria, prioridad, justificacionPrioridad, fechaObjetivo }) {
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.categoria = categoria;
    this.prioridad = prioridad;
    this.justificacionPrioridad = justificacionPrioridad;
    this.fechaObjetivo = fechaObjetivo;
  }
}

export class PrioritizeSolicitudDTO {
  constructor({ prioridad, justificacion, fechaObjetivo }) {
    this.prioridad = prioridad;
    this.justificacion = justificacion;
    this.fechaObjetivo = fechaObjetivo;
  }
}
