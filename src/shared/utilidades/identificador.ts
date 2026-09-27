// Formato de uuid: evita pedir al backend una URL que no puede existir
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const esUuid = (valor: string | undefined): valor is string => Boolean(valor && UUID.test(valor));
