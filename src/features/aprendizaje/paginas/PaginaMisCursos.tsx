import { useCallback, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import PlantillaSeccion from '@/shared/ui/plantillas/PlantillaSeccion';
import EstadoVacio from '@/shared/ui/atomos/EstadoVacio';
import Paginador from '@/shared/ui/moleculas/Paginador';
import FiltrosCuenta from '@/shared/ui/organismos/FiltrosCuenta';
import SaludoAprendizaje from '@/features/aprendizaje/componentes/moleculas/SaludoAprendizaje';
import PestanasAprendizaje from '@/features/aprendizaje/componentes/moleculas/PestanasAprendizaje';
import FilaCursoComprado from '@/features/aprendizaje/componentes/moleculas/FilaCursoComprado';
import PanelAvance from '@/features/aprendizaje/componentes/organismos/PanelAvance';
import { listarMisCursosApi } from '@/features/aprendizaje/servicios/aprendizaje.api';
import { filtrarPorPestana, type Pestana } from '@/features/aprendizaje/utilidades/panel-aprendizaje';
import { useListadoPaginado } from '@/shared/hooks/useListadoPaginado';
import { PAGINACION_INICIAL } from '@/shared/utilidades/paginacion';
import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';
import { RUTAS } from '@/app/rutas/rutas';
import type { FiltrosCuenta as Filtros } from '@/shared/utilidades/filtros-listado';

// Lo que se dice cuando la pestana elegida no tiene ningun curso
const VACIO_POR_PESTANA: Record<Pestana, { titulo: string; descripcion: string }> = {
  'en-curso': {
    titulo: 'No tienes cursos pendientes',
    descripcion: 'Terminaste todo lo que compraste. En la pestaña Terminados puedes repasarlos.',
  },
  terminados: {
    titulo: 'Todavía no terminas ningún curso',
    descripcion: 'Al ver todas las partes de un curso aparecerá aquí con su certificado.',
  },
  todos: {
    titulo: 'Todavía no tienes cursos',
    descripcion: 'Cuando compres uno aparecerá aquí para que lo veas cuando quieras.',
  },
};

export default function PaginaMisCursos() {
  const { usuario, cargando: cargandoSesion } = useAutenticacion();
  const [filtros, setFiltros] = useState<Filtros>({});
  const [pestana, setPestana] = useState<Pestana>('todos');

  // Sin sesion no se consulta nada; al entrar, la clave cambia y se pide el listado
  const cargar = useCallback(
    (pagina: number, senal: AbortSignal) =>
      usuario
        ? listarMisCursosApi(pagina, senal, filtros)
        : Promise.resolve({ elementos: [], paginacion: PAGINACION_INICIAL }),
    [usuario, filtros]
  );

  // Al cambiar de usuario o de filtros se vuelve a la primera pagina
  const { elementos, paginacion, cargando, error, irAPagina } = useListadoPaginado(
    cargar,
    'No se pudieron cargar tus cursos',
    `${usuario?.userId ?? 'sin-sesion'}|${JSON.stringify(filtros)}`
  );

  const hayFiltros = Object.keys(filtros).length > 0;
  const visibles = filtrarPorPestana(elementos, pestana);
  const cuantos: Record<Pestana, number> = {
    'en-curso': filtrarPorPestana(elementos, 'en-curso').length,
    terminados: filtrarPorPestana(elementos, 'terminados').length,
    todos: elementos.length,
  };

  if (!cargandoSesion && !usuario) {
    return (
      <PlantillaSeccion titulo="Mis cursos" descripcion="Los cursos a los que tienes acceso.">
        <div className="rounded-2xl bg-white ring-1 ring-g-20">
          <EstadoVacio
            icono="solar:user-circle-linear"
            titulo="Entra a tu cuenta para ver tus cursos"
            descripcion="Tus cursos quedan guardados en tu cuenta, no en este navegador."
          />
        </div>
      </PlantillaSeccion>
    );
  }

  const vacio = VACIO_POR_PESTANA[pestana];

  return (
    <div className="pagina-interior hy-contenedor py-10 sm:py-12">
      <SaludoAprendizaje nombre={usuario?.name ?? ''} />

      <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <FiltrosCuenta modulo="mis-cursos" onAplicar={setFiltros} />

          <div className="mt-4">
            <PestanasAprendizaje activa={pestana} onElegir={setPestana} cuantos={cuantos} />
          </div>

          {(cargando || cargandoSesion) && (
            <ul aria-label="Cargando cursos" className="mt-4 space-y-3">
              {[0, 1, 2].map((posicion) => (
                <li
                  key={posicion}
                  className="flex items-center gap-4 rounded-xl border border-g-20 bg-white p-4"
                >
                  <div className="h-[72px] w-[128px] shrink-0 animate-pulse rounded-lg bg-g-10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-g-10" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-g-10" />
                    <div className="h-1.5 w-full animate-pulse rounded-full bg-g-10" />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!cargando && error && (
            <p
              role="alert"
              className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center text-[15px] text-red-700"
            >
              {error}
            </p>
          )}

          {!cargando && !error && visibles.length === 0 && (
            <div className="mt-4 rounded-2xl bg-white ring-1 ring-g-20">
              {hayFiltros ? (
                <EstadoVacio
                  icono="solar:magnifer-linear"
                  titulo="Ningún curso coincide con el filtro"
                  descripcion="Prueba con otro texto o limpia los filtros para verlos todos."
                />
              ) : (
                <>
                  <EstadoVacio
                    icono="solar:diploma-linear"
                    titulo={vacio.titulo}
                    descripcion={vacio.descripcion}
                  />
                  {elementos.length === 0 && (
                    <div className="flex justify-center pb-8">
                      <Link
                        to={RUTAS.cursos}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-[13px] font-medium text-white transition-colors hover:bg-marca-oscuro"
                      >
                        Ver los cursos
                        <Icon icon="solar:arrow-right-linear" width="15" height="15" aria-hidden />
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {!cargando && !error && visibles.length > 0 && (
            <>
              <ul aria-label="Mis cursos" className="mt-4 space-y-3">
                {visibles.map((curso) => (
                  <FilaCursoComprado key={curso.uuid} curso={curso} />
                ))}
              </ul>

              <div className="mt-8">
                <Paginador paginacion={paginacion} onCambiar={irAPagina} entidad="cursos" />
              </div>
            </>
          )}
        </div>

        <aside aria-label="Resumen de tu aprendizaje">
          <PanelAvance cursos={elementos} />
        </aside>
      </div>
    </div>
  );
}
