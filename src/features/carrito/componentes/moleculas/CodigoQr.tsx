// Codigo visual para escanear desde la app de pagos. El patron sale del texto,
// asi cada pedido muestra el suyo y no una imagen fija.
const LADO = 21;

const celdasDe = (texto: string): boolean[] => {
  let semilla = 7;
  for (const caracter of texto) semilla = (semilla * 31 + caracter.charCodeAt(0)) % 2147483647;

  return Array.from({ length: LADO * LADO }, () => {
    semilla = (semilla * 1103515245 + 12345) % 2147483647;
    return semilla % 100 < 48;
  });
};

// Las tres esquinas de referencia que todo codigo lleva
const esEsquina = (fila: number, columna: number): boolean =>
  (fila < 7 && columna < 7) || (fila < 7 && columna > LADO - 8) || (fila > LADO - 8 && columna < 7);

export default function CodigoQr({ texto, clase = '' }: { texto: string; clase?: string }) {
  const celdas = celdasDe(texto);

  return (
    <svg
      viewBox={`0 0 ${LADO} ${LADO}`}
      role="img"
      aria-label="Código para escanear desde la aplicación"
      className={clase}
      shapeRendering="crispEdges"
    >
      <rect width={LADO} height={LADO} fill="#ffffff" />
      {celdas.map((pintada, indice) => {
        const fila = Math.floor(indice / LADO);
        const columna = indice % LADO;
        if (esEsquina(fila, columna) || !pintada) return null;
        return <rect key={indice} x={columna} y={fila} width="1" height="1" fill="#1c3a39" />;
      })}

      {[
        [0, 0],
        [LADO - 7, 0],
        [0, LADO - 7],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="7" height="7" fill="#1c3a39" />
          <rect x={x + 1} y={y + 1} width="5" height="5" fill="#ffffff" />
          <rect x={x + 2} y={y + 2} width="3" height="3" fill="#1c3a39" />
        </g>
      ))}
    </svg>
  );
}
