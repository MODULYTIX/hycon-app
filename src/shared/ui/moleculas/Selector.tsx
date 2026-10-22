import { useEffect, useId, useLayoutEffect, useRef, useState, type AriaAttributes, type FocusEventHandler } from 'react';
import '../controles.css';

export interface OpcionSelector {
  valor: string;
  etiqueta: string;
  descripcion?: string;
  deshabilitada?: boolean;
}

interface Props extends AriaAttributes {
  id?: string;
  name?: string;
  opciones: readonly OpcionSelector[];
  value?: string;
  defaultValue?: string;
  onChange?: (valor: string) => void;
  onBlur?: FocusEventHandler<HTMLButtonElement>;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const normalizar = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();

/** Selector con lista diseñada por Hycon. El popover usa la capa superior del
 * navegador para no quedar recortado por el scroll de un modal o diálogo nativo. */
export default function Selector({ id, name, opciones, value, defaultValue, onChange, onBlur,
  placeholder, disabled, required, className = '', ...aria }: Props) {
  const generado = useId();
  const listaId = `${id || generado}-opciones`;
  const boton = useRef<HTMLButtonElement>(null);
  const lista = useRef<HTMLDivElement>(null);
  const [local, setLocal] = useState(defaultValue ?? opciones[0]?.valor ?? '');
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);
  const busqueda = useRef({ texto: '', tiempo: 0 });
  const valor = value ?? local;
  const seleccionado = opciones.findIndex(o => o.valor === valor);
  const etiqueta = (valor === '' && placeholder) || opciones[seleccionado]?.etiqueta || placeholder || 'Selecciona una opción';
  const habilitados = opciones.map((o, i) => !o.deshabilitada ? i : -1).filter(i => i !== -1);
  const cerrado = () => { setAbierto(false); busqueda.current = { texto: '', tiempo: 0 }; };

  const abrir = (indice = seleccionado) => {
    if (boton.current?.matches(':disabled') || !habilitados.length) return;
    setActivo(habilitados.includes(indice) ? indice : habilitados[0]);
    setAbierto(true);
  };
  const escoger = (indice: number) => {
    const opcion = opciones[indice];
    if (!opcion || opcion.deshabilitada || boton.current?.matches(':disabled')) return;
    if (value === undefined) setLocal(opcion.valor);
    onChange?.(opcion.valor);
    cerrado();
    boton.current?.focus({ preventScroll: true });
  };

  useLayoutEffect(() => {
    const menu = lista.current;
    const trigger = boton.current;
    if (!menu || !trigger || !abierto) return;
    // Un popover, a diferencia de un portal al body, sigue dentro del ámbito
    // accesible y de foco del dialog que contiene el selector.
    menu.showPopover?.();
    const posicionar = () => {
      const r = trigger.getBoundingClientRect();
      const margen = 8;
      const vista = window.visualViewport;
      const alto = vista?.height ?? window.innerHeight;
      const ancho = vista?.width ?? window.innerWidth;
      const inicioY = vista?.offsetTop ?? 0;
      const inicioX = vista?.offsetLeft ?? 0;
      const debajo = inicioY + alto - r.bottom - margen - 6;
      const encima = r.top - inicioY - margen - 6;
      const haciaArriba = debajo < Math.min(224, opciones.length * 44 + 12) && encima > debajo;
      const maximo = Math.max(0, Math.min(272, haciaArriba ? encima : debajo));
      const anchura = Math.min(r.width, ancho - margen * 2);
      menu.style.width = `${anchura}px`;
      menu.style.maxHeight = `${maximo}px`;
      menu.style.left = `${Math.max(inicioX + margen, Math.min(r.left, inicioX + ancho - margen - anchura))}px`;
      menu.style.top = `${haciaArriba ? r.top - 6 - Math.min(menu.scrollHeight, maximo) : r.bottom + 6}px`;
      menu.dataset.lado = haciaArriba ? 'arriba' : 'abajo';
    };
    posicionar();
    const observar = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(posicionar) : null;
    observar?.observe(trigger);
    window.addEventListener('resize', posicionar);
    window.visualViewport?.addEventListener('resize', posicionar);
    window.visualViewport?.addEventListener('scroll', posicionar);
    const alDesplazar = (e: Event) => {
      if (e.target instanceof Node && menu.contains(e.target)) return;
      posicionar();
    };
    document.addEventListener('scroll', alDesplazar, true);
    return () => {
      menu.hidePopover?.();
      observar?.disconnect();
      window.removeEventListener('resize', posicionar);
      window.visualViewport?.removeEventListener('resize', posicionar);
      window.visualViewport?.removeEventListener('scroll', posicionar);
      document.removeEventListener('scroll', alDesplazar, true);
    };
  }, [abierto, opciones]);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => {
      if (e.target instanceof Node && !lista.current?.contains(e.target) && !boton.current?.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('pointerdown', fuera, true);
    return () => document.removeEventListener('pointerdown', fuera, true);
  }, [abierto]);

  useLayoutEffect(() => {
    if (abierto && activo >= 0) lista.current?.querySelector<HTMLElement>(`[data-indice="${activo}"]`)?.scrollIntoView?.({ block: 'nearest' });
  }, [abierto, activo]);

  useEffect(() => {
    const form = boton.current?.form;
    if (!form) return;
    const restablecer = () => {
      if (value === undefined) setLocal(defaultValue ?? opciones[0]?.valor ?? '');
      setAbierto(false);
    };
    form.addEventListener('reset', restablecer);
    return () => form.removeEventListener('reset', restablecer);
  }, [value, defaultValue, opciones]);

  return <span className={`hy-select ${className}`}>
    <button {...aria} id={id} ref={boton} type="button" role="combobox" disabled={disabled}
      className="hy-select-trigger" data-placeholder={valor === '' && !!placeholder || undefined}
      aria-haspopup="listbox" aria-expanded={abierto} aria-controls={listaId} aria-required={required || undefined}
      aria-activedescendant={abierto && activo >= 0 ? `${listaId}-${activo}` : undefined}
      onClick={() => abierto ? cerrado() : abrir()}
      onBlur={e => { cerrado(); onBlur?.(e); }}
      onKeyDown={e => {
        if (e.key === 'Escape' && abierto) { e.preventDefault(); e.stopPropagation(); cerrado(); return; }
        if (e.key === 'Tab') { cerrado(); return; }
        if (e.key === 'Enter' || e.key === ' ') {
          // El espacio dentro de una búsqueda forma parte de la etiqueta.
          if (e.key === ' ' && busqueda.current.texto && abierto && Date.now() - busqueda.current.tiempo <= 700) { e.preventDefault(); busqueda.current.texto += ' '; busqueda.current.tiempo = Date.now(); return; }
          e.preventDefault(); if (abierto) escoger(activo); else abrir(); return;
        }
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
          e.preventDefault();
          if (e.key === 'Home' || e.key === 'End') {
            const indice = e.key === 'Home' ? habilitados[0] : habilitados[habilitados.length - 1];
            if (indice !== undefined) { setActivo(indice); abrir(indice); }
          } else if (!abierto) abrir();
          else if (habilitados.length) {
            const posicion = habilitados.indexOf(activo);
            const siguiente = (posicion + (e.key === 'ArrowDown' ? 1 : -1) + habilitados.length) % habilitados.length;
            setActivo(habilitados[siguiente]);
          }
          return;
        }
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          const ahora = Date.now();
          const texto = ahora - busqueda.current.tiempo > 700 ? e.key : busqueda.current.texto + e.key;
          busqueda.current = { texto, tiempo: ahora };
          const indice = habilitados.find(i => normalizar(opciones[i].etiqueta).startsWith(normalizar(texto)));
          if (indice !== undefined) abrir(indice);
        }
      }}>
      <span className="hy-select-value">{etiqueta}</span>
      <svg className="hy-select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
    {name && <input type="hidden" name={name} value={valor} disabled={disabled} />}
    {abierto && <div ref={lista} id={listaId} role="listbox" popover={typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype ? 'manual' : undefined} className="hy-select-menu"
      aria-label={aria['aria-label']} aria-labelledby={aria['aria-labelledby']}
      onPointerDown={e => e.preventDefault()}>
      {opciones.map((o, i) => <div id={`${listaId}-${i}`} key={o.valor} role="option" aria-selected={o.valor === valor}
        aria-disabled={o.deshabilitada || undefined} data-indice={i} data-activo={i === activo || undefined}
        className="hy-select-option" onPointerMove={() => { if (!o.deshabilitada) setActivo(i); }} onClick={e => { e.preventDefault(); e.stopPropagation(); escoger(i); }}>
        <span><span className="hy-select-option-label">{o.etiqueta}</span>{o.descripcion && <span className="hy-select-option-description">{o.descripcion}</span>}</span>
        {o.valor === valor && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </div>)}
    </div>}
  </span>;
}
