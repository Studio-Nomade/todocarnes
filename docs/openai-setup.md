# Setup de OpenAI — generación de imágenes

Cómo se conecta la generación de imágenes con IA. Sirve para configurar la demo y para el traspaso a
TodoCarnes.

Contenido de los prompts y flujo de generación: `image-playbook.md`.

---

## 1. Los dos caminos — no son lo mismo

| | ChatGPT manual | API (la app, M6) |
|---|---|---|
| **Dónde** | chatgpt.com | platform.openai.com |
| **Acceso** | Suscripción (Plus / Team) | **API key** + billing pay-as-you-go |
| **Quién genera** | Una persona, a mano | La app, con `IMAGE_PROVIDER=openai` |
| **Cómo entra al catálogo** | Se baja la imagen y se sube por la carga manual de M4 | La app la genera y la guarda sola |

**La suscripción de ChatGPT NO habilita la API.** Son cuentas y billing separados aunque el login
sea el mismo mail. La app nunca usa ChatGPT; usa la API con una key.

---

## 2. Configurar la API (para M6)

1. Entrar a **platform.openai.com** (no chatgpt.com) con la cuenta del Studio.
2. **Billing** → cargar crédito pay-as-you-go. La suscripción Plus no cuenta acá.
3. **Verificación de organización** → requerida para `gpt-image-1`. *(Ya hecha.)*
4. **Crear la API key** — ver abajo.

### Crear la key con aislamiento para prototipos

En vez de una key suelta en la organización, usá un **Project** dedicado. Dentro de una misma org,
cada project tiene sus propias keys, su propio tope de gasto y sus propios límites. Así el gasto de
prototipos queda separado y acotado.

1. platform.openai.com → **Projects** → crear uno, ej. `Prototipos Studio Nomade`.
2. En ese project → **Limits** → poné un **tope de gasto mensual** (ej. USD 20). Es la red real contra
   un loop accidental — más fuerte que el tope de la app.
3. En ese project → **API keys** → **Create** → nombrala (ej. `catalogo-todocarnes`). Se muestra
   **una sola vez**: copiala en el momento.

Esa misma key (o una hermana en el mismo project) te sirve para otros prototipos con IA. El tope del
project los cubre a todos.

---

## 3. Dónde va la key

- **Local:** en `.env.local` → `OPENAI_API_KEY=sk-...`. Nunca commiteada (`.env.local` está en
  `.gitignore`).
- **Deploy (Railway):** en las variables de entorno del servicio, no en el repo.
- **Solo servidor.** Jamás en un componente client, jamás con prefijo `NEXT_PUBLIC_`. La app la usa
  desde Server Actions / route handlers. La auditoría de M6 lo verifica.
- **No pegar la key en chats, issues, PRs ni capturas.** Si se expone, rotarla en el project.

---

## 4. El flag `IMAGE_PROVIDER`

```
IMAGE_PROVIDER=mock      # default — placeholders, sin API, sin costo
IMAGE_PROVIDER=openai    # generación real con gpt-image-1
```

La app funciona igual con los dos: ningún componente de UI sabe cuál está activo. Se cambia con una
env var, sin tocar código.

---

## 5. Costos

- `gpt-image-1`: ~USD 0,02–0,19 por imagen, según tamaño/calidad. 4 imágenes por producto.
- Dos topes, en capas:
  - **Del project** (§2): tope de gasto mensual en OpenAI. La red dura.
  - **De la app**: `settings.generation_daily_limit` (40), chequeado server-side antes de llamar.
    Protege contra un loop dentro de un mismo día.

Para la demo el gasto es marginal, pero los topes quedan igual — protegen contra el error, no contra
el uso.

---

## 6. Recomendación para la demo

**No dependas de una llamada a la API en vivo.** `gpt-image-1` tarda 30–90s por imagen y puede fallar
en el escenario.

- **Pre-generá** las imágenes de los productos de la demo a mano en ChatGPT (cuenta del Studio, con
  los prompts de `image-playbook.md`) y subilas por la carga manual de M4.
- La demo muestra imágenes reales sin esperar ni arriesgar una falla en vivo.
- La API queda como el argumento de "y además se automatiza" — mostrable con un producto de prueba si
  querés, o contable si la verificación/M6 no llegó.

Encaja con la arquitectura mock-first: la demo no se cae aunque la API no esté.

---

## 7. Traspaso a TodoCarnes

La key vive en env, así que migrar de la cuenta del Studio a la de TodoCarnes es cambiar una variable
de entorno — sin tocar código. Cuando TodoCarnes tenga su propia cuenta con billing y verificación,
se reemplaza `OPENAI_API_KEY` en Railway y listo.
