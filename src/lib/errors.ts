/**
 * Errores de la aplicación con mensajes amigables para estudiantes.
 * Los detalles técnicos se registran solo en el servidor.
 */
export type AppErrorCode =
  | "MISSING_API_KEY"
  | "AUTH"
  | "QUOTA"
  | "RATE_LIMIT"
  | "TIMEOUT"
  | "NETWORK"
  | "INVALID_AI_RESPONSE"
  | "MODEL_UNAVAILABLE"
  | "TOO_LARGE"
  | "BAD_REQUEST"
  | "NOT_CURRICULUM"
  | "NO_SUBJECTS"
  | "UNKNOWN";

export const USER_MESSAGES: Record<AppErrorCode, string> = {
  MISSING_API_KEY:
    "El servicio de análisis no está configurado todavía. Si eres quien administra la página, agrega la clave GEMINI_API_KEY. Mientras tanto puedes probar la demostración.",
  AUTH: "No pudimos conectarnos con el servicio de inteligencia artificial. Intenta nuevamente más tarde.",
  QUOTA:
    "El servicio de análisis alcanzó su límite de uso gratuito por ahora. Intenta nuevamente en unos minutos (o mañana si el límite diario se agotó).",
  RATE_LIMIT: "Has realizado muchas solicitudes seguidas. Espera un minuto e inténtalo de nuevo.",
  TIMEOUT: "El análisis tardó demasiado. Intenta nuevamente o prueba con un documento más corto.",
  NETWORK: "No pudimos analizar tu documento en este momento. Revisa tu conexión e intenta nuevamente en unos minutos.",
  INVALID_AI_RESPONSE: "No pudimos interpretar la respuesta del análisis. Intenta nuevamente en unos minutos.",
  MODEL_UNAVAILABLE: "El servicio de análisis está muy ocupado. Intenta nuevamente en unos minutos.",
  TOO_LARGE:
    "Tu documento es demasiado grande. Prueba subiendo solo las páginas de la retícula, una captura de pantalla o escribiendo las materias manualmente.",
  BAD_REQUEST: "La información enviada no es válida. Revisa los datos e inténtalo de nuevo.",
  NOT_CURRICULUM:
    "No encontramos un plan de estudios en este documento. Verifica que sea la retícula de la carrera o escribe las materias manualmente.",
  NO_SUBJECTS:
    "No encontramos materias en tu documento. Puedes intentar con otra imagen más clara o escribir las materias manualmente.",
  UNKNOWN: "No pudimos analizar tu documento en este momento. Intenta nuevamente en unos minutos.",
};

const STATUS: Record<AppErrorCode, number> = {
  MISSING_API_KEY: 503,
  AUTH: 502,
  QUOTA: 429,
  RATE_LIMIT: 429,
  TIMEOUT: 504,
  NETWORK: 502,
  INVALID_AI_RESPONSE: 502,
  MODEL_UNAVAILABLE: 503,
  TOO_LARGE: 413,
  BAD_REQUEST: 400,
  NOT_CURRICULUM: 422,
  NO_SUBJECTS: 422,
  UNKNOWN: 500,
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly retryable: boolean;

  constructor(code: AppErrorCode, internalMessage?: string, retryable = false) {
    super(internalMessage ?? code);
    this.code = code;
    this.status = STATUS[code];
    this.retryable = retryable;
  }

  get userMessage(): string {
    return USER_MESSAGES[this.code];
  }
}

export interface ApiErrorBody {
  error: { code: AppErrorCode; message: string };
}

