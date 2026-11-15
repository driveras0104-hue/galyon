# Navegación y Suelo · 15 de noviembre de 2026

## Navegación

Las seis áreas se muestran de forma independiente dentro del sitio estático:
`#nosotros`, `#asesor`, `#combos`, `#lineas`, `#suelo` y `#garantia`.
El inicio conserva la portada y accesos a cada área. Las anclas anteriores
`#humicos`, `#tricho-sustrato` y `#analisis` siguen funcionando dentro de su área.
El logo devuelve al inicio. Sin JavaScript, el contenido y sus anclas se conservan.

Suelo reúne húmicos, fúlvicos, información de materia orgánica y los análisis
existentes. Los fúlvicos se anuncian como próximamente: no tienen SKU de compra,
precio ni un peso de empaque inventado. Los húmicos conservan el SKU de 1 kg y $15.

## Fotografías y empaques

Las fotografías de TRICHO, BACT e INSECTA usan un escenario común de luz suave,
mesa de madera y cultivo. Las botellas se compusieron a partir de las referencias
del usuario, sin redibujar sus etiquetas. Los titulares son texto HTML sobre blanco,
con la tipografía del sitio, y rotan con problema y resultado mediante el mismo reloj.
El crema usado en las publicaciones de Instagram no se incorpora a estas tarjetas.

Los nuevos empaques de húmicos y fúlvicos siguen el formato kraft de NODUM,
con etiqueta botánica y sin filas de iconos. Son imágenes comerciales de propuesta;
los datos se muestran también como texto accesible en la web.

## Datos verificados con las fichas proporcionadas por el usuario

| Dato | Húmicos | Fúlvicos |
| --- | --- | --- |
| Concentración | 50 % | 60 % |
| Potasio expresado como K₂O | 10–12 % | 8–10 % |
| Solubilidad / hidrosolubilidad | 99,8 % | 99,5 % |
| pH | 7,5–8,5 en solución al 1 % | 5–7 |

El saco de 20 kg en las fichas corresponde al proveedor. No se usa como
presentación comercial de GALYON. No se agregaron dosis ni compatibilidades
universales a partir de esas fichas. Los fúlvicos son higroscópicos según su ficha.

## Verificación

Ejecutar `node verify_increment1.js`, `node verify_asesor_images.js` y
`node verify_prices.js`. Verificar además las áreas por enlace directo, recarga,
logo, selector móvil, fichas, carrito y sincronización de las tres secuencias.
