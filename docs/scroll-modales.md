# Corrección de desplazamiento de modales

## Causa verificada
En la ficha ergonómica, los legend y otros textos sr-only usan posición absoluta. Su referencia era el dialog nativo, no el contenido desplazable. Sus posiciones ampliaban el área del diálogo aunque los campos ya estuvieran dentro de su propio scroll.

A 1272 × 895 px, antes del cambio el diálogo tenía 850 px de alto útil y 1148 px de área desplazable. Al hacer relativo el contenedor del contenido, el área del diálogo volvió a 850 px. El contenido conserva su propio desplazamiento.

## Cambios
- Contenido de la ficha con posición relativa, min-height: 0 y desplazamiento contenido.
- Marco y zona central de la ficha acotados; cabecera y acciones no se contraen ni reciben contenido superpuesto.
- Navegación horizontal en móvil o con hasta 700 px de alto, para evitar otra barra vertical en la navegación.
- Los mensajes de error forman parte del mismo contenido desplazable; al fallar el guardado se muestra su inicio.
- Formularios de productos, cursos, publicaciones y temario con sus etiquetas ocultas contenidas en el área correcta.
- Modales compartidos centrados mediante márgenes automáticos y sin contracción del panel. Si el contenido supera la pantalla, su inicio y final permanecen accesibles.
- Acceso y registro utilizan el desplazamiento exterior del modal, sin duplicarlo dentro.
- Con 400 px de alto o menos, los formularios del panel utilizan un único desplazamiento exterior para mantener todos los controles accesibles.

## Comprobación
Navegador Chrome con la aplicación local, sin guardar fichas, productos, cursos, publicaciones ni pedidos:

- 36 combinaciones de las seis secciones de la ficha con tamaños 1272×895, 1366×768, 1100×650, 390×844, 844×390 y 1024×280.
- Se midió que el diálogo no tiene desbordamiento propio, que solo el contenido tiene scroll vertical y que cabecera y acciones permanecen dentro de la pantalla.
- Resumen con todas las respuestas desplegadas y mensaje de error largo: sin desbordamiento del marco, guardado y cierre accesibles.
- 20 casos adicionales: productos, cursos, publicaciones, acceso, registro y los tres métodos del modal de pago. No se enviaron pedidos.
- Cuatro tamaños del temario y cierre protegido de un producto sin guardar en pantalla de poca altura.
- En cada caso se comprobó el propietario del scroll y el acceso a ambos extremos del modal.
- Suite de frontend: 57 archivos, 495 pruebas aprobadas.
- Compilación TypeScript + Vite y ESLint de todos los componentes modificados aprobados.
- Sesión temporal de revisión cerrada y archivo temporal de cookies eliminado.

[Captura de la ficha corregida](ergonomia/scroll-corregido.png)

