// Servicio de contacto: envia los datos del formulario publico
import { URL_API } from '@/shared/configuracion/entorno';
import type { ApiResponse, HyconPayload } from '@/features/contacto/tipos/enviar-correo.tipos';

export async function enviarCorreo(payload: HyconPayload): Promise<ApiResponse> {
  try {
    const res = await fetch(`${URL_API}/hycon/enviar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al enviar datos');

    return { ok: true, ...data };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : 'Error al enviar datos' };
  }
}
