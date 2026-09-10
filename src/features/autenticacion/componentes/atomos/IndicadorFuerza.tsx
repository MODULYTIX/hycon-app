import { calcularFuerzaPassword } from '@/features/autenticacion/utilidades/validaciones';

const ETIQUETAS = ['', 'Debil', 'Aceptable', 'Fuerte'];
const COLORES = ['bg-g-20', 'bg-red-400', 'bg-y-40', 'bg-green-500'];

// Barra de fortaleza de la contrasena en el formulario de registro
export default function IndicadorFuerza({ valor }: { valor: string }) {
  const nivel = calcularFuerzaPassword(valor);

  if (!valor) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1" aria-hidden>
        {[1, 2, 3].map((tramo) => (
          <span
            key={tramo}
            className={`h-1 flex-1 rounded-full transition-colors ${
              nivel >= tramo ? COLORES[nivel] : 'bg-g-20'
            }`}
          />
        ))}
      </div>
      <p className="mt-1 text-[12px] text-g-50">
        Seguridad de la contrasena: <span className="font-medium">{ETIQUETAS[nivel]}</span>
      </p>
    </div>
  );
}
