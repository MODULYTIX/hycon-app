import { useCallback, useEffect, useState } from 'react';
import CabeceraSeccion from '@/features/administracion/componentes/moleculas/CabeceraSeccion';
import ModalCurso from '@/features/administracion/componentes/organismos/ModalCurso';
import ListaCursos from '@/features/administracion/componentes/organismos/ListaCursos';
import AlertaFormulario from '@/features/autenticacion/componentes/atomos/AlertaFormulario';
import { listarCursosApi } from '@/features/administracion/servicios/catalogo.api';
import type { Curso } from '@/features/administracion/tipos/catalogo.tipos';

export default function PaginaCursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    const controlador = new AbortController();
    let vigente = true;

    listarCursosApi(controlador.signal)
      .then((lista) => {
        if (vigente) setCursos(lista);
      })
      .catch((fallo: unknown) => {
        if (!vigente) return;
        setError(fallo instanceof Error ? fallo.message : 'No se pudieron cargar los cursos');
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
      controlador.abort();
    };
  }, []);

  const agregar = useCallback((curso: Curso) => {
    setCursos((previos) => [curso, ...previos]);
    setAviso(`Curso "${curso.name}" agregado al catalogo`);
  }, []);

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
        <ListaCursos cursos={cursos} cargando={cargando} error={error} />
      </div>

      <ModalCurso abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} onCreado={agregar} />
    </>
  );
}
