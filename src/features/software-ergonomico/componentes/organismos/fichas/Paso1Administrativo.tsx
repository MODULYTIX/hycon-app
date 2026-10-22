import AreaTextoBase from '@/shared/ui/atomos/AreaTextoBase';
import EntradaBase from '@/shared/ui/atomos/EntradaBase';
import type { DatosAdministrativos } from '../../../tipos/ficha.tipos';
export default function Paso1Administrativo({ datos, onChange }: { datos: DatosAdministrativos; onChange: (d: DatosAdministrativos) => void }) {
  const campos: { llave: keyof DatosAdministrativos; titulo: string; placeholder: string }[] = [
    { llave: 'area', titulo: 'Área', placeholder: 'Ej. Operaciones' },
    { llave: 'puesto', titulo: 'Tarea / puesto', placeholder: 'Ej. Operador de almacén' },
    { llave: 'actividad', titulo: 'Actividad específica', placeholder: 'Ej. Preparación de pedidos' },
    { llave: 'superintendencia', titulo: 'Superintendencia', placeholder: 'Ej. Logística' },
    { llave: 'gerencia', titulo: 'Gerencia', placeholder: 'Ej. Gerencia de operaciones' },
  ];
  return <div className="er-grid-fields">
    {campos.map(c => <label className="er-field" key={c.llave}>{c.titulo}
      <EntradaBase  value={datos[c.llave]} onChange={e => onChange({ ...datos, [c.llave]: e.target.value })} placeholder={c.placeholder} maxLength={500} />
    </label>)}
    <label className="er-field er-field-wide">Resumen de la tarea / puesto
      <AreaTextoBase  rows={3} maxLength={10000} placeholder="Describe las funciones, herramientas y condiciones de trabajo observadas." value={datos.resumenPuesto} onChange={e => onChange({ ...datos, resumenPuesto: e.target.value })} />
    </label>
  </div>;
}
