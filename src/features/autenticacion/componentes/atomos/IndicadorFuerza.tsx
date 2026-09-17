import { Icon } from '@iconify/react';
import {
  calcularFuerzaPassword,
  requisitosPassword,
  type DatosPersonales,
} from '@/features/autenticacion/utilidades/politica-password';

const NIVELES = [
  { etiqueta: '', color: 'bg-g-20', texto: 'text-g-50' },
  { etiqueta: 'No cumple', color: 'bg-red-500', texto: 'text-red-600' },
  { etiqueta: 'Segura', color: 'bg-hy-verde', texto: 'text-[#2f7a3b]' },
  { etiqueta: 'Muy segura', color: 'bg-hy-verde', texto: 'text-[#2f7a3b]' },
];

// Barra de seguridad y lista de requisitos que se marcan mientras se escribe
export default function IndicadorFuerza({ valor, datos }: { valor: string; datos: DatosPersonales }) {
  const nivel = calcularFuerzaPassword(valor, datos);
  const requisitos = requisitosPassword(valor, datos);

  return (
    <div className="mt-2.5 rounded-lg border border-g-20 bg-g-5 px-3 py-2.5">
      {valor && (
        <div className="mb-2 flex items-center gap-3">
          <div className="flex flex-1 gap-1" aria-hidden>
            {[1, 2, 3].map((tramo) => (
              <span
                key={tramo}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  nivel >= tramo ? NIVELES[nivel].color : 'bg-g-20'
                }`}
              />
            ))}
          </div>
          <span className={`text-[12px] font-semibold ${NIVELES[nivel].texto}`}>{NIVELES[nivel].etiqueta}</span>
        </div>
      )}

      <ul aria-label="Requisitos de la contraseña" className="space-y-1">
        {requisitos.map((requisito) => (
          <li
            key={requisito.id}
            className={`flex items-center gap-1.5 text-[12.5px] ${requisito.cumple ? 'text-[#2f7a3b]' : 'text-g-50'}`}
          >
            <Icon
              icon={requisito.cumple ? 'solar:check-circle-bold' : 'solar:record-circle-linear'}
              width="15"
              height="15"
              aria-hidden
            />
            <span>
              {requisito.texto}
              <span className="sr-only">{requisito.cumple ? ': cumplido' : ': pendiente'}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
