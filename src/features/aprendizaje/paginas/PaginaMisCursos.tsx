import { useCallback, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import PlantillaSeccion from '@/shared/ui/plantillas/PlantillaSeccion';
import EstadoVacio from '@/shared/ui/atomos/EstadoVacio';
import Paginador from '@/shared/ui/moleculas/Paginador';
import FiltrosCuenta from '@/shared/ui/organismos/FiltrosCuenta';
import TarjetaCursoComprado from '@/features/aprendizaje/componentes/moleculas/TarjetaCursoComprado';
import { listarMisCursosApi } from '@/features/aprendizaje/servicios/aprendizaje.api';
import { useListadoPaginado } from '@/shared/hooks/useListadoPaginado';
import { PAGINACION_INICIAL } from '@/shared/utilidades/paginacion';
import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';
import { RUTAS } from '@/app/rutas/rutas';
import type { FiltrosCuenta as Filtros } from '@/shared/utilidades/filtros-listado';

export default function PaginaMisCursos() {
  const { usuario, cargando: cargandoSesion } = useAutenticacion();
  const [filtros, setFiltros] = useState<Filtros>({});

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

  return (
    <PlantillaSeccion titulo="Mis cursos" descripcion="Los cursos a los que tienes acceso.">
      <FiltrosCuenta modulo="mis-cursos" onAplicar={setFiltros} />

      {(cargando || cargandoSesion) && (
        <ul
          aria-label="Cargando cursos"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {[0, 1, 2].map((posicion) => (
            <li key={posicion} className="overflow-hidden rounded-2xl bg-white ring-1 ring-g-20">
              <div className="aspect-[16/9] animate-pulse bg-g-10" />
              <div className="space-y-3 border-t border-g-20 p-5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-g-10" />
                <div className="h-9 w-full animate-pulse rounded-xl bg-g-10" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {!cargando && error && (
        <p
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center text-[15px] text-red-700"
        >
          {error}
        </p>
      )}

      {!cargando && !error && elementos.length === 0 && (
        <div className="rounded-2xl bg-white ring-1 ring-g-20">
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
                titulo="Todavía no tienes cursos"
                descripcion="Cuando compres uno aparecerá aquí para que lo veas cuando quieras."
              />
              <div className="flex justify-center pb-8">
                <Link
                  to={RUTAS.cursos}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-[13px] font-medium text-white transition-colors hover:bg-marca-oscuro"
                >
                  Ver los cursos
                  <Icon icon="solar:arrow-right-linear" width="15" height="15" aria-hidden />
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {!cargando && !error && elementos.length > 0 && (
        <>
          <ul
            aria-label="Mis cursos"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {elementos.map((curso) => (
              <TarjetaCursoComprado key={curso.uuid} curso={curso} />
            ))}
          </ul>

          <div className="mt-8">
            <Paginador paginacion={paginacion} onCambiar={irAPagina} entidad="cursos" />
          </div>
        </>
      )}
    </PlantillaSeccion>
  );
}
