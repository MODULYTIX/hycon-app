export type ModoAcceso = 'login' | 'registro';

interface Props {
  modo: ModoAcceso;
  onCambiar: (modo: ModoAcceso) => void;
}

const PESTANAS: Array<{ modo: ModoAcceso; etiqueta: string }> = [
  { modo: 'login', etiqueta: 'Iniciar sesion' },
  { modo: 'registro', etiqueta: 'Crear cuenta' },
];

// Reutiliza el mismo lenguaje visual que las pestanas del formulario de contacto
export default function PestanasAcceso({ modo, onCambiar }: Props) {
  return (
    <div className="flex" role="tablist" aria-label="Tipo de acceso">
      {PESTANAS.map((pestana, indice) => {
        const activa = pestana.modo === modo;
        return (
          <button
            key={pestana.modo}
            type="button"
            role="tab"
            aria-selected={activa}
            onClick={() => onCambiar(pestana.modo)}
            className={`flex-1 py-2 font-semibold shadow-lg transition-all duration-300 ease-in-out
              ${indice === 0 ? 'rounded-l-lg' : ''}
              ${indice === PESTANAS.length - 1 ? 'rounded-r-lg' : ''}
              ${activa ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {pestana.etiqueta}
          </button>
        );
      })}
    </div>
  );
}
