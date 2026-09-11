# Hycon App

Sitio de Hycon: catalogo publico, area de cuenta y panel de administracion.
React 19 + Vite 7 + Tailwind 4 + React Router 7 + TypeScript.

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

El codigo sigue **screaming architecture**: cada carpeta dentro de `src/features`
nombra un dominio del negocio, no una tecnologia, y coincide con lo que el
visitante ve en el menu. Dentro de cada dominio los componentes se organizan por
**atomic design** (atomos, moleculas, organismos, plantillas, paginas).

```
src/
  app/                        Arranque de la aplicacion
    App.tsx
    proveedores/              Proveedores de contexto globales
    rutas/                    rutas.ts (catalogo de URLs), arbol de rutas,
                              guarda de rol y paginas de 404 / en construccion
  features/
    home/                     Portada: Hero, Servicios, Plataforma Asociada, Clientes
    productos/                Dominio producto, publico y de panel
      componentes/
        moleculas/            TarjetaProducto (publico), FilaProducto (panel)
        organismos/           RejillaProductos, ListaProductos,
                              FormularioProducto, ModalProducto
      paginas/                PaginaProductos (catalogo publico)
      servicios/              Llamadas a /api/v1/catalog/products
      tipos/                  Producto y su formulario
      utilidades/             Validaciones del formulario
    cursos/                   Mismo reparto que productos
    publicaciones/            Seccion sin backend todavia
    acerca-de/                Quienes somos, Por que elegirnos, Alcance
    contacto/                 Formulario publico y boton de WhatsApp
    autenticacion/            Login, registro, sesion y menu de cuenta
    administracion/           Panel: barra lateral, layout y paginas de gestion
  shared/
    ui/
      atomos/                 Titulo, EntradaTexto, Etiqueta, TextoError,
                              Cargador, EtiquetaEstado, EstadoVacio
      moleculas/              CampoFormulario, CampoArea, CampoSeleccion,
                              AlertaFormulario
      organismos/             Encabezado, NavegacionPrincipal, PiePagina, Modal
      plantillas/             PlantillaPublica, PlantillaSeccion, CabeceraPagina,
                              PaginaMensaje
    hooks/                    useListaRemota
    configuracion/            Lectura de variables de entorno
    utilidades/               Cliente HTTP, token, formato y validaciones comunes
  assets/                     Imagenes y fuentes
  pruebas/                    Configuracion de Vitest
```

Los imports usan el alias `@` apuntando a `src`, de modo que mover una carpeta no
obliga a reescribir rutas relativas.

Un dominio no importa de otro salvo por lo que sea genuinamente compartido, que
vive en `shared`. Si dos features necesitan lo mismo, sube a `shared`; no se
importa de `features/x` desde `features/y`.

## Rutas

| Ruta | Contenido |
| --- | --- |
| `/` | Portada |
| `/productos` | Catalogo publico de productos |
| `/cursos` | Catalogo publico de cursos |
| `/publicaciones` | Seccion en preparacion (sin backend) |
| `/acerca-de` | Quienes somos, por que elegirnos y alcance |
| `/contactanos` | Formulario de contacto |
| `/carrito`, `/perfil`, `/historial-de-compras`, `/panel-de-cursos`, `/software-ergonomico` | Pantallas en construccion |
| `/panel-de-configuracion/productos` | Alta y listado de productos (solo ADMIN) |
| `/panel-de-configuracion/cursos` | Alta y listado de cursos (solo ADMIN) |
| cualquier otra | Pagina de no encontrada |

Todas las URLs salen de `src/app/rutas/rutas.ts`: renombrar una seccion es un
cambio en un solo archivo.

Hay dos **rutas de layout**, `PlantillaPublica` y `PlantillaPanel`. Cada una se
monta una sola vez y las paginas se intercambian dentro de su `Outlet`, asi que al
cambiar de seccion no se rehacen el encabezado, la navegacion ni el pie: solo el
contenido.

`RutaSoloAdmin` protege el panel en el cliente, pero eso es comodidad de interfaz:
la autorizacion real la aplica el backend, que exige rol `ADMIN` en
`POST /api/v1/catalog/products` y `POST /api/v1/catalog/courses`.

## Catalogo publico y panel

El backend solo publica lo que esta en estado `active`. El panel pide
`?estado=todos` para poder ver y gestionar tambien lo dado de baja, de modo que un
producto marcado como inactivo desaparece de `/productos` pero sigue en el panel.

El alta de productos y cursos ocurre en un modal; el listado del panel es una
lista de filas y el del sitio publico una rejilla de tarjetas.

## Sesion y roles

- El token JWT lo emite el backend y se guarda en `localStorage` bajo `hycon.token`.
- Al cargar la pagina, si hay token se llama a `GET /api/v1/auth/me` para
  reconstruir la sesion; si el token caduco se limpia en silencio.
- El menu de la cuenta se arma con `filtrarOpcionesPorRol`: **Panel de
  configuracion** solo aparece para el rol `ADMIN`. El rol proviene del token que
  firma el backend, nunca de una preferencia guardada en el navegador.
