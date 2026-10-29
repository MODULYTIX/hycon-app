# Listado comparativo de evaluaciones

La vista principal de ergonomía abre la pestaña Evaluaciones y reúne las fichas de las empresas del usuario. La pestaña Empresas conserva su listado y registro. La tabla también se usa dentro de cada empresa.

Columnas: tarea/puesto (empresa y ficha como contexto), área/gerencia, resultados de posturas D/I, NIOSH, OCRA DX/IX, estado y acciones. Superintendencia es opcional. Búsqueda sin distinguir acentos en datos administrativos; filtros combinables de empresa, área, tipo de evaluación y estado; orden por actualización o puesto.

Los valores y colores usan las funciones de clasificación existentes. Se distinguen resultados pendientes, factores aún por identificar y grupos sin criterio activado. Los resultados anteriores se conservan y se identifican cuando no hay criterio activado actualmente.

Resumen/Editar consulta la versión actual de la ficha y abre el mismo editor en un modal. Al guardar se actualiza la fila sin perder los filtros. En móvil el desplazamiento horizontal queda limitado a la tabla; en escritorio la primera columna y cabeceras permanecen visibles al desplazar.

La API disponible lista fichas por empresa: el listado conjunto consulta esas rutas, con cancelación al desmontar, estado de carga y reintento ante errores, sin presentar resultados parciales como un listado completo.

Verificación: pruebas de tabla y agregación (filtros, cero, pendientes, colores, edición, conservación de búsqueda y reintento); suite de ergonomía; TypeScript, ESLint y build. Capturas de diseño con datos de prueba: `ergonomia/tabla-evaluaciones-desktop.png` y `ergonomia/tabla-evaluaciones-mobile.png`.

## Datos de demostración

Se añadieron 12 fichas ficticias en «Demo · Evaluaciones ergonómicas», con puestos de logística, producción, mantenimiento, calidad, administración, servicios generales y operaciones. Incluyen uno, dos o tres métodos, resultados de distintos colores, un resultado pendiente y una ficha en registro. El nombre de cada ficha empieza por DEMO y la descripción identifica los valores como inventados.

El script `scripts/seed-ergo-demo.mjs` usa la API con HYCON_DEMO_EMAIL y HYCON_DEMO_PASSWORD en variables de entorno. Reutiliza la empresa por nombre y omite fichas ya existentes con el mismo nombre. No modifica registros existentes. Verifica los valores persistidos y cierra su sesión al terminar.

Comprobación en la interfaz: 12 fichas al filtrar la empresa de demostración; 3 al combinar el área Logística. Captura: `ergonomia/tabla-fichas-demo.png`.

### Ajustes para presentación

Los mismos 12 registros conservaron sus valores y descripciones de ejemplo; se renombraron con el puesto como título y la empresa pasó a llamarse «Servicios Industriales del Sur» (nombre ilustrativo). El script de carga usa esos nombres para no volver a generar prefijos DEMO. Las acciones usan iconos de ojo y lápiz con etiquetas accesibles y tooltips; la columna Estado mide 135 px. Verificación con la tabla real: 12 filas, 24 botones, apertura de resumen y edición; captura `ergonomia/tabla-presentacion-iconos.png`.
