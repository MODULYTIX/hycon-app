import EntradaBase from '@/shared/ui/atomos/EntradaBase';
import Selector from '@/shared/ui/moleculas/Selector';
import { useId, useState, type FormEvent } from 'react';
import RangoPrecio from '@/shared/ui/moleculas/RangoPrecio';
import { Icon } from '@iconify/react';
import type { FiltrosListado as Valores } from '@/shared/utilidades/filtros-listado';

type Modulo = 'productos' | 'cursos' | 'publicaciones';
interface Props { modulo: Modulo; admin?: boolean; onAplicar: (filtros: Valores) => void; }
export default function FiltrosListado({ modulo, admin = false, onAplicar }: Props) {
  const id = useId();
  const [abierto, setAbierto] = useState(!admin);
  const [error, setError] = useState<string | null>(null);
  const [activos, setActivos] = useState(false);
  const [version, setVersion] = useState(0);
  const aplicar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const valores: Record<string, string | number> = {};
    for (const [campo, valor] of datos) {
      const texto = String(valor).trim();
      if (!texto || (campo === 'orden' && texto === 'recientes') || (campo === 'estado' && texto === 'todos')) continue;
      valores[campo] = ['precioMin', 'precioMax', 'duracionMax'].includes(campo) ? Number(texto) : texto;
    }
    if (valores.precioMin !== undefined && valores.precioMax !== undefined && Number(valores.precioMin) > Number(valores.precioMax)) {
      setError('El precio mínimo no puede superar el máximo.'); return;
    }
    if (valores.desde && valores.hasta && valores.desde > valores.hasta) {
      setError('La fecha inicial no puede superar la final.'); return;
    }
    setError(null); setActivos(Object.keys(valores).length > 0);
    onAplicar(valores as Valores);
  };
  return (
    <form key={version} onSubmit={aplicar} aria-label={`Filtros de ${modulo}`} className={admin ? "filtros-admin mb-5 rounded-xl border border-g-20 bg-white p-4 shadow-sm" : "filtros-lateral rounded-xl border border-g-20 bg-white p-4"}>
      <div className={abierto ? "mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-g-20 pb-3" : "flex flex-wrap items-center justify-between gap-2"}>
        {admin ? <button type="button" aria-expanded={abierto} aria-controls={`${id}-contenido`} onClick={() => setAbierto((valor) => !valor)} className="flex min-h-10 min-w-0 flex-1 items-center justify-between gap-3 rounded-lg text-left text-[13px] font-semibold text-g-80 focus-visible:outline-2 focus-visible:outline-primary">
          <span className="inline-flex items-center gap-2"><Icon icon="solar:filter-linear" width="16" aria-hidden />Filtrar {modulo}</span>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-md bg-hy-5 px-2.5 py-1.5 text-[12px] font-medium text-primary">{abierto ? 'Ocultar' : 'Mostrar'}<Icon icon={abierto ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'} width="16" aria-hidden /></span>
        </button> : <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-g-80"><Icon icon="solar:filter-linear" width="16" aria-hidden />Filtrar {modulo}</span>}
        {activos && <span className="rounded-full bg-hy-5 px-2 py-1 text-[10px] text-primary" role="status">Filtros aplicados</span>}
      </div>
      <div id={`${id}-contenido`} hidden={!abierto}>
      <div className={admin ? "filtros-campos grid gap-4 sm:grid-cols-2 xl:grid-cols-4" : "filtros-campos flex flex-col gap-5"}>
        <label htmlFor={`${id}-buscar`} className="text-[12px] font-medium text-g-60">Buscar
          <EntradaBase id={`${id}-buscar`} name="buscar" maxLength={120} placeholder={modulo === 'publicaciones' ? 'Título o contenido' : 'Nombre o descripción'} className="mt-1" />
        </label>
        <label htmlFor={`${id}-orden`} className="text-[12px] font-medium text-g-60">Ordenar por
          <Selector id={`${id}-orden`} name="orden" aria-label="Ordenar por" className="mt-1" opciones={[{ valor: 'recientes', etiqueta: 'Más recientes' }, { valor: 'antiguos', etiqueta: 'Más antiguos' }, ...(modulo === 'publicaciones' ? [{ valor: 'leidos', etiqueta: 'Más leídos' }, { valor: 'titulo', etiqueta: 'Título: A a Z' }] : [{ valor: 'nombre', etiqueta: 'Nombre: A a Z' }, { valor: 'precio-asc', etiqueta: 'Precio de lista: menor a mayor' }, { valor: 'precio-desc', etiqueta: 'Precio de lista: mayor a menor' }])]} />
        </label>
        {modulo !== 'publicaciones' && <div className={admin ? 'sm:col-span-2 xl:col-span-2' : ''}><RangoPrecio /></div>}
        {modulo === 'productos' && <label htmlFor={`${id}-stock`} className="text-[12px] font-medium text-g-60">Disponibilidad
          <Selector id={`${id}-stock`} name="stock" aria-label="Disponibilidad" className="mt-1" opciones={[{ valor: '', etiqueta: 'Todos' }, { valor: 'disponible', etiqueta: 'Con stock' }, { valor: 'agotado', etiqueta: 'Sin stock' }]} />
        </label>}
        {modulo === 'cursos' && <label htmlFor={`${id}-duracion`} className="text-[12px] font-medium text-g-60">Duración máxima (minutos)
          <EntradaBase id={`${id}-duracion`} name="duracionMax" type="number" min="1" max="100000" step="1" placeholder="Sin límite" className="mt-1" />
        </label>}
        {modulo === 'publicaciones' && <>
          <label htmlFor={`${id}-desde`} className="text-[12px] font-medium text-g-60">Publicado desde<EntradaBase id={`${id}-desde`} name="desde" type="date" className="mt-1" /></label>
          <label htmlFor={`${id}-hasta`} className="text-[12px] font-medium text-g-60">Publicado hasta<EntradaBase id={`${id}-hasta`} name="hasta" type="date" className="mt-1" /></label>
        </>}
        {admin && <label htmlFor={`${id}-estado`} className="text-[12px] font-medium text-g-60">Estado
          <Selector id={`${id}-estado`} name="estado" aria-label="Estado" className="mt-1" opciones={[{ valor: 'todos', etiqueta: 'Todos los estados' }, { valor: 'active', etiqueta: 'Activos / publicados' }, { valor: 'inactive', etiqueta: 'Inactivos / borradores' }]} />
        </label>}
        <div className={admin ? "flex flex-col sm:flex-row items-stretch sm:items-end justify-end gap-2 sm:col-span-2 xl:col-span-4 border-t border-g-20 pt-4" : "flex flex-col gap-2 border-t border-g-20 pt-4"}>
          <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-[12px] font-medium text-white hover:bg-marca-oscuro">Aplicar filtros</button>
          <button type="button" onClick={() => { setVersion((v) => v + 1); setError(null); setActivos(false); onAplicar({}); }} className="h-10 rounded-lg border border-g-20 bg-white px-3 text-[12px] text-g-60 hover:text-primary">Limpiar</button>
        </div>
      </div>
      </div>
      {error && <p role="alert" className="mt-3 text-[12px] text-red-600">{error}</p>}
    </form>
  );
}
