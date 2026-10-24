import { useId, useState, type FormEvent } from 'react';
import { Icon } from '@iconify/react';
import type { FiltrosCuenta as Valores } from '@/shared/utilidades/filtros-listado';

type Modulo = 'mis-cursos' | 'mis-compras';

interface Props {
  modulo: Modulo;
  onAplicar: (filtros: Valores) => void;
}

const CAMPO =
  'h-10 w-full min-w-0 rounded-lg border border-g-20 bg-white px-3 text-[13px] text-g-70 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15';

const ETIQUETA = 'block text-[12px] font-medium text-g-60';

const TEXTOS: Record<Modulo, { titulo: string; buscar: string }> = {
  'mis-cursos': { titulo: 'Filtrar mis cursos', buscar: 'Nombre del curso' },
  'mis-compras': { titulo: 'Filtrar mis compras', buscar: 'Producto o curso' },
};

/** Barra de filtros de las listas de la cuenta. Lo que aplica lo resuelve el backend. */
export default function FiltrosCuenta({ modulo, onAplicar }: Props) {
  const id = useId();
  const [version, setVersion] = useState(0);
  // Cerrado de entrada: el listado es lo que importa, los filtros se piden
  const [abierto, setAbierto] = useState(false);
  const [aplicados, setAplicados] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const esCompras = modulo === 'mis-compras';

  const aplicar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const valores: Record<string, string> = {};

    for (const [campo, valor] of datos) {
      const texto = String(valor).trim();
      // Lo que ya es el valor por defecto no viaja en la URL
      if (!texto || (campo === 'orden' && texto === 'recientes') || (campo === 'estado' && texto === 'todos')) {
        continue;
      }
      valores[campo] = texto;
    }

    if (valores.desde && valores.hasta && valores.desde > valores.hasta) {
      setError('La fecha inicial no puede superar la final.');
      return;
    }

    setError(null);
    setAplicados(Object.keys(valores).length);
    onAplicar(valores as Valores);
  };

  const limpiar = () => {
    setVersion((valor) => valor + 1);
    setError(null);
    setAplicados(0);
    onAplicar({});
  };

  return (
    <form
      key={version}
      onSubmit={aplicar}
      aria-label={TEXTOS[modulo].titulo}
      className="mb-6 rounded-2xl border border-g-20 bg-white px-4 py-3.5 sm:px-5"
    >
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls={`${id}-campos`}
        onClick={() => setAbierto((valor) => !valor)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="inline-flex min-w-0 items-center gap-2 text-[13px] font-semibold text-g-80">
          <Icon icon="solar:filter-linear" width="16" height="16" aria-hidden />
          {TEXTOS[modulo].titulo}
        </span>

        <span className="inline-flex shrink-0 items-center gap-2">
          {aplicados > 0 && (
            <span
              role="status"
              className="rounded-full bg-hy-5 px-2.5 py-1 text-[11px] font-medium text-primary"
            >
              {aplicados} {aplicados === 1 ? 'filtro activo' : 'filtros activos'}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-md bg-g-5 px-2.5 py-1.5 text-[12px] font-medium text-g-60">
            {abierto ? 'Ocultar' : 'Mostrar'}
            <Icon
              icon={abierto ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'}
              width="15"
              height="15"
              aria-hidden
            />
          </span>
        </span>
      </button>

      <div id={`${id}-campos`} hidden={!abierto} className="mt-4 border-t border-g-20 pt-4">
      <div className={`grid gap-4 ${esCompras ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2'}`}>
        <label htmlFor={`${id}-buscar`} className={ETIQUETA}>
          Buscar
          <input
            id={`${id}-buscar`}
            name="buscar"
            maxLength={120}
            placeholder={TEXTOS[modulo].buscar}
            className={`${CAMPO} mt-1`}
          />
        </label>

        <label htmlFor={`${id}-orden`} className={ETIQUETA}>
          Ordenar por
          <select id={`${id}-orden`} name="orden" className={`${CAMPO} mt-1`}>
            <option value="recientes">{esCompras ? 'Compra más reciente' : 'Comprado hace poco'}</option>
            <option value="antiguos">{esCompras ? 'Compra más antigua' : 'Comprado hace tiempo'}</option>
            {!esCompras && <option value="nombre">Nombre: A a Z</option>}
          </select>
        </label>

        {esCompras && (
          <>
            <label htmlFor={`${id}-estado`} className={ETIQUETA}>
              Estado del pago
              <select id={`${id}-estado`} name="estado" className={`${CAMPO} mt-1`}>
                <option value="todos">Todos</option>
                <option value="pagado">Pagadas</option>
                <option value="pendiente">Pendientes de pago</option>
              </select>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label htmlFor={`${id}-desde`} className={ETIQUETA}>
                Desde
                <input id={`${id}-desde`} name="desde" type="date" className={`${CAMPO} mt-1`} />
              </label>
              <label htmlFor={`${id}-hasta`} className={ETIQUETA}>
                Hasta
                <input id={`${id}-hasta`} name="hasta" type="date" className={`${CAMPO} mt-1`} />
              </label>
            </div>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-[12.5px] text-red-600">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 border-t border-g-20 pt-4 sm:flex-row sm:justify-end">
        <button
          type="submit"
          className="h-10 rounded-lg bg-primary px-5 text-[13px] font-medium text-white transition-colors hover:bg-marca-oscuro"
        >
          Aplicar filtros
        </button>
        <button
          type="button"
          onClick={limpiar}
          className="h-10 rounded-lg border border-g-20 bg-white px-4 text-[13px] font-medium text-g-60 transition-colors hover:border-primary hover:text-primary"
        >
          Limpiar
        </button>
      </div>
      </div>
    </form>
  );
}
