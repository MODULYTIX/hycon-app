import { useState, type FormEvent } from 'react';
import Tittle from '../shared/components/Tittle';
import ContactanosPeople from '../assets/images/contacanos_people.webp';
import { Icon } from '@iconify/react';

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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Formulario enviado');
  };

  return (
    <div className="w-full max-w-[1340px] mx-auto min-h-screen px-4">
      <header className="mt-8">
        <Tittle>Contactanos</Tittle>
      </header>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-12 my-6">
        <div className="flex-shrink-0">
          <img
            src={ContactanosPeople}
            alt="Contactanos"
            className="w-[700px] h-[565px] object-cover rounded-2xl"
          />
        </div>
        <div className="w-full max-w-lg bg-white rounded-2xl">
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

          {/* Animación con key para forzar transición al cambiar de tab */}
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
                          <select className="w-full border p-2 rounded-lg border-g-40 text-g-40">
                            <option value="">Seleccione unidad</option>
                            <option value="moto">Moto</option>
                            <option value="auto">Auto</option>
                            <option value="camioneta">Camioneta</option>
                          </select>
                        ) : (
                          <input
                            type={rf.type}
                            placeholder={rf.placeholder}
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
                      type={field.type}
                      placeholder={field.placeholder}
                      className="w-full border p-2 rounded-lg border-g-40"
                    />
                  </div>
                )
              )}

              {/* Botón separado según el tab */}
              {activeTab === 'ECOMMERCE' && (
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-blue-700 flex gap-2 items-center justify-center transition-colors duration-300 mt-11">
                  <p>Enviar datos </p>
                  <Icon icon="fluent:send-16-filled" width="16" height="16" />
                </button>
              )}

              {activeTab === 'REPARTIDOR' && (
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-blue-700 flex gap-2 items-center justify-center transition-colors duration-300">
                  <p>Enviar datos </p>
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
