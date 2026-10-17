import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormularioCotizacion from './FormularioCotizacion';
import * as api from '@/features/contacto/servicios/cotizaciones.api';
import type { Cotizacion, EvaluacionErgonomica } from '@/features/contacto/tipos/cotizacion.tipos';

vi.mock('@/features/contacto/servicios/cotizaciones.api');

const EVALUACIONES: EvaluacionErgonomica[] = [
  {
    codigo: 'movimientos-repetitivos',
    nombre: 'Movimientos repetitivos de miembros superiores',
    norma: 'ISO 11228-3:2026',
    precio: 250,
  },
  { codigo: 'levantamiento-cargas', nombre: 'Levantamiento de cargas', norma: 'ISO 11228-1:2021', precio: 200 },
  { codigo: 'empuje-traccion', nombre: 'Empuje y tracción', norma: 'ISO 11228-2:2007', precio: 250 },
  { codigo: 'posturas-forzadas', nombre: 'Posturas forzadas', norma: 'ISO 11226:2000', precio: 200 },
];

const cotizacion: Cotizacion = {
  uuid: '0192f0aa-1111-7000-8000-5f3ad2c91e77',
  codigo: 'COT-C91E77',
  nombre: 'Ana Quispe',
  empresa: null,
  telefono: '902665565',
  correo: 'ana@empresa.com',
  mensaje: null,
  evaluaciones: [EVALUACIONES[1]],
  total: 200,
  estado: 'nuevo',
  createdAt: '2026-10-16T12:00:00.000Z',
};

const rellenar = async (usuario: ReturnType<typeof userEvent.setup>) => {
  await usuario.type(screen.getByLabelText(/nombre y apellido/i), 'Ana Quispe');
  await usuario.type(screen.getByLabelText(/celular/i), '902665565');
  await usuario.type(screen.getByLabelText(/^correo$/i), 'ana@empresa.com');
};

describe('FormularioCotizacion', () => {
  beforeEach(() => {
    vi.mocked(api.listarEvaluacionesApi).mockResolvedValue(EVALUACIONES);
    vi.mocked(api.solicitarCotizacionApi).mockResolvedValue(cotizacion);
  });

  it('muestra las evaluaciones con su norma y su precio', async () => {
    render(<FormularioCotizacion />);

    expect(await screen.findByText('Levantamiento de cargas')).toBeInTheDocument();
    expect(screen.getByText('ISO 11228-1:2021')).toBeInTheDocument();
    expect(screen.getByText('ISO 11228-3:2026')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
  });

  it('suma el total conforme se eligen y se quitan evaluaciones', async () => {
    const usuario = userEvent.setup({ delay: null });
    render(<FormularioCotizacion />);
    await screen.findByText('Levantamiento de cargas');

    // El precio tambien aparece en cada evaluacion: se mira solo el total
    const total = () => screen.getByText(/total estimado/i).closest('p') as HTMLElement;

    await usuario.click(screen.getByRole('checkbox', { name: /levantamiento de cargas/i }));
    expect(within(total()).getByText(/200\.00/)).toBeInTheDocument();

    await usuario.click(screen.getByRole('checkbox', { name: /movimientos repetitivos/i }));
    expect(within(total()).getByText(/450\.00/)).toBeInTheDocument();

    await usuario.click(screen.getByRole('checkbox', { name: /levantamiento de cargas/i }));
    expect(within(total()).getByText(/250\.00/)).toBeInTheDocument();
  });

  it('no envia sin elegir evaluaciones', async () => {
    const usuario = userEvent.setup({ delay: null });
    render(<FormularioCotizacion />);
    await screen.findByText('Levantamiento de cargas');

    await rellenar(usuario);
    await usuario.click(screen.getByRole('button', { name: /solicitar cotización/i }));

    expect(await screen.findByText(/elige al menos una evaluación/i)).toBeInTheDocument();
    expect(api.solicitarCotizacionApi).not.toHaveBeenCalled();
  });

  it('avisa de los datos de contacto que faltan o estan mal', async () => {
    const usuario = userEvent.setup({ delay: null });
    render(<FormularioCotizacion />);
    await screen.findByText('Levantamiento de cargas');

    await usuario.click(screen.getByRole('checkbox', { name: /empuje y tracción/i }));
    await usuario.type(screen.getByLabelText(/celular/i), 'llamame');
    await usuario.type(screen.getByLabelText(/^correo$/i), 'no-es-correo');
    await usuario.click(screen.getByRole('button', { name: /solicitar cotización/i }));

    expect(await screen.findByText(/escribe tu nombre/i)).toBeInTheDocument();
    expect(screen.getByText(/celular válido/i)).toBeInTheDocument();
    expect(screen.getByText(/correo válido/i)).toBeInTheDocument();
    expect(api.solicitarCotizacionApi).not.toHaveBeenCalled();
  });

  it('envia solo los codigos elegidos y los datos de contacto', async () => {
    const usuario = userEvent.setup({ delay: null });
    render(<FormularioCotizacion />);
    await screen.findByText('Levantamiento de cargas');

    await usuario.click(screen.getByRole('checkbox', { name: /levantamiento de cargas/i }));
    await rellenar(usuario);
    await usuario.type(screen.getByLabelText(/empresa/i), 'Logistica SAC');
    await usuario.click(screen.getByRole('button', { name: /solicitar cotización/i }));

    await waitFor(() =>
      expect(api.solicitarCotizacionApi).toHaveBeenCalledWith({
        name: 'Ana Quispe',
        company: 'Logistica SAC',
        phone: '902665565',
        email: 'ana@empresa.com',
        message: undefined,
        evaluaciones: ['levantamiento-cargas'],
      })
    );
  });

  it('al enviarse muestra el codigo, el detalle y el enlace de WhatsApp', async () => {
    const usuario = userEvent.setup({ delay: null });
    render(<FormularioCotizacion />);
    await screen.findByText('Levantamiento de cargas');

    await usuario.click(screen.getByRole('checkbox', { name: /levantamiento de cargas/i }));
    await rellenar(usuario);
    await usuario.click(screen.getByRole('button', { name: /solicitar cotización/i }));

    expect(await screen.findByText('COT-C91E77')).toBeInTheDocument();
    const total = screen.getByText(/^total$/i).closest('p') as HTMLElement;
    expect(within(total).getByText(/200\.00/)).toBeInTheDocument();

    const enlace = screen.getByRole('link', { name: /whatsapp/i }).getAttribute('href') as string;
    const texto = new URL(enlace).searchParams.get('text') as string;
    expect(texto).toContain('COT-C91E77');
    expect(texto).toContain('ISO 11228-1:2021');
  });

  it('muestra el motivo si el servidor rechaza la solicitud', async () => {
    const usuario = userEvent.setup({ delay: null });
    vi.mocked(api.solicitarCotizacionApi).mockRejectedValue(
      new Error('Ya enviaste varias solicitudes')
    );
    render(<FormularioCotizacion />);
    await screen.findByText('Levantamiento de cargas');

    await usuario.click(screen.getByRole('checkbox', { name: /posturas forzadas/i }));
    await rellenar(usuario);
    await usuario.click(screen.getByRole('button', { name: /solicitar cotización/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/varias solicitudes/i);
  });

  it('si no cargan las evaluaciones lo dice', async () => {
    vi.mocked(api.listarEvaluacionesApi).mockRejectedValue(new Error('sin conexion'));
    render(<FormularioCotizacion />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudieron cargar/i);
  });

  it('desde el acuse se puede pedir otra cotizacion', async () => {
    const usuario = userEvent.setup({ delay: null });
    render(<FormularioCotizacion />);
    await screen.findByText('Levantamiento de cargas');

    await usuario.click(screen.getByRole('checkbox', { name: /levantamiento de cargas/i }));
    await rellenar(usuario);
    await usuario.click(screen.getByRole('button', { name: /solicitar cotización/i }));
    await screen.findByText('COT-C91E77');

    await usuario.click(screen.getByRole('button', { name: /pedir otra cotización/i }));

    // El formulario vuelve limpio
    expect(await screen.findByLabelText(/nombre y apellido/i)).toHaveValue('');
    expect(within(screen.getByRole('button', { name: /solicitar cotización/i })).queryByText(/enviando/i)).toBeNull();
  });
});
