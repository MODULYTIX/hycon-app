import { useState, type CSSProperties } from 'react';

export default function PrecioCatalogo({ minimo, maximo }: { minimo?: number; maximo?: number }) {
  const [desde, setDesde] = useState(minimo === undefined ? '' : String(minimo));
  const [hasta, setHasta] = useState(maximo === undefined ? '' : String(maximo));
  const limite = Math.max(1000, Math.ceil((maximo ?? 0) / 100) * 100 + 100, Math.ceil((minimo ?? 0) / 100) * 100 + 100);
  const inferior = Math.max(0, Math.min(Number(desde) || 0, limite));
  const superior = hasta === '' ? limite : Math.max(0, Math.min(Number(hasta) || 0, limite));
  const estilo = {
    '--rango-desde': Math.min(inferior, superior) / limite * 100 + '%',
    '--rango-hasta': superior / limite * 100 + '%',
  } as CSSProperties;

  return (
    <fieldset>
      <legend>Filtrar por precio (S/)</legend>
      <div className="rango-precio" style={estilo}>
        <div className="rango-precio-pista" aria-hidden />
        <input type="range" min="0" max={limite} value={inferior} step="0.01" aria-label="Deslizar precio mínimo"
          style={{ zIndex: inferior > limite / 2 ? 4 : 2 }}
          onChange={evento => setDesde(String(Math.min(Number(evento.target.value), superior)))} />
        <input type="range" min="0" max={limite} value={superior} step="0.01" aria-label="Deslizar precio máximo"
          aria-valuetext={hasta === '' ? 'Sin límite' : undefined} style={{ zIndex: 3 }}
          onChange={evento => {
            const valor = Math.max(Number(evento.target.value), inferior);
            setHasta(valor === limite ? '' : String(valor));
          }} />
      </div>
      <div className="productos-precio-rango">
        <span>Precio</span>
        <label><span className="sr-only">Desde</span>S/ <input type="number" aria-label="Desde" name="precioMin" min="0" step="0.01" value={desde}
          onChange={evento => setDesde(evento.target.value)} placeholder="0" /></label>
        <span aria-hidden>–</span>
        <label><span className="sr-only">Hasta</span><input type="number" aria-label="Hasta" name="precioMax" min="0" step="0.01" value={hasta}
          onChange={evento => setHasta(evento.target.value)} placeholder="Sin límite" /></label>
      </div>
    </fieldset>
  );
}
