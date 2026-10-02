import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  agregarAlCarrito,
  cambiarCantidad,
  contarItems,
  leerCarrito,
  quitarDelCarrito,
  suscribirseAlCarrito,
  vaciarCarrito,
} from './carrito.almacen';

const CAJA = '7b73989c-0719-4c06-bd1e-8c7ae193a432';
const CURSO = 'b7b299d8-ee8f-4bea-a618-0a5f8261136f';

describe('almacen del carrito', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('empieza vacio', () => {
    expect(leerCarrito()).toEqual([]);
    expect(contarItems()).toBe(0);
  });

  it('agrega un producto y suma unidades al repetirlo', () => {
    expect(agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 2 }, 10)).toBe(true);
    expect(agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 3 }, 10)).toBe(true);

    expect(leerCarrito()).toEqual([{ tipo: 'producto', uuid: CAJA, cantidad: 5 }]);
    expect(contarItems()).toBe(5);
  });

  it('no deja pasar del stock disponible', () => {
    agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 2 }, 3);

    expect(agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 2 }, 3)).toBe(false);
    expect(leerCarrito()[0].cantidad).toBe(2);
  });

  it('un curso entra una sola vez', () => {
    expect(agregarAlCarrito({ tipo: 'curso', uuid: CURSO })).toBe(true);
    expect(agregarAlCarrito({ tipo: 'curso', uuid: CURSO })).toBe(false);

    expect(leerCarrito()).toHaveLength(1);
  });

  it('cambia la cantidad y quitar deja el resto intacto', () => {
    agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 1 }, 10);
    agregarAlCarrito({ tipo: 'curso', uuid: CURSO });

    cambiarCantidad(CAJA, 4);
    expect(leerCarrito().find((linea) => linea.uuid === CAJA)?.cantidad).toBe(4);

    quitarDelCarrito(CAJA);
    expect(leerCarrito()).toEqual([{ tipo: 'curso', uuid: CURSO, cantidad: 1 }]);
  });

  it('bajar de una unidad retira la linea', () => {
    agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 1 }, 10);

    cambiarCantidad(CAJA, 0);

    expect(leerCarrito()).toEqual([]);
  });

  it('vaciar lo deja sin nada', () => {
    agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 2 }, 10);

    vaciarCarrito();

    expect(leerCarrito()).toEqual([]);
  });

  it('ignora lo guardado con otro formato o corrupto', () => {
    window.localStorage.setItem('hycon.carrito', JSON.stringify([{ productId: 1, quantity: 2 }]));
    expect(leerCarrito()).toEqual([]);

    window.localStorage.setItem('hycon.carrito', 'esto no es json');
    expect(leerCarrito()).toEqual([]);
  });

  it('avisa a la interfaz en cada cambio', () => {
    const escucha = vi.fn();
    const cancelar = suscribirseAlCarrito(escucha);

    agregarAlCarrito({ tipo: 'producto', uuid: CAJA, cantidad: 1 }, 10);
    expect(escucha).toHaveBeenCalledTimes(1);

    cancelar();
    quitarDelCarrito(CAJA);
    expect(escucha).toHaveBeenCalledTimes(1);
  });
});
