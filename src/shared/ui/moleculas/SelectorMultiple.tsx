import { Icon } from '@iconify/react';

interface Opcion {
  valor: string;
  etiqueta: string;
}

interface Props {
  leyenda: string;
  opciones: Opcion[];
  seleccionados: string[];
  onCambiar: (seleccionados: string[]) => void;
  ayuda?: string;
  cargando?: boolean;
  error?: string | null;
}

// Grupo de casillas con aspecto de fichas: cada ficha se marca o desmarca al pulsarla
export default function SelectorMultiple({
  leyenda,
  opciones,
  seleccionados,
  onCambiar,
  ayuda,
  cargando,
  error,
}: Props) {
  const alternar = (valor: string) => {
    onCambiar(
      seleccionados.includes(valor)
        ? seleccionados.filter((actual) => actual !== valor)
        : // Se respeta el orden de las opciones, no el de los clics
          opciones.map((opcion) => opcion.valor).filter((v) => v === valor || seleccionados.includes(v))
    );
  };

  return (
    <fieldset>
      <legend className="mb-1 text-[13px] font-semibold text-hy-tinta">{leyenda}</legend>
      {ayuda && <p className="mb-2.5 text-[12.5px] text-g-50">{ayuda}</p>}

      {cargando && <p className="text-[13px] text-g-50">Cargando opciones...</p>}
      {error && (
        <p role="alert" className="text-[13px] text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {opciones.map((opcion) => {
          const marcado = seleccionados.includes(opcion.valor);
          return (
            <label
              key={opcion.valor}
              className={`inline-flex h-9 cursor-pointer select-none items-center gap-1.5 rounded-full border px-3.5 text-[14px] font-medium transition-colors has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-hy-60 ${
                marcado
                  ? 'border-hy-60 bg-hy-60 text-white'
                  : 'border-hy-20 bg-white text-hy-80 hover:border-hy-40 hover:bg-hy-5'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={marcado}
                onChange={() => alternar(opcion.valor)}
              />
              <Icon
                icon={marcado ? 'solar:check-circle-bold' : 'solar:add-circle-linear'}
                width="16"
                height="16"
                aria-hidden
              />
              {opcion.etiqueta}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
