mobile-request-inspector
========================

Para facilitar el desarrollo y el diagnóstico de las apps y del wrapper armamos una herramienta sencilla que permite conocer en detalle todas las características de un request recibido por el wrapper de mobile.

Permite ver, en una cómoda UI (?), lo siguiente:
- Los datos completos del request, el response y el client info (a partir de los headers)
- La lista de llamadas internas que hace el wrapper, con el detalle disponible y un gráfico donde se ve cómo se orquestraron y la respuesta de cada una.
- Los logs de la aplicación, completos
- El uso de cachés (hits)

Para usarlo, levantar el wrapper local con:

npm run inspector

Abre automáticamente un browser en http://localhost:3000

Es muy básica ya que preferimos tener algo funcionando; así que cualquier sugerencia es bienvenida!! 
