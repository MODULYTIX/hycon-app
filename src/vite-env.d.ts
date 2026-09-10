/// <reference types="vite/client" />

// Variables de entorno disponibles en el navegador.
// Deben empezar por HYCON_ o VITE_ para que Vite las exponga (ver envPrefix).
interface ImportMetaEnv {
  readonly HYCON_API_URL?: string;
  /** Respaldo heredado: usar HYCON_API_URL en proyectos nuevos */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
