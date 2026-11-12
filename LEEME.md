# Ronda · prueba del diseño nuevo

Prueba aparte del diseño nuevo de Ronda, con **datos de ejemplo** y **sin conexión con Google**. La app real está en `kaki12121215-ux/ronda` y esta prueba no la toca.

- Dirección: https://kaki12121215-ux.github.io/ronda_/
- GitHub Pages: rama `main`, carpeta `/docs`.
- Versión: se ve en Ajustes, abajo («Ronda · prueba 0.2.0 · datos de ejemplo»).

## Qué hay en cada carpeta

| Carpeta | Qué es |
|---|---|
| `docs/` | La web que se publica (la que abre el iPhone). `app.js` y `ronda.css` se generan: no se tocan a mano. |
| `src/app/` | El código. Del `00` al `26`, la app de hoy (1.8.0) como base de la lógica; del `30` en adelante, la prueba y el diseño nuevo. |
| `src/css/` | `tokens.css` (los valores aprobados), `diseno.css` (los estilos, todos con prefijo `rn-`) y `viejo_1.7.3.css` (la estructura de las pantallas de dentro de la app de hoy, que el montaje acota a `.rn-viejo`). |
| `src/iconos/`, `src/ilustraciones/` | Los 203 iconos sin punto y las 40 ilustraciones (claro y oscuro). |
| `test/` | `prueba1.js`: las comprobaciones de la tanda 1. `prueba2.js`: todas las secciones, en claro y en oscuro. |

## Montar y probar

```
node src/build.js            # genera docs/app.js y docs/ronda.css
node src/build.js --iconos   # además, los iconos de la app (necesita Playwright)
node test/prueba1.js         # pruebas de la tanda 1 (necesita Playwright)
node test/prueba2.js         # pruebas de todas las secciones
```

## Convivencia con la app real

Las dos están en el mismo dominio (`kaki12121215-ux.github.io`) y el navegador les deja compartir el almacenamiento. Por eso la prueba usa sus propios nombres: la base `ronda_prueba`, las claves `rondaP-…` y las cachés `prueba_ronda_…`. Nunca lee ni borra nada de la app real.
