import { act, fireEvent, render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Hero from './Hero';

const montar = (reducido = false) => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: reducido, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  render(<MemoryRouter><Hero /></MemoryRouter>);
};
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('ambientes del hero', () => {
  it('avanza automáticamente y permite pausar', () => {
    vi.useFakeTimers(); montar();
    act(() => { vi.advanceTimersByTime(7000); });
    expect(screen.getByRole('button', { name: /Mostrar ambiente 2/ })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Pausar imágenes' }));
    act(() => { vi.advanceTimersByTime(14000); });
    expect(screen.getByRole('button', { name: /Mostrar ambiente 2/ })).toHaveAttribute('aria-pressed', 'true');
  });
  it('conserva la escena elegida manualmente', () => {
    vi.useFakeTimers(); montar();
    fireEvent.click(screen.getByRole('button', { name: /Mostrar ambiente 3/ }));
    act(() => { vi.advanceTimersByTime(14000); });
    expect(screen.getByRole('button', { name: /Mostrar ambiente 3/ })).toHaveAttribute('aria-pressed', 'true');
  });
  it('no reproduce automáticamente con movimiento reducido', () => {
    vi.useFakeTimers(); montar(true);
    act(() => { vi.advanceTimersByTime(14000); });
    expect(screen.getByRole('button', { name: /Mostrar ambiente 1/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: 'Pausar imágenes' })).not.toBeInTheDocument();
  });
});
