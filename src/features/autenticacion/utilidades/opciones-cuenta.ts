import { ROLES, type OpcionCuenta } from '@/features/autenticacion/tipos/autenticacion.tipos';

// Opciones del menu que se despliega al pulsar el perfil.
// "rolesPermitidos" ausente significa que la opcion es visible para cualquier sesion.
export const OPCIONES_CUENTA: OpcionCuenta[] = [
  {
    id: 'perfil',
    etiqueta: 'Perfil',
    icono: 'solar:user-rounded-bold',
    href: '/perfil',
  },
  {
    id: 'historial',
    etiqueta: 'Historial de compras',
    icono: 'solar:bag-check-bold',
    href: '/historial-de-compras',
  },
  {
    id: 'panel-configuracion',
    etiqueta: 'Panel de configuracion',
    icono: 'solar:settings-bold',
    href: '/panel-de-configuracion',
    rolesPermitidos: [ROLES.ADMIN],
    destacada: true,
  },
  {
    id: 'panel-cursos',
    etiqueta: 'Panel de cursos',
    icono: 'solar:diploma-bold',
    href: '/panel-de-cursos',
  },
  {
    id: 'software-ergonomico',
    etiqueta: 'Software de ergonomico',
    icono: 'solar:monitor-smartphone-bold',
    href: '/software-ergonomico',
  },
];

// Devuelve solo las opciones que el rol indicado puede ver.
// El rol llega del token emitido por el backend, no de una preferencia del cliente.
export const filtrarOpcionesPorRol = (rol: string | undefined): OpcionCuenta[] => {
  if (!rol) return [];
  return OPCIONES_CUENTA.filter(
    (opcion) => !opcion.rolesPermitidos || opcion.rolesPermitidos.includes(rol)
  );
};

export const esAdministrador = (rol: string | undefined): boolean => rol === ROLES.ADMIN;

// Iniciales para el avatar cuando el usuario no tiene foto
export const obtenerIniciales = (nombre: string, apellido: string): string => {
  const primera = nombre.trim().charAt(0);
  const segunda = apellido.trim().charAt(0);
  return `${primera}${segunda}`.toUpperCase() || '?';
};
