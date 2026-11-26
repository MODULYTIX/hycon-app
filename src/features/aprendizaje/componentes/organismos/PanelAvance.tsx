import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { rutaCertificadoCurso } from '@/app/rutas/rutas';
import { resumir } from '@/features/aprendizaje/utilidades/panel-aprendizaje';
import type { CursoComprado } from '@/features/aprendizaje/tipos/aprendizaje.tipos';

function Dato({ valor, etiqueta }: { valor: number; etiqueta: string }) {
  return (
    <div>
      <p className="text-[22px] font-semibold leading-none text-g-90">{valor}</p>
      <p className="mt-1 text-[11.5px] leading-tight text-g-50">{etiqueta}</p>
    </div>
  );
}

/** Resumen y certificados. Los numeros salen de los cursos que se estan viendo. */
export default function PanelAvance({ cursos }: { cursos: CursoComprado[] }) {
  const resumen = resumir(cursos);
  const conCertificado = cursos.filter((curso) => curso.certificado !== null);

  return (
    <div className="space-y-4">
      <section
        aria-labelledby="titulo-avance"
        className="rounded-2xl border border-g-20 bg-white p-5"
      >
        <h2 id="titulo-avance" className="text-[14px] font-semibold text-g-90">
          Tu avance
        </h2>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <Dato valor={resumen.porTerminar} etiqueta="Por terminar" />
          <Dato valor={resumen.terminados} etiqueta="Terminados" />
          <Dato valor={resumen.certificados} etiqueta="Certificados" />
        </div>
      </section>

      <section
        aria-labelledby="titulo-certificados"
        className="rounded-2xl border border-g-20 bg-white p-5"
      >
        <h2 id="titulo-certificados" className="text-[14px] font-semibold text-g-90">
          Tus certificados
        </h2>

        {conCertificado.length === 0 ? (
          <p className="mt-2 text-[12.5px] leading-relaxed text-g-50">
            Al terminar todas las partes de un curso puedes emitir su certificado.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {conCertificado.map((curso) => (
              <li key={curso.uuid} className="flex items-start gap-2.5">
                <Icon
                  icon="solar:diploma-linear"
                  width="18"
                  height="18"
                  aria-hidden
                  className="mt-0.5 shrink-0 text-primary"
                />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-g-80">{curso.name}</p>
                  <Link
                    to={rutaCertificadoCurso(curso.uuid)}
                    className="text-[12.5px] font-medium text-primary hover:underline"
                  >
                    Ver certificado
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
