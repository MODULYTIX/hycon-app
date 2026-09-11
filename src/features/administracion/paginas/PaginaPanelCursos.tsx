import { useCallback, useState } from 'react';
import CabeceraSeccion from '@/features/administracion/componentes/moleculas/CabeceraSeccion';
import ModalCurso from '@/features/cursos/componentes/organismos/ModalCurso';
import ListaCursos from '@/features/cursos/componentes/organismos/ListaCursos';
import AlertaFormulario from '@/shared/ui/moleculas/AlertaFormulario';
import { listarCursosApi } from '@/features/cursos/servicios/cursos.api';
import { useListaRemota } from '@/shared/hooks/useListaRemota';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

export default function PaginaPanelCursos() {
  const cargar = useCallback((senal: AbortSignal) => listarCursosApi('todos', senal), []);
  const { datos, cargando, error, anteponer } = useListaRemota<Curso>(
    cargar,
    'No se pudieron cargar los cursos'
  );

  const [modalAbierto, setModalAbierto] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const agregar = useCallback(
    (curso: Curso) => {
      anteponer(curso);
      setAviso(`Curso "${curso.name}" agregado al catalogo`);
    },
    [anteponer]
  );

  return (
    <>
      <CabeceraSeccion
        titulo="Cursos"
        descripcion="Agrega cursos al catalogo y revisa los que ya estan publicados."
        textoBoton="Agregar curso"
        onAgregar={() => {
          setAviso(null);
          setModalAbierto(true);
        }}
      />

      <div className="space-y-4">
        <AlertaFormulario mensaje={aviso} tono="exito" />
        <ListaCursos cursos={datos} cargando={cargando} error={error} />
      </div>

      <ModalCurso abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} onCreado={agregar} />
    </>
  );
}
