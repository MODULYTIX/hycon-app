import PlantillaSeccion from '@/shared/ui/plantillas/PlantillaSeccion';
import EstadoVacio from '@/shared/ui/atomos/EstadoVacio';

/**
 * La vista publica de articulos aun no esta construida; los articulos ya se
 * gestionan desde el panel (/api/v1/posts). La pagina evita que el menu quede roto.
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
          descripcion="Muy pronto publicaremos aqui nuestros articulos sobre ergonomia y logistica."
        />
      </div>
    </PlantillaSeccion>
  );
}
