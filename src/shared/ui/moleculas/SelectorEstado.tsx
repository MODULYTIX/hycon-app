type Estado = 'active' | 'inactive';

export type OpcionEstado = { valor: Estado; etiqueta: string; detalle: string };

const OPCIONES: OpcionEstado[] = [
  { valor: 'active', etiqueta: 'Activo', detalle: 'Visible en la web' },
  { valor: 'inactive', etiqueta: 'Inactivo', detalle: 'Oculto al publico' },
];

// Interruptor de dos posiciones para publicar u ocultar un registro
export default function SelectorEstado({
  nombre,
  valor,
  onCambiar,
  opciones = OPCIONES,
}: {
  nombre: string;
  valor: Estado;
  onCambiar: (valor: Estado) => void;
  // Textos propios, por ejemplo Publicado / Borrador en los articulos
  opciones?: OpcionEstado[];
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-[13px] font-semibold text-hy-tinta">Estado</legend>
      <div className="grid grid-cols-2 gap-1 rounded-lg border border-hy-20 bg-hy-5 p-1">
        {opciones.map((opcion) => {
          const marcado = valor === opcion.valor;
          return (
            <label
              key={opcion.valor}
              className={`flex cursor-pointer flex-col rounded-md px-3 py-1.5 transition-colors has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-hy-60 ${
                marcado ? 'bg-white shadow-sm' : 'hover:bg-white/60'
              }`}
            >
              <input
                type="radio"
                name={nombre}
                value={opcion.valor}
                checked={marcado}
                onChange={() => onCambiar(opcion.valor)}
                className="sr-only"
              />
              <span className="flex items-center gap-1.5 text-[14px] font-semibold text-hy-tinta">
                <span
                  aria-hidden
                  className={`h-2 w-2 rounded-full ${
                    opcion.valor === 'active' ? 'bg-hy-verde' : 'bg-g-40'
                  } ${marcado ? '' : 'opacity-40'}`}
                />
                {opcion.etiqueta}
              </span>
              <span className="text-[12px] text-g-50">{opcion.detalle}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
