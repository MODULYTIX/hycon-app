import Modal from '@/shared/ui/organismos/Modal';
import { Icon } from '@iconify/react';
import { useState } from 'react';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  empresaSeleccionada: { id: string; nombre: string } | null;
}

export default function ModalListaFichas({ abierto, onCerrar, empresaSeleccionada }: Props) {
  // Datos de prueba temporales para visualizar la lista
  const [fichas] = useState([
    { id: '1', nombre: 'Ficha Evaluación Puesto A', fecha: '20/9/2026', estado: 'Completado' },
    { id: '2', nombre: 'Ficha Evaluación Puesto B', fecha: '21/9/2026', estado: 'En progreso' },
  ]);

  if (!empresaSeleccionada) return null;

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      idTitulo="modal-lista-fichas"
      ancho="max-w-[800px]"
    >
      <div className="p-6 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-lista-fichas" className="text-2xl font-bold text-g-90">
              Fichas de Evaluación
            </h2>
            <p className="mt-1 text-sm text-g-50">
              Empresa: <span className="font-semibold text-g-90">{empresaSeleccionada.nombre}</span>
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-g-10 text-g-60 transition-colors hover:bg-g-20 hover:text-g-90"
          >
            <Icon icon="solar:close-circle-bold-duotone" width="24" height="24" />
          </button>
        </div>

        <div className="flex w-full flex-col gap-4">
          {fichas.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-g-30 bg-g-10 text-center">
              <p className="text-sm font-medium text-g-70">Aún no hay fichas creadas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-g-20">
              <table className="w-full text-left text-sm text-g-70">
                <thead className="bg-g-10 text-xs uppercase text-g-60">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-semibold">Nombre de la Ficha</th>
                    <th scope="col" className="px-6 py-3 font-semibold">Fecha</th>
                    <th scope="col" className="px-6 py-3 font-semibold">Estado</th>
                    <th scope="col" className="px-6 py-3 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-g-20 bg-white">
                  {fichas.map((ficha) => (
                    <tr key={ficha.id} className="transition-colors hover:bg-g-10/50">
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-g-90">
                        {ficha.nombre}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {ficha.fecha}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          ficha.estado === 'Completado' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            ficha.estado === 'Completado' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}></span>
                          {ficha.estado}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <button className="text-sm font-medium text-primary transition-colors hover:text-primary-600 hover:underline">
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
