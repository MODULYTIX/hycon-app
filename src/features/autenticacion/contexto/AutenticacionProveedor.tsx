import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  iniciarSesionApi,
  obtenerPerfilApi,
  registrarApi,
} from '@/features/autenticacion/servicios/autenticacion.api';
import type {
  CredencialesLogin,
  DatosRegistro,
  Usuario,
} from '@/features/autenticacion/tipos/autenticacion.tipos';
import {
  borrarToken,
  guardarToken,
  leerToken,
} from '@/shared/utilidades/almacenamiento-sesion';
import {
  AutenticacionContexto,
  type ValorAutenticacion,
} from '@/features/autenticacion/contexto/AutenticacionContexto';

export default function AutenticacionProveedor({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState<boolean>(() => Boolean(leerToken()));

  // Al montar, si hay token guardado se pide el perfil para reconstruir la sesion.
  // Si el token caduco o el usuario fue borrado, se limpia sin molestar al visitante.
  useEffect(() => {
    const token = leerToken();
    if (!token) {
      setCargando(false);
      return;
    }

    const controlador = new AbortController();
    let vigente = true;

    obtenerPerfilApi(controlador.signal)
      .then((perfil) => {
        if (vigente) setUsuario(perfil);
      })
      .catch(() => {
        if (!vigente) return;
        borrarToken();
        setUsuario(null);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
      controlador.abort();
    };
  }, []);

  const iniciarSesion = useCallback(async (credenciales: CredencialesLogin) => {
    const sesion = await iniciarSesionApi(credenciales);
    guardarToken(sesion.token);
    setUsuario(sesion.usuario);
    return sesion.usuario;
  }, []);

  const registrar = useCallback(async (datos: DatosRegistro) => {
    const sesion = await registrarApi(datos);
    guardarToken(sesion.token);
    setUsuario(sesion.usuario);
    return sesion.usuario;
  }, []);

  const cerrarSesion = useCallback(() => {
    borrarToken();
    setUsuario(null);
  }, []);

  const valor = useMemo<ValorAutenticacion>(
    () => ({
      usuario,
      cargando,
      autenticado: usuario !== null,
      iniciarSesion,
      registrar,
      cerrarSesion,
    }),
    [usuario, cargando, iniciarSesion, registrar, cerrarSesion]
  );

  return (
    <AutenticacionContexto.Provider value={valor}>{children}</AutenticacionContexto.Provider>
  );
}
