import type { FactorPostura, FormularioFichaErgonomica } from '@/features/software-ergonomico/tipos/ficha.tipos';
import {
  FACTORES_CARGAS,
  FACTORES_ESFUERZO,
  FACTORES_MOVIMIENTO,
  NOMBRES_POSTURAS_CORTOS,
} from './catalogoFactores';

interface Props {
  datos: FormularioFichaErgonomica;
}

interface ItemMarcado {
  id: string;
  grupo: string;
  titulo: string;
  minutos: number | null;
  supera: boolean;
}

const LIMITE_MINUTOS = 120;

function aItem(id: string, grupo: string, titulo: string, factor: FactorPostura): ItemMarcado | null {
  if (!factor.aplica) return null;
  const minutos = factor.duracionDiaria === '' ? null : Number(factor.duracionDiaria);
  return { id, grupo, titulo, minutos, supera: minutos !== null && minutos >= LIMITE_MINUTOS };
}

function recolectarMarcados(datos: FormularioFichaErgonomica): ItemMarcado[] {
  const items: Array<ItemMarcado | null> = [
    ...(Object.keys(NOMBRES_POSTURAS_CORTOS) as Array<keyof typeof NOMBRES_POSTURAS_CORTOS>).map((llave) =>
      aItem(`p-${llave}`, 'Postura', NOMBRES_POSTURAS_CORTOS[llave], datos.paso3[llave]),
    ),
    ...FACTORES_CARGAS.map(({ llave, corto }) => aItem(`c-${llave}`, 'Carga', corto, datos.paso4[llave])),
    ...FACTORES_ESFUERZO.map(({ llave, corto }) =>
      aItem(`e-${llave}`, 'Esfuerzo manos', corto, datos.paso5.esfuerzoManos[llave]),
    ),
    ...FACTORES_MOVIMIENTO.map(({ llave, corto }) =>
      aItem(`m-${llave}`, 'Mov. repetitivo', corto, datos.paso5.movimientosAltaFrecuencia[llave]),
    ),
  ];
  return items.filter((item): item is ItemMarcado => item !== null);
}

export default function PasoTareasEvaluar({ datos }: Props) {
  const marcados = recolectarMarcados(datos);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-g-90">6. Tareas a evaluar</h3>
        <p className="text-sm text-g-60">
          Condiciones marcadas en los pasos anteriores. En rojo, las que alcanzan o superan {LIMITE_MINUTOS} minutos.
        </p>
      </div>

      {marcados.length === 0 ? (
        <p className="text-sm text-g-50">No se marcó ninguna condición en los pasos 3, 4 y 5.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {marcados.map((item) => (
            <li
              key={item.id}
              className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${item.supera ? 'border-red-500 bg-red-50' : 'border-g-20 bg-white'}`}
            >
              <div className="flex min-w-0 flex-col">
                <span className="text-[11px] font-medium text-g-50">{item.grupo}</span>
                <span className="truncate text-sm font-medium text-g-90" title={item.titulo}>{item.titulo}</span>
              </div>
              <span className={`shrink-0 text-sm font-semibold ${item.supera ? 'text-red-700' : 'text-g-70'}`}>
                {item.minutos === null ? '—' : `${item.minutos} min`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
