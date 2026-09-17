import type { ReactNode } from 'react';

export default function Etiqueta({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-g-80">
      {children}
    </label>
  );
}
