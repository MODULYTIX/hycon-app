// Catalogo central de rutas. Cualquier enlace de la aplicacion sale de aqui,
// para que renombrar una URL sea un cambio en un solo sitio.
export const RUTAS = {
  home: '/',
  productos: '/productos',
  cursos: '/cursos',
  publicaciones: '/publicaciones',
  acercaDe: '/acerca-de',
  contactanos: '/contactanos',
  carrito: '/carrito',
  perfil: '/perfil',
  historial: '/historial-de-compras',
  panelCursos: '/panel-de-cursos',
  softwareErgonomico: '/software-ergonomico',
  panel: '/panel-de-configuracion',
  panelProductos: '/panel-de-configuracion/productos',
  panelPublicaciones: '/panel-de-configuracion/publicaciones',
  panelCursosAdmin: '/panel-de-configuracion/cursos',
} as const;

export interface EnlaceNavegacion {
  id: string;
  etiqueta: string;
  ruta: string;
}

// Menu principal del sitio publico, en el orden en que se muestra
export const NAVEGACION_PRINCIPAL: EnlaceNavegacion[] = [
  { id: 'home', etiqueta: 'HOME', ruta: RUTAS.home },
  { id: 'productos', etiqueta: 'PRODUCTOS', ruta: RUTAS.productos },
  { id: 'cursos', etiqueta: 'CURSOS', ruta: RUTAS.cursos },
  { id: 'publicaciones', etiqueta: 'PUBLICACIONES', ruta: RUTAS.publicaciones },
  { id: 'acerca-de', etiqueta: 'ACERCA DE', ruta: RUTAS.acercaDe },
  { id: 'contactanos', etiqueta: 'CONTACTANOS', ruta: RUTAS.contactanos },
];
