import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PaginaCertificado from './PaginaCertificado';
import AutenticacionProveedor from '@/features/autenticacion/contexto/AutenticacionProveedor';
import * as api from '@/features/aprendizaje/servicios/aprendizaje.api';
import * as autenticacionApi from '@/features/autenticacion/servicios/autenticacion.api';
import { marcarSesionActiva } from '@/shared/utilidades/almacenamiento-sesion';
import type { Sesion } from '@/features/autenticacion/tipos/autenticacion.tipos';
import type { ProgresoCurso } from '@/features/aprendizaje/tipos/aprendizaje.tipos';

vi.mock('@/features/aprendizaje/servicios/aprendizaje.api');
vi.mock('@/features/autenticacion/servicios/autenticacion.api');

const UUID = '00000007-0000-4000-8000-000000000000';

const sesion: Sesion = {
  token: 'token-de-prueba',
  expiraEn: 900,
  usuario: {
    userId: 7,
    name: 'Ana',
    lastname: 'Quispe',
    email: 'ana@hycon.com',
    phone: null,
    avatarUrl: null,
    roleId: 2,
    rol: 'CLIENTE',
  },
};

const certificado = {
  codigo: 'HY-ABCD1234',
  nombre: 'Ana Quispe Flores',
  curso: 'Mejora continua en operaciones',
  duracionMinutos: 33,
  emitidoEl: '2026-11-04T12:00:00.000Z',
};

const progreso = (cambios: Partial<ProgresoCurso> = {}): ProgresoCurso => ({
  cursoUuid: UUID,
  curso: 'Mejora continua en operaciones',
  partes: [],
  vistas: 3,
  total: 3,
  completado: true,
  certificado: null,
  ...cambios,
});

const renderizar = () =>
  render(
    <AutenticacionProveedor>
      <MemoryRouter initialEntries={[`/cursos/${UUID}/certificado`]}>
        <Routes>
          <Route path="/cursos/:uuid" element={<p>Ficha del curso</p>} />
          <Route path="/cursos/:uuid/certificado" element={<PaginaCertificado />} />
        </Routes>
      </MemoryRouter>
    </AutenticacionProveedor>
  );

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  marcarSesionActiva(true);
  vi.mocked(autenticacionApi.restaurarSesionApi).mockResolvedValue(sesion);
  vi.mocked(api.obtenerProgresoApi).mockResolvedValue(progreso());
  vi.mocked(api.emitirCertificadoApi).mockResolvedValue(certificado);
});

describe('confirmar el nombre del certificado', () => {
  it('propone el nombre de la cuenta pero deja corregirlo', async () => {
    renderizar();

    expect(await screen.findByLabelText(/nombre completo/i)).toHaveValue('Ana Quispe');
  });

  // Lo que el usuario pidio: se avisa de que es una sola vez
  it('avisa de que el certificado se emite una sola vez', async () => {
    renderizar();

    // Lo dice el texto de arriba y tambien la casilla de confirmacion
    expect((await screen.findAllByText(/se emite una sola vez/i)).length).toBeGreaterThan(0);
  });

  it('no deja emitir sin confirmar la casilla', async () => {
    renderizar();
    await screen.findByLabelText(/nombre completo/i);

    expect(screen.getByRole('button', { name: /emitir mi certificado/i })).toBeDisabled();
    expect(api.emitirCertificadoApi).not.toHaveBeenCalled();
  });

  it('emite con el nombre confirmado y muestra el certificado', async () => {
    const usuario = userEvent.setup();
    renderizar();
    const campo = await screen.findByLabelText(/nombre completo/i);

    await usuario.clear(campo);
    await usuario.type(campo, 'Ana Quispe Flores');
    await usuario.click(screen.getByRole('checkbox'));
    await usuario.click(screen.getByRole('button', { name: /emitir mi certificado/i }));

    await waitFor(() =>
      expect(api.emitirCertificadoApi).toHaveBeenCalledWith(UUID, 'Ana Quispe Flores')
    );
    const lamina = within(await screen.findByRole('article', { name: /certificado HY-ABCD1234/i }));
    expect(lamina.getByText('Ana Quispe Flores')).toBeInTheDocument();
  });

  it('rechaza un nombre que no es un nombre antes de llamar al servidor', async () => {
    const usuario = userEvent.setup();
    renderizar();
    const campo = await screen.findByLabelText(/nombre completo/i);

    await usuario.clear(campo);
    await usuario.type(campo, '<script>');
    await usuario.click(screen.getByRole('checkbox'));
    await usuario.click(screen.getByRole('button', { name: /emitir mi certificado/i }));

    expect(await screen.findByText(/solo admite letras/i)).toBeInTheDocument();
    expect(api.emitirCertificadoApi).not.toHaveBeenCalled();
  });

  it('muestra el motivo si el servidor lo rechaza', async () => {
    const usuario = userEvent.setup();
    vi.mocked(api.emitirCertificadoApi).mockRejectedValue(
      new Error('Ya tienes el certificado de este curso')
    );
    renderizar();
    await screen.findByLabelText(/nombre completo/i);

    await usuario.click(screen.getByRole('checkbox'));
    await usuario.click(screen.getByRole('button', { name: /emitir mi certificado/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/ya tienes el certificado/i);
  });
});

describe('certificado ya emitido', () => {
  beforeEach(() => {
    vi.mocked(api.obtenerProgresoApi).mockResolvedValue(progreso({ certificado }));
  });

  it('se ve en la pagina con el nombre, el curso y el codigo', async () => {
    renderizar();

    const lamina = within(await screen.findByRole('article', { name: /certificado HY-ABCD1234/i }));
    expect(lamina.getByText('Ana Quispe Flores')).toBeInTheDocument();
    expect(lamina.getByText('Mejora continua en operaciones')).toBeInTheDocument();
    expect(lamina.getByText('HY-ABCD1234')).toBeInTheDocument();
    expect(lamina.getByText(/04\/11\/2026/)).toBeInTheDocument();
  });

  it('ya no vuelve a pedir el nombre', async () => {
    renderizar();
    await screen.findByRole('article', { name: /certificado/i });

    expect(screen.queryByLabelText(/nombre completo/i)).not.toBeInTheDocument();
  });

  it('se puede descargar', async () => {
    const usuario = userEvent.setup();
    const imprimir = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    renderizar();
    await screen.findByRole('article', { name: /certificado/i });

    await usuario.click(screen.getByRole('button', { name: /descargar/i }));

    expect(imprimir).toHaveBeenCalled();
  });
});

describe('cuando todavia no corresponde', () => {
  it('sin terminar el curso dice cuanto falta y lleva al aula', async () => {
    vi.mocked(api.obtenerProgresoApi).mockResolvedValue(
      progreso({ vistas: 1, total: 3, completado: false })
    );
    renderizar();

    expect(await screen.findByText(/te faltan 2 partes/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /seguir el curso/i })).toHaveAttribute(
      'href',
      `/cursos/${UUID}/aula`
    );
  });

  it('un curso sin partes lo explica en vez de prometer un certificado', async () => {
    vi.mocked(api.obtenerProgresoApi).mockResolvedValue(
      progreso({ vistas: 0, total: 0, completado: false })
    );
    renderizar();

    expect(await screen.findByText(/todavía no tiene partes/i)).toBeInTheDocument();
  });

  it('sin sesion vuelve a la ficha del curso', async () => {
    window.localStorage.clear();
    vi.mocked(autenticacionApi.restaurarSesionApi).mockRejectedValue(new Error('sin sesion'));
    renderizar();

    expect(await screen.findByText('Ficha del curso')).toBeInTheDocument();
    expect(api.obtenerProgresoApi).not.toHaveBeenCalled();
  });

  it('si el curso no es tuyo lo explica y deja volver', async () => {
    vi.mocked(api.obtenerProgresoApi).mockRejectedValue(
      new Error('Este curso no esta en tu cuenta')
    );
    renderizar();

    expect(await screen.findByRole('alert')).toHaveTextContent(/no esta en tu cuenta/i);
    expect(screen.getByRole('link', { name: /volver a mis cursos/i })).toHaveAttribute(
      'href',
      '/panel-de-cursos'
    );
  });
});
