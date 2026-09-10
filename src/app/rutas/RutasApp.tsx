import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import PaginaInicio from '@/features/landing/paginas/PaginaInicio';
import PlantillaPanel from '@/features/administracion/componentes/plantillas/PlantillaPanel';
import PaginaProductos from '@/features/administracion/paginas/PaginaProductos';
import PaginaCursos from '@/features/administracion/paginas/PaginaCursos';
import RutaSoloAdmin from '@/app/rutas/RutaSoloAdmin';
import { RUTA_PANEL } from '@/features/administracion/utilidades/opciones-panel';

export default function RutasApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PaginaInicio />} />

        {/* Ruta de layout: PlantillaPanel se monta una vez y las secciones
            se intercambian dentro de su Outlet, sin rehacer encabezado ni barra lateral */}
        <Route
          path={RUTA_PANEL}
          element={
            <RutaSoloAdmin>
              <PlantillaPanel />
            </RutaSoloAdmin>
          }
        >
          <Route index element={<Navigate to="productos" replace />} />
          <Route path="productos" element={<PaginaProductos />} />
          <Route path="cursos" element={<PaginaCursos />} />
        </Route>

        {/* Las rutas del menu que aun no tienen pagina siguen mostrando la landing,
            que es el comportamiento que ya daba el rewrite de Vercel */}
        <Route path="*" element={<PaginaInicio />} />
      </Routes>
    </BrowserRouter>
  );
}
