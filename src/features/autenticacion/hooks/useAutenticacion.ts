import { useContext } from 'react';
import { AutenticacionContexto } from '@/features/autenticacion/contexto/AutenticacionContexto';

export const useAutenticacion = () => {
  const contexto = useContext(AutenticacionContexto);

  if (!contexto) {
    throw new Error('useAutenticacion debe usarse dentro de AutenticacionProveedor');
  }

  return contexto;
};
