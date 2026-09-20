import type { DatosAdministrativos } from '@/features/software-ergonomico/tipos/ficha.tipos';

interface Props {
  datos: DatosAdministrativos;
  onChange: (datos: DatosAdministrativos) => void;
}

export default function Paso1Administrativo({ datos, onChange }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...datos, [name]: value });
  };

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-semibold text-g-90">1. Información administrativa</h3>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="area" className="text-sm font-medium text-g-80">Área</label>
          <select
            id="area"
            name="area"
            value={datos.area}
            onChange={handleChange}
            className="rounded-lg border border-g-30 bg-white px-3 py-2 text-sm text-g-90 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Selecciona el área...</option>
            <option value="operaciones">Operaciones</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="administracion">Administración</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="puesto" className="text-sm font-medium text-g-80">Tarea / Puesto</label>
          <input
            id="puesto"
            name="puesto"
            type="text"
            value={datos.puesto}
            onChange={handleChange}
            placeholder="Ej. Soldador, Analista..."
            className="rounded-lg border border-g-30 px-3 py-2 text-sm text-g-90 placeholder-g-50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="resumenPuesto" className="text-sm font-medium text-g-80">Resumen de la tarea / puesto</label>
        <textarea
          id="resumenPuesto"
          name="resumenPuesto"
          value={datos.resumenPuesto}
          onChange={handleChange}
          rows={3}
          placeholder="Descripción general de las funciones realizadas..."
          className="rounded-lg border border-g-30 px-3 py-2 text-sm text-g-90 placeholder-g-50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="actividad" className="text-sm font-medium text-g-80">Actividad específica</label>
          <input
            id="actividad"
            name="actividad"
            type="text"
            value={datos.actividad}
            onChange={handleChange}
            className="rounded-lg border border-g-30 px-3 py-2 text-sm text-g-90 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="superintendencia" className="text-sm font-medium text-g-80">Superintendencia</label>
          <input
            id="superintendencia"
            name="superintendencia"
            type="text"
            value={datos.superintendencia}
            onChange={handleChange}
            className="rounded-lg border border-g-30 px-3 py-2 text-sm text-g-90 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="gerencia" className="text-sm font-medium text-g-80">Gerencia</label>
          <input
            id="gerencia"
            name="gerencia"
            type="text"
            value={datos.gerencia}
            onChange={handleChange}
            className="rounded-lg border border-g-30 px-3 py-2 text-sm text-g-90 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="duracionMinutos" className="text-sm font-medium text-g-80">Duración diaria (minutos)</label>
          <input
            id="duracionMinutos"
            name="duracionMinutos"
            type="number"
            min="0"
            value={datos.duracionMinutos}
            onChange={handleChange}
            className="rounded-lg border border-g-30 px-3 py-2 text-sm text-g-90 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="frecuencia" className="text-sm font-medium text-g-80">Frecuencia</label>
          <select
            id="frecuencia"
            name="frecuencia"
            value={datos.frecuencia}
            onChange={handleChange}
            className="rounded-lg border border-g-30 bg-white px-3 py-2 text-sm text-g-90 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Seleccione...</option>
            <option value="cotidiana">Cotidiana / diaria</option>
            <option value="no_cotidiana">No cotidiana</option>
          </select>
        </div>
      </div>
    </div>
  );
}
