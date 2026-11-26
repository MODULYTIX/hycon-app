import type { Pestana } from '@/features/aprendizaje/utilidades/panel-aprendizaje';

const PESTANAS: [Pestana, string][] = [
  ['todos', 'Todos'],
  ['en-curso', 'En curso'],
  ['terminados', 'Terminados'],
];

interface Props {
  activa: Pestana;
  onElegir: (pestana: Pestana) => void;
  cuantos: Record<Pestana, number>;
}

/** Las tres vistas de la lista. El conteo sale de los cursos ya cargados. */
export default function PestanasAprendizaje({ activa, onElegir, cuantos }: Props) {
  return (
    <div role="tablist" aria-label="Estado de mis cursos" className="flex gap-1 border-b border-g-20">
      {PESTANAS.map(([clave, etiqueta]) => {
        const seleccionada = clave === activa;
        return (
          <button
            key={clave}
            type="button"
            role="tab"
            aria-selected={seleccionada}
            onClick={() => onElegir(clave)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-[13.5px] font-medium transition-colors ${
              seleccionada
                ? 'border-primary text-primary'
                : 'border-transparent text-g-50 hover:text-g-80'
            }`}
          >
            {etiqueta}
            <span className="ml-1.5 text-[12px] text-g-40">{cuantos[clave]}</span>
          </button>
        );
      })}
    </div>
  );
}
