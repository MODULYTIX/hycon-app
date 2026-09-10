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
  features/
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

Los enlaces del menu (`/perfil`, `/historial-de-compras`, `/panel-de-configuracion`,
`/panel-de-cursos`, `/software-ergonomico`, `/carrito`) todavia no tienen pagina
asociada: la app no monta un router. `vercel.json` reescribe cualquier ruta a `/`,
asi que hoy devuelven la landing en lugar de un 404.
