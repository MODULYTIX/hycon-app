export type ModoAcceso = 'login' | 'registro';

interface Props {
  modo: ModoAcceso;
  onCambiar: (modo: ModoAcceso) => void;
}

const PESTANAS: Array<{ modo: ModoAcceso; etiqueta: string }> = [
  { modo: 'login', etiqueta: 'Iniciar sesión' },
  { modo: 'registro', etiqueta: 'Crear cuenta' },
];

// Dos pestanas subrayadas: la activa marca su linea en el color del logo
export default function PestanasAcceso({ modo, onCambiar }: Props) {
  return (
    <div role="tablist" aria-label="Tipo de acceso" className="flex border-b border-g-20">
      {PESTANAS.map((pestana) => {
        const activa = pestana.modo === modo;
        return (
          <button
            key={pestana.modo}
            type="button"
            role="tab"
            aria-selected={activa}
            onClick={() => onCambiar(pestana.modo)}
            className={`-mb-px flex-1 border-b-2 pb-3 pt-1 text-[14.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marca ${
              activa ? 'border-marca text-marca' : 'border-transparent text-g-50 hover:text-g-80'
            }`}
          >
            {pestana.etiqueta}
          </button>
        );
      })}
    </div>
  );
}
