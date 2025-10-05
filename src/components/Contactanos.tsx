import { useState, type FormEvent, type ChangeEvent } from 'react';
import Tittle from '../shared/components/Tittle';
import ContactanosPeople from '../assets/images/contacanos_people.webp';
import { Icon } from '@iconify/react';
import type { HyconPayload } from '../services/hycon/enviarCorreo.type';
import { enviarCorreo } from '../services/hycon/enviarCorreo.api';

type Field = {
  key: string;
  label: string;
  type: string;
  placeholder: string;
  full: boolean;
};

type RowField = {
  key: string;
  label: string;
  type: string;
  placeholder: string;
};

type Tab = 'ECOMMERCE' | 'REPARTIDOR';

type FormStructure = {
  [K in Tab]: (
    | Field
    | {
        row: RowField[];
      }
  )[];
};

const formFields: FormStructure = {
  ECOMMERCE: [
    {
      key: 'empresa',
      label: 'Nombre de la Empresa',
      type: 'text',
      placeholder: 'Nombre de la Empresa',
      full: true,
    },
    {
      key: 'solicitante',
      label: 'Nombre del Solicitante',
      type: 'text',
      placeholder: 'Nombre del Solicitante',
      full: true,
    },
    {
      row: [
        {
          key: 'telefono',
          label: 'Teléfono',
          type: 'text',
          placeholder: 'Teléfono',
        },
        { key: 'ciudad', label: 'Ciudad', type: 'text', placeholder: 'Ciudad' },
      ],
    },
    {
      key: 'email',
      label: 'E-mail',
      type: 'email',
      placeholder: 'E-mail',
      full: true,
    },
  ],
  REPARTIDOR: [
    {
      key: 'nombre',
      label: 'Nombre y Apellido completo',
      type: 'text',
      placeholder: 'Nombre y apellido completo',
      full: true,
    },
    {
      row: [
        { key: 'dni', label: 'DNI', type: 'text', placeholder: 'DNI' },
        {
          key: 'telefono',
          label: 'Teléfono',
          type: 'text',
          placeholder: 'Teléfono',
        },
      ],
    },
    {
      key: 'email',
      label: 'E-mail',
      type: 'email',
      placeholder: 'E-mail',
      full: true,
    },
    {
      row: [
        { key: 'unidad', label: 'Unidad', type: 'select', placeholder: '' },
        { key: 'placa', label: 'Placa', type: 'text', placeholder: 'Placa' },
      ],
    },
  ],
};

export default function Contactanos() {
  const [activeTab, setActiveTab] = useState<Tab>('ECOMMERCE');

  const [ecom, setEcom] = useState({
    empresa: '',
    solicitante: '',
    telefono: '',
    ciudad: '',
    email: '',
  });

  const [rep, setRep] = useState({
    nombre: '',
    dni: '',
    telefono: '',
    email: '',
    unidad: '',
    placa: '',
  });

  const [sending, setSending] = useState(false);

  const handleChangeEcom = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEcom((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeRep = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setRep((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);

    try {
      let payload: HyconPayload;

      if (activeTab === 'ECOMMERCE') {
        payload = {
          rol: 'ECOMMERCE',
          empresa: ecom.empresa,
          solicitante: ecom.solicitante,
          telefono: ecom.telefono,
          ciudad: ecom.ciudad,
          email: ecom.email,
        };
      } else {
        const unidadMap: Record<string, 'Moto' | 'Auto' | 'Otro'> = {
          moto: 'Moto',
          auto: 'Auto',
          camioneta: 'Auto',
        };

        payload = {
          rol: 'REPARTIDOR',
          nombreCompleto: rep.nombre,
          dni: rep.dni,
          telefono: rep.telefono,
          email: rep.email,
          unidad: unidadMap[rep.unidad] ?? 'Otro',
          placa: rep.placa || undefined,
        };
      }

      const res = await enviarCorreo(payload);
      if (!res.ok) {
        console.error(res.error || 'Error al enviar');
        alert(res.error || 'Error al enviar');
      } else {
        alert('¡Datos enviados correctamente!');
        if (activeTab === 'ECOMMERCE') {
          setEcom({
            empresa: '',
            solicitante: '',
            telefono: '',
            ciudad: '',
            email: '',
          });
        } else {
          setRep({
            nombre: '',
            dni: '',
            telefono: '',
            email: '',
            unidad: '',
            placa: '',
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error inesperado');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full max-w-[1340px] mx-auto min-h-screen px-4">
      <header className="mt-8">
        <Tittle>Contactanos</Tittle>
      </header>

      {/* Layout principal */}
      <div className="flex flex-col lg:flex-row items-center justify-center lg:items-start gap-12 my-6">
        {/* Imagen solo visible en PC/Laptop */}
        <div className="flex-shrink-0 hidden lg:block">
          <img
            src={ContactanosPeople}
            alt="Contactanos"
            className="w-[700px] h-[568px] object-cover rounded-2xl"
          />
        </div>

        {/* Formulario centrado en tablet/móvil */}
        <div className="w-full max-w-lg bg-white rounded-2xl mx-auto">
          <p className="mb-3 text-[28px] font-medium text-g-70">
            Envíenos sus datos como:
          </p>

          <div className="flex mb-4">
            {(['ECOMMERCE', 'REPARTIDOR'] as Tab[]).map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 font-semibold shadow-lg transition-all duration-300 ease-in-out
                  ${index === 0 ? 'rounded-l-lg' : ''} 
                  ${index === 1 ? 'rounded-r-lg' : ''} 
                  ${
                    activeTab === tab
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                {tab}
              </button>
            ))}
          </div>

          <p className="mb-6 text-g-60 font-normal transition-opacity duration-300 ease-in-out">
            {activeTab === 'ECOMMERCE'
              ? 'Rellene los siguiente campos para poder contactarnos con ustedes.'
              : 'Rellene los siguiente campos para poder contactarnos con ustedes.  Ojo: Solo para Arequipa'}
          </p>

          <div
            key={activeTab}
            className="transition-opacity duration-500 ease-in-out opacity-100 animate-fadeIn">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {formFields[activeTab].map((field, i) =>
                'row' in field ? (
                  <div className="flex gap-4" key={i}>
                    {field.row.map((rf) => (
                      <div key={rf.key} className="w-1/2">
                        <label className="block mb-1 text-sm font-medium text-primary">
                          {rf.label}
                        </label>
                        {rf.type === 'select' ? (
                          <select
                            name={rf.key}
                            value={rep.unidad}
                            onChange={handleChangeRep}
                            className="w-full border p-2 rounded-lg border-g-40 text-g-40">
                            <option value="">Seleccione unidad</option>
                            <option value="moto">Moto</option>
                            <option value="auto">Auto</option>
                            <option value="camioneta">Camioneta</option>
                          </select>
                        ) : (
                          <input
                            name={rf.key}
                            type={rf.type}
                            placeholder={rf.placeholder}
                            value={
                              activeTab === 'ECOMMERCE'
                                ? rf.key in ecom
                                  ? (ecom as any)[rf.key] ?? ''
                                  : (rep as any)[rf.key] ?? ''
                                : rf.key in rep
                                ? (rep as any)[rf.key] ?? ''
                                : (ecom as any)[rf.key] ?? ''
                            }
                            onChange={
                              activeTab === 'ECOMMERCE'
                                ? handleChangeEcom
                                : handleChangeRep
                            }
                            className="w-full border p-2 rounded-lg border-g-40"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    key={field.key}
                    className={field.full ? 'w-full' : 'w-1/2'}>
                    <label className="block mb-1 text-sm font-medium text-primary">
                      {field.label}
                    </label>
                    <input
                      name={field.key}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={
                        activeTab === 'ECOMMERCE'
                          ? (ecom as any)[field.key] ?? ''
                          : (rep as any)[field.key] ?? ''
                      }
                      onChange={
                        activeTab === 'ECOMMERCE'
                          ? handleChangeEcom
                          : handleChangeRep
                      }
                      className="w-full border p-2 rounded-lg border-g-40"
                    />
                  </div>
                )
              )}

              {activeTab === 'ECOMMERCE' && (
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-blue-700 flex gap-2 items-center justify-center transition-colors duration-300 mt-11">
                  <p>{sending ? 'Enviando...' : 'Enviar datos'}</p>
                  <Icon icon="fluent:send-16-filled" width="16" height="16" />
                </button>
              )}

              {activeTab === 'REPARTIDOR' && (
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-blue-700 flex gap-2 items-center justify-center transition-colors duration-300">
                  <p>{sending ? 'Enviando...' : 'Enviar datos'}</p>
                  <Icon icon="fluent:send-16-filled" width="16" height="16" />
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
