# Medicion de Discover Mexico

## Instalacion y alcance

Solo Discover carga `GTM-K45KXVZR`, con `next/script` despues de la hidratacion y
el iframe noscript al inicio del body. El cargador tiene una guarda por documento;
las navegaciones internas no reinstalan GTM. No se instalo otra biblioteca ni se
agrego una etiqueta directa de GA4 o Ads. No hay cambios en la web mexicana.

Antes de la implementacion, las dos homes publicas no incluian GTM/GA4/Ads en su
HTML. El JavaScript publicado de este contenedor si contiene un destino Ads:
`AW-18562613894`. No se encontro un ID GA4 en ese recurso publico. Esto no sustituye
una auditoria de la cuenta ni confirma la propiedad de ese destino.

## Accion necesaria en la cuenta de Google

La version inspeccionada del contenedor tenia deteccion automatica de datos
personales (email, telefono y direccion) y de formularios, historial y enlaces.
Antes de habilitar medicion completa:

1. Google Ads > Herramientas > Gestor de datos > Etiqueta de Google > Gestionar.
2. Verificar el destino `AW-18562613894` y abrir Mostrar todo, si hace falta.
3. Desactivar Permitir funciones de datos proporcionados por los usuarios,
   incluyendo su deteccion automatica. Guardar y publicar si corresponde.
4. En Gestionar deteccion automatica de eventos, desactivar formularios, enlaces
   salientes e historial/page views automaticos. No usar sus URLs o textos como
   sustitutos de los eventos controlados de esta aplicacion.
5. Si se configura GA4, desactivar tambien la recogida automatica equivalente
   (formularios, outbound, busqueda interna y cambios de historial). El page_view
   inicial automatico debe estar desactivado: `send_page_view=false`.

No usar conversiones mejoradas, deteccion de datos de formularios, user_data,
User-ID ni variables DOM con datos de clientes en esta implementacion.

## Eventos y significado

| Evento | Momento | Conversion principal |
| --- | --- | --- |
| page_view | Visita de una pagina conocida, inicial, SPA, idioma o Back/Forward | No |
| view_package | Visita de una de las seis URLs de paquete | No |
| select_package | Activacion de enlace de paquete/cotizacion; no cambio de idioma | No |
| whatsapp_click | Activacion real de un enlace HTTPS wa.me; no iconos con enlaces internos | No |
| quote_request_validated | Acuse API valido en development o live | No |
| quote_request_received | API live confirma solicitud recibida; puede estar queued | No |
| generate_lead | HTTP 200, mode live, status delivered y referencia UUID valida | Si |

HTTP 202 queued es un acuse durable con entrega pendiente, no generate_lead. HTTP
200 development prepara el resumen sin guardar el contacto ni enviarlo a Kommo.
Errores, respuestas incompletas o resultados desconocidos no generan conversion.
La referencia del backend se usa solo en memoria para evitar repetir eventos;
no se envia a Google, no se escriben cookies ni storage de deduplicacion.

No hay polling del estado queued ni integracion nueva con CRM o WhatsApp. Si la
entrega ocurre despues, no se inventa una conversion en el navegador: hara falta
un acuse posterior real o una futura medicion server-side/offline. Un clic nunca
confirma que el usuario envio un mensaje. No se emite purchase ni una venta.

## Datos permitidos

Todos los eventos propios llevan `measurement_source=discover_app`. Campos:

- `page_path`, `source_page`, `page_location`, `page_referrer`, `page_title`, `page_type`.
- `language`: idioma de pagina en/es, no inferido por nacionalidad.
- `package_id`, `package_name`: solamente del catalogo aprobado.
- `destination`, `destinations`, `journey_id`: slugs conocidos del catalogo.
- `target_page`, `interaction_location`, `office`, `request_state`, `delivery_status`.

Los campos no aplicables se mandan como null para limpiar contexto anterior en
GTM. Las URLs no incluyen query ni fragmento; las rutas desconocidas se convierten
en /en/404, /es/404 o /404 sin transmitir el texto desconocido. Referencias externas
se limitan al origen. Nunca se envian formularios, email, nombre, telefono, pais
de residencia, fechas, edades, comentarios, requestId, URL/mensaje de WhatsApp,
Idempotency-Key, ni hashes de contacto. Los titulos tambien provienen del catalogo,
no de texto arbitrario del DOM. No enviar Click URL ni Page URL sin sanear.

## Consentimiento

Antes del contenedor se establecen analytics_storage, ad_storage, ad_user_data y
ad_personalization como denied. Se desactivan senales Google/personalizacion y
se activa ads_data_redaction. La casilla de la solicitud NO es consentimiento
para publicidad/analytics y no cambia esos valores.

No se agrego un banner ni se invento una eleccion de consentimiento. Configurar
una CMP aprobada mediante la plantilla de consentimiento de GTM, y comprobar sus
actualizaciones y las comprobaciones adicionales de cada etiqueta. No conceder
ad_user_data ni habilitar recoleccion automatica como parte de esta tarea.
Denied no equivale a ausencia de red: el modo avanzado puede enviar pings sin
cookies. Si se requiere bloqueo completo hasta consentimiento, usar controles
adicionales/modo basico en las etiquetas. No se afirma cumplimiento legal completo.

## Configuracion en GTM, GA4 y Ads

1. Crear variables de capa de datos version 2 para los campos permitidos anteriores.
2. Usar activadores Evento personalizado con nombres exactos de la tabla,
   `measurement_source` igual a `discover_app` y Page Hostname igual a
   `discover.deviaje.mx`. No combinar con activadores de clic/formulario/historial.
3. GA4: obtener el ID real G-... del flujo web de Discover. Configurar Google tag
   sin page_view automatico. Usar las variables saneadas page_location,
   page_referrer y page_title como parametros de configuracion y de los eventos.
4. Crear etiqueta(s) de evento GA4 para los eventos de la tabla; no dispararlas
   de nuevo mediante enhanced measurement. Registrar dimensiones personalizadas
   de evento para paquete, destino, idioma, placement y delivery_status si se
   necesitan en informes. No registrar IDs de recibos ni datos de contacto.
5. Ads: confirmar el ID ya observado y obtener el Conversion Label real de una
   accion de solicitud confirmada. Activar esa conversion SOLO en generate_lead,
   contar Una y no asignar importes inventados. No agregar otro AW a la web.
6. Mantener whatsapp_click como accion secundaria/observacion si se desea medirlo;
   no convertirlo en lead confirmado ni usarlo como venta.
7. Elegir un solo origen para la conversion principal: etiqueta nativa Ads
   (recomendada con el destino ya existente) O importar generate_lead desde GA4.
   No activar ambas como primarias para la misma solicitud. Verificar vinculacion
   GA4/Ads y etiquetado automatico de las campanas. El enlace de conversion ya
   puede estar integrado en el Google tag; no duplicarlo sin revisar.

Los parametros publicitarios originales no se borran de la barra de direcciones:
Google puede gestionar su atribucion mediante sus etiquetas y consentimiento.
La app no transmite queries libres como parametros analiticos. La atribucion de
una conversion real desde un anuncio debe verificarse en la cuenta; los eventos
locales no prueban una importacion ni una atribucion de Google Ads.

## Comprobar con Tag Assistant

Abrir el contenedor en Tag Manager > Vista previa, conectar
https://discover.deviaje.mx/en y repetir en /es. En cada evento propio revisar
Data Layer, Variables, Consent y Tags Fired/Not Fired. Confirmar:

- Una carga de GTM por documento y un page_view por pagina, no por paso de formulario.
- Las tres landings en ambos idiomas producen view_package con el mismo ID comercial.
- Seleccionar paquete produce select_package; cambiar idioma no lo vuelve a seleccionar.
- WhatsApp de oficinas, flotante, paquete y resultado produce solo whatsapp_click.
- Validacion fallida no convierte. Development produce validacion, nunca generate_lead.
- Solo un acuse live/delivered produce generate_lead; queued queda separado.
- No aparecen datos personales ni URLs con query en los parametros enviados.

No enviar solicitudes de prueba a produccion sin coordinarlo con el equipo. Los
casos delivered/queued se probaron localmente con respuestas interceptadas y
transporte de gateway simulado, no con leads reales ni confirmaciones inventadas.
Comprobar DebugView de GA4 y los diagnosticos de Ads despues de configurar sus IDs,
consentimiento y activadores; GTM instalado no significa conversiones configuradas.

## Pruebas locales

`npm test`, `npm run check`, `npm run build`.
Con preview local: `node tools/analytics-qa.mjs`.
Auditoria de privacidad con el contenedor publico:
`node tools/analytics-qa.mjs --real-container`.
Este ultimo carga solo JavaScript publico; intercepta los hits y no los entrega
a Google. No abre conversaciones reales ni envia mensajes o leads de prueba.

## Fuentes oficiales

- https://developers.google.com/tag-platform/tag-manager/datalayer
- https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications
- https://support.google.com/analytics/answer/6366371
- https://developers.google.com/tag-platform/security/guides/consent
- https://support.google.com/google-ads/answer/12131703?hl=es
- https://support.google.com/tagmanager/answer/6107056
