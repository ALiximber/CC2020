# Sustentabilidad en Brújula Curricular

## Arquitectura e implementación por fases

La aplicación existente usa Next.js App Router, React, TypeScript, Tailwind, Recharts, PDF.js, Zod y `@google/genai`. El flujo original extrae documentos, permite revisar materias, clasifica en lotes y calcula el perfil CC2020 determinísticamente. Los resultados se guardan en sessionStorage y se comparan sin base de datos.

1. **Concientización:** `src/lib/sustainability/schema.ts` define contratos; `/api/sustainability` reutiliza `generateJson`, modelos configurados, timeout, respaldo, manejo de cuotas, origen y límite de solicitudes. `validate.ts` comprueba referencias y citas. `SustainabilityPanel.tsx` muestra ODS, materias y reflexión ambiental. La compilación de esta fase pasó.
2. **Aprendizaje:** `LearningPanel.tsx` presenta proyectos con indicadores y limitaciones, actividades con comprobación/reintento y sectores personalizados. Un único llamado genera las tres secciones bajo demanda. La compilación y las 29 pruebas originales pasaron tras esta fase.
3. **Evidencia:** `ProgramEditor.tsx` incorpora texto de programas por materia; `SustainabilityComparison.tsx` compara evidencia y posibilidades sin ranking. La metodología pública explica los límites.

Archivos existentes integrados: ResultsDashboard, ComparisonView, ReviewStep, HomePage, useSessionAnalyses, tipos Subject/StoredAnalysis, exportación JSON, api-client y página de metodología. Los campos nuevos son opcionales: las sesiones anteriores siguen funcionando. No se modificaron fórmulas, áreas, porcentajes ni clasificaciones CC2020. No hay dependencias nuevas.

## Cómo probar

1. Configura `GEMINI_API_KEY` y los modelos mediante las variables existentes; nunca uses una clave `NEXT_PUBLIC_*`. Ejecuta `npm run dev`.
2. Carga una retícula, revisa materias y completa el análisis CC2020 habitual. También puedes abrir la demostración existente; su nueva dimensión se solicita realmente a Gemini.
3. En resultados abre **Sustentabilidad → Analizar sustentabilidad con Gemini**. Se procesan lotes de hasta ocho materias. Comprueba ODS, justificaciones y el filtro de materias. Con solo nombres debe aparecer «No verificable» y nivel 1.
4. Pulsa **Generar proyectos y actividades**. Abre un proyecto y revisa materias, conocimientos adicionales, indicadores y limitaciones. Selecciona una opción de un reto, comprueba la respuesta y pulsa **Intentar nuevamente**. Explora sectores profesionales.
5. En **Editar materias → Detalles → Evidencia de sustentabilidad** carga el PDF digital/TXT del programa de esa asignatura o escribe su fragmento. Añade la fuente y marca «completo» únicamente si lo es. Reanaliza. Verifica nivel 3, citas y procedencia; con una descripción sin programa se usa nivel 2.
6. Analiza una segunda carrera, genera su dimensión complementaria y abre **Comparar carreras → Sustentabilidad**. Las carreras sin datos se identifican como pendientes, no como menos sustentables.
7. Cambia entre vistas y carreras: no se vuelve a llamar Gemini para resultados completos. Cancela un análisis por lotes; al completar pendientes se reutilizan los lotes guardados. Una falla conserva CC2020 y los lotes anteriores.
8. Descarga JSON: incluye el módulo complementario. La impresión incluye la vista de sustentabilidad; abre los desplegables que quieras imprimir. CSV conserva la tabla CC2020 original.

## Criterios y límites

- Se validan ODS 1–17, campos obligatorios, IDs reales, opciones y respuestas de actividades. Las materias faltantes siguen pendientes. Un lote malformado se rechaza; no invalida los anteriores.
- `present` requiere una cita literal del texto disponible y términos temáticos. Esta regla conservadora puede omitir relaciones implícitas y no sustituye la revisión humana del significado. La procedencia oficial es declarada, no autenticada.
- `absent` solo se admite con un programa declarado completo y cita verificable; significa «no identificado en ese texto». En los demás casos se muestra `unknown`.
- Nombres, descripciones y documentos se envían como datos de usuario; el prompt del sistema prohíbe obedecer instrucciones contenidas en ellos. No se navega a URLs aportadas ni se ejecuta texto de documentos.
- Caché de sesión por contenido del plan y clasificaciones, con versión. Las solicitudes son bajo demanda y se bloquean clics duplicados mientras se procesan. No hay caché compartida entre usuarios. Reabrir otra pestaña o borrar la sesión requiere generar de nuevo. Cancelar en el navegador no garantiza cancelar trabajo ya recibido por Gemini.
- PDF digital/TXT: hasta 15 MB y 12 000 caracteres por materia. Se reutiliza PDF.js. Los PDF escaneados de programas no se usan como evidencia textual: se solicita transcripción o versión digital; nunca se inventa una cita. La carga original de retículas escaneadas sigue funcionando.
- El aprendizaje usa nombres, descripciones abreviadas y clasificaciones; no envía programas oficiales completos ni demuestra integración explícita.
- La confianza es orientativa, no una probabilidad estadística. No hay puntuaciones ambientales. Los indicadores son propuestas para mediciones futuras, no beneficios medidos.
- Persistencia de mejor esfuerzo: si sessionStorage está bloqueado o sin espacio, se conserva en memoria. El texto aportado se guarda en la sesión y se incluye en la exportación JSON.

## Verificaciones

`npm test`, `npm run typecheck`, `npm run build`. La suite incluye regresión CC2020, evidencia, referencias a materias, respuestas incompletas, ODS fuera de rango y errores de cuota del endpoint con Gemini sustituido en pruebas. El repositorio no tiene script ni configuración de lint; no se presenta TypeScript como sustituto de lint.

Prueba real de integración: `/api/sustainability` respondió HTTP 200 con `gemini-3.1-flash-lite`, una materia analizada (integración explícita `unknown` cuando solo había nombre) y, en otra solicitud, tres proyectos, tres actividades y tres sectores. Se corrigió el rechazo inicial de esquemas JSON demasiado restrictivos para el proveedor sin relajar la validación Zod. La automatización del navegador no estuvo disponible en este entorno; la revisión visual y la interacción manual deben seguir los pasos anteriores.

Referencias conceptuales: [ONU](https://www.un.org/sustainabledevelopment/es/sustainable-development-goals/), [UNESCO](https://www.unesco.org/es/sustainable-development/education/need-know), [Green Software Foundation](https://learn.greensoftware.foundation/). El esquema enviado a Gemini usa un subconjunto reducido; Zod aplica todos los límites localmente, según el enfoque de [salidas estructuradas de Gemini](https://ai.google.dev/gemini-api/docs/generate-content/structured-output).
