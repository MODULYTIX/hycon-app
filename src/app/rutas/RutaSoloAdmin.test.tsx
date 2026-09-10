import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RutaSoloAdmin from './RutaSoloAdmin';
import { AutenticacionContexto } from '@/features/autenticacion/contexto/AutenticacionContexto';
import type { Usuario } from '@/features/autenticacion/tipos/autenticacion.tipos';

const crearUsuario = (rol: string): Usuario => ({
  userId: 4,
  name: 'Esau',
  lastname: 'Morales',
  email: 'info@hycon.lat',
  phone: null,
  avatarUrl: null,
  roleId: 1,
  rol,
});

const renderizar = (usuario: Usuario | null, cargando = false) =>
  render(
    <AutenticacionContexto.Provider
      value={{
        usuario,
        cargando,
        autenticado: usuario !== null,
        iniciarSesion: vi.fn(),
        registrar: vi.fn(),
        cerrarSesion: vi.fn(),
      }}
    >
      <MemoryRouter initialEntries={['/panel-de-configuracion/productos']}>
        <Routes>
          <Route path="/" element={<p>Landing publica</p>} />
          <Route
            path="/panel-de-configuracion/productos"
            element={
              <RutaSoloAdmin>
                <p>Contenido del panel</p>
              </RutaSoloAdmin>
            }
          />
        </Routes>
      </MemoryRouter>
    </AutenticacionContexto.Provider>
  );

describe('RutaSoloAdmin', () => {
  it('deja pasar al rol ADMIN', () => {
    renderizar(crearUsuario('ADMIN'));

    expect(screen.getByText('Contenido del panel')).toBeInTheDocument();
  });

  it('manda a la landing a un CLIENTE', () => {
    renderizar(crearUsuario('CLIENTE'));

    expect(screen.queryByText('Contenido del panel')).not.toBeInTheDocument();
    expect(screen.getByText('Landing publica')).toBeInTheDocument();
  });

  it('manda a la landing a un rol desconocido', () => {
    // Un rol nuevo en la base no debe heredar acceso al panel
    renderizar(crearUsuario('SOPORTE'));

    expect(screen.getByText('Landing publica')).toBeInTheDocument();
  });

  it('manda a la landing a quien no tiene sesion', () => {
    renderizar(null);

    expect(screen.getByText('Landing publica')).toBeInTheDocument();
  });

  it('espera sin decidir mientras se restaura la sesion', () => {
    // Sin esto, recargar el panel con sesion valida expulsaria al usuario
    renderizar(null, true);

    expect(screen.getByRole('status')).toHaveTextContent(/verificando tu sesion/i);
    expect(screen.queryByText('Landing publica')).not.toBeInTheDocument();
    expect(screen.queryByText('Contenido del panel')).not.toBeInTheDocument();
  });
});
