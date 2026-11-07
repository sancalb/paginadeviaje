# Discover: auditoria y reutilizacion de personajes

## Alcance

Solo se crean `discover-mexico/components/characters.tsx` y este documento.
El componente exporta `Characters({ locale })`, con `Locale` del catalogo actual.
No se integra en paginas ni se importa, copia, edita o sustituye CSS aqui. La
integracion y el vendor/import del `styles.css` original quedan a cargo del
integrador. No cargar el `script.js` global original en React: sus listeners y
mutaciones del DOM duplicarian el comportamiento que ahora controla el componente.

## Evidencia original

- `index.html:455-522`: seccion `#personajes`, encabezado, seis `article` y orden
  Diego, Chente, Diana, Frida, Minerva, Tenoch. Se conservan los roles y frases
  espanoles literalmente; el ingles los traduce, sin inventar funciones nuevas.
- `index.html:479-500`: solo Frida tiene enlace, con retrato, nombre, rol y frase
  dentro de `.frida-trigger`. Los otros cinco personajes son estaticos, con el
  hover visual del CSS original, sin enlaces o botones nuevos.
- `styles.css:1473-1771`: `.crew-section`, `.mini-crew article`, `.frida-member`,
  `.frida-trigger`, `.frida-mega`, `.frida-menu-panel`, `.frida-menu-copy`,
  `.frida-menu-content`, `.frida-teaser-strip`, `.frida-teaser-link.has-image`,
  `.frida-menu-explore` y los estados `.has-frida-open` / `.is-frida-open`.
- La busqueda de `crew-item` en HTML, CSS y script originales no encuentra esa
  clase. No se inventa: el selector real es `.mini-crew article`.
- `script.js:267-375`: hover solo con `(hover: hover) and (pointer: fine) and
  (min-width: 901px)`; apertura inmediata, cierre diferido original de **210 ms**,
  cancelacion al entrar al panel, apertura con foco y cierre con Escape
  (`script.js:72`). Las transiciones CSS duran **240 ms**, no el timer original.
- `script.js:212,307-341`: el teaser original usa Oaxaca, Nueva York, Cusco y
  Cartagena, thumbnails mediante `--destination-image`, y enlaces
  `/destinos/{slug}`; Frida y el enlace final llevan a `/frida`.
- `styles.css:3680-3687`: hasta 1160 px la fila se convierte en scroller horizontal.
  `styles.css:4434-4442`: en movil, columnas de 148 px y retratos de 128 x 200 px.
  `styles.css:4476-4479`: hasta 900 px, `.frida-mega { display: none; }`.
- `styles.css:3617-3630` y `script.js:1611-1629`: `.reveal` necesita `.is-visible`
  para ser visible. Se incluye ese estado desde el render; no se importa el
  observador global ni se deja la seccion invisible esperando otro script.

## Assets sin modificaciones

Se reutilizan exactamente los seis WebP ya presentes en
`discover-mexico/public/media/`: `diego-cutout.webp`, `chente-cutout.webp`,
`diana-cutout.webp`, `frida-cutout.webp`, `minerva-cutout.webp`, `tenoch-cutout.webp`.
Las URL son `/media/{nombre}-cutout.webp`, sin generar ni retocar ilustraciones.
Inspeccion visual de `frida-cutout.webp`: figura naranja con flores, pincel y
paleta, **rostro sin facciones**. Se conserva ese archivo, sin superponer cara,
emoji, avatar alternativo o iconografia sobre el rostro.

## Rutas y catalogo actual

Los nombres e imagenes salen de `discover-mexico/data/content.ts`, no del JSON
internacional original. Se seleccionan por slug en este orden fijo:

| Slug | Thumbnail existente | EN | ES |
| --- | --- | --- | --- |
| oaxaca | /media/oaxaca.webp | /en/destinations/oaxaca | /es/destinos/oaxaca |
| mexico-city | /media/mexico-city.webp | /en/destinations/mexico-city | /es/destinos/mexico-city |
| guadalajara | /media/guadalajara.webp | /en/destinations/guadalajara | /es/destinos/guadalajara |
| tequila | /media/tequila.webp | /en/destinations/tequila | /es/destinos/tequila |

Todas se construyen con `href(locale, "destinations", destination.slug)` de
`discover-mexico/lib/routes.ts`. El resolver existente en
`discover-mexico/app/[locale]/[[...path]]/page.tsx` acepta estos cuatro slugs.
Frida completa (incluidos retrato y nombre) y **Explore all / Explorar todos**
usan `href(locale, "destinations")`: `/en/destinations` o `/es/destinos`.
No se usa `/frida`, una ruta internacional, ni una ruta fabricada por traduccion
del slug. Los cinco personajes restantes no reciben rutas nuevas.

## Decisiones de reutilizacion

- Se conserva la jerarquia original del teaser: panel anclado sobre Frida,
  texto corto, cuatro thumbnails y enlace final. No hay modal de pantalla
  completa, galeria gigante, pagina nueva ni portal.
- Se conservan sus clases y atributos `data-frida-*` para poder aplicar el CSS
  completo original. Los IDs de panel/titulo se generan con `useId`.
- La apertura por hover/foco es inmediata. El **cierre se difiere 240 ms** y se
  cancela al entrar al host/panel o mover el foco entre sus enlaces, permitiendo
  atravesar los 14 px originales de separacion sin cerrar. No se cierra mientras
  el foco permanezca dentro o el puntero este sobre Frida/panel.
- Escape cierra, sincroniza `aria-expanded` / `aria-hidden` y devuelve el foco a
  Frida si estaba dentro. No roba foco externo ni lo atrapa en un dialogo modal.
  El panel cerrado es `inert`, por lo que sus enlaces no quedan en el tabulado.
  El foco interno restaurado no vuelve a abrirlo. Tab/Shift+Tab permiten recorrer
  los enlaces; salir del conjunto agenda el mismo cierre.
- En movil/touch no se abre el teaser. Frida sigue siendo un enlace nativo al
  catalogo, sin interceptar click, Enter, enlaces modificados o abrir otra pestana.
  Un cambio de media query cierra el panel; los timers/listeners se limpian al
  desmontar. Se mantiene el scroller movil del CSS original.
- Excepciones locales de compatibilidad, sin editar el CSS: en escritorio fino
  >=901 px la fila usa seis columnas flexibles y overflow visible para que el
  scroller original <=1160 px no recorte el panel. Los retratos tienen
  `max-width:100%` para caber en esas columnas y dimensiones HTML de reserva.
- Las etiquetas del thumbnail heredan su color para evitar que los selectores
  generales `.mini-crew strong/span` anulen el blanco de `.has-image`.
  Las etiquetas compactas de 0.72rem y padding horizontal de 6 px permiten leer
  los nombres en las cuatro columnas estrechas originales, con
  `overflow-wrap:anywhere` como proteccion. Las flechas son de Lucide, ya instalado.
- No se agregan estilos globales, dependencias, nuevas fotos ni fetch de catalogo.
  La unica variable de imagen es la original `--destination-image`, alimentada
  desde `destination.image`.

## Snapshot CSS original

Estos extractos son evidencia del contrato visual, **no un stylesheet nuevo**.
Importar/vendorizar el archivo original completo, con sus variables, resets,
selectores compartidos, pseudo-elementos y media queries. No bastan estos bloques.

```css
.mini-crew {
  display: grid;
  grid-template-columns: repeat(6, minmax(120px, 1fr));
  gap: 6px;
  align-items: end;
  max-width: var(--max);
  margin: 0 auto;
}

.mini-crew article {
  display: grid;
  justify-items: center;
  text-align: center;
}

.mini-crew img {
  width: 150px;
  height: 230px;
  object-fit: contain;
  object-position: center bottom;
  filter: drop-shadow(0 16px 20px rgba(6, 27, 47, 0.14));
  transition: transform 280ms ease;
}

.frida-mega {
  position: absolute;
  z-index: 1;
  bottom: calc(100% + 14px);
  left: 50%;
  width: min(680px, calc(100vw - 56px));
  opacity: 0;
  pointer-events: none;
  transform: translateX(-50%) translateY(10px);
  transform-origin: center bottom;
  transition: opacity 240ms ease, transform 240ms ease;
}

.frida-member.is-frida-open .frida-mega {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(-50%) translateY(0);
}

.frida-teaser-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;
}

@media (max-width: 1160px) {
  .mini-crew {
    overflow-x: auto;
    grid-auto-flow: column;
    grid-auto-columns: 170px;
    grid-template-columns: none;
    padding-bottom: 12px;
  }
}

@media (max-width: 900px) {
  .frida-mega {
    display: none;
  }
}
```

Huella SHA-256 de los originales inspeccionados, antes de esta tarea:

| Archivo raiz | SHA-256 |
| --- | --- |
| index.html | 96A02CDAAB45B5DEBFED070EF06D587412F5F405074B29F54FC75612B4F812E9 |
| styles.css | 8820E3197C97A9C95F94A447C70E9E55E82DBDE3ECF0A4C60F220B8B7195A3CA |
| script.js | EC97598A33116E02FD315204950A3C2A8671E0787A642C78AB8A81FEB7E820E2 |

## Verificacion de integracion

El integrador incorporo `Characters` en Home y copio el CSS original a
`discover-mexico/app/brand.css`, importado por `app/globals.css`, durante esta
tarea. Esos archivos no fueron editados por esta implementacion.

Verificacion ejecutada sobre esa Home con Chromium/Playwright:

- TypeScript: `tsc --noEmit --incremental false`, sin errores.
- Escritorio 1440 px y 1024 px: panel original de 680 px, cuatro thumbnails
  cargados, sin recorte del scroller; capturas inspeccionadas visualmente.
- EN y ES: seis articulos, enlaces de Frida/Explore all al catalogo localizado y
  los cuatro enlaces individuales en el orden solicitado.
- Hover, movimiento por el hueco de 14 px y permanencia en el panel: abierto.
  Salida: abierto aun a 100 ms, cerrado despues del margen de 240 ms.
- Foco en Frida, Tab al primer destino y permanencia de foco: abierto. Escape:
  cerrado con foco restaurado en Frida, sin reapertura. Panel cerrado `inert` y
  excluido de Tab. Sin errores de pagina en estas pruebas.
- Movil tactil 390 px: `overflow-x:auto` original, panel `display:none`, los seis
  retratos cargados y click real en el nombre Frida navega a `/es/destinos`.

La comprobacion preliminar del componente se hizo en 4192. La integracion final
ya fue compilada y verificada en 4191 junto con el resto de Discover. La evidencia
actual esta en `storage/qa` y `docs/VISUAL-INTEGRATION.md`; los archivos originales
conservan sus huellas. No se agregaron capturas ni datos de ejecucion a git.
