import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { RUTAS } from '@/app/rutas/rutas';
import portada from '@/assets/images/banners/cursos.webp';
import '@/features/productos/paginas/catalogo-productos.css';
import './catalogo-cursos.css';
import Selector from '@/shared/ui/moleculas/Selector';
import DuracionCatalogo from '@/features/cursos/componentes/moleculas/DuracionCatalogo';
import PrecioCatalogo from '@/features/productos/componentes/moleculas/PrecioCatalogo';
import type { OrdenListado } from '@/shared/utilidades/filtros-listado';
import { useFiltrosListado } from '@/shared/hooks/useFiltrosListado';
import { useCallback, useId, useState, type FormEvent } from 'react';
import Paginador from '@/shared/ui/moleculas/Paginador';
import RejillaCursos from '@/features/cursos/componentes/organismos/RejillaCursos';
import ModalVideoCurso from '@/features/cursos/componentes/organismos/ModalVideoCurso';
import { listarCursosApi } from '@/features/cursos/servicios/cursos.api';
import { useListadoPaginado } from '@/shared/hooks/useListadoPaginado';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

const ORDENES: { valor: OrdenListado; etiqueta: string }[] = [
  { valor: 'recientes', etiqueta: 'Más recientes' },
  { valor: 'antiguos', etiqueta: 'Más antiguos' },
  { valor: 'nombre', etiqueta: 'Nombre: A a Z' },
  { valor: 'precio-asc', etiqueta: 'Precio: menor a mayor' },
  { valor: 'precio-desc', etiqueta: 'Precio: mayor a menor' },
];
const CANTIDADES = ['6', '12', '24'].map(valor => ({ valor, etiqueta: valor }));

export default function PaginaCursos() {
  const { filtros, clave, aplicar } = useFiltrosListado();
  const [porPagina, setPorPagina] = useState(12);
  const [vista, setVista] = useState<'grilla' | 'lista'>('grilla');
  const [busqueda, setBusqueda] = useState('');
  const [abierto, setAbierto] = useState(false);
  const [version, setVersion] = useState(0);
  const [errorPrecio, setErrorPrecio] = useState('');
  const filtrosId = useId();
  const buscar = busqueda.trim() || undefined;
  const cargar = useCallback(
    (pagina: number, senal: AbortSignal) => listarCursosApi('active', pagina, senal, porPagina, filtros),
    [filtros, porPagina]
  );
  const { elementos, paginacion, cargando, error, irAPagina, recargar } = useListadoPaginado(
    cargar,
    'No se pudieron cargar los cursos',
    porPagina + ":" + clave
  );

  const [enReproduccion, setEnReproduccion] = useState<Curso | null>(null);

  const cambiarPagina = (pagina: number) => {
    irAPagina(pagina);
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  const aplicarPanel = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const leerNumero = (campo: string) => {
      const valor = String(datos.get(campo) ?? '').trim();
      return valor ? Number(valor) : undefined;
    };
    const precioMin = leerNumero('precioMin');
    const precioMax = leerNumero('precioMax');
    if ((precioMin ?? 0) > (precioMax ?? Infinity)) {
      setErrorPrecio('El precio mínimo no puede superar el máximo.');
      return;
    }
    setErrorPrecio('');
    aplicar({
      ...(buscar && { buscar }),
      ...(filtros.orden && { orden: filtros.orden }),
      ...(precioMin !== undefined && { precioMin }),
      ...(precioMax !== undefined && { precioMax }),
      ...(datos.get('duracionMax') && { duracionMax: leerNumero('duracionMax') }),
      ...(datos.get('oferta') === 'si' && { oferta: 'si' }),
      ...(datos.get('conAvance') === 'si' && { conAvance: 'si' }),
    });
    setAbierto(false);
  };

  const limpiar = () => {
    setBusqueda('');
    setErrorPrecio('');
    setVersion(valor => valor + 1);
    aplicar({});
  };

  return (
    <div className="catalogo-productos catalogo-cursos">
      <section className="productos-portada" aria-labelledby="cursos-titulo">
        <img className="productos-portada-foto-editorial" src={portada} alt="" />
        <div className="productos-portada-texto">
          <h1 id="cursos-titulo">Cursos</h1>
          <nav className="productos-migas" aria-label="Ruta de navegación">
            <Link to={RUTAS.home}>Inicio</Link>
            <Icon icon="solar:alt-arrow-right-linear" width="14" aria-hidden />
            <span aria-current="page">Cursos</span>
          </nav>
          <p>Formación para supervisores y equipos operativos, desde ergonomía hasta atención al cliente.</p>
        </div>
      </section>

      <div className="hy-contenedor">
        <div className="productos-distribucion">
          <aside aria-label="Filtros del catálogo">
            <div className="productos-lateral cursos-filtros">
              <h2 className="productos-lateral-titulo">Filtrar cursos</h2>
              <button className="productos-abrir-filtros" type="button" aria-controls={filtrosId}
                aria-expanded={abierto} onClick={() => setAbierto(valor => !valor)}>
                <Icon icon="solar:filter-linear" width="18" aria-hidden /> Filtrar cursos
                <Icon icon={abierto ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'} width="16" aria-hidden />
              </button>
              <form key={version} className="productos-panel-filtros" id={filtrosId}
                data-abierto={abierto} aria-label="Filtros de cursos" onSubmit={aplicarPanel}>
                <div className="productos-filtro-grupo"><PrecioCatalogo /></div>
                <div className="productos-filtro-grupo">
                  <DuracionCatalogo />
                </div>
                <div className="productos-filtro-grupo">
                  <fieldset className="productos-filtros-campos">
                    <legend>Contenido del curso</legend>
                    <label className="productos-filtro-casilla">
                      <input type="checkbox" name="conAvance" value="si" /> Con avance o muestra
                    </label>
                  </fieldset>
                </div>
                <div className="productos-filtro-grupo">
                  <label className="productos-filtro-casilla"><input type="checkbox" name="oferta" value="si" /> Solo en oferta</label>
                </div>
                {errorPrecio && <p role="alert">{errorPrecio}</p>}
                <div className="productos-panel-acciones">
                  <button className="productos-limpiar" type="button" onClick={limpiar}>Limpiar</button>
                  <button className="productos-accion" type="submit">Aplicar filtros</button>
                </div>
              </form>
            </div>
          </aside>
          <section className="productos-resultados" aria-label="Resultados de cursos">
            <div className="productos-barra">
              <div className="productos-vistas" role="group" aria-label="Presentación del catálogo">
                <button type="button" aria-label="Vista en cuadrícula" aria-pressed={vista === 'grilla'}
                  onClick={() => setVista('grilla')}><Icon icon="solar:widget-2-linear" width="19" aria-hidden /></button>
                <button type="button" aria-label="Vista en lista" aria-pressed={vista === 'lista'}
                  onClick={() => setVista('lista')}><Icon icon="solar:list-linear" width="19" aria-hidden /></button>
              </div>
              <form className="productos-busqueda" aria-label="Buscar en el catálogo" onSubmit={evento => {
                evento.preventDefault();
                const nuevos = { ...filtros };
                if (buscar) nuevos.buscar = buscar;
                else delete nuevos.buscar;
                aplicar(nuevos);
              }}>
                <Icon icon="solar:magnifer-linear" width="18" aria-hidden />
                <input aria-label="Buscar" value={busqueda} onChange={evento => setBusqueda(evento.target.value)}
                  maxLength={120} placeholder="Buscar cursos" />
                <button type="submit" aria-label="Buscar cursos"><Icon icon="solar:arrow-right-linear" width="18" aria-hidden /></button>
              </form>
              <div className="productos-orden productos-cantidad">
                <span>Mostrar</span>
                <Selector aria-label="Cursos por página" opciones={CANTIDADES} value={String(porPagina)}
                  onChange={valor => setPorPagina(Number(valor))} />
              </div>
            </div>
            <div className="productos-barra-secundaria">
              <div className="productos-orden">
                <Selector aria-label="Ordenar por" opciones={ORDENES} value={filtros.orden ?? 'recientes'}
                  onChange={valor => {
                    const nuevos = { ...filtros };
                    const orden = ORDENES.find(opcion => opcion.valor === valor)?.valor;
                    if (orden && orden !== 'recientes') nuevos.orden = orden;
                    else delete nuevos.orden;
                    aplicar(nuevos);
                  }} />
              </div>
              <p role="status">{cargando ? 'Cargando cursos…' : error ? 'Catálogo de cursos'
                : paginacion.total === 1 ? '1 curso' : `${paginacion.total} cursos`}</p>
            </div>
            <RejillaCursos
              vista={vista}
              filtrado={Boolean(clave)}
              cursos={elementos}
              cargando={cargando && elementos.length === 0}
              error={error}
              onVerAvance={setEnReproduccion}
              onReintentar={recargar}
            />

            <div className="productos-paginacion mt-8">
              <Paginador
                paginacion={paginacion}
                onCambiar={cambiarPagina}
                entidad="cursos"
                deshabilitado={cargando}
              />
            </div>

          </section>
        </div>
        <ModalVideoCurso curso={enReproduccion} onCerrar={() => setEnReproduccion(null)} />
      </div>
    </div>
  );
}
