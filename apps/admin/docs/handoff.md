# Handoff MVP — Creador de Catálogo Digital Todo Carnes

**Proyecto:** Intranet / herramienta interna para generación de catálogo digital  
**Cliente:** Todo Carnes  
**Equipo:** Studio Nomade  
**Fecha de handoff:** 2026-07-16  
**Objetivo del documento:** Entregar a Claude un contexto completo para que actúe como cerebro, arquitecto, planificador y auditor técnico del proyecto, mientras Codex ejecuta el desarrollo del prototipo.

---

## 0. Instrucción central para Claude

Claude debe actuar como **cerebro estratégico y técnico del proyecto**.

Su rol NO es avanzar directamente a escribir toda la aplicación sin planificación. Primero debe entender el producto, ordenar el alcance, proponer arquitectura, definir tareas ejecutables y preparar instrucciones claras para que **Codex sea el agente desarrollador** encargado de implementar código.

Claude debe:

1. Analizar el PDF y SVG del catálogo actual.
2. Convertir el diseño actual en reglas de plantilla reutilizables.
3. Diseñar la arquitectura técnica del MVP.
4. Definir el modelo de datos.
5. Dividir el trabajo en tareas claras para Codex.
6. Auditar el código generado por Codex.
7. Revisar consistencia visual, seguridad, estructura, escalabilidad y fidelidad al catálogo.
8. Mantener el foco en un MVP rápido de presentar a cliente.
9. Evitar sobreingeniería.
10. Dejar preparado el camino para escalar a una intranet completa posteriormente.

**Codex será el dev implementador. Claude será el planner + tech lead + reviewer.**

---

## 1. Contexto del proyecto

Todo Carnes actualiza mensualmente su catálogo comercial. Actualmente el flujo depende de piezas diseñadas manualmente y editables del catálogo, que Studio Nomade ya posee.

Para julio 2026 existe un catálogo en PDF con productos organizados por categorías y cortes. También existe una hoja tipo en SVG que representa la diagramación de una ficha de producto.

El objetivo del MVP es construir una herramienta interna donde Todo Carnes pueda:

- Crear, editar, activar o desactivar productos.
- Mantener una biblioteca mensual reutilizable de productos.
- Seleccionar productos para un catálogo específico.
- Generar páginas del catálogo con plantillas.
- Exportar el catálogo en PDF.
- Subir imágenes base de productos.
- Generar o preparar 4 imágenes de producto con IA para alimentar cada ficha.
- Administrar usuarios con roles simples.

El prototipo se utilizará para una reunión comercial con Todo Carnes. Debe demostrar valor rápidamente, sin intentar resolver toda la intranet ni integraciones con ERP en esta primera etapa.

---

## 2. Archivos de referencia

Claude debe considerar como fuentes visuales y funcionales:

1. **Todo Carnes - Catálogo v01-light.pdf**  
   Catálogo actual de julio 2026. Contiene portada, índice, separadores de categoría, fichas de producto y cierre.

2. **Todo Carnes - Catálogo v01.svg**  
   Hoja tipo de producto. Debe ser considerada como referencia base para la plantilla visual editable.

3. **Captura de referencia de ficha de producto**  
   Ejemplo visual de ficha de producto para “Costillar de Cerdo Notable”, con una imagen principal y tres imágenes secundarias.

Si PDF y SVG difieren en medidas o composición, Claude debe tratar el **SVG como fuente principal de diagramación de ficha producto** y el PDF como referencia de estructura general de catálogo.

---

## 3. Problema a resolver

El catálogo mensual requiere actualizar datos, productos, imágenes, categorías, cortes y orden de presentación.

El flujo actual depende de edición manual, lo que genera:

- Tiempos largos para actualizar catálogos.
- Dependencia del equipo de diseño.
- Riesgo de errores en códigos, marcas, pesos o formatos.
- Dificultad para reutilizar productos entre meses.
- Necesidad de recrear fichas visuales cada vez.
- Falta de una base centralizada de productos.

El MVP debe demostrar que este proceso puede transformarse en una plataforma interna simple, editable y escalable.

---

## 4. Objetivo del MVP

Construir un prototipo funcional llamado:

**Creador de Catálogo Digital — Todo Carnes**

Este MVP debe permitir que un usuario de Todo Carnes cree productos, seleccione productos para un catálogo mensual, previsualice las páginas y exporte un PDF siguiendo la identidad visual actual.

La generación de imágenes con IA debe estar contemplada como flujo funcional del MVP, aunque se puede implementar inicialmente con una integración simple, mocks o placeholders si se necesita priorizar velocidad para la demo.

---

## 5. Usuarios y roles

### 5.1 Admin

Puede:

- Crear y editar usuarios.
- Asignar roles.
- Configurar categorías y cortes.
- Configurar prompts base de generación de imágenes.
- Configurar API Key de OpenAI.
- Definir límites o créditos internos de generación.
- Administrar plantillas.
- Ver historial de generación de imágenes.
- Ver historial de exportaciones.

### 5.2 Comercial / Ventas

Puede:

- Crear productos.
- Editar productos.
- Eliminar o desactivar productos.
- Subir imágenes base.
- Generar imágenes asistidas por IA.
- Aprobar o reemplazar imágenes.
- Crear catálogos mensuales.
- Seleccionar productos para un catálogo.
- Ordenar productos.
- Previsualizar catálogo.
- Exportar PDF.

Para el MVP, bastan dos roles: `admin` y `commercial`.

---

## 6. Categorías y cortes iniciales

El catálogo actual trabaja con estas categorías principales:

### Cerdo

Cortes iniciales:

- Costillar
- Baby Back Ribs
- Chuletas
- Lomo Centro
- Pulpa Pierna
- Panceta

### Pollo

Cortes iniciales:

- Pechuga
- Filetillo
- Trutros
- Pollo Entero

### Vacuno

Cortes iniciales:

- Posta
- Hígado

### Trimming

Cortes iniciales:

- 50/50
- 70/30
- 80/20
- 90/10

Estos valores deben ser seed data editable por Admin.

---

## 7. Campos del producto

Cada producto debe tener un formulario editable con:

- `category_id`
- `cut_id`
- `eyebrow` / subcategoría visible
- `title` / título principal
- `code`
- `brand`
- `origin`
- `box_weight`
- `format`
- `units`
- `status`: active / inactive / draft
- `month_tag` o `season_tag` opcional
- `notes` opcional para uso interno
- imágenes asociadas:
  - source image
  - main image
  - secondary image 1
  - secondary image 2
  - secondary image 3

Ejemplo basado en ficha de referencia:

```txt
Categoría: Cerdo
Corte: Costillar
Eyebrow: Costillar Brasil
Título: Costillar de Cerdo Notable
Código: CF-1608
Marca: Notable
Procedencia: Brasil
Peso Caja: 8 KG (Peso Variable)
Formato: Vacío
Unidades: 7-8 x caja
```

---

## 8. Plantillas del catálogo

Para el MVP se deben considerar 4 tipos de plantillas:

### 8.1 Portada

Debe incluir:

- Logo TodoCarnes.
- Mes/año del catálogo.
- Razón social o texto institucional.
- Fondo visual azul con elementos gráficos.

### 8.2 Índice

Debe incluir:

- Categorías principales.
- Íconos por categoría.
- Cortes activos dentro del catálogo.
- Layout simple y limpio.

### 8.3 Separador de categoría

Debe incluir:

- Nombre de categoría.
- Ícono principal.
- Lista de cortes incluidos.
- Fondo azul con elementos gráficos.

### 8.4 Ficha de producto

Debe incluir:

- Header superior con logo y categorías.
- Categoría activa resaltada.
- Submenú de cortes.
- Corte activo resaltado.
- Eyebrow/subcategoría.
- Título principal.
- Lista de campos técnicos:
  - Código
  - Marca
  - Procedencia
  - Peso caja
  - Formato
  - Unidades
- Íconos laterales para cada campo.
- Imagen principal.
- Tres imágenes secundarias.
- Footer con mes/año y número de página.

La ficha de producto es la plantilla más importante del MVP.

---

## 9. Reglas de diseño y salida visual

Claude debe transformar el diseño actual en un sistema de componentes reutilizable.

Consideraciones:

- Formato horizontal digital.
- Trabajar preferentemente en 1920x1080 para el prototipo, salvo que al inspeccionar el SVG se detecte otra medida de fuente de verdad.
- Respetar jerarquía visual, colores, posiciones, tamaños relativos y espaciados del SVG.
- Mantener el look & feel de Todo Carnes.
- No reconstruir el catálogo como una imagen fija; debe ser HTML/CSS/React editable.
- El PDF exportado debe verse como una pieza diseñada, no como una tabla administrativa.
- La plantilla debe soportar títulos largos con saltos de línea controlados.
- La plantilla debe soportar valores vacíos como `N/A`, `-` o campo sin completar.
- La numeración de página debe ser automática.
- El índice debe construirse desde los productos seleccionados.
- El menú superior debe marcar categoría y corte según cada producto.

---

## 10. Generación de imágenes con IA

### 10.1 Objetivo

El sistema debe permitir subir una imagen base de producto y generar 4 imágenes finales consistentes con el catálogo:

1. Imagen principal del producto.
2. Imagen secundaria 1.
3. Imagen secundaria 2.
4. Imagen secundaria 3.

El flujo debe ser asistido y editable, no completamente automático.

### 10.2 Flujo sugerido

1. Usuario crea o edita producto.
2. Usuario sube imagen base.
3. Usuario selecciona tipo de generación:
   - Producto principal
   - Vista empaque frontal
   - Vista empaque lateral
   - Vista caja / presentación comercial
4. El sistema construye un prompt usando datos del producto.
5. El backend llama a OpenAI Images API.
6. El resultado queda como “pendiente de aprobación”.
7. Usuario aprueba, rechaza, regenera o reemplaza manualmente.
8. Las imágenes aprobadas quedan disponibles para la plantilla.

### 10.3 Consideración crítica

La IA no debe inventar información técnica de etiquetas, códigos, sellos sanitarios, marcas o empaques.

Si el empaque o etiqueta debe ser fiel al producto real, se debe usar imagen fuente como referencia. En caso de baja fidelidad, se debe permitir carga manual.

### 10.4 Prompt base para imágenes

Los prompts internos para generación deben estar en inglés.

#### Prompt general

```txt
Create a realistic commercial product photography image for a meat product catalog.

Product: {{product_title}}
Category: {{category}}
Cut: {{cut}}
Brand: {{brand}}
Origin: {{origin}}

Use the provided reference image as the source of truth for the product shape, packaging, color, and visible brand elements. Keep the product realistic and commercially accurate. Place the product on a clean pure white studio background with soft natural shadows. The style must match a premium B2B frozen meat catalog: clean, bright, minimal, high-resolution, professional product photography.

Do not add text, labels, logos, seals, codes, or packaging information unless they are clearly visible in the provided reference image. Do not invent brand details. No people, no plates, no cooked food, no kitchen environment.

Output one isolated catalog-ready image.
```

#### Variante 01 — Imagen principal

```txt
Generate the main hero image for the catalog page. Show the product as the central subject, large and clean, with a realistic studio angle. Use a white background, soft shadows, and optional minimal garnish such as a rosemary sprig and peppercorns only if it matches the existing catalog style. Preserve product realism and do not invent packaging text.
```

#### Variante 02 — Imagen secundaria frontal / empaque

```txt
Generate a secondary catalog image showing the product packaging or front presentation. Keep the image realistic, clean, and aligned with the reference. Use white background and soft shadows. Do not invent readable label details; only preserve visible information from the reference image.
```

#### Variante 03 — Imagen secundaria lateral / alternativa

```txt
Generate a secondary catalog image showing the product from an alternate side or diagonal angle. Keep the product consistent with the reference image. Use a clean white background, realistic frozen meat texture, and professional studio lighting.
```

#### Variante 04 — Imagen caja / presentación comercial

```txt
Generate a secondary catalog image showing the product in its commercial presentation, such as inside a cardboard box, bag, or grouped packaging, only if this makes sense for the product. Keep the style consistent with a B2B frozen meat catalog. Use a white background and realistic shadows. Do not invent labels or technical information.
```

---

## 11. Stack tecnológico propuesto

Claude debe evaluar este stack y confirmar si es adecuado para un MVP rápido. Puede proponer ajustes si hay razones técnicas claras.

### Stack recomendado para prototipo

- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **Supabase Auth**
- **Supabase Postgres**
- **Supabase Storage**
- **OpenAI Images API**
- **Playwright o Puppeteer para exportar PDF**
- **Vercel para deploy rápido**

### Razones

- Permite construir frontend y backend en un mismo repo.
- Es rápido para prototipar.
- Facilita diseño de interfaces modernas.
- Supabase resuelve autenticación, base de datos y storage.
- Vercel permite mostrar demo rápido.
- Playwright/Puppeteer permite exportar HTML/CSS a PDF.
- OpenAI se integra desde backend sin exponer API keys.

### Alternativa para implementación futura

- Laravel + MySQL en el hosting actual de BanaHosting.
- Esta opción puede evaluarse si Todo Carnes exige alojar el sistema en su propio hosting.
- No se recomienda como primera opción para el MVP de venta, porque puede limitar tareas de exportación PDF, colas de procesamiento e integración con IA.

---

## 12. Modelo de datos inicial

Claude debe revisar y ajustar este modelo antes de entregarlo a Codex.

```sql
users
- id uuid primary key
- name text
- email text
- role text check in ('admin', 'commercial')
- status text check in ('active', 'inactive')
- created_at timestamp
- updated_at timestamp

categories
- id uuid primary key
- name text
- slug text unique
- icon_key text
- sort_order integer
- created_at timestamp
- updated_at timestamp

cuts
- id uuid primary key
- category_id uuid references categories(id)
- name text
- slug text
- sort_order integer
- created_at timestamp
- updated_at timestamp

products
- id uuid primary key
- category_id uuid references categories(id)
- cut_id uuid references cuts(id)
- eyebrow text
- title text
- code text
- brand text
- origin text
- box_weight text
- format text
- units text
- status text check in ('draft', 'active', 'inactive')
- notes text
- created_by uuid
- updated_by uuid
- created_at timestamp
- updated_at timestamp

product_images
- id uuid primary key
- product_id uuid references products(id)
- image_type text check in ('source', 'main', 'secondary_1', 'secondary_2', 'secondary_3')
- storage_path text
- public_url text
- status text check in ('pending', 'approved', 'rejected')
- generated_by_ai boolean
- prompt_used text
- created_by uuid
- created_at timestamp
- updated_at timestamp

image_generation_jobs
- id uuid primary key
- product_id uuid references products(id)
- requested_image_type text
- prompt text
- model text
- status text check in ('queued', 'processing', 'completed', 'failed')
- result_image_id uuid
- error_message text
- created_by uuid
- created_at timestamp
- updated_at timestamp

catalogs
- id uuid primary key
- title text
- month integer
- year integer
- status text check in ('draft', 'ready', 'exported')
- created_by uuid
- created_at timestamp
- updated_at timestamp

catalog_items
- id uuid primary key
- catalog_id uuid references catalogs(id)
- product_id uuid references products(id)
- sort_order integer
- page_number integer
- created_at timestamp
- updated_at timestamp

settings
- id uuid primary key
- key text unique
- value jsonb
- created_at timestamp
- updated_at timestamp
```

### Consideración futura

El catálogo tiene casos especiales, como “Pollo Entero” con múltiples variantes/códigos en una misma ficha. Para el MVP, Claude debe decidir si:

1. Se excluye del MVP.
2. Se modela como producto especial con `product_variants`.
3. Se resuelve visualmente con una plantilla secundaria.

Si no complica el prototipo, se puede agregar:

```sql
product_variants
- id uuid primary key
- product_id uuid references products(id)
- label text
- code text
- box_weight text
- units text
- sort_order integer
```

Pero no debe bloquear el MVP.

---

## 13. Pantallas del MVP

### 13.1 Login

- Email.
- Password.
- Acceso según rol.

### 13.2 Dashboard

Debe mostrar:

- Catálogo activo o último catálogo.
- Cantidad de productos activos.
- Productos sin imágenes aprobadas.
- Últimas generaciones IA.
- Botón “Crear nuevo catálogo”.
- Botón “Crear producto”.

### 13.3 Productos

Listado con:

- Imagen miniatura.
- Código.
- Nombre.
- Categoría.
- Corte.
- Marca.
- Estado.
- Acciones: editar, duplicar, desactivar.

Filtros:

- Categoría.
- Corte.
- Marca.
- Estado.
- Buscar por código/nombre.

### 13.4 Crear / editar producto

Formulario con campos de producto.

Debe incluir:

- Vista previa de ficha.
- Upload de imagen base.
- Galería de 4 imágenes.
- Botón generar imagen IA por slot.
- Botón reemplazar imagen manual.
- Estado de aprobación.

### 13.5 Catálogos

Listado con:

- Título.
- Mes.
- Año.
- Estado.
- Cantidad de productos.
- Fecha de actualización.
- Exportar PDF.

### 13.6 Constructor de catálogo

Debe permitir:

- Seleccionar productos.
- Ordenar productos.
- Agrupar por categoría.
- Previsualizar índice.
- Previsualizar separadores.
- Previsualizar fichas.
- Exportar PDF.

### 13.7 Preview de página

Vista exacta o aproximada del diseño final.

Debe permitir revisar una ficha de producto como se verá exportada.

### 13.8 Admin / Settings

Solo Admin:

- Usuarios.
- Categorías.
- Cortes.
- Prompts.
- API Key OpenAI.
- Límite de generación.
- Plantillas.

---

## 14. API / Server Actions sugeridas

Claude debe decidir si usar Route Handlers, Server Actions o API interna. Para MVP, mantener simple.

### Auth

- login
- logout
- getCurrentUser

### Products

- createProduct
- updateProduct
- deleteProduct / deactivateProduct
- duplicateProduct
- listProducts
- getProduct

### Images

- uploadSourceImage
- uploadManualImage
- generateProductImage
- approveImage
- rejectImage
- regenerateImage

### Catalogs

- createCatalog
- updateCatalog
- deleteCatalog
- listCatalogs
- addProductToCatalog
- removeProductFromCatalog
- reorderCatalogItems
- previewCatalog
- exportCatalogPdf

### Settings

- updateOpenAIKey
- updatePromptTemplate
- updateCategories
- updateCuts

---

## 15. Seguridad

El MVP debe contemplar desde el inicio:

- API Key de OpenAI solo en servidor.
- Variables de entorno, nunca hardcoded.
- Row Level Security en Supabase.
- Roles admin/commercial.
- Validación de permisos en backend.
- Validación de formularios.
- Sanitización de nombres de archivos.
- Control de tamaño y tipo de imagen subida.
- Storage separado por producto.
- No exponer imágenes privadas si el catálogo no es público.
- Registro básico de usuario que generó o editó cada recurso.
- No incluir credenciales reales en repo.
- No almacenar contraseñas manualmente si Supabase Auth está disponible.

---

## 16. Exportación PDF

### Enfoque recomendado

1. Renderizar cada página como HTML/CSS/React en formato fijo.
2. Usar Playwright o Puppeteer para capturar y exportar PDF.
3. Generar páginas:
   - Portada.
   - Índice automático.
   - Separadores de categoría.
   - Fichas de producto.
   - Cierre, si corresponde.
4. Mantener CSS print dedicado.

### Consideraciones

- La plantilla debe verse correctamente en navegador y PDF.
- Los assets deben estar cargados antes de exportar.
- Las imágenes deben tener proporción y recorte controlado.
- Deben evitarse saltos de página inesperados.
- Cada página debe ser una unidad visual fija.
- Para el MVP, el PDF puede ser generado server-side o vía endpoint protegido.

---

## 17. Foco comercial del MVP

El prototipo debe mostrar que Studio Nomade puede ayudar a Todo Carnes a pasar de un flujo manual de diseño mensual a un sistema interno más eficiente.

Mensaje estratégico:

**“Un sistema interno para automatizar la creación del catálogo comercial mensual de Todo Carnes, centralizando productos, fichas técnicas, imágenes y exportación en PDF desde una plataforma editable.”**

La IA es un atributo diferenciador, pero el valor central es:

- Ordenar la base de productos.
- Reducir tiempos de actualización.
- Evitar errores.
- Mantener consistencia gráfica.
- Permitir autonomía del equipo comercial.
- Escalar a una intranet mayor.

---

## 18. Qué queda fuera del MVP

Para evitar sobrecargar el prototipo, dejar fuera inicialmente:

- Integración con ERP / SQL Server.
- Sincronización automática de stock.
- Precios dinámicos.
- Cotizaciones.
- Portal de clientes.
- Carrito o e-commerce.
- Aprobaciones complejas.
- Firma digital.
- Reportería avanzada.
- Multiempresa.
- Notificaciones por email.
- App móvil.
- Edición libre tipo Canva.
- Editor drag-and-drop de plantillas.

Estos puntos pueden proponerse como etapas futuras.

---

## 19. Roadmap sugerido para Codex

Claude debe convertir esto en tareas ejecutables para Codex. Sugerencia:

### Fase 0 — Plan y setup

- Revisar assets PDF/SVG.
- Definir stack final.
- Crear repo.
- Configurar Next.js + TypeScript + Tailwind.
- Definir estructura de carpetas.
- Configurar variables de entorno.
- Configurar Supabase.

### Fase 1 — Base de datos y auth

- Crear schema inicial.
- Seed categorías/cortes.
- Implementar login.
- Implementar roles.
- Proteger rutas.

### Fase 2 — Productos

- Listado de productos.
- Crear producto.
- Editar producto.
- Desactivar producto.
- Filtros.
- Seed de productos de ejemplo.

### Fase 3 — Imágenes

- Upload de imagen base.
- Upload manual de 4 imágenes.
- Galería por producto.
- Estados de aprobación.
- Estructura para jobs IA.
- Mock de generación si la API todavía no está configurada.

### Fase 4 — Plantillas

- Reconstruir ficha de producto en React/CSS.
- Crear componentes de portada.
- Crear índice.
- Crear separador de categoría.
- Preview visual.

### Fase 5 — Constructor de catálogo

- Crear catálogo mensual.
- Seleccionar productos.
- Ordenar productos.
- Agrupar automáticamente por categoría.
- Numeración.
- Preview completo.

### Fase 6 — Export PDF

- Endpoint export.
- CSS print.
- Generación PDF.
- Descarga.

### Fase 7 — IA real

- Integrar OpenAI Images API.
- Configurar prompts.
- Generar imágenes por slot.
- Guardar resultados.
- Manejar errores.
- Registrar historial.

### Fase 8 — Demo polish

- Mejorar UI.
- Cargar productos reales de muestra.
- Ajustar diseño al catálogo.
- Preparar demo script.
- Validar flujo end-to-end.

---

## 20. Estructura sugerida de repo

```txt
todo-carnes-catalog-builder/
├─ app/
│  ├─ (auth)/
│  │  └─ login/
│  ├─ (dashboard)/
│  │  ├─ dashboard/
│  │  ├─ products/
│  │  ├─ catalogs/
│  │  ├─ settings/
│  │  └─ preview/
│  ├─ api/
│  │  ├─ images/
│  │  ├─ catalogs/
│  │  └─ export/
│  └─ layout.tsx
├─ components/
│  ├─ ui/
│  ├─ forms/
│  ├─ products/
│  ├─ catalogs/
│  └─ templates/
│     ├─ CatalogCover.tsx
│     ├─ CatalogIndex.tsx
│     ├─ CategoryDivider.tsx
│     └─ ProductPageTemplate.tsx
├─ lib/
│  ├─ supabase/
│  ├─ openai/
│  ├─ pdf/
│  ├─ auth/
│  ├─ permissions/
│  └─ validators/
├─ data/
│  └─ seed/
├─ public/
│  ├─ brand/
│  ├─ icons/
│  └─ placeholders/
├─ styles/
│  └─ print.css
├─ types/
├─ scripts/
└─ README.md
```

---

## 21. Criterios de aceptación del MVP

Para considerar el MVP listo para demo:

- Usuario puede iniciar sesión.
- Hay roles admin/commercial.
- Usuario puede crear y editar productos.
- Producto tiene todos los campos técnicos necesarios.
- Usuario puede cargar imágenes manualmente.
- Se puede crear un catálogo mensual.
- Se pueden seleccionar productos.
- Se puede previsualizar al menos una ficha de producto con diseño similar al catálogo.
- Se genera índice automático simple.
- Se generan separadores por categoría.
- Se puede exportar PDF.
- La API Key de OpenAI no está expuesta.
- Existe estructura lista para integración IA real.
- El prototipo puede correr en deploy público protegido por login.

---

## 22. Checklist de auditoría para Claude sobre Codex

Después de cada implementación de Codex, Claude debe revisar:

### Código

- ¿Compila?
- ¿Pasa lint/typecheck?
- ¿Hay errores de TypeScript?
- ¿Hay duplicación innecesaria?
- ¿La estructura de carpetas está ordenada?
- ¿Hay componentes demasiado grandes?
- ¿Hay nombres claros?

### Seguridad

- ¿Se expone la API Key?
- ¿Las rutas están protegidas?
- ¿Los roles están validados en backend?
- ¿Los uploads están controlados?
- ¿No hay credenciales reales en repo?

### Producto

- ¿El flujo responde al MVP?
- ¿Hay scope creep?
- ¿La UI es simple para el comercial?
- ¿El Admin tiene lo necesario sin exceso?

### Diseño

- ¿La ficha se parece al catálogo?
- ¿Los espacios y jerarquías son consistentes?
- ¿Las imágenes respetan proporciones?
- ¿El PDF se ve comercial?

### Datos

- ¿El modelo soporta categorías/cortes?
- ¿El producto soporta todos los campos?
- ¿El catálogo selecciona productos correctamente?
- ¿El orden y número de página funcionan?

### Demo

- ¿Se puede mostrar un flujo completo?
- ¿Hay datos seed suficientes?
- ¿Se puede explicar el valor en 5 minutos?
- ¿El resultado ayuda a vender el proyecto?

---

## 23. Prompt maestro para iniciar en Claude

Copiar y pegar en Claude:

```txt
You are the strategic brain, technical architect, planner, and reviewer for a new internal MVP project for Todo Carnes.

Important role division:
- You are Claude. You are NOT the main coding agent in this phase.
- Codex will be the implementation developer.
- Your job is to think, plan, define architecture, break work into precise tasks for Codex, and audit Codex’s code after each implementation step.
- You must keep the project focused on an MVP that can be quickly prototyped and used in a sales meeting with Todo Carnes.
- Avoid overengineering.
- Do not start coding the full app until the technical plan and task breakdown are clear.

Project:
We need to build a “Digital Catalog Builder” for Todo Carnes.

Todo Carnes currently updates a commercial product catalog every month. We have:
1. A July 2026 PDF catalog.
2. An SVG reference for a product page template.
3. A screenshot showing a product page layout with one main product image and three secondary images.

The MVP should allow internal users to:
- Manage a product database.
- Create/edit/delete/deactivate products.
- Store product fields such as category, cut, eyebrow, title, code, brand, origin, box weight, format, units.
- Upload product source images.
- Generate or prepare 4 product images using OpenAI Images API.
- Approve or replace generated images.
- Create monthly catalogs.
- Select products for each catalog.
- Preview catalog pages using the current Todo Carnes visual layout.
- Export the catalog as a PDF.

There are two roles:
- Admin: manages users, categories, cuts, prompts, API keys, generation limits, and settings.
- Commercial user: manages products, images, catalogs, preview, and export.

Categories:
- Cerdo
- Pollo
- Vacuno
- Trimming

Initial cuts:
- Cerdo: Costillar, Baby Back Ribs, Chuletas, Lomo Centro, Pulpa Pierna, Panceta.
- Pollo: Pechuga, Filetillo, Trutros, Pollo Entero.
- Vacuno: Posta, Hígado.
- Trimming: 50/50, 70/30, 80/20, 90/10.

Preferred stack proposal:
- Next.js
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- OpenAI Images API
- Playwright or Puppeteer for PDF export
- Vercel for fast deployment

However, you must evaluate whether this is the right stack for a fast MVP. If you propose a better stack, explain why.

Your first task:
Create a complete technical plan for Codex.

Please deliver:
1. Product understanding.
2. Recommended architecture.
3. MVP scope.
4. Out-of-scope list.
5. Data model.
6. UI screens.
7. User flows.
8. Image generation flow.
9. PDF generation approach.
10. Folder structure.
11. API routes or server actions.
12. Security considerations.
13. Seed data strategy.
14. Development milestones.
15. Specific task list for Codex.
16. Audit checklist you will use to review Codex’s implementation.
17. Open questions that must be resolved before or during implementation.

Remember:
You are the planner and reviewer. Codex is the dev. Your output should be structured enough that Codex can execute it step by step.
```

---

## 24. Prompt corto para pedirle a Claude el primer plan

Si se quiere partir más simple, usar este prompt:

```txt
Act as the tech lead and planning brain for this MVP. Codex will be the developer.

Review the attached Todo Carnes catalog PDF and SVG template. Create a precise MVP implementation plan for a Digital Catalog Builder, including architecture, data model, screens, workflows, tasks for Codex, and an audit checklist. Do not write the full app yet. Focus on planning, sequencing, and making sure Codex can execute cleanly.
```

---

## 25. Nota final para Claude

Este proyecto debe ser tratado como una herramienta de venta y validación.

El MVP debe verse suficientemente real para que Todo Carnes entienda el potencial, pero no necesita resolver todos los casos finales.

La prioridad es:

1. Producto editable.
2. Plantilla visual fiel.
3. Constructor de catálogo mensual.
4. Export PDF.
5. Flujo de imágenes IA.
6. Demo clara.
7. Base escalable para futura intranet.

