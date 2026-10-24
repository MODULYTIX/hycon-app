export const fechaErgo = (s: string) => new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(s));
export const mensajeError = (e: unknown) => e instanceof Error ? e.message : 'No se pudo completar la operación. Vuelve a intentarlo.';
