# Controles de formulario Hycon

- `EntradaBase`: texto, correo, contraseña, números y búsqueda. Acepta atributos HTML, ref y `compacto` para filas densas.
- `AreaTextoBase`: texto multilínea con el mismo borde, foco, error y estado deshabilitado.
- `Selector`: menú propio con `opciones: { valor, etiqueta, descripcion?, deshabilitada? }[]`. `onChange` recibe el valor, no un evento. Admite valor controlado o `defaultValue`, `name` para FormData y restablecimiento del formulario.
- `CampoTexto`, `CampoTextoLargo` y `EntradaTexto` usan estas bases; conservan etiquetas, ayuda, errores, prefijos y acciones de contraseña.

El selector mantiene el foco en el botón. Flechas, Inicio/Fin y escritura navegan; Enter confirma; Escape cierra la lista antes de afectar el modal; Tab continúa con el siguiente campo. El menú usa la capa superior del navegador mediante Popover para evitar recortes dentro de diálogos. Se posiciona encima cuando falta espacio debajo. En entornos sin esa API, se renderiza como lista personalizada normal.

Integrado en ergonomía, filtros de productos/cursos/publicaciones, contacto y formularios que ya usan los campos compartidos (acceso, perfil, compra y administración). Los controles especializados de rango, archivos y opciones Sí/No conservan sus componentes propios.

Verificación visual: `ergonomia/controles-selector-desktop.png` y `ergonomia/controles-selector-mobile.png`.
