// Secciones de la barra lateral del panel.
// ARTICULOS aparece desactivada a proposito: todavia no existe una tabla que la respalde
// en el esquema de Prisma, asi que no hay endpoint al que llamar.
export interface SeccionPanel {
  id: string;
  etiqueta: string;
  icono: string;
  ruta: string;
  disponible: boolean;
}

export const RUTA_PANEL = '/panel-de-configuracion';

export const SECCIONES_PANEL: SeccionPanel[] = [
  {
    id: 'productos',
    etiqueta: 'PRODUCTOS',
    icono: 'solar:box-bold',
    ruta: `${RUTA_PANEL}/productos`,
    disponible: true,
  },
  {
    id: 'cursos',
    etiqueta: 'CURSOS',
    icono: 'solar:diploma-bold',
    ruta: `${RUTA_PANEL}/cursos`,
    disponible: true,
  },
  {
    id: 'articulos',
    etiqueta: 'ARTICULOS',
    icono: 'solar:document-text-bold',
    ruta: `${RUTA_PANEL}/articulos`,
    disponible: false,
  },
];

export const seccionesDisponibles = (): SeccionPanel[] =>
  SECCIONES_PANEL.filter((seccion) => seccion.disponible);
