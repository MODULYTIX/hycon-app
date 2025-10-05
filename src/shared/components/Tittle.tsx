import React from "react";

export default function Tittle({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex flex-col items-start gap-[14px]">
      <h1
        className="m-0 font-medium 
                   text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[64px] 
                   leading-[1.1] text-g-80"
        style={{
          fontFamily:
            "Roboto, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
        }}
      >
        {children}
      </h1>

      <div
        aria-hidden
        className="bg-primary rounded-[6px] 
                   w-[48px] h-[6px] sm:w-[64px] sm:h-[8px] lg:w-[84px] lg:h-[12px]"
      />
    </div>
  );
}
