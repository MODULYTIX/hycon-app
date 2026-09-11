import PaginaMensaje from '@/shared/ui/plantillas/PaginaMensaje';

// Destino temporal de las opciones del menu de cuenta que aun no tienen pantalla
export default function PaginaEnConstruccion() {
  return (
    <PaginaMensaje
      icono="solar:hammer-linear"
      titulo="Seccion en construccion"
      descripcion="Esta pantalla todavia no esta disponible. Estamos trabajando en ella."
    />
  );
}
