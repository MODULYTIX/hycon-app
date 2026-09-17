export type ModoAcceso = 'login' | 'registro';

interface Props {
  modo: ModoAcceso;
  onCambiar: (modo: ModoAcceso) => void;
}

const PESTANAS: Array<{ modo: ModoAcceso; etiqueta: string }> = [
  { modo: 'login', etiqueta: 'Iniciar sesión' },
  { modo: 'registro', etiqueta: 'Crear cuenta' },
];

// Control segmentado: la pestana activa se levanta sobre un fondo suave
export default function PestanasAcceso({ modo, onCambiar }: Props) {
  return (
    <div role="tablist" aria-label="Tipo de acceso" className="grid grid-cols-2 gap-1 rounded-xl bg-g-10 p-1">
      {PESTANAS.map((pestana) => {
        const activa = pestana.modo === modo;
        return (
          <button
            key={pestana.modo}
            type="button"
            role="tab"
            aria-selected={activa}
            onClick={() => onCambiar(pestana.modo)}
            className={`h-10 rounded-lg text-[14px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-marca ${
              activa ? 'bg-white text-marca shadow-sm' : 'text-g-50 hover:text-g-80'
            }`}
          >
            {pestana.etiqueta}
          </button>
        );
      })}
    </div>
  );
}
