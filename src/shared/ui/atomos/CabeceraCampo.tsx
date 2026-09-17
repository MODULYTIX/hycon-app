// Etiqueta del campo con la marca "Opcional" a la derecha.
// La marca queda fuera del <label> para que el nombre accesible sea solo la etiqueta.
export default function CabeceraCampo({
  htmlFor,
  etiqueta,
  opcional,
}: {
  htmlFor?: string;
  etiqueta: string;
  opcional?: boolean;
}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-[13px] font-semibold text-hy-tinta">
          {etiqueta}
        </label>
      ) : (
        <span className="text-[13px] font-semibold text-hy-tinta">{etiqueta}</span>
      )}
      {opcional && <span className="text-[12px] text-g-40">Opcional</span>}
    </div>
  );
}
