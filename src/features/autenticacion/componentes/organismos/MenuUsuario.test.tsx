import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MenuUsuario from './MenuUsuario';
import { AutenticacionContexto } from '@/features/autenticacion/contexto/AutenticacionContexto';
import type { Usuario } from '@/features/autenticacion/tipos/autenticacion.tipos';

const crearUsuario = (rol: string): Usuario => ({
  userId: 1,
  name: 'Esau',
  lastname: 'Morales',
  email: 'admin@hycon.com',
  phone: null,
  avatarUrl: null,
  roleId: 1,
  rol,
});

const cerrarSesion = vi.fn();

const renderizar = (rol: string) => {
  const usuario = crearUsuario(rol);
  return render(
    <AutenticacionContexto.Provider
      value={{
        usuario,
        cargando: false,
        autenticado: true,
        iniciarSesion: vi.fn(),
        registrar: vi.fn(),
        cerrarSesion,
      }}
    >
      <MenuUsuario usuario={usuario} />
    </AutenticacionContexto.Provider>
  );
};

describe('MenuUsuario', () => {
  beforeEach(() => {
    cerrarSesion.mockClear();
  });

  it('empieza cerrado y se abre al pulsar el perfil', async () => {
    const usuario = userEvent.setup();
    renderizar('CLIENTE');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { expanded: false }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('muestra el panel de configuracion cuando el rol es ADMIN', async () => {
    const usuario = userEvent.setup();
    renderizar('ADMIN');

    await usuario.click(screen.getByRole('button', { expanded: false }));

    expect(screen.getByRole('menuitem', { name: /panel de configuracion/i })).toBeInTheDocument();
  });

  it('oculta el panel de configuracion a un CLIENTE', async () => {
    const usuario = userEvent.setup();
    renderizar('CLIENTE');

    await usuario.click(screen.getByRole('button', { expanded: false }));

    expect(screen.queryByRole('menuitem', { name: /panel de configuracion/i })).not.toBeInTheDocument();
    // El resto de opciones si estan disponibles
    expect(screen.getByRole('menuitem', { name: /historial de compras/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /panel de cursos/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /software de ergonomico/i })).toBeInTheDocument();
  });

  it('las opciones son enlaces con destino', async () => {
    const usuario = userEvent.setup();
    renderizar('ADMIN');

    await usuario.click(screen.getByRole('button', { expanded: false }));

    const enlace = screen.getByRole('menuitem', { name: /panel de configuracion/i });
    expect(enlace).toHaveAttribute('href', '/panel-de-configuracion');
  });

  it('cierra la sesion al pulsar Cerrar sesion', async () => {
    const usuario = userEvent.setup();
    renderizar('ADMIN');

    await usuario.click(screen.getByRole('button', { expanded: false }));
    await usuario.click(screen.getByRole('menuitem', { name: /cerrar sesion/i }));

    expect(cerrarSesion).toHaveBeenCalledTimes(1);
  });

  it('se cierra al pulsar Escape', async () => {
    const usuario = userEvent.setup();
    renderizar('ADMIN');

    await usuario.click(screen.getByRole('button', { expanded: false }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await usuario.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
