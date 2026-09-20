import { useState } from 'react';
import CabeceraPagina from '@/shared/ui/plantillas/CabeceraPagina';
import Modal from '@/shared/ui/organismos/Modal';
import ModalRegistroFicha from '../componentes/organismos/fichas/ModalRegistroFicha';
import ModalListaFichas from '../componentes/organismos/fichas/ModalListaFichas';
import { Icon } from '@iconify/react';

export default function PaginaRegistroEmpresa() {
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalFichaAbierto, setModalFichaAbierto] = useState(false);
  const [modalFichasAbierto, setModalFichasAbierto] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<{ id: string; nombre: string } | null>(null);
  const [empresas, setEmpresas] = useState<{ id: string; nombre: string; fecha: string }[]>([]);

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Guardamos temporalmente en el estado local hasta conectar el endpoint
    const nuevaEmpresa = {
      id: crypto.randomUUID(),
      nombre: nombreEmpresa,
      fecha: new Date().toLocaleDateString()
    };
    
    setEmpresas([...empresas, nuevaEmpresa]);
    setModalAbierto(false);
    setNombreEmpresa('');
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <CabeceraPagina 
          titulo="Software Ergonómico" 
          descripcion="Gestiona tus empresas y crea fichas de evaluación." 
        />
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
        >
          <Icon icon="solar:add-circle-bold" width="20" height="20" />
          Registrar Empresa
        </button>
      </div>

      <div className="flex w-full flex-col gap-4">
        <h2 className="text-xl font-bold text-g-90">Mis Empresas</h2>
        
        {empresas.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-g-30 bg-g-10 text-center">
            <p className="text-sm font-medium text-g-70">Aún no tienes empresas registradas.</p>
            <p className="mt-1 text-sm text-g-50">Haz clic en el botón superior para agregar una.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {empresas.map((empresa) => (
              <div 
                key={empresa.id} 
                className="flex flex-col justify-between rounded-xl bg-white p-5 shadow-sm ring-1 ring-g-20 transition-shadow hover:shadow-md"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-g-90">{empresa.nombre}</h3>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-g-10 text-g-60 transition-colors hover:bg-g-20 hover:text-primary cursor-pointer">
                      <Icon icon="solar:folder-with-files-bold-duotone" width="18" height="18" />
                    </span>
                  </div>
                  <p className="text-xs text-g-50">Creada el {empresa.fecha}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => setModalFichaAbierto(true)}
                    className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                  >
                    Nueva Ficha
                  </button>
                  <button 
                    onClick={() => {
                      setEmpresaSeleccionada(empresa);
                      setModalFichasAbierto(true);
                    }}
                    className="w-full rounded-lg bg-g-10 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    Ver Fichas
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        idTitulo="modal-registro-empresa"
        ancho="max-w-[480px]"
        protegido={nombreEmpresa.length > 0}
      >
        <div className="p-6 sm:p-8">
          <h2 id="modal-registro-empresa" className="mb-6 text-2xl font-bold text-g-90">
            Registrar Nueva Empresa
          </h2>
          <form onSubmit={manejarEnvio} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="nombre-empresa" className="text-sm font-medium text-g-80">
                Nombre de la Empresa
              </label>
              <input
                id="nombre-empresa"
                type="text"
                value={nombreEmpresa}
                onChange={(e) => setNombreEmpresa(e.target.value)}
                placeholder="Ej. Mi Empresa S.A.C."
                className="rounded-lg border border-g-30 px-3 py-2.5 text-sm text-g-90 placeholder-g-50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            
            <div className="mt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-g-70 transition-colors hover:bg-g-10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
              >
                Registrar
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <ModalRegistroFicha 
        abierto={modalFichaAbierto}
        onCerrar={() => setModalFichaAbierto(false)}
      />

      <ModalListaFichas 
        abierto={modalFichasAbierto}
        onCerrar={() => setModalFichasAbierto(false)}
        empresaSeleccionada={empresaSeleccionada}
      />
    </div>
  );
}
