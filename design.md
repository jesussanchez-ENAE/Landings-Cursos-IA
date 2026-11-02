# Manual de Diseño del Proyecto: La Fábrica de Agentes
Este documento resume y especifica las directrices de diseño, tokens visuales, componentes y patrones estéticos de la landing page de **La Fábrica de Agentes** de ENAE Business School.

---

## 1. Fundamentos de Marca y Filosofía Visual

La estética de **"La Fábrica de Agentes"** combina una atmósfera de tecnología premium (Dark Mode de alto rendimiento y contrastes sutiles) con la seriedad académica y corporativa de **ENAE Business School** (usando su tono carmesí característico como color de acento principal).

La experiencia visual se estructura a través de un **ritmo de alternancia estricto de secciones oscuras y claras**, lo que segmenta el contenido de forma natural y mantiene al lector con un alto nivel de atención e interés.

---

## 2. Paleta de Colores y Tokens

### Variables del Sistema (CSS `:root`)

Las siguientes variables globales representan los cimientos del diseño del sitio, permitiendo que la mayoría de componentes respondan automáticamente al flujo temático:

```css
:root {
    --bg-color: #000000;
    --text-color: #ffffff;
    --accent-color: #a81730;                 /* Carmesí Corporativo ENAE */
    --accent-glow: rgba(168, 23, 48, 0.4);   /* Glow de acento */
    --secondary-accent: #ff8e8e;             /* Coral / Rosa suave */
    --card-bg: rgba(20, 20, 20, 0.6);
    --input-bg: #111111;
    --border-color: rgba(255, 255, 255, 0.1);
    
    --color-text-primary: #ffffff;
    --color-text-secondary: #888888;
    --color-background-secondary: rgba(255, 255, 255, 0.03);
    --color-border-tertiary: rgba(255, 255, 255, 0.1);
    --border-radius-md: 0.75rem;

    /* Tipografías */
    --font-heading: 'Nohemi', sans-serif;
    --font-body: 'Nohemi', sans-serif;
    --font-mono: 'SpaceMono', monospace;
    
    /* Transiciones fluidas de microinteracciones */
    --transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## 3. Estructura de Secciones (Alternancia de Temas)

El flujo visual de la landing page intercala fondos oscuros y claros para potenciar la legibilidad y dinamismo:

| Sección | Identificador | Fondo | Estilo de Tema |
| :--- | :--- | :--- | :--- |
| **Hero** | `<header>` | Imagen de Fondo con superposición | Dark Gradient Overlay |
| **1. Impacto / Riesgo** | `#riesgo` | Negro Puro / Degradados sutiles | Oscuro Nivel 0 (`#000`) |
| **2. Comparativa Eficiencia** | `#comparativa` | Crema Cálido (`#f2efe8`) | Clase `.section-light` |
| **3. Programa Académico** | `#programa` | Negro Puro | Oscuro Nivel 0 |
| **4. Ecosistema de Herramientas** | `#herramientas` | Crema Cálido (`#f2efe8`) | Clase `.section-light` |
| **5. ¿Es esto para ti?** | `#audiencia` | Negro Profundo (`#050505`) | Oscuro Nivel 1 |
| **6. Calendario y Fechas** | `#agenda` | Crema Cálido (`#f2efe8`) | Clase `.section-light` |
| **Footer** | `<footer>` | Negro Puro | Oscuro Nivel 0 |

---

## 4. El Sistema de Inversión de Tema Claro (`.section-light`)

Para evitar tener que duplicar marcado o clases utilitarias, se desarrolló una estructura de cascada CSS basada en la clase contenedora `.section-light`. Esta invierte inteligentemente la apariencia de los componentes comunes dentro de ella:

```css
/* Inversión General de Textos */
.section-light h2,
.section-light h3,
.section-light h4,
.section-light span:not(.text-gradient):not(.num):not(.accordion-icon) {
    color: #0e0e0e; /* Negro de alta legibilidad, no puro */
}

.section-light p {
    color: #555555; /* Gris equilibrado para lectura continua */
}

/* Conservar acentos corporativos */
.section-light [style*="color: var(--accent-color)"],
.section-light [style*="color:var(--accent-color)"] {
    color: var(--accent-color) !important;
}

/* Bento Grid en Modo Claro */
.section-light .bento-card {
    background: #ffffff !important;
    border: 1px solid rgba(0, 0, 0, 0.06) !important;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.section-light .bento-card::before {
    /* Glow de cursor adaptado a luz */
    background: radial-gradient(800px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(168, 23, 48, 0.07), transparent 40%) !important;
}

.section-light .bento-card:hover {
    border-color: rgba(168, 23, 48, 0.3) !important;
    box-shadow: 0 16px 48px rgba(168, 23, 48, 0.1) !important;
}

/* Glass Cards en Modo Claro */
.section-light .glass {
    background: #ffffff !important;
    border-color: rgba(168, 23, 48, 0.2) !important;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1) !important;
}

/* Textos con Degradados en Modo Claro */
.section-light .text-gradient {
    background: linear-gradient(to bottom, #1a1a1a 0%, #555 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
```

---

## 5. Componentes Clave de UI

### A. Bento Grid de Última Generación
Estructuras de diseño en grilla de 12 columnas (`.bento-grid`) que alojan tarjetas interactivas de esquinas redondeadas (`border-radius: 1.5rem`).
- **Efecto Hover Dinámico:** Las tarjetas escuchan el movimiento del cursor mediante JavaScript para proyectar una iluminación radial sutil (`::before` con gradiente radial usando las variables CSS de cursor `var(--mouse-x)` y `var(--mouse-y)`).

### B. Accordion de Programa (Efecto Timeline)
El programa utiliza un sistema interactivo tipo acordeón con números monoespaciados que se activan suavemente:
- **Encabezado:** Compuesto por un número de paso mono (`.num`) de gran visibilidad y un texto principal en un tono gris translúcido que cambia a blanco (u oscuro en `.section-light`) al expandirse.
- **Transición:** `max-height 0.6s cubic-bezier(0.16, 1, 0.3, 1)` para un despliegue orgánico de los contenidos.

### C. Botones Premium ENAE (`.btn`)
- **Fórmula de diseño:** Esquinas totalmente redondeadas (`border-radius: 100px`), textos en mayúsculas, fuente geométrica gruesa y un sutil desplazamiento al pasar el ratón por encima (`transform: translateY(-3px)`).
- El botón principal (`.btn-primary`) cuenta con un sombreado con halo carmesí (`box-shadow: 0 10px 30px var(--accent-glow)`) que aumenta al activarse.

### D. Formulario de Registro con Sello FUNDAE
- **Fondo:** Tarjeta translúcida con difuminado de fondo (`backdrop-filter: blur(20px)`).
- **Badge FUNDAE:** Diseñado con un gradiente ámbar/dorado exclusivo (`rgba(212,166,0,0.1)`) y un borde fino a juego. El logo se estiliza dinámicamente mediante filtros CSS (`brightness(2) sepia(1) hue-rotate(5deg) saturate(2)`) para mantener un look dorado corporativo.
- **Mensaje de Urgencia:** Texto en dorado brillante bajo el badge: `⚠ PLAZAS LIMITADAS POR CONVOCATORIA`.

---

## 6. Calendario de Agenda Interactivo (Julio 2026)

La sección `#agenda` contiene un calendario mensual completamente interactivo que sustituye a las listas de fechas estáticas convencionales.

### Diseño del Calendario:
- **Estructura:** Grilla de 7 columnas que muestra los días de la semana y la distribución de los días del mes de julio de 2026 de forma limpia.
- **Resaltado de Días Clave (Sesiones 15, 16, 22 y 26):**
  - Fondo de acento carmesí (`var(--accent-color)`).
  - Texto en blanco, subrayado discreto, y un efecto de elevación al pasar el cursor (`transform: scale(1.15)`).
- **Panel de Detalles:** Tarjeta lateral que se inicializa en estado vacío solicitando al usuario clicar un día. Al seleccionar un día del calendario, la información se despliega con una animación fluida de entrada (`opacity` y `translateY` controlado por `@keyframes calDetailIn`).
- **Interactividad Accesible:** Funciona mediante eventos de click estándar y es controlable con el teclado (`Enter` / `Espacio`) a través de un mapeo en JS autoejecutable.

---

## 7. Directrices para Nuevos Desarrollos e Integraciones

Si se añaden nuevas secciones o componentes, es crucial seguir estas reglas para asegurar la coherencia estética de la landing:
1. **Tipografías:** Usar estrictamente las fuentes cargadas en `fonts.css`. No usar fuentes de sistema para elementos destacados.
2. **Espaciados:** Los márgenes de las secciones deben ser generosos, idealmente `padding: 10rem 0` o `padding: 12rem 0` para un look moderno con suficiente aire.
3. **Imágenes:** Si se requiere incluir logos o assets, envolverlos en componentes que tengan un tema claro definido o usar filtros CSS para adaptarlos (por ejemplo, pasándolos a escala de grises o invirtiéndolos en fondos oscuros).
4. **Interactividad:** Todas las transiciones de hover deben utilizar la curva de aceleración configurada en `--transition`. Evitar transiciones directas instantáneas sin suavizado.
