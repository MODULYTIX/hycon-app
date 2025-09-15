import React from "react";

// tittle.tsx — versión fija
// Roboto, medium (500), tamaño 64px, con subrayado corto azul

export default function Tittle({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex flex-col items-start gap-[14px]">
      <h1
        className="m-0 font-medium text-[64px] leading-[1.1] text-g-80"
        style={{ fontFamily: "Roboto, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" }}
      >
        {children}
      </h1>

      <div
        aria-hidden
        className="w-[84px] h-[12px] rounded-[6px] bg-primary"
      />
    </div>
  );
}
