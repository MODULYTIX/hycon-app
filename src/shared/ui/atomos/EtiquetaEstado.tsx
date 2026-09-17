// Distintivo de estado en los listados del panel
export default function EtiquetaEstado({
  estado,
  textos = { activo: 'Activo', inactivo: 'Inactivo' },
}: {
  estado: string;
  textos?: { activo: string; inactivo: string };
}) {
  const activo = estado === 'active';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${
        activo ? 'bg-hy-verde/10 text-[#2f7a3b]' : 'bg-g-10 text-g-50'
      }`}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${activo ? 'bg-hy-verde' : 'bg-g-40'}`}
      />
      {activo ? textos.activo : textos.inactivo}
    </span>
  );
}
