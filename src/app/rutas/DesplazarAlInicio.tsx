import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Al cambiar de pagina el navegador conserva el scroll anterior.
// Esto lo devuelve arriba, como espera cualquiera que pulsa un enlace del menu.
export default function DesplazarAlInicio() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
}
