import PaginaMensaje from '@/shared/ui/plantillas/PaginaMensaje';

export default function PaginaNoEncontrada() {
  return (
    <PaginaMensaje
      icono="solar:map-arrow-square-linear"
      titulo="Pagina no encontrada"
      descripcion="La direccion que abriste no existe o cambio de sitio."
    />
  );
}
