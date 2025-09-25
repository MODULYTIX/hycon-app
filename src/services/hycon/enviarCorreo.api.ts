// src/api/enviarCorreo.api.ts

import type { ApiResponse, HyconPayload } from './enviarCorreo.type';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function enviarCorreo(
  payload: HyconPayload
): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_URL}/hycon/enviar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al enviar datos");

    return { ok: true, ...data };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}
