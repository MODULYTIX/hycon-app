import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModalAcceso from './ModalAcceso';
import AutenticacionProveedor from '@/features/autenticacion/contexto/AutenticacionProveedor';
import * as api from '@/features/autenticacion/servicios/autenticacion.api';
import type { Sesion } from '@/features/autenticacion/tipos/autenticacion.tipos';

// Las pruebas no hablan con el backend: se sustituye la capa de servicios
vi.mock('@/features/autenticacion/servicios/autenticacion.api');

const sesionAdmin: Sesion = {
  token: 'token-de-prueba',
  usuario: {
    userId: 1,
    name: 'Esau',
    lastname: 'Morales',
    email: 'admin@hycon.com',
    phone: null,
    avatarUrl: null,
    roleId: 1,
    rol: 'ADMIN',
  },
};

const onCerrar = vi.fn();

const renderizar = () =>
  render(
    <AutenticacionProveedor>
      <ModalAcceso abierto onCerrar={onCerrar} />
    </AutenticacionProveedor>
  );

describe('ModalAcceso', () => {
  beforeEach(() => {
    window.localStorage.clear();
    onCerrar.mockClear();
    vi.mocked(api.iniciarSesionApi).mockReset();
    vi.mocked(api.obtenerPerfilApi).mockReset();
  });

  it('no renderiza nada cuando esta cerrado', () => {
    render(
      <AutenticacionProveedor>
        <ModalAcceso abierto={false} onCerrar={onCerrar} />
      </AutenticacionProveedor>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('se presenta como dialogo accesible con su titulo', () => {
    renderizar();

    const diálogo = screen.getByRole('dialog');
    expect(diálogo).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('heading', { name: /bienvenido de vuelta/i })).toBeInTheDocument();
  });

  it('valida el formulario antes de llamar al backend', async () => {
    const usuario = userEvent.setup();
    renderizar();

    await usuario.click(screen.getByRole('button', { name: /^iniciar sesion$/i }));

    expect(await screen.findByText(/el correo es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/la contrasena es obligatoria/i)).toBeInTheDocument();
    expect(api.iniciarSesionApi).not.toHaveBeenCalled();
  });

  it('marca el correo invalido sin enviar la peticion', async () => {
    const usuario = userEvent.setup();
    renderizar();

    await usuario.type(screen.getByLabelText(/correo electronico/i), 'no-es-correo');
    await usuario.type(screen.getByLabelText(/^contrasena$/i), 'Hycon2026');
    await usuario.click(screen.getByRole('button', { name: /^iniciar sesion$/i }));

    expect(await screen.findByText(/ingresa un correo valido/i)).toBeInTheDocument();
    expect(api.iniciarSesionApi).not.toHaveBeenCalled();
  });

  it('envia las credenciales, guarda el token y cierra el modal', async () => {
    const usuario = userEvent.setup();
    vi.mocked(api.iniciarSesionApi).mockResolvedValue(sesionAdmin);
    renderizar();

    await usuario.type(screen.getByLabelText(/correo electronico/i), 'Admin@Hycon.com');
    await usuario.type(screen.getByLabelText(/^contrasena$/i), 'Hycon2026');
    await usuario.click(screen.getByRole('button', { name: /^iniciar sesion$/i }));

    await waitFor(() => expect(onCerrar).toHaveBeenCalled());
    // El correo se normaliza antes de salir del navegador
    expect(api.iniciarSesionApi).toHaveBeenCalledWith({
      email: 'admin@hycon.com',
      password: 'Hycon2026',
    });
    expect(window.localStorage.getItem('hycon.token')).toBe('token-de-prueba');
  });

  it('muestra el mensaje de error que devuelve el backend', async () => {
    const usuario = userEvent.setup();
    vi.mocked(api.iniciarSesionApi).mockRejectedValue(
      new Error('Correo o contrasena incorrectos')
    );
    renderizar();

    await usuario.type(screen.getByLabelText(/correo electronico/i), 'admin@hycon.com');
    await usuario.type(screen.getByLabelText(/^contrasena$/i), 'mala');
    await usuario.click(screen.getByRole('button', { name: /^iniciar sesion$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/correo o contrasena incorrectos/i);
    expect(onCerrar).not.toHaveBeenCalled();
    expect(window.localStorage.getItem('hycon.token')).toBeNull();
  });

  it('alterna entre iniciar sesion y crear cuenta', async () => {
    const usuario = userEvent.setup();
    renderizar();

    await usuario.click(screen.getByRole('tab', { name: /crear cuenta/i }));

    expect(screen.getByRole('heading', { name: /crea tu cuenta/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
  });

  it('permite ver la contrasena escrita', async () => {
    const usuario = userEvent.setup();
    renderizar();

    const campo = screen.getByLabelText(/^contrasena$/i);
    expect(campo).toHaveAttribute('type', 'password');

    await usuario.click(screen.getByRole('button', { name: /mostrar contrasena/i }));

    expect(campo).toHaveAttribute('type', 'text');
  });

  it('cierra con la tecla Escape', async () => {
    const usuario = userEvent.setup();
    renderizar();

    await usuario.keyboard('{Escape}');

    expect(onCerrar).toHaveBeenCalled();
  });
});
