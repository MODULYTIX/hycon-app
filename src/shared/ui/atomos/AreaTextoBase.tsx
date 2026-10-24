import { forwardRef, type TextareaHTMLAttributes } from 'react';
import '../controles.css';

const AreaTextoBase = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function AreaTextoBase(
  { className = '', rows = 3, ...props }, ref,
) {
  return <textarea ref={ref} rows={rows} className={`hy-textarea ${className}`} {...props} />;
});

export default AreaTextoBase;
