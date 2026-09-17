import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModalAcceso from './ModalAcceso';
import AutenticacionProveedor from '@/features/autenticacion/contexto/AutenticacionProveedor';
import * as api from '@/features/autenticacion/servicios/autenticacion.api';
import { ErrorHttp } from '@/shared/utilidades/cliente-http';
import { borrarToken, leerToken } from '@/shared/utilidades/almacenamiento-sesion';
import type { Sesion } from '@/features/autenticacion/tipos/autenticacion.tipos';

// Las pruebas no hablan con el backend: se sustituye la capa de servicios
vi.mock('@/features/autenticacion/servicios/autenticacion.api');

type Usuario = ReturnType<typeof userEvent.setup>;

const sesionAdmin: Sesion = {
  token: 'token-de-prueba',
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

const onCerrar = vi.fn();

const renderizar = () =>
  render(
    <AutenticacionProveedor>
      <ModalAcceso abierto onCerrar={onCerrar} />
    </AutenticacionProveedor>
  );

const correo = () => screen.getByLabelText(/correo electr[oó]nico/i);
const contrasena = () => screen.getByLabelText(/^contrase[nñ]a$/i);
const botonEntrar = () => screen.getByRole('button', { name: /^iniciar sesi[oó]n$/i });

const escribirCredenciales = async (usuario: Usuario, email = 'Info@Hycon.lat', password = '123456') => {
  await usuario.type(correo(), email);
  await usuario.type(contrasena(), password);
};

describe('ModalAcceso', () => {
  beforeEach(() => {
    window.localStorage.clear();
    borrarToken();
    onCerrar.mockClear();
    vi.mocked(api.iniciarSesionApi).mockReset();
    vi.mocked(api.registrarApi).mockReset();
  });

  describe('presentacion', () => {
    it('no renderiza nada cuando esta cerrado', () => {
      render(
        <AutenticacionProveedor>
          <ModalAcceso abierto={false} onCerrar={onCerrar} />
        </AutenticacionProveedor>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('es un dialogo accesible con su titulo', () => {
      renderizar();

      expect(screen.getByRole('dialog', { name: /bienvenido de vuelta/i })).toHaveAttribute('aria-modal', 'true');
    });

    it('los campos ayudan al gestor de contrasenas del navegador', () => {
      renderizar();

      expect(correo()).toHaveAttribute('autocomplete', 'username');
      expect(contrasena()).toHaveAttribute('autocomplete', 'current-password');
      expect(contrasena()).toHaveAttribute('type', 'password');
    });

    it('cierra con Escape', async () => {
      const usuario = userEvent.setup();
      renderizar();

      await usuario.keyboard('{Escape}');

      expect(onCerrar).toHaveBeenCalled();
    });
  });

  describe('iniciar sesion', () => {
    it('valida antes de llamar al backend', async () => {
      const usuario = userEvent.setup();
      renderizar();

      await usuario.click(botonEntrar());

      expect(await screen.findByText(/el correo es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/la contrase[nñ]a es obligatoria/i)).toBeInTheDocument();
      expect(api.iniciarSesionApi).not.toHaveBeenCalled();
    });

    it('entra, guarda el token solo en memoria y cierra el modal', async () => {
      const usuario = userEvent.setup();
      vi.mocked(api.iniciarSesionApi).mockResolvedValue(sesionAdmin);
      renderizar();

      await escribirCredenciales(usuario);
      await usuario.click(botonEntrar());

      await waitFor(() => expect(onCerrar).toHaveBeenCalled());
      expect(api.iniciarSesionApi).toHaveBeenCalledWith({
        email: 'info@hycon.lat',
        password: '123456',
        recordar: false,
      });
      expect(leerToken()).toBe('token-de-prueba');
      // Nada sensible en localStorage: solo la marca de que hubo sesion
      expect(window.localStorage.getItem('hycon.token')).toBeNull();
      expect(window.localStorage.getItem('hycon.haySesion')).toBe('1');
    });

    it('Mantener la sesion iniciada viene desmarcado y se envia al marcarlo', async () => {
      const usuario = userEvent.setup();
      vi.mocked(api.iniciarSesionApi).mockResolvedValue(sesionAdmin);
      renderizar();

      const casilla = screen.getByRole('checkbox', { name: /mantener la sesi[oó]n iniciada/i });
      expect(casilla).not.toBeChecked();

      await escribirCredenciales(usuario);
      await usuario.click(casilla);
      await usuario.click(botonEntrar());

      await waitFor(() =>
        expect(api.iniciarSesionApi).toHaveBeenCalledWith(expect.objectContaining({ recordar: true }))
      );
    });

    it('muestra el error del backend y borra la contrasena escrita', async () => {
      const usuario = userEvent.setup();
      vi.mocked(api.iniciarSesionApi).mockRejectedValue(new ErrorHttp('Correo o contrasena incorrectos', 401));
      renderizar();

      await escribirCredenciales(usuario, 'info@hycon.lat', 'mala');
      await usuario.click(botonEntrar());

      expect(await screen.findByRole('alert')).toHaveTextContent(/correo o contrasena incorrectos/i);
      expect(contrasena()).toHaveValue('');
      expect(correo()).toHaveValue('info@hycon.lat');
      expect(onCerrar).not.toHaveBeenCalled();
      expect(leerToken()).toBeNull();
    });

    it('si el servidor bloquea el acceso muestra la cuenta atras y desactiva el boton', async () => {
      const usuario = userEvent.setup();
      vi.mocked(api.iniciarSesionApi).mockRejectedValue(new ErrorHttp('Demasiados intentos', 429, 840));
      renderizar();

      await escribirCredenciales(usuario, 'info@hycon.lat', 'mala');
      await usuario.click(botonEntrar());

      const aviso = await screen.findByRole('alert');
      expect(aviso).toHaveTextContent(/acceso bloqueado temporalmente/i);
      expect(aviso).toHaveTextContent('14:00');
      expect(botonEntrar()).toBeDisabled();
    });

    it('avisa cuando Bloq Mayus esta activado', () => {
      renderizar();

      fireEvent.keyDown(contrasena(), { key: 'A', modifierCapsLock: true });
      expect(screen.getByText(/bloq may[uú]s est[aá] activado/i)).toBeInTheDocument();

      fireEvent.keyDown(contrasena(), { key: 'a', modifierCapsLock: false });
      expect(screen.queryByText(/bloq may[uú]s/i)).not.toBeInTheDocument();
    });

    it('permite ver la contrasena escrita', async () => {
      const usuario = userEvent.setup();
      renderizar();

      await usuario.click(screen.getByRole('button', { name: /mostrar contrase[nñ]a/i }));

      expect(contrasena()).toHaveAttribute('type', 'text');
    });
  });

  describe('crear cuenta', () => {
    const irARegistro = async (usuario: Usuario) => {
      await usuario.click(screen.getByRole('tab', { name: /crear cuenta/i }));
      return screen.getByRole('heading', { name: /crea tu cuenta/i });
    };

    it('se llega por la pestana o por el enlace inferior', async () => {
      const usuario = userEvent.setup();
      renderizar();

      await usuario.click(screen.getByRole('button', { name: /cr[eé]ala aqu[ií]/i }));
      expect(screen.getByRole('heading', { name: /crea tu cuenta/i })).toBeInTheDocument();

      await usuario.click(screen.getByRole('button', { name: /inicia sesi[oó]n/i }));
      expect(screen.getByRole('heading', { name: /bienvenido de vuelta/i })).toBeInTheDocument();
    });

    it('marca los requisitos de la contrasena mientras se escribe', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await irARegistro(usuario);

      await usuario.type(screen.getByLabelText(/^apellido$/i), 'Quispe');
      const campo = screen.getByLabelText(/^contrase[nñ]a$/i);
      const requisitos = () => within(screen.getByRole('list', { name: /requisitos de la contrase[nñ]a/i }));

      await usuario.type(campo, 'quispe');
      expect(requisitos().getByText(/al menos 12 caracteres/i).parentElement).toHaveTextContent('pendiente');
      expect(requisitos().getByText(/no incluye tu nombre/i).parentElement).toHaveTextContent('pendiente');

      await usuario.clear(campo);
      await usuario.type(campo, 'montaña roja del misti');
      for (const texto of [/al menos 12/i, /no es una contrase[nñ]a com[uú]n/i, /no incluye tu nombre/i]) {
        expect(requisitos().getByText(texto).parentElement).toHaveTextContent('cumplido');
      }
      expect(screen.getByText('Muy segura')).toBeInTheDocument();
    });

    it('no envia una contrasena comun', async () => {
      const usuario = userEvent.setup();
      renderizar();
      await irARegistro(usuario);

      await usuario.type(screen.getByLabelText(/^nombre$/i), 'Ana');
      await usuario.type(screen.getByLabelText(/^apellido$/i), 'Quispe');
      await usuario.type(screen.getByLabelText(/correo electr[oó]nico/i), 'ana@hycon.com');
      await usuario.type(screen.getByLabelText(/^contrase[nñ]a$/i), 'password1234');
      await usuario.click(screen.getByRole('button', { name: /^crear cuenta$/i }));

      expect(await screen.findByText(/muy com[uú]n/i)).toBeInTheDocument();
      expect(api.registrarApi).not.toHaveBeenCalled();
    });

    it('registra con una contrasena valida y abre la sesion', async () => {
      const usuario = userEvent.setup();
      vi.mocked(api.registrarApi).mockResolvedValue({
        ...sesionAdmin,
        usuario: { ...sesionAdmin.usuario, rol: 'CLIENTE' },
      });
      renderizar();
      await irARegistro(usuario);

      await usuario.type(screen.getByLabelText(/^nombre$/i), 'Ana');
      await usuario.type(screen.getByLabelText(/^apellido$/i), 'Quispe');
      await usuario.type(screen.getByLabelText(/correo electr[oó]nico/i), 'Ana@Hycon.com');
      await usuario.type(screen.getByLabelText(/^contrase[nñ]a$/i), 'montaña roja del misti');
      await usuario.click(screen.getByRole('button', { name: /^crear cuenta$/i }));

      await waitFor(() => expect(onCerrar).toHaveBeenCalled());
      expect(api.registrarApi).toHaveBeenCalledWith({
        name: 'Ana',
        lastname: 'Quispe',
        email: 'ana@hycon.com',
        password: 'montaña roja del misti',
        phone: undefined,
        recordar: false,
      });
    });
  });
});
