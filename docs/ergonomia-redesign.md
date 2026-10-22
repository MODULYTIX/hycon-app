# Rediseño del módulo ergonómico de Hycon

## Objetivo y alcance
Empresas con registro de solo nombre; espacio propio para sus fichas; creación y edición por secciones; resumen consultable en ambos modos. Se conserva la información administrativa, representatividad, factores existentes y resultados D/I, NIOSH y OCRA. Se añaden impacto repetido y vibración de brazo-mano. Los resultados siguen siendo opcionales.

## Benchmarking y decisión de diseño
Consulta de documentación oficial realizada el 17 de octubre de 2026. Las recomendaciones siguientes son decisiones para Hycon, no afirmaciones de que los productos estudiados utilicen nuestros criterios ergonómicos.

| Referencia | Patrón observado | Aplicación en Hycon |
| --- | --- | --- |
| [IBM Carbon: create flows](https://v10.carbondesignsystem.com/community/patterns/create-flows/) | Distingue la creación breve en modal de formularios complejos en una superficie amplia con navegación lateral y acciones persistentes. | Modal de un campo para empresa; editor de ficha amplio con navegación visible. |
| [GOV.UK: task list](https://design-system.service.gov.uk/components/task-list/) | Organiza tareas relacionadas y permite comunicar sus estados. | Secciones accesibles directamente, con número de factores registrados; edición sin recorrer un asistente secuencial. |
| [GOV.UK: check answers](https://design-system.service.gov.uk/patterns/check-answers/) | Revisión de respuestas con enlaces para cambiar datos concretos. | Resumen disponible siempre y botones que llevan a datos, tarea o grupo de factores. |
| [GOV.UK: radios](https://design-system.service.gov.uk/components/radios/) | Opciones mutuamente excluyentes con etiquetas explícitas y agrupación accesible. | Sí y No visibles en cada pregunta. Sin respuesta es un estado distinto y se puede quitar una respuesta. |
| [Mitti, por SafetyCulture: inspecciones](https://help.mitti.com/000009) | Permite retomar y editar inspecciones, y revisar respuestas señaladas antes de cerrar. | Listado de fichas con estado, edición y acceso al resumen; factores activados separados de respuestas pendientes. |
| [Fulcrum: guardar registros y borradores](https://help.fulcrumapp.com/en/articles/14189839-saving-records-with-required-fields-and-project-selections) | Documenta borradores móviles y restricciones del guardado web. | Hycon necesita completar evaluaciones después: se permite guardar avance también desde la web y se informa qué queda pendiente. |

Las fuentes describen comportamientos de producto; no demuestran por sí mismas mejoras de productividad. La adecuación a Hycon se comprueba con el flujo implementado y pruebas funcionales y visuales.

### Propuestas consideradas
1. **Asistente secuencial**: orienta el alta inicial, pero añade pasos repetidos al editar. No satisface la edición directa solicitada.
2. **Formulario único con todas las preguntas**: facilita comparar datos, pero produce desplazamiento extenso y pierde la acción de guardar.
3. **Espacio de empresa + editor por secciones**: conserva contexto, permite saltar al campo que falta y ofrece un resumen permanente. Es la propuesta elegida para creación y edición.

### Decisiones por vista
| Vista | Organización elegida y razón |
| --- | --- |
| Empresas | Título de escala moderada, contadores discretos y listado con búsqueda. El acceso tiene un destino único: la empresa. |
| Registrar empresa | Modal nativo breve, solo nombre, ejemplo, validación, bloqueo mientras guarda y confirmación si hay cambios. |
| Fichas de empresa | Página con URL propia, nombre de empresa, búsqueda por ficha/puesto/área, filtro de estado, fecha de actualización, resumen y editar. |
| Datos del puesto | Tres columnas en escritorio cuando caben; dos o una en móvil. Textos largos ocupan una fila. Ejemplos en todos los campos de escritura y opción inicial en sector. |
| Representatividad | Minutos y Sí/No. Criterio general explicado; no bloquea factores que tienen condiciones independientes. |
| Factores | Filas con pregunta, Sí/No y minutos; cargas de 40 kg se responde solo Sí/No. Alerta textual, borde y fondo discretos cuando se activa el criterio. |
| Resultados | Campos realmente deshabilitados hasta que corresponden; opcionales, con estado pendiente y clasificación cuando existe un valor válido. |
| Resumen | Contadores, datos administrativos, representatividad, razones de activación, respuestas pendientes, todas las respuestas bajo detalle y resultados con valores guardados. Acceso directo para corregir. |

Visualmente: paleta verde azulada actual de Hycon, superficies blancas, líneas finas, radios de 3–5 px, tipografía contenida. No se utilizan sombras decorativas ni tarjetas grandes para cada pregunta. En móvil, las secciones pasan a una barra horizontal y las acciones permanecen visibles.

## Reglas de identificación
Fuente para los dos nuevos factores: imagen 3 adjunta al objetivo del usuario.

| Factor | Condición que activa la evaluación |
| --- | --- |
| Posturas existentes | Sí y duración diaria ≥ 120 minutos |
| Cargas de 40 kg o más al menos una vez al día | Sí; no requiere duración |
| Otras cargas existentes | Sí y duración diaria ≥ 120 minutos |
| Esfuerzos y movimientos existentes | Sí y duración diaria ≥ 120 minutos |
| Impacto repetido | Uso de manos o rodillas como martillo más de 10 veces/hora; Sí y duración > 120 minutos |
| Vibración de brazo-mano de moderada a alta | Sí y duración > 30 minutos; la referencia adjunta también menciona > 120 minutos para alta |
| Representatividad general | Tarea cotidiana y duración > 120 minutos; se calcula automáticamente como contexto |

Se preservan los clasificadores de resultados existentes. Las respuestas nuevas parten en null, no en No. Las fichas antiguas conservan sus booleanos y valores; las opciones añadidas aparecen sin responder. Un número vacío no se interpreta como cero ni como riesgo aceptable. El resumen no declara ausencia de riesgo ante información incompleta.

## Guardado y compatibilidad
- Crear una ficha siempre utiliza la empresa abierta en la URL.
- Consultar, crear y editar comprueban en servidor que la empresa pertenece al usuario; detalle y edición comprueban también la pertenencia de la ficha.
- El documento JSON guarda todos los grupos y resultados, incluidos los nuevos factores.
- La normalización completa campos nuevos conservando extensiones históricas.
- Edición con versión updatedAt: una versión antigua devuelve 409 sin sobrescribir cambios.
- Guardado bloqueado mientras hay solicitud; errores visibles sin vaciar el editor.
- Protección de cierre desde el primer cambio y aviso antes de recargar/cerrar la pestaña con cambios.
- El módulo espera la restauración de sesión y vuelve a montar sus datos para el usuario autenticado.
- Se sincronizan esquema y cliente Prisma. Los UUID de catálogo/publicaciones ya existían en migraciones y base local; se recuperan en el esquema fuente para que regenerar no los elimine.
- Migración aditiva forms.payload, con IF NOT EXISTS para instalaciones donde se agregó manualmente.

## Verificación
Las pruebas de reglas comprueban los límites 29/30/31, 119/120/121, condición booleana, resultados opcionales, normalización histórica y conservación de datos. Las pruebas del editor comprueban navegación directa, protección de cambios, guardado, errores y reintento. Las pruebas API y servicio comprueban autenticación, alcance por empresa/usuario, validación y conflictos de edición.

La revisión final debe además demostrar creación, guardado, recarga, edición y resumen en la base local; verificación visual en escritorio y móvil; compilación y lint del código cambiado. Los resultados concretos de esa revisión se registran al terminar en la sección siguiente.

## Auditoría final

Verificación realizada el 17 de octubre de 2026 sobre el código final del módulo.

| Requisito | Evidencia inspeccionada | Resultado |
| --- | --- | --- |
| Empresas con solo nombre y espacio propio | Alta real desde el modal; navegación a /software-ergonomico/empresas/:empresaId; listado y recarga de empresa | Verificado |
| Densidad, jerarquía y ejemplos de campos | Captura del editor en escritorio: tres columnas en la primera fila, texto largo en su fila, navegación lateral y guardado visible | Verificado |
| Rediseño de listados y estados vacíos | Captura de empresas; búsqueda y limpieza de filtros reales en empresas y fichas | Verificado |
| Crear y editar sin asistente secuencial | Navegación directa a cada grupo y edición de área y puntuación tras recargar | Verificado |
| Sí/No y estado sin responder | Controles radio agrupados y prueba de diferencia entre No, sin responder y minutos pendientes | Verificado |
| Nuevos factores, umbrales y activación | Pruebas 29/30/31 y 119/120/121; navegador confirmó 120 no activa impacto, 121 sí; vibración 31 y carga de 40 kg activan sus resultados independientemente de tarea de 60 min | Verificado |
| Resultados opcionales | POST real con OCRA, posturas y NIOSH vacíos; recuperación tras recarga; edición posterior de DX a 12.5 | Verificado |
| Resumen en alta y edición | Navegador confirmó ambos nuevos factores, condición booleana, motivos de activación, pendientes y puntuación DX recuperada | Verificado |
| Conservación de datos anteriores | Pruebas de normalización y roundtrip que conservan booleanos, minutos, puntuaciones y extensiones históricas | Verificado |
| Persistencia y alcance por empresa/usuario | Recarga real desde PostgreSQL; acceso por otra empresa devuelve 404; pruebas de servicio inspeccionan el filtro de propietario en lectura y escritura | Verificado |
| Conflictos de edición | Una versión antigua de la ficha real devuelve 409; prueba de servicio demuestra que no devuelve guardado exitoso | Verificado |
| Estados de solicitud y error | Pruebas de bloqueo de solicitudes duplicadas, error sin vaciar campos y reintento de edición | Verificado |
| Cierre y foco | Confirmación desde primer cambio; seguir editando conserva datos; descarte vuelve a habilitar desplazamiento; diálogo nativo mantiene el foco modal | Verificado |
| Móvil y escritorio | Navegador en 320, 390, 768 y 1440 px; sin desbordamiento horizontal; sección activa visible y acciones accesibles | Verificado |
| Base de datos reproducible | Migración aditiva aplicada; prisma migrate status confirma que las 10 migraciones están al día | Verificado |

### Comandos y resultados
- Frontend: suite completa de 56 archivos y 494 pruebas aprobada antes del ajuste final de cierre. Tras ese ajuste se ejecutaron las **20 pruebas del módulo** (incluida la regresión nueva de cierre), todas aprobadas.
- Frontend: compilación final TypeScript + Vite aprobada; ESLint aprobado para el módulo y rutas modificadas. Vite mantiene el aviso informativo de tamaño del paquete.
- Backend: compilación TypeScript aprobada y suite completa de **31 archivos / 349 pruebas** aprobada, incluyendo 16 del módulo ergonómico.
- Recorrido real local aprobado: empresa de un campo, ficha, cuatro factores que activan criterios, resultados vacíos, guardado, recarga, edición directa, resumen actualizado, 404 por empresa y 409 por versión.
- No hubo errores de ejecución del navegador en ese recorrido.
- Se retiraron exclusivamente la empresa y la ficha temporales creadas para la prueba; la comprobación posterior encontró cero empresas de QA. Las empresas originales permanecen.
- La sesión de pruebas se cerró y su archivo temporal con cookies se eliminó.

### Capturas
Las capturas se tomaron del navegador; la de factores utiliza los registros temporales de QA durante la verificación, ya eliminados.

- [Empresas](ergonomia/empresas.png)
- [Editor con datos de ejemplo sin guardar](ergonomia/editor.png)
- [Factores y resultados opcionales](ergonomia/factores.png)

### Recorrido para revisión
1. Abrir /software-ergonomico e iniciar sesión.
2. Registrar una empresa con su nombre y abrirla.
3. Crear una ficha; saltar entre secciones y guardar desde cualquiera de ellas.
4. En movimientos repetitivos, responder Sí a vibración e introducir 31 minutos. Se muestran el criterio activado y los campos OCRA opcionales.
5. Guardar sin puntuaciones, recargar y abrir Resumen o Editar.
6. Completar una puntuación, guardar y volver a abrir el resumen para verla recuperada.
