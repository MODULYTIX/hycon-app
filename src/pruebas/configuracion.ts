// Registra los matchers de jest-dom (toBeInTheDocument, toBeVisible, etc.) en Vitest
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup, configure } from '@testing-library/react';

// Las esperas de findBy y waitFor venian con 1 s: cuando una pantalla encadena
// dos consultas y la maquina esta cargada, no da tiempo y falla sin nada roto
configure({ asyncUtilTimeout: 5000 });

// Sin globals activados, Testing Library no engancha su limpieza automatica:
// sin esto el DOM de una prueba se arrastra a la siguiente
afterEach(() => {
  cleanup();
});

// El editor de texto (ProseMirror) mide la posicion del cursor en pantalla.
// jsdom no dibuja nada y no trae estas APIs: se simulan con medidas vacias.
if (!Range.prototype.getBoundingClientRect) {
  Range.prototype.getBoundingClientRect = () => new DOMRect();
}
if (!Range.prototype.getClientRects) {
  Range.prototype.getClientRects = () =>
    ({ length: 0, item: () => null, [Symbol.iterator]: [][Symbol.iterator] }) as unknown as DOMRectList;
}
if (!document.elementFromPoint) {
  document.elementFromPoint = () => null;
}
