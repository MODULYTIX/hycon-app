import portada from '@/assets/images/banners/publicaciones.webp';
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { RUTAS } from '@/app/rutas/rutas';
import '@/features/productos/paginas/catalogo-productos.css';
import './publicaciones-editorial.css';
import FiltrosListado from '@/shared/ui/organismos/FiltrosListado';
import { useFiltrosListado } from '@/shared/hooks/useFiltrosListado';
import { Icon } from '@iconify/react';
import EstadoVacio from '@/shared/ui/atomos/EstadoVacio';
import TarjetaArticuloDestacado from '@/features/publicaciones/componentes/moleculas/TarjetaArticuloDestacado';
import TarjetaArticulo from '@/features/publicaciones/componentes/moleculas/TarjetaArticulo';
import PanelMasLeidos from '@/features/publicaciones/componentes/organismos/PanelMasLeidos';
import { usePublicacionesPublicas } from '@/features/publicaciones/hooks/usePublicacionesPublicas';

import EsqueletoPublicaciones from '@/features/publicaciones/componentes/organismos/EsqueletoPublicaciones';
import AvisoErrorCatalogo from '@/shared/ui/moleculas/AvisoErrorCatalogo';

export default function PaginaPublicaciones() {
  const { filtros, clave, aplicar } = useFiltrosListado();
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const filtrosId = useId();
  const { publicaciones, cargando, cargandoPrimera, error, hayMas, verMas } =
    usePublicacionesPublicas({ porPagina: 9, filtros });
  const masLeidos = usePublicacionesPublicas({ orden: 'leidos', porPagina: 6 });

  const [destacado, ...resto] = publicaciones;
  const secundarios = resto.slice(0, 2);
  const listado = resto.slice(2);
  const articulosPortada = new Set(publicaciones.slice(0, 3).map(({ uuid }) => uuid));
  const populares = masLeidos.publicaciones.filter(({ uuid }) => !articulosPortada.has(uuid)).slice(0, 3);
  const mostrarPopulares = !clave && (masLeidos.cargandoPrimera || populares.length > 0);

  return (
    <div className="catalogo-productos publicaciones-editorial">
      <section className="productos-portada" aria-labelledby="publicaciones-titulo">
        <img className="productos-portada-foto-editorial" src={portada} alt="" />
        <div className="productos-portada-texto">
          <h1 id="publicaciones-titulo">Publicaciones</h1>
          <nav className="productos-migas" aria-label="Ruta de navegación">
            <Link to={RUTAS.home}>Inicio</Link>
            <Icon icon="solar:alt-arrow-right-linear" width="14" aria-hidden />
            <span aria-current="page">Publicaciones</span>
          </nav>
          <p>Ideas prácticas sobre ergonomía, capacitación y operaciones para tu equipo.</p>
        </div>
      </section>

      <div className="hy-contenedor publicaciones-contenido">
        <div className="publicaciones-barra">
          <button type="button" className="publicaciones-control" aria-expanded={filtrosAbiertos}
            aria-controls={filtrosId} onClick={() => setFiltrosAbiertos(valor => !valor)}>
            <Icon icon="solar:filter-linear" width="16" aria-hidden />
            Filtros
          </button>
        </div>
        <div id={filtrosId} hidden={!filtrosAbiertos} className="publicaciones-filtros">
          <FiltrosListado modulo="publicaciones" onAplicar={aplicar} />
        </div>

        {cargandoPrimera && <EsqueletoPublicaciones />}
        {!cargando && error && (
          <AvisoErrorCatalogo error={error} onReintentar={verMas} reintentando={cargando} />
        )}
        {!cargando && !error && publicaciones.length === 0 && (
          <div className="border border-g-20 bg-white">
            <EstadoVacio
              icono="solar:document-text-linear"
              titulo={clave ? 'No encontramos publicaciones' : 'Todavía no hay artículos publicados'}
              descripcion={clave ? 'Prueba otros filtros o pulsa Limpiar para ver todas las publicaciones.' : 'Estamos preparando los primeros artículos.'}
            />
          </div>
        )}

        {destacado && (
          <>
            <div className="publicaciones-portadilla" data-apoyo={secundarios.length > 0} data-populares={mostrarPopulares}>
              <div className="publicaciones-principal">
                <TarjetaArticuloDestacado
                  etiqueta={filtros.orden === 'leidos' ? 'Más leído' : filtros.orden && filtros.orden !== 'recientes' ? 'Selección' : 'Lo último'}
                  publicacion={destacado} horizontal={secundarios.length === 0 && !mostrarPopulares}
                />
              </div>
              {secundarios.length > 0 && (
                <div className="publicaciones-apoyo">
                  {secundarios.map(publicacion => <TarjetaArticulo key={publicacion.uuid} publicacion={publicacion} />)}
                </div>
              )}
              {mostrarPopulares && (
                <aside className="publicaciones-populares">
                  <PanelMasLeidos publicaciones={populares} cargando={masLeidos.cargandoPrimera} />
                </aside>
              )}
            </div>

            {(listado.length > 0 || hayMas) && (
              <section className="publicaciones-archivo" aria-labelledby="titulo-todos">
                <h2 id="titulo-todos">Más artículos</h2>
                {listado.length > 0 && (
                  <ul aria-label="Listado de artículos" className="publicaciones-rejilla">
                    {listado.map(publicacion => (
                      <li key={publicacion.uuid}><TarjetaArticulo publicacion={publicacion} /></li>
                    ))}
                  </ul>
                )}
                {hayMas && (
                  <div className="mt-7 flex justify-center">
                    <button type="button" onClick={verMas} disabled={cargando} className="publicaciones-control">
                      {cargando ? 'Cargando…' : 'Ver más artículos'}
                      <Icon icon="solar:alt-arrow-down-linear" width="16" aria-hidden />
                    </button>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
