# La Casa del Aire Acondicionado y del Gas — página de muestra

> **Esto es una demo / prueba de concepto, no el sitio final.** Se subió para poder
> revisarla, compartirla y probarla desplegada. Van a llegar pequeños ajustes y
> correcciones de contenido, textos, imágenes y estilos en los próximos commits —
> si algo se ve o falta, probablemente ya está en la lista de pendientes.

## Qué es esto

Landing page de "La Casa del Gas" y "La Casa del Aire Acondicionado" (dos sedes,
un solo negocio: aires acondicionados, calentadores, gas con certificación legal
y ferretería). La página vive en `Inicio.dc.html` e incluye:

- Un selector de temperatura interactivo (perilla) que mezcla el look "frío" y
  "calor" del hero según el valor elegido.
- `Servicios.dc.html`: aires, calentadores, gas y ferretería, cada uno con su
  sección propia.
- `Herramientas.dc.html`: calculadora de BTU (a mano o con la cámara), litraje
  de calentador y un chat de preguntas al "asesor" técnico.
- Navegación (`Nav.dc.html`) compartida entre las tres páginas.

## Cómo funciona técnicamente

El sitio está construido con el formato `.dc.html` del editor visual de
[Claude Design](https://claude.ai/design): HTML declarativo con plantillas
(`{{ variable }}`, `sc-if`, `sc-for`, `dc-import`) más un bloque de lógica en
JavaScript por página. Todo se interpreta **en el navegador**, en tiempo de
ejecución, por `support.js` (un runtime generado que carga React, ReactDOM y
Babel desde CDN y renderiza el árbol).

Por eso no hay build step: son archivos estáticos que cualquier hosting
(incluido Netlify) puede servir tal cual.

```
Inicio.dc.html          Página principal
Servicios.dc.html        Aires, calentadores, gas, ferretería
Herramientas.dc.html      Calculadoras y chat del asesor
Nav.dc.html                Barra de navegación (importada por dc-import en cada página)
support.js                  Runtime que interpreta los .dc.html (generado, no editar a mano)
boot-intro.js                 Animación de entrada / transición entre páginas
page-chrome.js                  Lógica de la transición de entrada, cargada dinámicamente
index.html                        Redirección a Inicio.dc.html (para servir algo en "/")
netlify.toml                        Configuración de despliegue en Netlify
assets/                                Imágenes del sitio
```

La calculadora con cámara pide permiso de cámara al navegador (`getUserMedia`) y
el chat del asesor intenta usar `window.claude.complete(...)`, una API que solo
existe dentro del entorno de Claude Design. Fuera de ahí (como en Netlify) esa
llamada falla silenciosamente y el chat responde con las respuestas de
respaldo ya escritas en el código — no rompe la página, pero no es un chat con
IA real todavía.

## Desplegar en Netlify

Este repo ya está listo para conectarse directamente:

1. En Netlify: **Add new site → Import an existing project** y elegí este
   repositorio de GitHub.
2. Build command: (vacío, no hace falta build).
3. Publish directory: `.` (raíz del repo).
4. Netlify va a usar `netlify.toml`, que ya define esto y redirige `/` hacia
   `Inicio.dc.html`.

También se puede arrastrar la carpeta completa a
[app.netlify.com/drop](https://app.netlify.com/drop) para una prueba rápida
sin conectar Git.

## Estado conocido / pendientes

- Falta `assets/ferreteria.jpg` (una de las fotos de la sección de ferretería
  en `Servicios.dc.html`) — se agrega en un commit posterior.
- El chat de "Pregúntale al técnico" usa respuestas de respaldo fijas fuera del
  entorno de Claude Design (ver arriba); conectarlo a un modelo real es trabajo
  pendiente.
- Los datos de contacto (WhatsApp, etc.) son de prueba y hay que reemplazarlos
  por los reales antes de publicar la versión definitiva.
