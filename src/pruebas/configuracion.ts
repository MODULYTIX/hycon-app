// Registra los matchers de jest-dom (toBeInTheDocument, toBeVisible, etc.) en Vitest
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Sin globals activados, Testing Library no engancha su limpieza automatica:
// sin esto el DOM de una prueba se arrastra a la siguiente
afterEach(() => {
  cleanup();
});
