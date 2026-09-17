import { useState, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { Icon } from '@iconify/react';
import CampoFormulario from '@/shared/ui/moleculas/CampoFormulario';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: ReactNode;
}

// Campo de contrasena con boton para mostrarla y aviso de mayusculas activadas
export default function CampoContrasena({ id, etiqueta, error, ayuda, onKeyUp, onKeyDown, onBlur, ...props }: Props) {
  const [visible, setVisible] = useState(false);
  const [mayusculas, setMayusculas] = useState(false);

  // Bloq Mayus es la causa mas comun de "contrasena incorrecta" sin que la persona lo note
  const detectarMayusculas = (evento: KeyboardEvent<HTMLInputElement>) => {
    if (typeof evento.getModifierState === 'function') {
      setMayusculas(evento.getModifierState('CapsLock'));
    }
  };

  return (
    <div>
      <CampoFormulario
        id={id}
        etiqueta={etiqueta}
        icono="solar:lock-password-linear"
        type={visible ? 'text' : 'password'}
        error={error}
        // Evita que el navegador sugiera correcciones o mayusculas sobre la contrasena
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        onKeyDown={(evento) => {
          detectarMayusculas(evento);
          onKeyDown?.(evento);
        }}
        onKeyUp={(evento) => {
          detectarMayusculas(evento);
          onKeyUp?.(evento);
        }}
        onBlur={(evento) => {
          setMayusculas(false);
          onBlur?.(evento);
        }}
        accesorio={
          <button
            type="button"
            onClick={() => setVisible((previo) => !previo)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={visible}
            className="flex h-8 w-9 items-center justify-center rounded-md text-g-40 transition-colors hover:bg-g-10 hover:text-g-70"
          >
            <Icon icon={visible ? 'solar:eye-closed-linear' : 'solar:eye-linear'} width="19" height="19" aria-hidden />
          </button>
        }
        {...props}
      />

      {mayusculas && (
        <p role="status" className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-y-70">
          <Icon icon="solar:keyboard-linear" width="15" height="15" aria-hidden />
          Bloq Mayús está activado
        </p>
      )}
      {!error && ayuda}
    </div>
  );
}
