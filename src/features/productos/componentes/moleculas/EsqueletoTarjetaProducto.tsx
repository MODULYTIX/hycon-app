export default function EsqueletoTarjetaProducto() {
  return (
    <li aria-hidden="true" className="productos-tarjeta bg-white">
      <div className="productos-esqueleto-titulo grid place-content-center gap-2 p-4">
        <span className="esqueleto-onda h-4 w-28 rounded" />
        <span className="esqueleto-onda mx-auto h-3 w-20 rounded" />
      </div>
      <div className="productos-esqueleto-foto esqueleto-onda bg-g-10" />
      <div className="grid place-content-center gap-3 p-5">
        <span className="esqueleto-onda h-5 w-20 rounded" />
        <span className="esqueleto-onda h-3.5 w-20 rounded" />
      </div>
    </li>
  );
}
