import PlantillaSeccion from '@/shared/ui/plantillas/PlantillaSeccion';
import EstadoVacio from '@/shared/ui/atomos/EstadoVacio';

/**
 * Publicaciones todavia no tiene respaldo en el backend: el esquema de Prisma
 * no define una tabla de articulos, asi que no hay endpoint que consultar.
 * La pagina existe para que la ruta del menu no quede rota.
 */
export default function PaginaPublicaciones() {
  return (
    <PlantillaSeccion
      titulo="Publicaciones"
      descripcion="Novedades, guias y casos de nuestra operacion logistica en Arequipa."
    >
      <div className="rounded-xl border border-g-20 bg-white">
        <EstadoVacio
          icono="solar:document-text-linear"
          titulo="Seccion en preparacion"
          descripcion="Aun no hay publicaciones. Esta seccion se activara cuando el backend tenga su modelo de articulos."
        />
      </div>
    </PlantillaSeccion>
  );
}
