// Distintivo de estado en los listados del panel
export default function EtiquetaEstado({ estado }: { estado: string }) {
  const activo = estado === 'active';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
        activo ? 'bg-green-50 text-green-700' : 'bg-g-10 text-g-50'
      }`}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${activo ? 'bg-green-500' : 'bg-g-40'}`}
      />
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}
