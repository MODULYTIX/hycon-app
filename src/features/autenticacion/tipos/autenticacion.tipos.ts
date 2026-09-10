// Roles reconocidos por la aplicacion. Deben coincidir con la tabla roles de la base.
export const ROLES = {
  ADMIN: 'ADMIN',
  CLIENTE: 'CLIENTE',
  INSTRUCTOR: 'INSTRUCTOR',
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];

export interface Usuario {
  userId: number;
  name: string;
  lastname: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  roleId: number;
  rol: string;
}

export interface Sesion {
  token: string;
  usuario: Usuario;
}

export interface CredencialesLogin {
  email: string;
  password: string;
}

export interface DatosRegistro {
  name: string;
  lastname: string;
  email: string;
  password: string;
  phone?: string;
}

// Cada entrada del menu que se despliega al hacer clic en el perfil
export interface OpcionCuenta {
  id: string;
  etiqueta: string;
  icono: string;
  href: string;
  // Si esta definido, la opcion solo se muestra a esos roles
  rolesPermitidos?: string[];
  destacada?: boolean;
}
