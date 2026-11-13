# Ronda · prueba del diseño nuevo

Prueba aparte del diseño nuevo de Ronda. Desde la 0.3.0 tiene dos modos: **datos de ejemplo** (sin conexión con Google) o **vuestra casa** (la misma hoja y el mismo script que la app de hoy, conectando con un código RONDA1 que se pega en el móvil). La app real está en `kaki12121215-ux/ronda` y esta prueba no la toca. En este repositorio no hay ninguna dirección de script, clave ni código: solo datos de ejemplo.

- Dirección: https://kaki12121215-ux.github.io/ronda_/
- GitHub Pages: rama `main`, carpeta `/docs`.
- Versión: se ve en Ajustes, abajo («Ronda · prueba 0.3.0 · datos de ejemplo» o «… · conectada a <vuestra casa>»).

## Qué hay en cada carpeta

| Carpeta | Qué es |
|---|---|
| `docs/` | La web que se publica (la que abre el iPhone). `app.js` y `ronda.css` se generan: no se tocan a mano. |
| `src/app/` | El código. Del `00` al `26`, la app de hoy (1.8.0) como base de la lógica; del `30` en adelante, la prueba y el diseño nuevo. |
| `src/css/` | `tokens.css` (los valores aprobados), `diseno.css` (los estilos, todos con prefijo `rn-`) y `viejo_1.7.3.css` (la estructura de las pantallas de dentro de la app de hoy, que el montaje acota a `.rn-viejo`). |
| `src/iconos/`, `src/ilustraciones/` | Los 203 iconos sin punto y las 40 ilustraciones (claro y oscuro). |
| `test/` | `prueba1.js`: las comprobaciones de la tanda 1. `prueba2.js`: todas las secciones, en claro y en oscuro. `prueba3.js`: los arreglos de la 0.2.1 y el arranque «R◯nda». `prueba4.js`: las dos apps a la vez contra el script de hoy (usa el Google falso de la app de hoy, en `../../traspaso/app_actual` o en `RONDA_HOY`). `grabar_arranque.js`: graba la animación del arranque. |

## Montar y probar

```
node src/build.js            # genera docs/app.js y docs/ronda.css
node src/build.js --iconos   # además, los iconos de la app (necesita Playwright)
node test/prueba1.js         # pruebas de la tanda 1 (necesita Playwright)
node test/prueba2.js         # pruebas de todas las secciones
node test/prueba3.js         # pruebas de la 0.2.1 y del arranque
node test/prueba4.js         # conectar con la casa: app nueva y app de hoy a la vez
```

## Convivencia con la app real

Las dos están en el mismo dominio (`kaki12121215-ux.github.io`) y el navegador les deja compartir el almacenamiento. Por eso la prueba usa sus propios nombres: la base `ronda_prueba`, las claves `rondaP-…` y las cachés `prueba_ronda_…`. Nunca lee ni borra nada de la app real.

## 0.3.0 · Conectar con vuestra casa

- Modo en `localStorage` `rondaP-modo` (`ejemplo` o `casa`). Cada modo guarda en su almacén: `ronda_prueba` y `ronda_prueba_casa` (IndexedDB). Nunca `ronda`, que es el de la app real.
- En «casa» la app usa la sincronización de la app de hoy (`02_sync.js`, sin tocar) y el mismo script: mismas colecciones y mismos campos.
- Solo en el móvil, nunca en la hoja: el orden y las tarjetas de Inicio, la barra de abajo y el «Deshacer» de Actividad (`rondaP-loc-…`, `rondaP-act-…`).
