# Brújula Curricular CC2020 — Plataforma de Orientación Universitaria

Aplicación web interactiva para que **estudiantes de preparatoria** descubran qué se estudia en distintas carreras universitarias de computación a partir de su retícula o plan de estudios (en formato **PDF**, **imagen JPG/PNG** o **captura manual**), tomando como marco académico de referencia el reporte oficial **Computing Curricula 2020 (CC2020)** de **ACM** e **IEEE Computer Society**.

---

## Características principales

- **Flujo en 5 pasos pensado para estudiantes de preparatoria:**
  `Subir retícula → Revisar materias → Analizar → Explorar resultados → Comparar carreras`
- **Demostración interactiva inmediata:** incluye una retícula de demostración almacenada localmente que permite explorar todas las gráficas, el mapa 2D y el comparador sin consumir la API de Gemini.
- **Extracción multimodal en dos etapas:**
  - **PDF con texto digital:** extracción directa en el navegador mediante **PDF.js** (`pdfjs-dist`).
  - **PDF escaneado o fotografía (JPG/PNG):** compresión automática en cliente y lectura multimodal con **Google Gemini** (`@google/genai`) exclusivamente desde el servidor.
- **Separación estricta entre IA y cálculos matemáticos:**
  - **Gemini** identifica asignaturas (Etapa A) y relaciona cada materia con las 34 áreas de conocimiento del CC2020 asignando pesos de relevancia en $[0, 1]$ y justificaciones en español sencillo (Etapa B).
  - **Funciones deterministas en TypeScript** calculan la ponderación (por créditos, horas o uniforme), los puntajes de las 34 áreas, la normalización en las 6 categorías, el índice de semejanza coseno frente a los rangos oficiales de la Tabla 5.3 del CC2020 y la proyección al mapa curricular bidimensional.
- **Visualizaciones interactivas y explicables:**
  - Resumen comprensible y evaluación transparente del **respaldo documental** (*Información suficiente*, *Información parcial*, *Información limitada*).
  - Gráfica de barras horizontales interactiva con desglose de las 6 categorías y las 34 áreas del CC2020.
  - Gráfica radar de 6 ejes con opción de superponer cualquiera de las 6 disciplinas de referencia (`CE`, `CS`, `CSEC`, `IS`, `IT`, `SE`).
  - **Mapa curricular bidimensional** inspirado en la Figura 2.2 del CC2020 con su regla de proyección documentada.
  - Trazabilidad completa materia por materia (*"¿Por qué obtuvimos estos resultados?"*).
  - Comparador de dos o más carreras en la misma sesión.
  - Exportación en **JSON**, **CSV (compatible con Excel)** y versión **imprimible / PDF**.

---

## Guía paso a paso de instalación, ejecución y despliegue

### 1. Instalar Node.js

1. Entra a [https://nodejs.org/](https://nodejs.org/).
2. Descarga e instala la versión **LTS** (se recomienda **Node.js 20.9 o superior**).
3. Abre una terminal (PowerShell, CMD o Terminal) y verifica la instalación:
   ```bash
   node -v
   npm -v
   ```

### 2. Descargar el proyecto

Si tienes el repositorio en GitHub, clónalo en tu computadora (o descomprime la carpeta del proyecto):

```bash
git clone <URL_DE_TU_REPOSITORIO>
cd <NOMBRE_DE_LA_CARPETA>
```

### 3. Instalar dependencias

Dentro de la carpeta del proyecto ejecuta:

```bash
npm install
```

*(Este comando instala Next.js, React, Tailwind CSS, Recharts, Lucide React, PDF.js, Zod, `@google/genai` y copia automáticamente el worker de PDF.js a `public/pdf.worker.min.mjs`).*

### 4. Crear la clave gratuita de Gemini

1. Ingresa a **Google AI Studio**: [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey) con tu cuenta de Google.
2. Haz clic en **"Create API key"** (Crear clave API).
3. Copia la clave generada. No necesitas tarjeta de crédito para utilizar el nivel gratuito (*Free Tier*) con modelos de la familia **Gemini Flash**.

### 5. Configurar `.env.local`

1. En la raíz del proyecto encontrarás el archivo de plantilla `.env.example`.
2. Crea una copia llamada `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   *(En Windows PowerShell: `Copy-Item .env.example .env.local`)*
3. Abre `.env.local` en tu editor de texto y pega tu clave:
   ```env
   GEMINI_API_KEY=TU_CLAVE_AQUI
   GEMINI_MODEL=gemini-2.5-flash
   GEMINI_FALLBACK_MODEL=gemini-flash-latest
   ```
   > **Seguridad:** La variable `GEMINI_API_KEY` **no** lleva el prefijo `NEXT_PUBLIC_`, por lo que se usa exclusivamente en el servidor de Next.js y nunca se expone en el navegador. Además, `.gitignore` impide que `.env.local` se suba a GitHub.

### 6. Ejecutar el proyecto en modo desarrollo y pruebas

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

Comandos adicionales de verificación:

```bash
# Ejecutar pruebas unitarias de los algoritmos matemáticos y datos CC2020
npm test

# Comprobar que la aplicación compila para producción sin errores
npm run build
```

### 7. Subir el código a GitHub

1. Crea un repositorio nuevo en [https://github.com/new](https://github.com/new) (sin archivos iniciales si ya tienes esta carpeta).
2. En la terminal, dentro de la carpeta del proyecto, ejecuta:
   ```bash
   git init
   git add .
   git commit -m "Plataforma de orientación universitaria basada en CC2020"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```
   *(Verifica con `git status` que `.env.local` no aparezca en la lista de archivos).*

### 8. Importar el repositorio en Vercel

1. Entra a [https://vercel.com/](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..." → "Project"**.
3. Selecciona tu repositorio de GitHub y haz clic en **"Import"**.
4. Vercel detectará automáticamente que es un proyecto **Next.js**.

### 9. Configurar las variables de entorno en Vercel

Antes de desplegar (o desde **Settings → Environment Variables** del proyecto en Vercel), agrega las siguientes variables:

| Nombre | Valor |
| :--- | :--- |
| `GEMINI_API_KEY` | Tu clave de Google AI Studio |
| `GEMINI_MODEL` | `gemini-2.5-flash` |
| `GEMINI_FALLBACK_MODEL` | `gemini-flash-latest` |

### 10. Publicar la aplicación

1. Haz clic en **"Deploy"**.
2. En aproximadamente 1–2 minutos Vercel terminará de construir el proyecto y te dará un enlace público (`https://tu-proyecto.vercel.app`) listo para compartirse y utilizarse desde computadoras o teléfonos celulares.

---

## Estructura del proyecto

```text
src/
  app/
    page.tsx                 # Flujo interactivo principal (5 pasos)
    layout.tsx               # Layout raíz en español
    globals.css              # Estilos globales y estilos de impresión
    metodologia/
      page.tsx               # Página "¿Cómo funciona nuestro análisis?"
    api/
      extract/route.ts       # Etapa A: Extracción de materias con Gemini (servidor)
      classify/route.ts      # Etapa B: Clasificación CC2020 con Gemini (servidor)
      summarize/route.ts     # Redacción opcional de resumen a partir de datos calculados
      status/route.ts        # Estado de configuración de la API (sin exponer la clave)

  components/
    layout/                  # Header con indicador de pasos, HeroHome y Footer
    upload/                  # Carga de PDF/imagen/manual, Revisión y Procesamiento
    results/                 # Panel de resultados y sección de trazabilidad por materia
    charts/                  # Gráfica de barras, Gráfica radar y Mapa curricular 2D
    comparison/              # Comparador de dos o más carreras

  lib/
    gemini/                  # Cliente oficial @google/genai, prompts y reintentos
    pdf/                     # Extracción con PDF.js y compresión de imágenes
    cc2020/                  # Perfiles de referencia normalizados (Tabla 5.3)
    analysis/                # Vectores, ponderación, perfil, similitud, proyección 2D y exportación
    validation/              # Esquemas Zod para solicitudes y respuestas de IA
    security/                # Validación de origen, tamaño y limitador de solicitudes

  data/
    cc2020-areas.ts          # 6 categorías y 34 áreas oficiales de la Tabla 4.1 / 5.3
    cc2020-reference.ts      # Valores Min-Max íntegros de la Tabla 5.3 para CE, CS, CSEC, IS, IT, SE
    demo-curriculum.ts       # Retícula ficticia de demostración

  hooks/
    useSessionAnalyses.ts    # Persistencia en sesión para comparar carreras

  tests/
    analysis.test.ts         # Pruebas unitarias con Vitest
```

---

## Referencia académica

- **CC2020 Task Force.** (2020). *Computing Curricula 2020: Paradigms for Global Computing Education*. ACM / IEEE Computer Society. Documento oficial: [https://www.acm.org/binaries/content/assets/education/curricula-recommendations/cc2020.pdf](https://www.acm.org/binaries/content/assets/education/curricula-recommendations/cc2020.pdf)

