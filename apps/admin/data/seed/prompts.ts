export const imagePrompts = {
  image_prompt_normalize: `A partir de la imagen de referencia adjunta, limpiar y normalizar la fotografía del producto cárnico para uso en catálogo TodoCarnes.

Mantener fielmente el producto enviado: respetar su tipo de corte, forma general, proporciones, textura, color, grasa visible, hueso si corresponde, empaque si corresponde, etiqueta visible si la tiene y características propias del producto.

Aislar el producto sobre un fondo blanco limpio o gris muy claro, con estética de fotografía de producto B2B. Mejorar la nitidez, iluminación y contraste de manera natural, manteniendo un aspecto realista de sesión fotográfica.

Eliminar desorden del fondo, sombras excesivas, manchas visuales, bordes sucios, elementos externos, mesa, piso, manos, objetos ajenos o cualquier elemento que no pertenezca al producto.

Si el producto está cubierto por plástico o film, reducir reflejos molestos y mejorar la lectura del producto, pero sin inventar texturas ni cambiar el estado real del producto. Si el producto viene envasado, mantener el empaque; si se solicita una versión sin empaque, retirar visualmente el plástico de forma natural, manteniendo el mismo corte crudo o congelado.

No agregar textos, logos nuevos, etiquetas inventadas, códigos, sellos, marcas, información comercial, ficha técnica ni elementos gráficos. No cocinar el producto. No cambiar el corte. No transformar el producto en una preparación. Mantenerlo crudo, fresco, congelado o envasado según corresponda a la referencia.

El resultado debe ser una fotografía limpia, nítida, realista y lista para ser usada como base en un generador de catálogo.`,
  image_prompt_main: `A partir de la imagen de referencia adjunta, crear una fotografía principal tipo hero para catálogo TodoCarnes del producto {{producto}}, correspondiente al corte {{corte}} de la categoría {{categoria}}.

Generar una sola imagen aislada del producto, sin maqueta, sin módulos, sin ficha técnica y sin composición de catálogo. La fotografía debe mostrar únicamente el producto principal sobre fondo blanco limpio.

Mantener el producto basado fielmente en la referencia enviada: respetar su tipo de corte, forma, proporciones generales, textura, grasa visible, hueso si corresponde, piel si corresponde, color, estado crudo, fresco, congelado o envasado según corresponda. No cambiar el corte ni inventar otro producto.

Mostrar el producto grande, nítido y protagonista, como fotografía profesional de producto B2B. Usar iluminación de estudio, alta nitidez, sombras suaves, buena textura, volumen realista y apariencia premium. La carne debe verse real, con humedad natural, detalle en fibras, grasa y superficie.

Agregar de manera sutil algunos elementos gastronómicos de apoyo, como granos de pimienta y una rama de romero, ubicados a un costado y sin robar protagonismo al producto. Estos elementos no deben tapar el producto ni ocupar el centro.

El fondo debe ser blanco limpio, sin textura, sin mesa visible, sin diseño gráfico, sin textos, sin logos adicionales, sin etiquetas inventadas, sin ficha técnica, sin bordes fuertes y sin elementos decorativos innecesarios.

Dejar margen de seguridad alrededor del producto para que el software pueda recortar e insertar la imagen en el marco correspondiente.

No cocinar el producto. No transformarlo en preparación. No agregar grillado, dorado, salsa, platos ni ingredientes extra. Mantenerlo crudo, congelado o envasado según la referencia original.

El resultado debe parecer una fotografía real de estudio para catálogo comercial TodoCarnes.`,
  image_prompt_secondary_1: `A partir de la imagen de referencia adjunta, crear una fotografía secundaria de empaque o vista frontal para catálogo TodoCarnes del producto {{producto}}, correspondiente al corte {{corte}} de la categoría {{categoria}}.

Generar una sola imagen aislada, sin maqueta, sin módulos, sin ficha técnica y sin composición de catálogo. La fotografía debe mostrar únicamente el producto o empaque en vista frontal, centrado sobre fondo blanco o gris muy claro.

Mantener fielmente el producto y su presentación según la referencia: si viene en bolsa, mantener la bolsa; si viene al vacío, mantener el vacío; si viene con etiqueta real visible, mantenerla como parte del producto; si no tiene empaque, mostrar el corte limpio de frente. No inventar marcas, etiquetas, códigos, sellos, textos ni información comercial.

La imagen debe verse como fotografía profesional de producto B2B, con iluminación de estudio, alta nitidez, sombras suaves y apariencia realista. El producto debe estar apoyado naturalmente, sin flotar, con sombra de contacto sutil.

Si hay plástico o film, debe verse realista, con reflejos controlados y lectura clara del producto. No exagerar brillos ni deformar el empaque.

No agregar textos, logos adicionales, ficha técnica, elementos gráficos, bordes ni decoraciones. No incluir pimienta ni romero en esta vista, salvo que sean parte de la referencia original.

Dejar margen de seguridad alrededor del producto para que el software pueda recortar e insertar la imagen en el marco secundario correspondiente.

No cambiar el corte. No cocinar el producto. No transformarlo en preparación. Mantenerlo crudo, congelado o envasado según corresponda.`,
  image_prompt_secondary_2: `A partir de la imagen de referencia adjunta, crear una fotografía secundaria en ángulo lateral o alternativo para catálogo TodoCarnes del producto {{producto}}, correspondiente al corte {{corte}} de la categoría {{categoria}}.

Generar una sola imagen aislada, sin maqueta, sin módulos, sin ficha técnica y sin composición de catálogo. La fotografía debe mostrar únicamente el producto sobre fondo blanco o gris muy claro.

Mostrar el mismo producto desde un ángulo diferente al de la imagen principal: puede ser lateral, 3/4, frontal bajo, vista levemente superior o una posición alternativa que ayude a entender mejor el corte. Mantener una lectura clara de la forma, volumen, textura y proporciones del producto.

Respetar fielmente la referencia enviada: tipo de corte, forma general, grasa visible, hueso si corresponde, piel si corresponde, textura, color, estado crudo, fresco, congelado o envasado según corresponda. No inventar otro corte ni modificar el producto.

La imagen debe tener estética de fotografía profesional de producto B2B: iluminación de estudio, alta nitidez, sombras suaves, volumen realista y textura natural. El producto debe estar apoyado de forma creíble, sin flotar.

No agregar envoltorio film o empaque adicional si el producto no lo tiene en esta vista. Si el producto se pidió sin empaque, mostrar solo la carne. Si la referencia exige empaque, mantenerlo de forma fiel.

No agregar textos, logos, etiquetas inventadas, ficha técnica, bordes, decoración ni elementos gráficos. No cocinar el producto ni transformarlo en preparación.

Dejar margen de seguridad alrededor del producto para que el software pueda recortar e insertar la imagen en el marco secundario correspondiente.`,
  image_prompt_secondary_3: `A partir de la imagen de referencia adjunta, crear una fotografía secundaria de caja o presentación comercial para catálogo TodoCarnes del producto {{producto}}, correspondiente al corte {{corte}} de la categoría {{categoria}}.

Generar una sola imagen aislada, sin maqueta, sin módulos, sin ficha técnica y sin composición de catálogo. La fotografía debe mostrar únicamente la caja o presentación comercial del producto, centrada sobre fondo blanco o gris muy claro.

Mostrar el producto dentro de una caja de cartón realista, como caja logística abierta usada para alimentos congelados. La caja debe verse como una fotografía real de sesión de producto, no como mockup.

La caja debe ser rectangular, baja y ancha, de cartón kraft café, vista en perspectiva 3/4 desde arriba. Debe tener proporciones creíbles, textura de cartón real, pequeñas imperfecciones naturales, dobleces, líneas de corrugado, pliegues, sombras internas y leves irregularidades en los cantos.

Las alas o solapas de la caja no deben dominar la imagen ni verse exageradamente abiertas. La caja debe verse completa, sin cortes en las esquinas ni bordes fuera de encuadre. Dejar margen de seguridad suficiente alrededor de toda la caja.

El interior debe estar forrado con bolsa plástica transparente o film interior, ligeramente arrugado, con reflejos suaves y realistas. El plástico puede cubrir parcialmente los bordes internos de la caja, como embalaje real de producto congelado.

Dentro de la caja debe ir el producto {{producto}}, respetando la referencia enviada: tipo de corte, forma, color, textura, grasa visible, hueso si corresponde, piel si corresponde, empaque si corresponde y estado crudo, congelado o envasado.

La cantidad de unidades en caja debe ajustarse al producto real. Si existe una indicación comercial, respetarla. Por ejemplo:
- costillar: aproximadamente 7 unidades por caja, congeladas, no necesariamente ordenadas;
- pollo entero: 8 unidades por caja;
- pulpa o cortes grandes: 4 unidades por caja;
- trimming: piezas sueltas en caja, no ordenadas;
- cortes porcionados: varias unidades visibles, distribuidas de manera natural.

Los productos deben verse apoyados naturalmente dentro de la caja, no flotando, con sombras de contacto reales y volumen. La disposición puede ser operativa y comercial, no excesivamente perfecta.

Evitar que la caja se vea plástica, demasiado limpia, demasiado simétrica o generada artificialmente. No usar bordes perfectos ni una caja rígida falsa. Debe parecer una caja real fotografiada en estudio.

No agregar textos, logos inventados, códigos, sellos, marcas ni gráfica adicional en la caja. Si la caja real tiene una marca visible en la referencia, mantenerla solo si corresponde; si no está en la referencia, no inventarla.

No cocinar el producto. No transformarlo en preparación. Mantenerlo crudo, congelado o envasado según corresponda.

El resultado debe parecer una fotografía profesional de presentación comercial para catálogo TodoCarnes.`,
} as const;
