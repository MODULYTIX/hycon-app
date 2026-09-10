// Indicador de carga en linea para botones en estado "enviando"
export default function Cargador({ etiqueta = 'Cargando' }: { etiqueta?: string }) {
  return (
    <span
      role="status"
      aria-label={etiqueta}
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
    />
  );
}
