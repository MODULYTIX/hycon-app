# Hycon App

Landing y area de cuenta de Hycon. React 19 + Vite 7 + Tailwind 4 + TypeScript.

## Puesta en marcha

```bash
pnpm install
pnpm dev
```

La app espera al backend en la URL definida en `.env` (parte de `.env.example`):

```env
HYCON_API_URL=http://localhost:4000
```

Debe coincidir con el `PORT` del `.env` de `hycon-backend`, y ese origen tiene que
estar listado en el `CORS_ORIGINS` del backend.

Vite solo expone al navegador las variables con los prefijos declarados en
`envPrefix` (`vite.config.ts`): `HYCON_` y `VITE_`. Por eso **cualquier variable
que empiece por `HYCON_` acaba en el bundle publico**: no poner secretos con ese
prefijo. `VITE_API_URL` sigue funcionando como respaldo para despliegues antiguos.

Para levantar el backend y la base de datos ver `hycon-backend` y `hycon-db`.

## Comandos

| Comando | Que hace |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo en http://localhost:5173 |
| `pnpm build` | Comprueba tipos y genera `dist/` |
| `pnpm test` | Pruebas unitarias y de componentes (Vitest + Testing Library) |
| `pnpm lint` | ESLint |

## Arquitectura

El codigo sigue **screaming architecture**: las carpetas de primer nivel dentro de
`src/features` nombran el dominio del negocio, no la tecnologia. Dentro de cada
dominio los componentes se organizan por **atomic design** (atomos, moleculas,
organismos).

```
src/
  app/                      Arranque de la aplicacion
    App.tsx
    proveedores/            Proveedores de contexto globales
    rutas/                  Enrutado (react-router) y guarda de rol
  features/
    administracion/         Panel de administracion (solo ADMIN)
      componentes/
        atomos/             EtiquetaEstado, EstadoVacio
        moleculas/          ItemSeccion, CabeceraSeccion, FilaProducto, FilaCurso
        organismos/         BarraLateral, ListaProductos, ListaCursos,
                            ModalProducto, ModalCurso y sus formularios
        plantillas/         PlantillaPanel (encabezado + barra lateral + Outlet)
      paginas/              PaginaProductos, PaginaCursos
      servicios/            Llamadas a /api/v1/catalog
      tipos/                Producto, Curso y sus formularios
      utilidades/           Validaciones, formato y secciones del panel
    autenticacion/          Inicio de sesion, registro y menu de cuenta
      componentes/
        atomos/             AvatarUsuario, AlertaFormulario, IndicadorFuerza
        moleculas/          CampoContrasena, PestanasAcceso, ItemMenuCuenta
        organismos/         ModalAcceso, FormularioLogin, FormularioRegistro,
                            MenuUsuario, AccesoCuenta
      contexto/             Estado de sesion compartido
      hooks/                useAutenticacion
      servicios/            Llamadas a /api/v1/auth
      tipos/                Usuario, Sesion, Rol, OpcionCuenta
      utilidades/           Validaciones y opciones del menu por rol
    contacto/               Formulario publico de contacto
    landing/                Secciones de la pagina de inicio
      componentes/organismos/
      paginas/PaginaInicio.tsx
  shared/
    ui/
      atomos/               Titulo, EntradaTexto, Etiqueta, TextoError, Cargador
      moleculas/            CampoFormulario
      organismos/           Encabezado, PiePagina, Modal
    configuracion/          Lectura de variables de entorno (URL del backend)
    utilidades/             Cliente HTTP y almacenamiento del token
  assets/                   Imagenes y fuentes
  pruebas/                  Configuracion de Vitest
```

Los imports usan el alias `@` apuntando a `src`, de modo que mover una carpeta no
obliga a reescribir rutas relativas.

## Sesion y roles

- El token JWT lo emite el backend y se guarda en `localStorage` bajo `hycon.token`.
- Al cargar la pagina, si hay token se llama a `GET /api/v1/auth/me` para
  reconstruir la sesion; si el token caduco se limpia en silencio.
- El menu de la cuenta se arma con `filtrarOpcionesPorRol`: **Panel de
  configuracion** solo aparece para el rol `ADMIN`. El rol proviene del token que
  firma el backend, nunca de una preferencia guardada en el navegador.

## Rutas

| Ruta | Contenido |
| --- | --- |
| `/` | Landing publica |
| `/panel-de-configuracion` | Redirige a la seccion de productos |
| `/panel-de-configuracion/productos` | Alta y listado de productos (solo ADMIN) |
| `/panel-de-configuracion/cursos` | Alta y listado de cursos (solo ADMIN) |
| cualquier otra | Landing, igual que antes del router |

`PlantillaPanel` es una **ruta de layout**: se monta una sola vez y las secciones
se intercambian dentro de su `Outlet`. Al cambiar de seccion no se rehacen ni el
encabezado ni la barra lateral, solo el contenido.

El alta de productos y cursos ocurre en un **modal**; el listado es una lista de
filas con miniatura, datos, stock, estado y precio.

`RutaSoloAdmin` protege el panel en el cliente, pero eso es solo comodidad de
interfaz: la autorizacion real la aplica el backend, que exige rol `ADMIN` en
`POST /api/v1/catalog/products` y `POST /api/v1/catalog/courses`.

El resto de enlaces del menu de cuenta (`/perfil`, `/historial-de-compras`,
`/panel-de-cursos`, `/software-ergonomico`, `/carrito`) todavia no tienen pagina
propia y caen en la landing.

La seccion **ARTICULOS** de la barra lateral aparece desactivada porque no existe
una tabla que la respalde en `schema.prisma`, asi que no hay endpoint al que llamar.
