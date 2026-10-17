// Espejo de lo que devuelve el backend en /api/v1/cotizaciones
export interface EvaluacionErgonomica {
  codigo: string;
  nombre: string;
  norma: string;
  precio: number;
}

export interface Cotizacion {
  uuid: string;
  // Codigo corto que el cliente menciona al escribirnos
  codigo: string;
  nombre: string;
  empresa: string | null;
  telefono: string;
  correo: string;
  mensaje: string | null;
  evaluaciones: EvaluacionErgonomica[];
  total: number;
  estado: string;
  createdAt: string;
}

// Lo que se envia: solo los codigos; el total lo calcula el servidor
export interface DatosCotizacion {
  name: string;
  company?: string;
  phone: string;
  email: string;
  message?: string;
  evaluaciones: string[];
}
