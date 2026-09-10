import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon } from '@iconify/react';
import CampoFormulario from '@/shared/ui/moleculas/CampoFormulario';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: ReactNode;
}

// Campo de contrasena con boton para alternar entre texto y puntos
export default function CampoContrasena({ id, etiqueta, error, ayuda, ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <CampoFormulario
      id={id}
      etiqueta={etiqueta}
      icono="solar:lock-password-bold"
      type={visible ? 'text' : 'password'}
      error={error}
      ayuda={ayuda}
      accesorio={
        <button
          type="button"
          onClick={() => setVisible((previo) => !previo)}
          aria-label={visible ? 'Ocultar contrasena' : 'Mostrar contrasena'}
          className="flex h-8 w-8 items-center justify-center rounded-md text-g-40 transition-colors hover:text-primary"
        >
          <Icon
            icon={visible ? 'solar:eye-closed-bold' : 'solar:eye-bold'}
            width="18"
            height="18"
          />
        </button>
      }
      {...props}
    />
  );
}
