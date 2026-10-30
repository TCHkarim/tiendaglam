# Tienda Glamm — tienda online

Sitio estático creado a partir de las pantallas de Stitch y del catálogo público de Tienda Glamm.

## Abrir la tienda

Abrí `index.html` en un navegador. La tienda también puede publicarse en un alojamiento estático como GitHub Pages o Cloudflare Pages subiendo esta carpeta completa y conservando su estructura.

## Archivos principales

- `index.html`: portada, búsqueda, categorías y catálogo.
- `producto.html`: detalle de cada producto; el enlace usa el identificador `?id=`.
- `styles.css`: estilos adaptables a celular y escritorio.
- `app.js` y `product.js`: interacción del catálogo, ficha y carrito.
- `catalog.js` / `products.json`: configuración y copia del catálogo.
- `assets/`: logotipo, banners y fotografías guardadas localmente.
- `inicio-stitch.html` y `producto-stitch.html`: archivos de diseño originales usados como referencia.

## Funciones incluidas

- Búsqueda, filtros por categoría y orden del catálogo.
- Galería, opciones disponibles, precio, precio por transferencia y stock registrado en la copia.
- Carrito guardado en el navegador, control de cantidades y estimación del umbral de envío gratis.
- Inicio de consulta y envío del pedido por WhatsApp al número público de la tienda.
- Diseño adaptable a pantallas chicas, teclado y preferencia de movimiento reducido.

## Antes de usarla para vender

El catálogo es una copia realizada el 30/10/2026. Los precios, variantes y existencias pueden cambiar; confirmalos antes de publicar. El carrito guarda datos solo en el navegador del comprador. WhatsApp recibe una consulta con el pedido, pero el sitio no cobra, no reserva stock y no crea pedidos en un sistema administrativo.

Para operar como ecommerce completo hacen falta integraciones propias con pagos, inventario, pedidos y cálculo/seguimiento de envíos. Las credenciales de esos servicios deben configurarse en un backend seguro, nunca en los archivos públicos del sitio.

Los precios promocionales y datos de contacto reflejan la información pública consultada al crear esta copia. Si cambia la tienda original, actualizá `catalog.js`, `products.json` y `assets/` antes de republicar.
