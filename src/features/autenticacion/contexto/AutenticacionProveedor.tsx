import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  cerrarSesionApi,
  iniciarSesionApi,
  registrarApi,
  restaurarSesionApi,
} from '@/features/autenticacion/servicios/autenticacion.api';
import type {
  CredencialesLogin,
  DatosRegistro,
  Sesion,
  Usuario,
} from '@/features/autenticacion/tipos/autenticacion.tipos';
import {
  borrarToken,
  guardarToken,
  haySesionMarcada,
  limpiarTokenAntiguo,
  marcarSesionActiva,
} from '@/shared/utilidades/almacenamiento-sesion';
import { alExpirarSesion } from '@/shared/utilidades/cliente-http';
import {
  AutenticacionContexto,
  type ValorAutenticacion,
} from '@/features/autenticacion/contexto/AutenticacionContexto';

export default function AutenticacionProveedor({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState<boolean>(() => haySesionMarcada());

  const olvidarSesion = useCallback(() => {
    borrarToken();
    marcarSesionActiva(false);
    setUsuario(null);
  }, []);

  // Al cargar: si hubo sesion en este navegador, se recupera con la cookie httpOnly.
  // Si la cookie caduco o fue revocada, se limpia sin molestar al visitante.
  useEffect(() => {
    limpiarTokenAntiguo();

    if (!haySesionMarcada()) {
      setCargando(false);
      return;
    }

    let vigente = true;
    // La renovacion no se cancela al desmontar: cortarla a mitad dejaria el
    // navegador con un token que el servidor ya roto
    restaurarSesionApi()
      .then((sesion) => {
        if (vigente) setUsuario(sesion.usuario);
      })
      .catch(() => {
        if (vigente) olvidarSesion();
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [olvidarSesion]);

  // Si en mitad de la navegacion la sesion ya no se puede renovar, la interfaz lo refleja
  useEffect(() => alExpirarSesion(olvidarSesion), [olvidarSesion]);

  const aplicarSesion = useCallback((sesion: Sesion) => {
    guardarToken(sesion.token);
    marcarSesionActiva(true);
    setUsuario(sesion.usuario);
    return sesion.usuario;
  }, []);

  const iniciarSesion = useCallback(
    async (credenciales: CredencialesLogin) => aplicarSesion(await iniciarSesionApi(credenciales)),
    [aplicarSesion]
  );

  const registrar = useCallback(
    async (datos: DatosRegistro) => aplicarSesion(await registrarApi(datos)),
    [aplicarSesion]
  );

  const cerrarSesion = useCallback(async () => {
    // La interfaz se limpia aunque el servidor no responda: el usuario pidio salir
    olvidarSesion();
    try {
      await cerrarSesionApi();
    } catch {
      // Sin conexion la sesion caducara sola en el servidor
    }
  }, [olvidarSesion]);

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
