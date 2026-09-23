/**
 * Interprete de comandos por reglas (sin LLM): 'siguiente', 'repite', 'atras', 'que sigue', 'pon un temporizador de X minutos'.
 * Devuelve un comando estructurado o null; si es null, el texto se manda al LLM como conversacion libre.
 * Convierte numeros hablados ('diez', 'media hora') a segundos.
 */
