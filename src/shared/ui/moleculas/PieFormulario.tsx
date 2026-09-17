import Boton from '@/shared/ui/atomos/Boton';

// Barra inferior fija de los formularios en modal: siempre visible aunque el cuerpo haga scroll
export default function PieFormulario({
  textoGuardar,
  textoGuardando,
  enviando,
  onCancelar,
}: {
  textoGuardar: string;
  textoGuardando: string;
  enviando: boolean;
  onCancelar: () => void;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-hy-10 bg-white px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end sm:px-7">
      <Boton variante="secundario" onClick={onCancelar} disabled={enviando}>
        Cancelar
      </Boton>
      <Boton type="submit" cargando={enviando} icono="solar:check-circle-bold" className="sm:min-w-[170px]">
        {enviando ? textoGuardando : textoGuardar}
      </Boton>
    </div>
  );
}
