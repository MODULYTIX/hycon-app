import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PaginaPerfil from './PaginaPerfil';
import AutenticacionProveedor from '@/features/autenticacion/contexto/AutenticacionProveedor';
import * as api from '@/features/autenticacion/servicios/autenticacion.api';
import { marcarSesionActiva } from '@/shared/utilidades/almacenamiento-sesion';
import type { Sesion, Usuario } from '@/features/autenticacion/tipos/autenticacion.tipos';

vi.mock('@/features/autenticacion/servicios/autenticacion.api');

const ana: Usuario = {
  userId: 7,
  name: 'Ana',
  lastname: 'Quispe',
  email: 'ana@hycon.com',
  phone: null,
  avatarUrl: null,
  roleId: 2,
  rol: 'CLIENTE',
};

const sesion: Sesion = { token: 'token-de-prueba', expiraEn: 900, usuario: ana };

const renderizar = () =>
  render(
    <AutenticacionProveedor>
      <MemoryRouter>
        <PaginaPerfil />
      </MemoryRouter>
    </AutenticacionProveedor>
  );

const conSesion = (usuario: Usuario = ana) => {
  marcarSesionActiva(true);
  vi.mocked(api.restaurarSesionApi).mockResolvedValue({ ...sesion, usuario });
};

describe('PaginaPerfil', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(api.restaurarSesionApi).mockRejectedValue(new Error('sin sesion'));
    vi.mocked(api.actualizarPerfilApi).mockImplementation(async (datos) => ({
      ...ana,
      ...datos,
      phone: datos.phone || null,
    }));
    vi.mocked(api.cambiarPasswordApi).mockResolvedValue(undefined);
    vi.mocked(api.subirAvatarApi).mockResolvedValue({
      ...ana,
      avatarUrl: 'http://localhost:4000/uploads/imagenes/foto.webp',
    });
    vi.mocked(api.quitarAvatarApi).mockResolvedValue({ ...ana, avatarUrl: null });
  });

  it('sin sesion pide entrar a la cuenta', async () => {
    renderizar();

    expect(await screen.findByText(/entra a tu cuenta para ver tu perfil/i)).toBeInTheDocument();
  });

  it('muestra los datos del usuario y el correo bloqueado', async () => {
    conSesion({ ...ana, phone: '902665565' });
    renderizar();

    expect(await screen.findByLabelText('Nombre')).toHaveValue('Ana');
    expect(screen.getByLabelText('Apellido')).toHaveValue('Quispe');
    expect(screen.getByLabelText(/teléfono/i)).toHaveValue('902665565');
    const correo = screen.getByLabelText(/correo electrónico/i);
    expect(correo).toHaveValue('ana@hycon.com');
    expect(correo).toBeDisabled();
  });

  it('guarda los datos personales y los refresca en toda la web', async () => {
    const usuario = userEvent.setup({ delay: null });
    conSesion();
    renderizar();
    const apellido = await screen.findByLabelText('Apellido');

    await usuario.clear(apellido);
    await usuario.type(apellido, 'Quispe Rojas');
    await usuario.type(screen.getByLabelText(/teléfono/i), '902665565');
    await usuario.click(screen.getByRole('button', { name: /guardar cambios/i }));

    expect(await screen.findByText('Datos guardados')).toBeInTheDocument();
    expect(api.actualizarPerfilApi).toHaveBeenCalledWith({
      name: 'Ana',
      lastname: 'Quispe Rojas',
      phone: '902665565',
    });
    // La barra lateral ya muestra el apellido nuevo
    expect(screen.getByText('Ana Quispe Rojas')).toBeInTheDocument();
  });

  it('no guarda datos invalidos', async () => {
    const usuario = userEvent.setup({ delay: null });
    conSesion();
    renderizar();
    const nombre = await screen.findByLabelText('Nombre');

    await usuario.clear(nombre);
    await usuario.type(nombre, 'A');
    await usuario.click(screen.getByRole('button', { name: /guardar cambios/i }));

    expect(await screen.findByText(/al menos 2 caracteres/i)).toBeInTheDocument();
    expect(api.actualizarPerfilApi).not.toHaveBeenCalled();
  });

  it('muestra el motivo si el servidor rechaza el cambio', async () => {
    const usuario = userEvent.setup({ delay: null });
    vi.mocked(api.actualizarPerfilApi).mockRejectedValue(new Error('El telefono es demasiado largo'));
    conSesion();
    renderizar();
    await screen.findByLabelText('Nombre');

    await usuario.click(screen.getByRole('button', { name: /guardar cambios/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/demasiado largo/i);
  });
});

describe('PaginaPerfil: contrasena', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(api.cambiarPasswordApi).mockResolvedValue(undefined);
    conSesion();
  });

  const escribir = async (
    usuario: ReturnType<typeof userEvent.setup>,
    datos: { actual: string; nueva: string; repetida: string }
  ) => {
    await usuario.type(screen.getByLabelText('Contraseña actual'), datos.actual);
    await usuario.type(screen.getByLabelText('Contraseña nueva'), datos.nueva);
    await usuario.type(screen.getByLabelText(/repite la contraseña/i), datos.repetida);
    await usuario.click(screen.getByRole('button', { name: /cambiar contraseña/i }));
  };

  it('cambia la contrasena y avisa de las sesiones cerradas', async () => {
    const usuario = userEvent.setup({ delay: null });
    renderizar();
    await screen.findByLabelText('Contraseña actual');

    await escribir(usuario, {
      actual: 'la-de-antes-2026',
      nueva: 'brisa-tablero-19-norte',
      repetida: 'brisa-tablero-19-norte',
    });

    expect(await screen.findByText(/contraseña actualizada/i)).toBeInTheDocument();
    expect(api.cambiarPasswordApi).toHaveBeenCalledWith({
      actual: 'la-de-antes-2026',
      nueva: 'brisa-tablero-19-norte',
    });
    // El formulario queda limpio, sin dejar la contrasena escrita
    expect(screen.getByLabelText('Contraseña actual')).toHaveValue('');
  });

  it('no envia nada si la repeticion no coincide', async () => {
    const usuario = userEvent.setup({ delay: null });
    renderizar();
    await screen.findByLabelText('Contraseña actual');

    await escribir(usuario, {
      actual: 'la-de-antes-2026',
      nueva: 'brisa-tablero-19-norte',
      repetida: 'brisa-tablero-19-sur',
    });

    expect(await screen.findByText(/no coinciden/i)).toBeInTheDocument();
    expect(api.cambiarPasswordApi).not.toHaveBeenCalled();
  });

  it('rechaza una contrasena que no cumple la politica', async () => {
    const usuario = userEvent.setup({ delay: null });
    renderizar();
    await screen.findByLabelText('Contraseña actual');

    await escribir(usuario, { actual: 'la-de-antes-2026', nueva: '123456', repetida: '123456' });

    expect(api.cambiarPasswordApi).not.toHaveBeenCalled();
  });

  it('muestra el error del servidor si la actual no es correcta', async () => {
    const usuario = userEvent.setup({ delay: null });
    vi.mocked(api.cambiarPasswordApi).mockRejectedValue(new Error('La contrasena actual no es correcta'));
    renderizar();
    await screen.findByLabelText('Contraseña actual');

    await escribir(usuario, {
      actual: 'equivocada-2026',
      nueva: 'brisa-tablero-19-norte',
      repetida: 'brisa-tablero-19-norte',
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(/no es correcta/i);
  });
});

describe('PaginaPerfil: foto', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(api.subirAvatarApi).mockResolvedValue({
      ...ana,
      avatarUrl: 'http://localhost:4000/uploads/imagenes/foto.webp',
    });
    vi.mocked(api.quitarAvatarApi).mockResolvedValue({ ...ana, avatarUrl: null });
  });

  it('sin foto muestra las iniciales', async () => {
    conSesion();
    renderizar();

    const seccion = (await screen.findByRole('heading', { name: 'Foto de perfil' })).closest(
      'section'
    ) as HTMLElement;
    expect(within(seccion).getByText('AQ')).toBeInTheDocument();
    expect(within(seccion).getByRole('button', { name: /subir foto/i })).toBeInTheDocument();
  });

  it('sube la foto elegida y la muestra al momento', async () => {
    const usuario = userEvent.setup({ delay: null });
    conSesion();
    renderizar();
    await screen.findByRole('heading', { name: 'Foto de perfil' });

    const archivo = new File([new Uint8Array(100)], 'foto.webp', { type: 'image/webp' });
    await usuario.upload(screen.getByLabelText(/elegir foto de perfil/i), archivo);

    await waitFor(() => expect(api.subirAvatarApi).toHaveBeenCalledWith(archivo));
    expect(await screen.findByAltText('Foto de Ana')).toHaveAttribute(
      'src',
      'http://localhost:4000/uploads/imagenes/foto.webp'
    );
  });

  it('rechaza un archivo que no es imagen sin llamar al servidor', async () => {
    conSesion();
    renderizar();
    await screen.findByRole('heading', { name: 'Foto de perfil' });

    // El selector ya filtra por tipo; se fuerza el caso para comprobar la segunda barrera
    const archivo = new File(['texto'], 'notas.txt', { type: 'text/plain' });
    fireEvent.change(screen.getByLabelText(/elegir foto de perfil/i), { target: { files: [archivo] } });

    expect(await screen.findByRole('alert')).toHaveTextContent(/jpg, png, webp o gif/i);
    expect(api.subirAvatarApi).not.toHaveBeenCalled();
  });

  it('rechaza una foto de mas de 5 MB', async () => {
    conSesion();
    renderizar();
    await screen.findByRole('heading', { name: 'Foto de perfil' });

    const pesada = new File([new Uint8Array(10)], 'grande.webp', { type: 'image/webp' });
    Object.defineProperty(pesada, 'size', { value: 6 * 1024 * 1024 });
    fireEvent.change(screen.getByLabelText(/elegir foto de perfil/i), { target: { files: [pesada] } });

    expect(await screen.findByRole('alert')).toHaveTextContent(/5 MB/);
    expect(api.subirAvatarApi).not.toHaveBeenCalled();
  });

  it('con foto se puede quitar', async () => {
    const usuario = userEvent.setup({ delay: null });
    conSesion({ ...ana, avatarUrl: 'http://localhost:4000/uploads/imagenes/vieja.webp' });
    renderizar();
    const seccion = (await screen.findByRole('heading', { name: 'Foto de perfil' })).closest(
      'section'
    ) as HTMLElement;

    await usuario.click(within(seccion).getByRole('button', { name: /quitar/i }));

    await waitFor(() => expect(api.quitarAvatarApi).toHaveBeenCalled());
    expect(within(seccion).getByText('AQ')).toBeInTheDocument();
  });
});
