import { RUTAS } from '@/app/rutas/rutas';

// Secciones de la barra lateral del panel. Una seccion con disponible: false se pinta
// apagada: sirve para anunciar algo que aun no tiene respaldo en el backend.
export interface SeccionPanel {
  id: string;
  etiqueta: string;
  icono: string;
  ruta: string;
  disponible: boolean;
}

export const SECCIONES_PANEL: SeccionPanel[] = [
  {
    id: 'productos',
    etiqueta: 'PRODUCTOS',
    icono: 'solar:box-bold',
    ruta: RUTAS.panelProductos,
    disponible: true,
  },
  {
    id: 'cursos',
    etiqueta: 'CURSOS',
    icono: 'solar:diploma-bold',
    ruta: RUTAS.panelCursosAdmin,
    disponible: true,
  },
  {
    id: 'publicaciones',
    etiqueta: 'PUBLICACIONES',
    icono: 'solar:document-text-bold',
    ruta: RUTAS.panelPublicaciones,
    disponible: true,
  },
];

export const seccionesDisponibles = (): SeccionPanel[] =>
  SECCIONES_PANEL.filter((seccion) => seccion.disponible);
