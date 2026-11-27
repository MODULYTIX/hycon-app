import { Component, createRef } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import type { Location, NavigationType } from 'react-router-dom';
import Hero from '@/features/home/componentes/organismos/Hero';
import Encabezado from '@/shared/ui/organismos/Encabezado';
import PiePagina from '@/shared/ui/organismos/PiePagina';
import LimiteDeError from '@/app/errores/LimiteDeError';
import { NAVEGACION_PRINCIPAL } from '@/app/rutas/rutas';

interface Props {
  location: Location;
  navigationType: NavigationType;
}

interface VistaAnterior {
  headerTop: number;
  enMovimiento: boolean;
  contenido?: { copia: HTMLDivElement; offset: number };
}

function indiceDeSeccion(pathname: string) {
  return NAVEGACION_PRINCIPAL.findIndex(({ ruta }) =>
    pathname === ruta || (ruta !== '/' && pathname.startsWith(ruta + '/')),
  );
}

class VistaPublica extends Component<Props, object, VistaAnterior | null> {
  private marco = createRef<HTMLDivElement>();
  private contenido = createRef<HTMLElement>();
  private pagina = createRef<HTMLDivElement>();
  private salida = createRef<HTMLDivElement>();
  private posiciones = new Map<string, number>();
  private animaciones: Animation[] = [];
  private restauracionAnterior: ScrollRestoration = 'auto';

  componentDidMount() {
    this.restauracionAnterior = history.scrollRestoration;
    history.scrollRestoration = 'manual';
  }

  componentWillUnmount() {
    history.scrollRestoration = this.restauracionAnterior;
    this.limpiarTransicion();
  }

  getSnapshotBeforeUpdate({ location }: Props): VistaAnterior | null {
    if (location.pathname === this.props.location.pathname) return null;
    this.posiciones.set(location.key, window.scrollY);

    const marco = this.marco.current;
    const header = marco?.querySelector('header');
    const rectHeader = header?.getBoundingClientRect();
    const headerTop = Math.max(0, rectHeader?.top ?? 0);
    const enMovimiento = this.animaciones.some(animacion => animacion.playState === 'running' || animacion.playState === 'paused');
    const pagina = this.pagina.current;
    if (enMovimiento || !pagina?.animate || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return { headerTop, enMovimiento };
    }

    const copia = pagina.cloneNode(true) as HTMLDivElement;
    copia.querySelectorAll('[id]').forEach(elemento => elemento.removeAttribute('id'));
    const offset = pagina.getBoundingClientRect().top - (rectHeader?.bottom ?? 0);
    return { headerTop, enMovimiento, contenido: { copia, offset } };
  }

  componentDidUpdate(anterior: Props, _state: object, vistaAnterior: VistaAnterior | null) {
    if (!vistaAnterior) return;
    this.limpiarTransicion();

    const { location, navigationType } = this.props;
    const esHistorial = navigationType === 'POP';
    window.scrollTo({ top: esHistorial ? (this.posiciones.get(location.key) ?? 0) : 0, behavior: 'instant' });

    const contenido = this.contenido.current;
    if (!esHistorial) contenido?.focus({ preventScroll: true });
    if (!contenido?.animate || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const marco = this.marco.current;
    const header = marco?.querySelector('header');
    if (!header) return;

    const desplazamiento = vistaAnterior.headerTop - header.getBoundingClientRect().top;
    const origen = indiceDeSeccion(anterior.location.pathname);
    const destino = indiceDeSeccion(location.pathname);
    const direccion = origen >= 0 && destino >= 0 && origen !== destino
      ? Math.sign(destino - origen)
      : esHistorial ? -1 : 1;

    const mueveHeader = Math.abs(desplazamiento) >= 1;
    const espera = mueveHeader && desplazamiento > 0 ? 240 : 0;
    if (vistaAnterior.enMovimiento) {
      const pagina = this.pagina.current;
      if (pagina) {
        this.animaciones.push(pagina.animate(
          [{ opacity: 0.85 }, { opacity: 1 }],
          { duration: 160, easing: 'ease-out', fill: 'backwards' },
        ));
      }
    } else {
      this.deslizarContenido(direccion, espera, mueveHeader, header, vistaAnterior.contenido);
    }

    if (mueveHeader) {
      const duracionRestante = Math.min(720, Math.max(180, 720 * Math.abs(desplazamiento) / window.innerHeight));
      const opciones: KeyframeAnimationOptions = {
        duration: vistaAnterior.enMovimiento ? duracionRestante : 720,
        easing: desplazamiento > 0 ? 'cubic-bezier(.45,0,.25,1)' : 'cubic-bezier(.75,0,.55,1)',
        fill: 'backwards',
      };
      const movimiento = [{ transform: 'translateY(' + desplazamiento + 'px)' }, { transform: 'translateY(0)' }];
      const pie = marco?.querySelector('footer');
      this.animaciones.push(header.animate(movimiento, opciones), contenido.animate(movimiento, opciones));
      if (pie) this.animaciones.push(pie.animate(movimiento, opciones));
    }

    const transicion = this.animaciones;
    void Promise.all(transicion.map(animacion => animacion.finished)).then(() => {
      if (this.animaciones === transicion) this.limpiarTransicion();
    }, () => {
      // Una siguiente navegación puede cancelar la transición.
    });
  }

  private deslizarContenido(
    direccion: number,
    espera: number,
    mueveHeader: boolean,
    header: HTMLElement,
    anterior?: VistaAnterior['contenido'],
  ) {
    const contenido = this.contenido.current;
    const pagina = this.pagina.current;
    const salida = this.salida.current;
    if (!contenido || !pagina || !salida || !anterior) return;

    const opciones: KeyframeAnimationOptions = {
      duration: mueveHeader ? 480 : 350,
      delay: espera,
      easing: 'cubic-bezier(.25,.65,.35,1)',
      fill: 'backwards',
    };
    contenido.classList.add('hy-contenido-deslizando');

    // Ambas vistas comparten el mismo marco, incluso mientras sube el header.
    const recorte = Math.max(0, header.getBoundingClientRect().bottom - contenido.getBoundingClientRect().top);
    salida.style.top = recorte + 'px';
    anterior.copia.style.top = anterior.offset + 'px';
    salida.append(anterior.copia);
    const recorrido = mueveHeader ? 100 : 25;
    this.animaciones.push(anterior.copia.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(' + (-recorrido * direccion) + '%)', opacity: mueveHeader ? 1 : 0 }],
      { ...opciones, fill: 'both' },
    ));

    this.animaciones.push(pagina.animate(
      [{ transform: 'translateX(' + (recorrido * direccion) + '%)' }, { transform: 'translateX(0)' }],
      opciones,
    ));
  }

  private limpiarTransicion() {
    this.animaciones.forEach(animacion => animacion.cancel());
    this.animaciones = [];
    this.contenido.current?.classList.remove('hy-contenido-deslizando');
    this.salida.current?.replaceChildren();
  }

  render() {
    const esHome = this.props.location.pathname === '/';
    return (
      <div ref={this.marco} className={'hy-vista-publica flex min-h-screen w-full flex-col' + (esHome ? ' hy-portada' : '')}>
        <Hero decorativo={!esHome} />
        <Encabezado />
        <main ref={this.contenido} tabIndex={-1} className={'hy-vista-contenido ' + (esHome ? 'hy-portada-contenido' : 'flex-1')}>
          <div ref={this.pagina}>
            <LimiteDeError>
              <Outlet />
            </LimiteDeError>
          </div>
          <div ref={this.salida} className="hy-salida-contenido" aria-hidden="true" inert />
        </main>
        <PiePagina />
      </div>
    );
  }
}

export default function PlantillaPublica() {
  const location = useLocation();
  const navigationType = useNavigationType();
  return <VistaPublica location={location} navigationType={navigationType} />;
}
