import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import DesplazarAlInicio from '@/app/rutas/DesplazarAlInicio';
import RutaSoloAdmin from '@/app/rutas/RutaSoloAdmin';
import PaginaNoEncontrada from '@/app/rutas/PaginaNoEncontrada';
import { RUTAS } from '@/app/rutas/rutas';

import PlantillaPublica from '@/shared/ui/plantillas/PlantillaPublica';
import PlantillaSinNavegacion from '@/shared/ui/plantillas/PlantillaSinNavegacion';
// El panel y su editor de texto solo los usa un ADMIN: se cargan aparte para
// no meter ese peso en el paquete que descarga cualquier visitante
const PlantillaPanel = lazy(
  () => import('@/features/administracion/componentes/plantillas/PlantillaPanel')
);

import PaginaHome from '@/features/home/paginas/PaginaHome';
import PaginaProductos from '@/features/productos/paginas/PaginaProductos';
import PaginaDetalleProducto from '@/features/productos/paginas/PaginaDetalleProducto';
import PaginaCursos from '@/features/cursos/paginas/PaginaCursos';
import PaginaDetalleCurso from '@/features/cursos/paginas/PaginaDetalleCurso';
import PaginaPublicaciones from '@/features/publicaciones/paginas/PaginaPublicaciones';
import PaginaDetallePublicacion from '@/features/publicaciones/paginas/PaginaDetallePublicacion';
import PaginaAcercaDe from '@/features/acerca-de/paginas/PaginaAcercaDe';
import PaginaCarrito from '@/features/carrito/paginas/PaginaCarrito';
import PaginaMisCompras from '@/features/pedidos/paginas/PaginaMisCompras';
import PaginaPerfil from '@/features/perfil/paginas/PaginaPerfil';
import PaginaMisCursos from '@/features/aprendizaje/paginas/PaginaMisCursos';
import PaginaAulaCurso from '@/features/aprendizaje/paginas/PaginaAulaCurso';
import PaginaContacto from '@/features/contacto/paginas/PaginaContacto';
const PaginaPanelProductos = lazy(() => import('@/features/administracion/paginas/PaginaPanelProductos'));
const PaginaPanelCursos = lazy(() => import('@/features/administracion/paginas/PaginaPanelCursos'));
const PaginaPanelPublicaciones = lazy(() => import('@/features/administracion/paginas/PaginaPanelPublicaciones'));
import PaginaRegistroEmpresa from '@/features/software-ergonomico/paginas/PaginaRegistroEmpresa';
import PaginaEmpresaErgo from '@/features/software-ergonomico/paginas/PaginaEmpresaErgo';

// Mientras llega una pantalla que se carga aparte
const CargandoPantalla = () => (
  <div role="status" aria-label="Cargando" className="flex min-h-[60vh] items-center justify-center">
    <span className="h-10 w-10 animate-spin rounded-full border-4 border-g-20 border-t-primary" />
  </div>
);

export default function RutasApp() {
  return (
    <BrowserRouter>
      <DesplazarAlInicio />

      <Suspense fallback={<CargandoPantalla />}>
        <Routes>
        {/* Sitio publico: encabezado, navegacion y pie compartidos por todas las paginas */}
        <Route element={<PlantillaPublica />}>
          <Route path={RUTAS.home} element={<PaginaHome />} />
          <Route path={RUTAS.productos} element={<PaginaProductos />} />
          <Route path={RUTAS.productoDetalle} element={<PaginaDetalleProducto />} />
          <Route path={RUTAS.cursos} element={<PaginaCursos />} />
          <Route path={RUTAS.cursoDetalle} element={<PaginaDetalleCurso />} />
          <Route path={RUTAS.publicaciones} element={<PaginaPublicaciones />} />
          <Route path={RUTAS.publicacionDetalle} element={<PaginaDetallePublicacion />} />
          <Route path={RUTAS.acercaDe} element={<PaginaAcercaDe />} />
          <Route path={RUTAS.contactanos} element={<PaginaContacto />} />

          <Route path={RUTAS.carrito} element={<PaginaCarrito />} />

          {/* Opciones del menu de cuenta que aun no tienen pantalla propia */}
          <Route path={RUTAS.perfil} element={<PaginaPerfil />} />
          <Route path={RUTAS.historial} element={<PaginaMisCompras />} />
          <Route path={RUTAS.panelCursos} element={<PaginaMisCursos />} />

          <Route path="*" element={<PaginaNoEncontrada />} />
        </Route>

        {/* Layout sin navegacion principal para flujos especificos */}
        <Route element={<PlantillaSinNavegacion />}>
          <Route path={RUTAS.softwareErgonomico} element={<PaginaRegistroEmpresa />} />
          {/* El aula ocupa toda la pantalla: el menu principal estorba mientras se ve el curso */}
          <Route path={RUTAS.aulaCurso} element={<PaginaAulaCurso />} />
          <Route path={RUTAS.empresaErgo} element={<PaginaEmpresaErgo />} />
        </Route>

        {/* Panel de administracion: layout propio con barra lateral */}
        <Route
          path={RUTAS.panel}
          element={
            <RutaSoloAdmin>
              <PlantillaPanel />
            </RutaSoloAdmin>
          }
        >
          <Route index element={<Navigate to="productos" replace />} />
          <Route path="productos" element={<PaginaPanelProductos />} />
          <Route path="cursos" element={<PaginaPanelCursos />} />
          <Route path="publicaciones" element={<PaginaPanelPublicaciones />} />
        </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
