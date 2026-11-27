import { useState, type CSSProperties } from 'react';
import EntradaBase from '@/shared/ui/atomos/EntradaBase';

const MAXIMO_API = 100000;
const ESCALA_INICIAL = 240;

export default function DuracionCatalogo() {
  const [maximo, setMaximo] = useState('');
  const sinLimite = maximo === '';
  // El último punto representa «Sin límite», fuera del rango de valores válidos.
  const [limite, setLimite] = useState(ESCALA_INICIAL + 1);
  const valor = sinLimite ? limite : Math.min(limite - 1, Math.max(0, Number(maximo)));
  const estilo = {
    '--rango-desde': '0%',
    '--rango-hasta': valor / limite * 100 + '%',
  } as CSSProperties;

  return (
    <fieldset>
      <legend>Duración máxima</legend>
      <div className="rango-precio" style={estilo}>
        <div className="rango-precio-pista" aria-hidden />
        <input type="range" min={0} max={limite} value={valor} step={1}
          aria-label="Deslizar duración máxima"
          aria-valuetext={sinLimite ? 'Sin límite' : `${valor} minutos`}
          onChange={evento => setMaximo(Number(evento.target.value) === limite ? '' : evento.target.value)} />
      </div>
      <label className="cursos-duracion-filtro">
        <span>Hasta</span>
        <EntradaBase aria-label="Duración máxima (minutos)" name="duracionMax" type="number"
          min={0} max={MAXIMO_API} step={1} placeholder="Sin límite" value={maximo}
          onChange={evento => {
            const texto = evento.target.value;
            setMaximo(texto);
            setLimite(Math.max(ESCALA_INICIAL, Math.min(MAXIMO_API, Math.ceil(Number(texto)))) + 1);
          }} />
        <span aria-hidden>min</span>
      </label>
    </fieldset>
  );
}
