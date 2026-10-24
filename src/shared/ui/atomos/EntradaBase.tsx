import { forwardRef, type InputHTMLAttributes } from 'react';
import '../controles.css';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  compacto?: boolean;
}

const EntradaBase = forwardRef<HTMLInputElement, Props>(function EntradaBase(
  { compacto, className = '', ...props }, ref,
) {
  return <input ref={ref} className={`hy-input ${className}`} data-compacto={compacto || undefined} {...props} />;
});

export default EntradaBase;
