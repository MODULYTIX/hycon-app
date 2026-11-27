import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Icon } from '@iconify/react';
import { Link, useSearchParams } from 'react-router-dom';
import { RUTAS } from '@/app/rutas/rutas';
import { useListadoPaginado } from '@/shared/hooks/useListadoPaginado';
import { parametrosFiltros, type FiltrosListado, type OrdenListado } from '@/shared/utilidades/filtros-listado';
import { formatearPrecio } from '@/shared/utilidades/formato';
import PrecioCatalogo from '@/features/productos/componentes/moleculas/PrecioCatalogo';
import Paginador from '@/shared/ui/moleculas/Paginador';
import Selector from '@/shared/ui/moleculas/Selector';
import RejillaProductos from '@/features/productos/componentes/organismos/RejillaProductos';
import { listarAtributosProductosApi, listarProductosApi, type AtributosProductos } from '@/features/productos/servicios/productos.api';
import portada from '@/assets/images/home/banner-panoramico.webp';
import './catalogo-productos.css';

const ATRIBUTOS = [
  { campo: 'marca', etiqueta: 'Marca', limite: 100 },
  { campo: 'modelo', etiqueta: 'Modelo', limite: 100 },
  { campo: 'color', etiqueta: 'Color', limite: 50 },
] as const;

const CATEGORIAS = [
  { nombre: 'Todos', buscar: '' },
  { nombre: 'Sillas', buscar: 'silla' },
  { nombre: 'Escritorios', buscar: 'escritorio' },
  { nombre: 'Soportes', buscar: 'soporte' },
];

const ORDENES: { valor: OrdenListado; etiqueta: string }[] = [
  { valor: 'recientes', etiqueta: 'Más recientes' },
  { valor: 'antiguos', etiqueta: 'Más antiguos' },
  { valor: 'nombre', etiqueta: 'Nombre: A a Z' },
  { valor: 'precio-asc', etiqueta: 'Precio: menor a mayor' },
  { valor: 'precio-desc', etiqueta: 'Precio: mayor a menor' },
];
const CANTIDADES = [6, 12, 24].map(cantidad => ({ valor: String(cantidad), etiqueta: String(cantidad) }));
const ATAJOS: { etiqueta: string; filtros: Pick<FiltrosListado, 'stock' | 'precioMax'> }[] = [
  { etiqueta: 'Con stock', filtros: { stock: 'disponible' } },
  { etiqueta: 'Sin stock', filtros: { stock: 'agotado' } },
  { etiqueta: 'Hasta S/ 100', filtros: { precioMax: 100 } },
  { etiqueta: 'Hasta S/ 500', filtros: { precioMax: 500 } },
];

function leerFiltros(datos: FormData | URLSearchParams): FiltrosListado {
  const filtros: FiltrosListado = {};
  const buscar = String(datos.get('buscar') ?? '').trim().slice(0, 120);
  const orden = ORDENES.find(opcion => opcion.valor === datos.get('orden'))?.valor;
  const stock = datos.get('stock');
  if (buscar) filtros.buscar = buscar;
  if (orden && orden !== 'recientes') filtros.orden = orden;
  if (stock === 'disponible' || stock === 'agotado') filtros.stock = stock;
  for (const campo of ['precioMin', 'precioMax'] as const) {
    const valor = String(datos.get(campo) ?? '').trim();
    const precio = Number(valor);
    if (valor && Number.isFinite(precio) && precio >= 0) filtros[campo] = precio;
  }
  for (const { campo, limite } of ATRIBUTOS) {
    const valor = String(datos.get(campo) ?? '').trim().slice(0, limite);
    if (valor) filtros[campo] = valor;
  }
  if (datos.get('oferta') === 'si') filtros.oferta = 'si';
  return filtros;
}

export default function PaginaProductos() {
  const [parametros, actualizarParametros] = useSearchParams();
  const filtros = leerFiltros(parametros);
  const [atributos, setAtributos] = useState<AtributosProductos | null>(null);
  const [errorAtributos, setErrorAtributos] = useState(false);
  useEffect(() => {
    const controlador = new AbortController();
    void Promise.resolve().then(() => listarAtributosProductosApi(controlador.signal)).then(valores => {
      if (!controlador.signal.aborted) setAtributos(valores);
    }).catch(() => {
      if (!controlador.signal.aborted) setErrorAtributos(true);
    });
    return () => controlador.abort();
  }, []);
  const camposDisponibles = ATRIBUTOS.filter(({ campo }) => atributos?.[campo].length || filtros[campo]);
  const clave = parametrosFiltros(filtros).slice(1);
  const [porPagina, setPorPagina] = useState(12);
  const [versionFiltros, reiniciarCampos] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const [vista, setVista] = useState<'grilla' | 'lista'>('grilla');
  const [errorPrecio, setErrorPrecio] = useState<string | null>(null);
  const filtrosId = useId();
  const abrirFiltros = useRef<HTMLButtonElement>(null);
  const filtrosActivos = [
    filtros.precioMin !== undefined && 'Desde ' + formatearPrecio(filtros.precioMin),
    filtros.precioMax !== undefined && 'Hasta ' + formatearPrecio(filtros.precioMax),
    ...ATRIBUTOS.map(({ campo, etiqueta }) => filtros[campo] && etiqueta + ': ' + filtros[campo]),
    filtros.oferta && 'En oferta',
    filtros.stock && (filtros.stock === 'disponible' ? 'Con stock' : 'Sin stock'),
  ].filter(Boolean);

  const { elementos, paginacion, cargando, error, irAPagina, recargar } = useListadoPaginado(
    (pagina, senal) => listarProductosApi('active', pagina, senal, porPagina, filtros),
    'No se pudieron cargar los productos',
    porPagina + ':' + clave,
  );

  const [conteos, setConteos] = useState<Record<string, number>>({});
  const { stock, precioMin, precioMax, marca, modelo, color, oferta } = filtros;
  useEffect(() => {
    const controlador = new AbortController();
    setConteos({});
    void Promise.all(CATEGORIAS.map(async ({ buscar }) => {
      const resultado = await listarProductosApi('active', 1, controlador.signal, 1, { buscar, stock, precioMin, precioMax, marca, modelo, color, oferta });
      return [buscar, resultado.paginacion.total] as const;
    })).then(filas => {
      if (!controlador.signal.aborted) setConteos(Object.fromEntries(filas));
    }).catch(() => { /* El catálogo sigue disponible si falla el recuento. */ });
    return () => controlador.abort();
  }, [stock, precioMin, precioMax, marca, modelo, color, oferta]);

  const cerrarFiltros = () => {
    setAbierto(false);
    setErrorPrecio(null);
    if (abierto && abrirFiltros.current?.getClientRects().length) {
      abrirFiltros.current.focus({ preventScroll: true });
    }
  };

  const aplicar = (evento: FormEvent<HTMLFormElement>, panel = false) => {
    evento.preventDefault();
    const nuevos = leerFiltros(new FormData(evento.currentTarget));
    const valores = panel
      ? { buscar: filtros.buscar, orden: filtros.orden, ...nuevos }
      : { ...filtros, buscar: undefined, orden: undefined, ...nuevos };
    if ((valores.precioMin ?? 0) > (valores.precioMax ?? Infinity)) {
      setErrorPrecio('El precio mínimo no puede superar el máximo.');
      setAbierto(true);
      return;
    }
    setErrorPrecio(null);
    actualizarParametros(parametrosFiltros(valores).slice(1), { replace: true, preventScrollReset: true });
    if (panel) cerrarFiltros();
  };

  const limpiar = () => {
    setErrorPrecio(null);
    reiniciarCampos(version => version + 1);
    actualizarParametros({}, { replace: true, preventScrollReset: true });
  };

  const cambiarPagina = (pagina: number) => {
    irAPagina(pagina);
    window.scrollTo({ top: 0, behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  return (
    <div className="catalogo-productos">
      <section className="productos-portada" aria-labelledby="productos-titulo">
        <img src={portada} alt="" />
        <div className="productos-portada-texto">
          <h1 id="productos-titulo">Productos ergonómicos</h1>
          <nav className="productos-migas" aria-label="Ruta de navegación">
            <Link to={RUTAS.home}>Inicio</Link>
            <Icon icon="solar:alt-arrow-right-linear" width="14" aria-hidden />
            <span aria-current="page">Productos</span>
          </nav>
          <p>Equipamiento ergonómico para trabajar con comodidad en casa o en la oficina.</p>
        </div>
      </section>

      <div className="hy-contenedor">

        <div className="productos-distribucion">
          <aside aria-label="Explorar y filtrar">
            <div className="productos-lateral">
              <h2 className="productos-lateral-titulo">
                Filtrar productos
              </h2>
              <div className="productos-tipos">
                <h3>Categorías</h3>
                <nav aria-label="Explorar por tipo de producto" className="productos-categorias">
                  {CATEGORIAS.map(({ nombre, buscar }) => (
                    <Link key={nombre}
                      to={{ search: parametrosFiltros({ ...filtros, buscar }).slice(1) }}
                      replace preventScrollReset
                      aria-current={(filtros.buscar ?? '') === buscar ? 'true' : undefined}>
                      {nombre}<span className="productos-conteo" aria-hidden>{conteos[buscar]}</span>
                    </Link>
                  ))}
                </nav>
              </div>
              <button ref={abrirFiltros} className="productos-abrir-filtros" type="button"
                aria-controls={filtrosId} aria-expanded={abierto} onClick={() => setAbierto(valor => !valor)}>
                <Icon icon="solar:filter-linear" width="18" aria-hidden /> Filtros
                {filtrosActivos.length > 0 && <span className="productos-numero-filtros">{filtrosActivos.length}</span>}
                <Icon icon={abierto ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'} width="16" aria-hidden />
              </button>
              <form className="productos-panel-filtros" id={filtrosId} data-abierto={abierto} key={clave + versionFiltros} aria-label="Filtros de productos" onSubmit={evento => aplicar(evento, true)}>
                <div className="productos-filtro-grupo">
                  <PrecioCatalogo minimo={filtros.precioMin} maximo={filtros.precioMax} />
                </div>
                <div className="productos-filtro-grupo">
                  <fieldset className="productos-disponibilidad">
                    <legend>Disponibilidad</legend>
                    <label><input type="radio" name="stock" value="" defaultChecked={!filtros.stock} /> Todas</label>
                    <label><input type="radio" name="stock" value="disponible" defaultChecked={filtros.stock === 'disponible'} /> Con stock</label>
                    <label><input type="radio" name="stock" value="agotado" defaultChecked={filtros.stock === 'agotado'} /> Sin stock</label>
                  </fieldset>
                </div>
                {camposDisponibles.length > 0 && (
                  <div className="productos-filtro-grupo">
                    <fieldset className="productos-filtros-campos">
                      <legend>Características</legend>
                      {camposDisponibles.map(({ campo, etiqueta }) => {
                        const opciones = (atributos?.[campo] ?? []).map(valor => ({ valor, etiqueta: valor }));
                        const actual = opciones.find(({ valor }) => valor.toLowerCase() === filtros[campo]?.toLowerCase())?.valor;
                        return opciones.length > 0 ? (
                          <label key={campo} className="productos-orden">{etiqueta}
                            <Selector name={campo} aria-label={etiqueta}
                              opciones={[{ valor: '', etiqueta: 'Cualquiera' }, ...opciones]} defaultValue={actual ?? ''} />
                          </label>
                        ) : <input key={campo} type="hidden" name={campo} value={filtros[campo]} />;
                      })}
                    </fieldset>
                  </div>
                )}
                {errorAtributos && <p className="productos-filtro-grupo text-sm text-g-60">No se pudieron cargar las características.</p>}
                <div className="productos-filtro-grupo">
                  <label className="productos-filtro-casilla">
                    <input type="checkbox" name="oferta" value="si" defaultChecked={Boolean(filtros.oferta)} /> Solo en oferta
                  </label>
                </div>
                {errorPrecio && <p role="alert">{errorPrecio}</p>}
                <div className="productos-panel-acciones">
                  <button className="productos-limpiar" type="button" onClick={() => {
                    reiniciarCampos(version => version + 1);
                    actualizarParametros(parametrosFiltros({ buscar: filtros.buscar, orden: filtros.orden }).slice(1),
                      { replace: true, preventScrollReset: true });
                    cerrarFiltros();
                  }}>Limpiar</button>
                  <button className="productos-accion" type="submit">Aplicar filtros</button>
                </div>
              </form>
            </div>
            <section className="productos-atajos" aria-labelledby={filtrosId + '-atajos'}>
              <h2 id={filtrosId + '-atajos'} className="productos-lateral-titulo">Filtros rápidos</h2>
              <div className="productos-atajos-lista">
                {ATAJOS.map(({ etiqueta, filtros: atajo }) => {
                  const activo = atajo.stock ? filtros.stock === atajo.stock : filtros.precioMax === atajo.precioMax;
                  const siguiente = {
                    ...filtros,
                    ...(atajo.stock
                      ? { stock: activo ? undefined : atajo.stock }
                      : { precioMin: undefined, precioMax: activo ? undefined : atajo.precioMax }),
                  };
                  return (
                    <button key={etiqueta} type="button" aria-pressed={activo}
                      onClick={() => {
                        setErrorPrecio(null);
                        actualizarParametros(parametrosFiltros(siguiente).slice(1), { replace: true, preventScrollReset: true });
                      }}>
                      {etiqueta}
                    </button>
                  );
                })}
              </div>
            </section>
          </aside>

          <section className="productos-resultados" aria-label="Resultados del catálogo">
            <div className="productos-barra">
              <div className="productos-vistas" role="group" aria-label="Presentación del catálogo">
                <button type="button" aria-label="Vista en cuadrícula" aria-pressed={vista === 'grilla'} onClick={() => setVista('grilla')}>
                  <Icon icon="solar:widget-2-linear" width="19" aria-hidden />
                </button>
                <button type="button" aria-label="Vista en lista" aria-pressed={vista === 'lista'} onClick={() => setVista('lista')}>
                  <Icon icon="solar:list-linear" width="19" aria-hidden />
                </button>
              </div>
              <form className="productos-busqueda" onSubmit={aplicar} aria-label="Buscar en el catálogo">
                <Icon icon="solar:magnifer-linear" width="18" aria-hidden />
                <input key={filtros.buscar ?? ''} aria-label="Buscar" name="buscar" defaultValue={filtros.buscar}
                  maxLength={120} placeholder="Buscar productos" />
                <button type="submit" aria-label="Buscar productos">
                  <Icon icon="solar:arrow-right-linear" width="18" aria-hidden />
                </button>
              </form>
              <div className="productos-orden productos-cantidad">
                <span>Mostrar</span>
                <Selector aria-label="Productos por página" opciones={CANTIDADES} value={String(porPagina)}
                  onChange={valor => setPorPagina(Number(valor))} />
              </div>
            </div>
            <div className="productos-barra-secundaria">
              <div className="productos-orden">
                <Selector aria-label="Ordenar por" opciones={ORDENES} value={filtros.orden ?? 'recientes'} onChange={valor => {
                  const orden = ORDENES.find(opcion => opcion.valor === valor)?.valor;
                  actualizarParametros(parametrosFiltros({ ...filtros, orden: orden === 'recientes' ? undefined : orden }).slice(1),
                    { replace: true, preventScrollReset: true });
                }} />
              </div>
              <p role="status">
                {cargando ? 'Cargando productos…' : error ? 'Catálogo de productos' : paginacion.total === 1 ? '1 producto' : `${paginacion.total} productos`}
                {filtros.buscar && <> para <strong>«{filtros.buscar}»</strong></>}
              </p>
            </div>
            {!error && paginacion.totalPaginas > 1 && (
              <div className="productos-paginacion productos-paginacion-superior">
                <Paginador paginacion={paginacion} onCambiar={irAPagina} entidad="productos" deshabilitado={cargando} />
              </div>
            )}
            {clave && (
              <div className="productos-seleccion">
                {filtrosActivos.length > 0 && <ul className="productos-filtros-activos" aria-label="Filtros aplicados">
                  {filtrosActivos.map(filtro => <li key={String(filtro)}>{filtro}</li>)}
                </ul>}
                <button className="productos-limpiar" type="button" onClick={limpiar}>Quitar filtros</button>
              </div>
            )}
            <RejillaProductos
              vista={vista}
              filtrado={Boolean(clave)}
              productos={elementos}
              cargando={cargando && elementos.length === 0}
              error={error}
              onReintentar={recargar}
            />
            {!error && paginacion.totalPaginas > 1 && <div className="productos-paginacion mt-8">
              <Paginador paginacion={paginacion} onCambiar={cambiarPagina} entidad="productos" deshabilitado={cargando} />
            </div>}
          </section>
        </div>
      </div>
    </div>
  );
}
