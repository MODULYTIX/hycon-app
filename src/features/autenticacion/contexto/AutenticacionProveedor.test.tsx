import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AutenticacionProveedor from './AutenticacionProveedor';
import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';
import * as api from '@/features/autenticacion/servicios/autenticacion.api';
import { borrarToken, guardarToken, leerToken } from '@/shared/utilidades/almacenamiento-sesion';
import type { Sesion } from '@/features/autenticacion/tipos/autenticacion.tipos';

vi.mock('@/features/autenticacion/servicios/autenticacion.api');

// Se captura el oyente que registra el proveedor para simular una sesion caducada
const oyentes = vi.hoisted(() => [] as Array<() => void>);
vi.mock('@/shared/utilidades/cliente-http', async (original) => ({
  ...(await original<typeof import('@/shared/utilidades/cliente-http')>()),
  alExpirarSesion: (oyente: () => void) => {
    oyentes.push(oyente);
    return () => oyentes.splice(oyentes.indexOf(oyente), 1);
  },
}));

const sesion: Sesion = {
  token: 'token-restaurado',
  expiraEn: 900,
  usuario: {
    userId: 1,
    name: 'Esau',
    lastname: 'Morales',
    email: 'info@hycon.lat',
    phone: null,
    avatarUrl: null,
    roleId: 1,
    rol: 'ADMIN',
  },
};

const Sonda = () => {
  const { usuario, cargando, cerrarSesion } = useAutenticacion();
  return (
    <div>
      <p>{cargando ? 'cargando' : usuario ? `sesion de ${usuario.name}` : 'sin sesion'}</p>
      <button type="button" onClick={() => void cerrarSesion()}>
        salir
      </button>
    </div>
  );
};

const renderizar = () =>
  render(
    <AutenticacionProveedor>
      <Sonda />
    </AutenticacionProveedor>
  );

describe('AutenticacionProveedor', () => {
  beforeEach(() => {
    window.localStorage.clear();
    borrarToken();
    oyentes.length = 0;
    vi.mocked(api.restaurarSesionApi).mockReset();
    vi.mocked(api.cerrarSesionApi).mockReset().mockResolvedValue(undefined);
  });

  it('sin sesion previa en este navegador no pide nada al servidor', () => {
    renderizar();

    expect(screen.getByText('sin sesion')).toBeInTheDocument();
    expect(api.restaurarSesionApi).not.toHaveBeenCalled();
  });

  it('borra el token que versiones anteriores dejaban en localStorage', () => {
    window.localStorage.setItem('hycon.token', 'token-antiguo-expuesto');

    renderizar();

    expect(window.localStorage.getItem('hycon.token')).toBeNull();
  });

  it('si hubo sesion la recupera con la cookie al cargar', async () => {
    window.localStorage.setItem('hycon.haySesion', '1');
    vi.mocked(api.restaurarSesionApi).mockResolvedValue(sesion);

    renderizar();

    expect(screen.getByText('cargando')).toBeInTheDocument();
    expect(await screen.findByText('sesion de Esau')).toBeInTheDocument();
  });

  it('si la cookie ya no sirve limpia la marca sin mostrar errores', async () => {
    window.localStorage.setItem('hycon.haySesion', '1');
    vi.mocked(api.restaurarSesionApi).mockRejectedValue(new Error('Tu sesion termino'));

    renderizar();

    expect(await screen.findByText('sin sesion')).toBeInTheDocument();
    expect(window.localStorage.getItem('hycon.haySesion')).toBeNull();
  });

  it('cerrar sesion revoca en el servidor y limpia el navegador', async () => {
    const usuario = userEvent.setup();
    window.localStorage.setItem('hycon.haySesion', '1');
    vi.mocked(api.restaurarSesionApi).mockResolvedValue(sesion);
    guardarToken('token-restaurado');
    renderizar();
    await screen.findByText('sesion de Esau');

    await usuario.click(screen.getByRole('button', { name: 'salir' }));

    expect(api.cerrarSesionApi).toHaveBeenCalledTimes(1);
    expect(screen.getByText('sin sesion')).toBeInTheDocument();
    expect(leerToken()).toBeNull();
    expect(window.localStorage.getItem('hycon.haySesion')).toBeNull();
  });

  it('aunque el servidor no responda al cerrar, la sesion se cierra en el navegador', async () => {
    const usuario = userEvent.setup();
    window.localStorage.setItem('hycon.haySesion', '1');
    vi.mocked(api.restaurarSesionApi).mockResolvedValue(sesion);
    vi.mocked(api.cerrarSesionApi).mockRejectedValue(new Error('Sin conexion'));
    renderizar();
    await screen.findByText('sesion de Esau');

    await usuario.click(screen.getByRole('button', { name: 'salir' }));

    await waitFor(() => expect(screen.getByText('sin sesion')).toBeInTheDocument());
  });

  it('si la sesion caduca mientras navega, la interfaz lo refleja', async () => {
    window.localStorage.setItem('hycon.haySesion', '1');
    vi.mocked(api.restaurarSesionApi).mockResolvedValue(sesion);
    renderizar();
    await screen.findByText('sesion de Esau');

    act(() => oyentes.forEach((oyente) => oyente()));

    expect(screen.getByText('sin sesion')).toBeInTheDocument();
  });
});
