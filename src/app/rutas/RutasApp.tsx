import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import DesplazarAlInicio from '@/app/rutas/DesplazarAlInicio';
import RutaSoloAdmin from '@/app/rutas/RutaSoloAdmin';
import PaginaEnConstruccion from '@/app/rutas/PaginaEnConstruccion';
import PaginaNoEncontrada from '@/app/rutas/PaginaNoEncontrada';
import { RUTAS } from '@/app/rutas/rutas';

import PlantillaPublica from '@/shared/ui/plantillas/PlantillaPublica';
import PlantillaPanel from '@/features/administracion/componentes/plantillas/PlantillaPanel';

import PaginaHome from '@/features/home/paginas/PaginaHome';
import PaginaProductos from '@/features/productos/paginas/PaginaProductos';
import PaginaDetalleProducto from '@/features/productos/paginas/PaginaDetalleProducto';
import PaginaCursos from '@/features/cursos/paginas/PaginaCursos';
import PaginaDetalleCurso from '@/features/cursos/paginas/PaginaDetalleCurso';
import PaginaPublicaciones from '@/features/publicaciones/paginas/PaginaPublicaciones';
import PaginaAcercaDe from '@/features/acerca-de/paginas/PaginaAcercaDe';
import PaginaContacto from '@/features/contacto/paginas/PaginaContacto';
import PaginaPanelProductos from '@/features/administracion/paginas/PaginaPanelProductos';
import PaginaPanelCursos from '@/features/administracion/paginas/PaginaPanelCursos';

export default function RutasApp() {
  return (
    <BrowserRouter>
      <DesplazarAlInicio />

      <Routes>
        {/* Sitio publico: encabezado, navegacion y pie compartidos por todas las paginas */}
        <Route element={<PlantillaPublica />}>
          <Route path={RUTAS.home} element={<PaginaHome />} />
          <Route path={RUTAS.productos} element={<PaginaProductos />} />
          <Route path={RUTAS.productoDetalle} element={<PaginaDetalleProducto />} />
          <Route path={RUTAS.cursos} element={<PaginaCursos />} />
          <Route path={RUTAS.cursoDetalle} element={<PaginaDetalleCurso />} />
          <Route path={RUTAS.publicaciones} element={<PaginaPublicaciones />} />
          <Route path={RUTAS.acercaDe} element={<PaginaAcercaDe />} />
          <Route path={RUTAS.contactanos} element={<PaginaContacto />} />

          {/* Opciones del menu de cuenta que aun no tienen pantalla propia */}
          <Route path={RUTAS.carrito} element={<PaginaEnConstruccion />} />
          <Route path={RUTAS.perfil} element={<PaginaEnConstruccion />} />
          <Route path={RUTAS.historial} element={<PaginaEnConstruccion />} />
          <Route path={RUTAS.panelCursos} element={<PaginaEnConstruccion />} />
          <Route path={RUTAS.softwareErgonomico} element={<PaginaEnConstruccion />} />

          <Route path="*" element={<PaginaNoEncontrada />} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
