import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PaginaCursos from './PaginaCursos';
import PaginaDetalleCurso from './PaginaDetalleCurso';
import * as api from '@/features/cursos/servicios/cursos.api';
import * as youtubeApi from '@/shared/servicios/youtube-api';
import { crearYoutubeFalso, type JugadorFalso } from '@/pruebas/youtube-falso';
import { agregarAlCarrito, leerCarrito } from '@/features/carrito/servicios/carrito.almacen';
import AutenticacionProveedor from '@/features/autenticacion/contexto/AutenticacionProveedor';
import * as leccionesApi from '@/features/cursos/servicios/lecciones.api';
import * as autenticacionApi from '@/features/autenticacion/servicios/autenticacion.api';
import { marcarSesionActiva } from '@/shared/utilidades/almacenamiento-sesion';
import type { Sesion } from '@/features/autenticacion/tipos/autenticacion.tipos';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

// Los catalogos se direccionan por uuid: el correlativo no sale del backend
const UUID_2 = '00000002-0000-4000-8000-000000000000';
const UUID_7 = '00000007-0000-4000-8000-000000000000';

vi.mock('@/features/cursos/servicios/cursos.api');
vi.mock('@/shared/servicios/youtube-api');
vi.mock('@/features/cursos/servicios/lecciones.api');
vi.mock('@/features/autenticacion/servicios/autenticacion.api');

let jugadores: JugadorFalso[];

const curso: Curso = {
  uuid: UUID_7,
  name: 'Curso completo de Claude Code',
  description: 'Aprende a crear aplicaciones.\n\nDesarrolla un proyecto paso a paso.',
  thumbnailUrl: 'https://example.com/curso.jpg',
  youtubeId: null,
  videoUrl: 'https://example.com/avance.mp4',
  durationMinutes: 150,
  partes: 0,
  previewSegundos: 60,
  price: 150,
  discountPrice: 120,
  status: 'active',
  createdAt: '2026-09-17T12:00:00.000Z',
};

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

// Sesion abierta y con este curso ya comprado
const temario = (tieneAcceso: boolean) => ({
  cursoUuid: UUID_7,
  tieneAcceso,
  previewSegundos: 60,
  lecciones: [],
});

const conAcceso = () => {
  marcarSesionActiva(true);
  vi.mocked(autenticacionApi.restaurarSesionApi).mockResolvedValue(sesion);
  vi.mocked(leccionesApi.obtenerTemarioApi).mockResolvedValue(temario(true));
};

const renderizar = (ruta = `/cursos/${UUID_7}`) => render(
  <AutenticacionProveedor>
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/cursos" element={<PaginaCursos />} />
        <Route path="/cursos/:uuid" element={<PaginaDetalleCurso />} />
      </Routes>
    </MemoryRouter>
  </AutenticacionProveedor>
);

describe('detalle del curso', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    // Por defecto: visitante sin sesion, nadie tiene el curso comprado
    vi.mocked(autenticacionApi.restaurarSesionApi).mockRejectedValue(new Error('sin sesion'));
    vi.mocked(leccionesApi.obtenerTemarioApi).mockResolvedValue(temario(false));
    vi.mocked(api.listarCursosApi).mockResolvedValue({
      elementos: [curso],
      paginacion: { pagina: 1, porPagina: 6, total: 1, totalPaginas: 1 },
    });
    vi.mocked(api.obtenerCursoApi).mockResolvedValue(curso);
    const falso = crearYoutubeFalso();
    jugadores = falso.jugadores;
    vi.mocked(youtubeApi.cargarApiYoutube).mockResolvedValue(falso.api);
  });

  it('abre el detalle desde una tarjeta y muestra los datos, avance y consulta del curso', async () => {
    const usuario = userEvent.setup();
    renderizar('/cursos');
    await usuario.click(await screen.findByRole('link', { name: `Ver detalles de ${curso.name}` }));

    expect(await screen.findByRole('heading', { level: 1, name: curso.name })).toBeInTheDocument();
    expect(api.obtenerCursoApi).toHaveBeenCalledWith(UUID_7, expect.anything());
    // La duracion aparece en la cabecera y en la ficha lateral
    expect(screen.getAllByText('2 h 30 min').length).toBeGreaterThan(0);
    expect(screen.getByText('Aprende a crear aplicaciones.')).toBeInTheDocument();
    expect(screen.getByText(/120\.00/)).toBeInTheDocument();
    const consulta = screen.getByRole('link', { name: /escríbenos/i }).getAttribute('href')!;
    expect(new URL(consulta).searchParams.get('text')).toContain(curso.name);
  });

  it('el avance se reproduce dentro de la pagina, sin salir a YouTube', async () => {
    const conVideo = {
      ...curso,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=2m',
      youtubeId: 'dQw4w9WgXcQ',
    };
    vi.mocked(api.obtenerCursoApi).mockResolvedValue(conVideo);
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByRole('heading', { level: 1, name: curso.name });

    // Hasta pulsar el avance no se carga ningun reproductor
    expect(youtubeApi.cargarApiYoutube).not.toHaveBeenCalled();

    await usuario.click(screen.getByRole('button', { name: 'Ver avance del curso' }));

    const reproductor = await screen.findByRole('region', { name: `Reproductor: ${curso.name}` });
    await waitFor(() => expect(jugadores).toHaveLength(1));
    expect(jugadores[0].opciones.videoId).toBe('dQw4w9WgXcQ');
    // Respeta el minuto del enlace y esconde los controles de YouTube
    expect(jugadores[0].opciones.playerVars).toMatchObject({ start: 120, controls: 0 });
    expect(within(reproductor).queryByRole('link')).not.toBeInTheDocument();
    expect(within(reproductor).getByRole('button', { name: /adelantar 10 segundos/i })).toBeInTheDocument();
  });

  it('sin miniatura propia usa la del video de YouTube como portada', async () => {
    vi.mocked(api.obtenerCursoApi).mockResolvedValue({ ...curso, thumbnailUrl: null, youtubeId: 'dQw4w9WgXcQ' });
    renderizar();

    expect(await screen.findByAltText(`Portada de ${curso.name}`)).toHaveAttribute(
      'src',
      'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
    );
  });

  it('agrega una sola inscripcion al carrito y conserva lo que ya habia', async () => {
    agregarAlCarrito({ tipo: 'producto', uuid: UUID_2, cantidad: 2 }, 5);
    const usuario = userEvent.setup({ delay: null });
    renderizar();
    const boton = await screen.findByRole('button', { name: 'Agregar al carrito' });

    await usuario.click(boton);
    expect(screen.getByRole('status')).toHaveTextContent('Curso agregado al carrito.');
    expect(screen.getByRole('link', { name: 'Ver carrito' })).toHaveAttribute('href', '/carrito');

    // Un curso es una sola inscripcion: repetirlo no suma otra linea
    await usuario.click(boton);
    expect(screen.getByRole('status')).toHaveTextContent('Este curso ya está en tu carrito.');
    expect(leerCarrito()).toEqual([
      { tipo: 'producto', uuid: UUID_2, cantidad: 2 },
      { tipo: 'curso', uuid: UUID_7, cantidad: 1 },
    ]);
  });

  it('muestra alternativas si faltan portada, duracion, descripcion o avance', async () => {
    vi.mocked(api.obtenerCursoApi).mockResolvedValue({ ...curso, thumbnailUrl: null, durationMinutes: null, videoUrl: null, description: null, discountPrice: 0 });
    renderizar();
    await screen.findByRole('heading', { name: curso.name });
    expect(screen.getByText('Formación Hycon')).toBeInTheDocument();
    expect(screen.getByText('Por confirmar')).toBeInTheDocument();
    expect(screen.getByText(/^S\/\s*0\.00$/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ver avance del curso' })).not.toBeInTheDocument();
    expect(screen.getByText(/consulta con nuestro equipo para conocer el contenido/i)).toBeInTheDocument();
  });

  it('muestra el estado no disponible cuando falla la consulta', async () => {
    vi.mocked(api.obtenerCursoApi).mockRejectedValue(new Error('Curso no encontrado'));
    renderizar();
    expect(await screen.findByRole('alert')).toHaveTextContent('Curso no encontrado');
    expect(screen.getByRole('link', { name: 'Volver a cursos' })).toHaveAttribute('href', '/cursos');
  });

  it('rechaza IDs invalidos sin consultar la API', async () => {
    renderizar('/cursos/invalido');
    expect(await screen.findByRole('alert')).toHaveTextContent('Este curso no existe.');
    expect(api.obtenerCursoApi).not.toHaveBeenCalled();
  });
});


describe('detalle de un curso ya comprado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    vi.mocked(api.obtenerCursoApi).mockResolvedValue(curso);
    conAcceso();
  });

  it('al recargar espera la sesión antes de consultar el acceso comprado', async () => {
    let restaurar!: (valor: Sesion) => void;
    let cargarTemario!: (valor: ReturnType<typeof temario>) => void;
    vi.mocked(autenticacionApi.restaurarSesionApi).mockReturnValue(new Promise((resolve) => { restaurar = resolve; }));
    vi.mocked(leccionesApi.obtenerTemarioApi).mockReturnValue(new Promise((resolve) => { cargarTemario = resolve; }));
    renderizar();
    expect(screen.getByRole('status', { name: 'Cargando curso' })).toBeInTheDocument();
    expect(leccionesApi.obtenerTemarioApi).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Agregar al carrito' })).not.toBeInTheDocument();
    await act(async () => { restaurar(sesion); });
    await waitFor(() => expect(leccionesApi.obtenerTemarioApi).toHaveBeenCalledWith(UUID_7, expect.any(AbortSignal)));
    expect(screen.queryByRole('button', { name: 'Agregar al carrito' })).not.toBeInTheDocument();
    await act(async () => { cargarTemario(temario(true)); });
    expect(await screen.findByText('Acceso activo')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Agregar al carrito' })).not.toBeInTheDocument();
  });

  it('si falla la comprobación de acceso no invita a comprar de nuevo', async () => {
    vi.mocked(leccionesApi.obtenerTemarioApi).mockRejectedValue(new Error('sin conexión'));
    renderizar();
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos comprobar tu acceso');
    expect(screen.queryByRole('button', { name: 'Agregar al carrito' })).not.toBeInTheDocument();
  });

  it('deja de ofrecer la compra y avisa de que ya es suyo', async () => {
    renderizar();
    await screen.findByRole('heading', { level: 1, name: curso.name });

    expect(await screen.findByText('Acceso activo')).toBeInTheDocument();
    expect(screen.getByText(/ya compraste este curso/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Agregar al carrito' })).not.toBeInTheDocument();
    // Tampoco se ve el precio
    expect(screen.queryByText(/120\.00/)).not.toBeInTheDocument();
  });

  it('ofrece entrar a mis cursos', async () => {
    renderizar();
    await screen.findByRole('heading', { level: 1, name: curso.name });

    expect(await screen.findByRole('link', { name: 'Mis cursos' })).toHaveAttribute(
      'href',
      '/panel-de-cursos'
    );
  });

  // Quien ya compro no ve el avance: entra al aula, que es donde esta el curso
  it('lleva al aula en lugar de ofrecer el avance', async () => {
    vi.mocked(api.obtenerCursoApi).mockResolvedValue({
      ...curso,
      youtubeId: 'dQw4w9WgXcQ',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    });
    renderizar();
    await screen.findByRole('heading', { level: 1, name: curso.name });

    expect(await screen.findByRole('link', { name: 'Ver el curso' })).toHaveAttribute(
      'href',
      `/cursos/${UUID_7}/aula`
    );
    expect(screen.getByRole('link', { name: /entrar al curso/i })).toHaveAttribute(
      'href',
      `/cursos/${UUID_7}/aula`
    );
    expect(screen.queryByRole('button', { name: 'Ver avance del curso' })).not.toBeInTheDocument();
  });

  it('sin sesion la ficha sigue vendiendo', async () => {
    window.localStorage.clear();
    vi.mocked(autenticacionApi.restaurarSesionApi).mockRejectedValue(new Error('sin sesion'));
    vi.mocked(leccionesApi.obtenerTemarioApi).mockResolvedValue(temario(false));
    renderizar();
    await screen.findByRole('heading', { level: 1, name: curso.name });

    expect(await screen.findByRole('button', { name: 'Agregar al carrito' })).toBeInTheDocument();
    expect(screen.queryByText('Acceso activo')).not.toBeInTheDocument();
  });
});

// Lecciones alojadas por nosotros: el backend manda un enlace firmado y el tipo
const URL_FIRMADA = 'https://bucket.r2.cloudflarestorage.com/hycon/cursos/parte-1.mp4?X-Amz-Signature=abc';

const temarioPropio = (tieneAcceso: boolean) => ({
  cursoUuid: UUID_7,
  tieneAcceso,
  previewSegundos: 60,
  lecciones: [
    {
      uuid: '01a0fef2-0000-70bf-a4e4-000000000001',
      titulo: 'Qué es la ergonomía',
      descripcion: null,
      duracionMinutos: 8,
      posicion: 1,
      esMuestra: true,
      bloqueada: false,
      tipoVideo: 'archivo' as const,
      videoUrl: URL_FIRMADA,
      youtubeId: null,
      limiteSegundos: tieneAcceso ? null : 60,
    },
    {
      uuid: '01a0fef2-0000-70bf-a4e4-000000000002',
      titulo: 'Evaluación de puestos',
      descripcion: null,
      duracionMinutos: 12,
      posicion: 2,
      esMuestra: false,
      bloqueada: !tieneAcceso,
      tipoVideo: tieneAcceso ? ('archivo' as const) : null,
      videoUrl: tieneAcceso ? URL_FIRMADA : null,
      youtubeId: null,
      limiteSegundos: null,
    },
  ],
});

const reproductorPropio = (titulo: string) =>
  screen.getByLabelText(`Reproductor: ${titulo}`) as HTMLVideoElement;

// La muestra se ofrece en dos sitios: sobre la portada y en la ficha lateral
const verLaMuestra = async () =>
  (await screen.findAllByRole('button', { name: /ver la muestra gratis/i }))[0];

describe('curso con el video alojado por nosotros', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    vi.mocked(autenticacionApi.restaurarSesionApi).mockRejectedValue(new Error('sin sesion'));
    vi.mocked(api.obtenerCursoApi).mockResolvedValue(curso);
    vi.mocked(leccionesApi.obtenerTemarioApi).mockResolvedValue(temarioPropio(false));
    const falso = crearYoutubeFalso();
    jugadores = falso.jugadores;
    vi.mocked(youtubeApi.cargarApiYoutube).mockResolvedValue(falso.api);
  });

  it('la muestra se ve con nuestro reproductor y sin pasar por YouTube', async () => {
    const usuario = userEvent.setup();
    renderizar();

    await usuario.click(await verLaMuestra());

    expect(reproductorPropio('Qué es la ergonomía')).toHaveAttribute('src', URL_FIRMADA);
    expect(jugadores).toHaveLength(0);
  });

  it('la parte elegida queda marcada en el temario', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await verLaMuestra();

    await usuario.click(screen.getByRole('button', { name: /qué es la ergonomía/i }));

    expect(screen.getByRole('button', { name: /qué es la ergonomía/i })).toHaveAttribute(
      'aria-current',
      'true'
    );
  });

  it('lo que no se ha comprado no se puede abrir', async () => {
    renderizar();
    await verLaMuestra();

    expect(screen.getByRole('button', { name: /evaluación de puestos/i })).toBeDisabled();
  });

  it('al acabarse la muestra invita a comprar', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await usuario.click(await verLaMuestra());

    const video = reproductorPropio('Qué es la ergonomía');
    video.pause = vi.fn();
    Object.defineProperty(video, 'currentTime', { value: 61, writable: true, configurable: true });
    fireEvent.timeUpdate(video);

    expect(await screen.findByText(/terminó la vista previa/i)).toBeInTheDocument();
    const aviso = screen.getByText(/terminó la vista previa/i).parentElement as HTMLElement;
    expect(within(aviso).getByRole('button', { name: /agregar al carrito/i })).toBeInTheDocument();
  });

  it('quien compro el curso ve las partes completas y sin corte', async () => {
    const usuario = userEvent.setup();
    conAcceso();
    vi.mocked(leccionesApi.obtenerTemarioApi).mockResolvedValue(temarioPropio(true));
    renderizar();

    await usuario.click(await screen.findByRole('button', { name: /evaluación de puestos/i }));

    const video = reproductorPropio('Evaluación de puestos');
    video.pause = vi.fn();
    Object.defineProperty(video, 'currentTime', { value: 600, writable: true, configurable: true });
    fireEvent.timeUpdate(video);

    expect(screen.queryByText(/terminó la vista previa/i)).not.toBeInTheDocument();
    expect(video.pause).not.toHaveBeenCalled();
  });
});

describe('partes sin video que reproducir', () => {
  // Pasa cuando el almacen de videos no responde: el backend manda la parte sin enlace
  const temarioSinVideo = () => ({
    cursoUuid: UUID_7,
    tieneAcceso: false,
    previewSegundos: 5,
    lecciones: [
      {
        uuid: '01a0fef2-0000-70bf-a4e4-000000000001',
        titulo: 'Qué es la ergonomía',
        descripcion: null,
        duracionMinutos: 1,
        posicion: 1,
        esMuestra: true,
        bloqueada: false,
        tipoVideo: null,
        videoUrl: null,
        youtubeId: null,
        limiteSegundos: 5,
      },
    ],
  });

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    vi.mocked(autenticacionApi.restaurarSesionApi).mockRejectedValue(new Error('sin sesion'));
    vi.mocked(api.obtenerCursoApi).mockResolvedValue({ ...curso, youtubeId: null, videoUrl: null });
    vi.mocked(leccionesApi.obtenerTemarioApi).mockResolvedValue(temarioSinVideo());
    const falso = crearYoutubeFalso();
    jugadores = falso.jugadores;
    vi.mocked(youtubeApi.cargarApiYoutube).mockResolvedValue(falso.api);
  });

  it('no ofrece una muestra que no se puede reproducir', async () => {
    renderizar();
    await screen.findByRole('heading', { level: 1, name: curso.name });

    expect(screen.queryByRole('button', { name: /ver la muestra gratis/i })).not.toBeInTheDocument();
  });

  it('la parte aparece marcada como sin video y no se puede abrir', async () => {
    renderizar();
    await screen.findByRole('heading', { level: 1, name: curso.name });

    const parte = screen.getByRole('button', { name: /qué es la ergonomía/i });
    expect(parte).toBeDisabled();
    expect(within(parte).getByText('Sin video')).toBeInTheDocument();
  });
});
