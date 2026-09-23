/**
 * Maquina de estados de la voz (Zustand + contexto React):
 * espera -> escuchando -> procesando -> hablando -> espera.
 * Orquesta: palabra clave -> grabadora -> transcripcion -> interpretarComando (o LLM) -> hablar.
 * Pausa la deteccion de 'Lyra' mientras Lyra habla para evitar eco.
 * Modo conversacion: tras responder, sigue escuchando 8-10 s sin pedir 'Lyra' otra vez.
 */
