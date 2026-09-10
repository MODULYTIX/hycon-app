import type { ReactNode } from 'react';

export default function Etiqueta({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block mb-1 text-sm font-medium text-primary">
      {children}
    </label>
  );
}
