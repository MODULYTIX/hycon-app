import { useEffect, useState } from 'react';

// Segundos que faltan hasta un momento dado; se actualiza cada segundo y se detiene en 0
export function useCuentaAtras(hasta: number | null): number {
  const calcular = () => (hasta ? Math.max(0, Math.ceil((hasta - Date.now()) / 1000)) : 0);
  const [restantes, setRestantes] = useState(calcular);

  useEffect(() => {
    setRestantes(calcular());
    if (!hasta) return;

    const intervalo = setInterval(() => {
      const quedan = Math.max(0, Math.ceil((hasta - Date.now()) / 1000));
      setRestantes(quedan);
      if (quedan === 0) clearInterval(intervalo);
    }, 1000);

    return () => clearInterval(intervalo);
    // calcular depende solo de hasta
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasta]);

  return restantes;
}

// 845 -> "14:05"
export const formatearCuentaAtras = (segundos: number): string =>
  `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`;
