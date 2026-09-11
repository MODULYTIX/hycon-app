import React from 'react';

// Por defecto es h2: en una pagina solo debe haber un h1, y ese lo pone la pagina.
export default function Titulo({
  children,
  nivel = 'h2',
}: {
  children: React.ReactNode;
  nivel?: 'h1' | 'h2';
}) {
  const Etiqueta = nivel;

  return (
    <div className="inline-flex flex-col items-start gap-[14px]">
      <Etiqueta
        className="m-0 font-medium
                   text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[64px]
                   leading-[1.1] text-g-80"
        style={{
          fontFamily:
            "Roboto, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
        }}
      >
        {children}
      </Etiqueta>

      <div
        aria-hidden
        className="bg-primary rounded-[6px]
                   w-[48px] h-[6px] sm:w-[64px] sm:h-[8px] lg:w-[84px] lg:h-[12px]"
      />
    </div>
  );
}
