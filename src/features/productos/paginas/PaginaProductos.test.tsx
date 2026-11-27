import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PaginaProductos from './PaginaProductos';
import * as api from '@/features/productos/servicios/productos.api';
import type { Producto } from '@/features/productos/tipos/producto.tipos';

// Los catalogos se direccionan por uuid: el correlativo no sale del backend
const UUID_1 = '00000001-0000-4000-8000-000000000000';
const UUID_2 = '00000002-0000-4000-8000-000000000000';

vi.mock('@/features/productos/servicios/productos.api');

const enOferta: Producto = {
  uuid: UUID_1,
  name: 'Silla ergonomica Pro',
  description: 'Soporte lumbar regulable',
  brand: 'Hycon',
  model: 'SE-200',
  color: 'Negro',
  price: 25.9,
  discountPrice: 19.9,
  stock: 12,
  shippingAgencies: [
    { code: 'shalom', name: 'Shalom' },
    { code: 'olva', name: 'Olva Courier' },
  ],
  status: 'active',
  imageUrl: null,
  createdAt: '2026-09-10T12:00:00.000Z',
};

const agotado: Producto = {
  ...enOferta,
  uuid: UUID_2,
  name: 'Reposapies',
  description: null,
  brand: null,
  model: null,
  color: null,
  discountPrice: null,
  stock: 0,
  shippingAgencies: [],
};

const pagina = (elementos: Producto[], extra = {}) => ({
  elementos,
  paginacion: { pagina: 1, porPagina: 6, total: elementos.length, totalPaginas: 1, ...extra },
});

const renderizar = (ruta = '/productos') =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <PaginaProductos />
    </MemoryRouter>
  );

const rejilla = () => screen.findByRole('list', { name: /catalogo de productos/i });

describe('PaginaProductos (publica)', () => {
  beforeEach(() => {
    vi.mocked(api.listarAtributosProductosApi).mockResolvedValue({ marca: [], modelo: [], color: [] });
    vi.mocked(api.listarProductosApi).mockResolvedValue(pagina([enOferta, agotado]));
  });

  it('pide al backend solo los productos activos de la primera pagina', async () => {
    renderizar();
    await screen.findByText('Silla ergonomica Pro');

    expect(api.listarProductosApi).toHaveBeenCalledWith('active', 1, expect.anything(), 12, {});
  });

  it('abre una búsqueda de producto desde el home', async () => {
    renderizar('/productos?buscar=silla');
    await screen.findByText('Silla ergonomica Pro');

    expect(api.listarProductosApi).toHaveBeenCalledWith('active', 1, expect.anything(), 12, { buscar: 'silla' });
    expect(screen.getByRole('textbox', { name: /buscar/i })).toHaveValue('silla');
    expect(screen.getByRole('link', { name: 'Sillas' })).toHaveAttribute('aria-current', 'true');
  });

  it('permite cambiar de tipo y quitar filtros si no hay resultados', async () => {
    const usuario = userEvent.setup();
    vi.mocked(api.listarProductosApi).mockImplementation(async (_estado, _numero, _senal, _cantidad, filtros) =>
      filtros?.buscar === 'escritorio' ? pagina([]) : pagina([enOferta]),
    );
    renderizar('/productos?buscar=silla');
    await screen.findByText('Silla ergonomica Pro');

    await usuario.click(screen.getByRole('link', { name: 'Escritorios' }));
    expect(await screen.findByText('No encontramos productos')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Escritorios' })).toHaveAttribute('aria-current', 'true');

    await usuario.click(screen.getByRole('button', { name: 'Quitar filtros' }));
    expect(await screen.findByText('Silla ergonomica Pro')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Todos' })).toHaveAttribute('aria-current', 'true');
  });

  it('muestra una tarjeta por producto', async () => {
    renderizar();

    expect(within(await rejilla()).getAllByRole('listitem')).toHaveLength(2);
  });

  it('permite alternar entre cuadrícula y lista sin perder los resultados', async () => {
    const usuario = userEvent.setup();
    renderizar();
    const listado = await rejilla();

    await usuario.click(screen.getByRole('button', { name: 'Vista en lista' }));
    expect(listado).toHaveAttribute('data-vista', 'lista');
    expect(within(listado).getAllByRole('listitem')).toHaveLength(2);
    await usuario.click(screen.getByRole('button', { name: 'Vista en cuadrícula' }));
    expect(listado).toHaveAttribute('data-vista', 'grilla');
  });

  it('destaca la oferta y tacha el precio original', async () => {
    renderizar();

    const tarjeta = within(await rejilla()).getAllByRole('listitem')[0];

    expect(within(tarjeta).getByText('−23%')).toBeInTheDocument();
    expect(within(tarjeta).getByText(/19\.90/)).toBeInTheDocument();
    expect(within(tarjeta).getByText(/25\.90/)).toBeInTheDocument();
  });

  it('muestra la referencia, el color y el stock disponible', async () => {
    renderizar();

    const tarjeta = within(await rejilla()).getAllByRole('listitem')[0];

    expect(within(tarjeta).getByText('Hycon · SE-200')).toBeInTheDocument();
    expect(within(tarjeta).getByText('Negro')).toBeInTheDocument();
    expect(within(tarjeta).getByText('12 disponibles')).toBeInTheDocument();
  });

  it('omite la referencia y el stock cuando el producto no los tiene', async () => {
    renderizar();

    const tarjeta = within(await rejilla()).getAllByRole('listitem')[1];

    expect(within(tarjeta).queryByText(/disponibles/)).not.toBeInTheDocument();
    expect(within(tarjeta).queryByText('·')).not.toBeInTheDocument();
  });

  it('toda la tarjeta lleva al detalle del producto', async () => {
    renderizar();

    const tarjeta = within(await rejilla()).getAllByRole('listitem')[0];
    const enlace = within(tarjeta).getByRole('link', { name: /ver detalles de silla ergonomica pro/i });

    expect(enlace).toHaveAttribute('href', `/productos/${UUID_1}`);
    expect(within(enlace).getByText('Ver detalle')).toBeInTheDocument();
  });

  it('avisa cuando un producto esta agotado', async () => {
    renderizar();

    const tarjeta = within(await rejilla()).getAllByRole('listitem')[1];

    expect(within(tarjeta).getByText('Sin stock')).toBeInTheDocument();
  });

  it('muestra un estado vacio si no hay catalogo', async () => {
    vi.mocked(api.listarProductosApi).mockResolvedValue(pagina([]));
    renderizar();

    expect(await screen.findByText(/todavia no hay productos publicados/i)).toBeInTheDocument();
  });

  it('avisa si la carga falla', async () => {
    vi.mocked(api.listarProductosApi).mockRejectedValue(new Error('Servidor no disponible'));
    renderizar();

    expect(await screen.findByRole('alert')).toHaveTextContent(/servidor no disponible/i);
  });

  it('sin mas de una pagina no muestra paginador', async () => {
    renderizar();
    await rejilla();

    expect(screen.queryByRole('navigation', { name: /paginas de productos/i })).not.toBeInTheDocument();
  });

  it('cambia cuántos productos se solicitan por página', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await rejilla();

    const selector = screen.getByRole('combobox', { name: 'Productos por página' });
    await usuario.click(selector);
    await usuario.keyboard('{Home}{Enter}');
    expect(api.listarProductosApi).toHaveBeenLastCalledWith('active', 1, expect.anything(), 6, {});
  });

  it('con mas de 6 productos pagina desde el backend', async () => {
    const usuario = userEvent.setup();
    vi.mocked(api.listarProductosApi).mockImplementation(async (_estado, numero) =>
      numero === 1
        ? pagina([enOferta], { total: 8, totalPaginas: 2 })
        : pagina([agotado], { pagina: 2, total: 8, totalPaginas: 2 })
    );
    renderizar();
    await screen.findByText('Silla ergonomica Pro');

    const paginadores = screen.getAllByRole('navigation', { name: /paginas de productos/i });
    await usuario.click(within(paginadores[0]).getByRole('button', { name: 'Pagina 2' }));

    expect(await screen.findByText('Reposapies')).toBeInTheDocument();
    expect(api.listarProductosApi).toHaveBeenLastCalledWith('active', 2, expect.anything(), 12, {});
    expect(screen.queryByText('Silla ergonomica Pro')).not.toBeInTheDocument();
  });

  it('la pagina publica no ofrece alta ni edicion', async () => {
    renderizar();
    await screen.findByText('Silla ergonomica Pro');

    expect(screen.queryByRole('button', { name: /agregar producto/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
  });

  it('aplica filtros mediante el backend y los limpia volviendo a la página uno', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await usuario.type(screen.getByLabelText('Buscar'), 'prueba');

    vi.mocked(api.listarProductosApi).mockClear();
    await usuario.click(screen.getByRole('button', { name: 'Buscar productos' }));
    expect(api.listarProductosApi).toHaveBeenCalledWith('active', 1, expect.anything(), 12, { buscar: 'prueba' });

    const panel = within(screen.getByRole('form', { name: 'Filtros de productos' }));
    await usuario.type(panel.getByRole('spinbutton', { name: 'Hasta' }), '250');
    await usuario.click(panel.getByRole('radio', { name: 'Con stock' }));
    vi.mocked(api.listarProductosApi).mockClear();
    await usuario.click(panel.getByRole('button', { name: 'Aplicar filtros' }));
    expect(api.listarProductosApi).toHaveBeenCalledWith('active', 1, expect.anything(), 12,
      { buscar: 'prueba', precioMax: 250, stock: 'disponible' });

    vi.mocked(api.listarProductosApi).mockClear();
    await usuario.click(screen.getByRole('button', { name: 'Quitar filtros' }));
    expect(api.listarProductosApi).toHaveBeenCalledWith('active', 1, expect.anything(), 12, {});
  });
});
