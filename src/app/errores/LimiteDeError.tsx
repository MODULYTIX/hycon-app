import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import AvisoFalloPantalla from '@/app/errores/AvisoFalloPantalla';

interface Props {
  children: ReactNode;
  // Al cambiar de pagina se vuelve a intentar solo: el fallo anterior ya no estorba
  clave: string;
}

interface Estado {
  fallo: Error | null;
}

class Limite extends Component<Props, Estado> {
  state: Estado = { fallo: null };

  static getDerivedStateFromError(fallo: Error): Estado {
    return { fallo };
  }

  // React no deja rastro del fallo en ningun otro sitio
  componentDidCatch(fallo: Error, info: ErrorInfo) {
    console.error('[pantalla] no se pudo dibujar', fallo, info.componentStack);
  }

  componentDidUpdate(anteriores: Props) {
    if (this.state.fallo && anteriores.clave !== this.props.clave) this.setState({ fallo: null });
  }

  reintentar = () => this.setState({ fallo: null });

  render() {
    if (this.state.fallo) return <AvisoFalloPantalla onReintentar={this.reintentar} />;
    return this.props.children;
  }
}

/**
 * Red de seguridad: si lo que envuelve se rompe al dibujarse, muestra un aviso
 * en su lugar en vez de dejar la pagina en blanco. Lo que queda fuera (el menu
 * y el pie) sigue en pie.
 */
export default function LimiteDeError({ children }: { children: ReactNode }) {
  // La clase no puede leer la ruta por si misma: se la pasa la envoltura
  const { pathname } = useLocation();
  return <Limite clave={pathname}>{children}</Limite>;
}
