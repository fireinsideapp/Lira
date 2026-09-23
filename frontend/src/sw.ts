/**
 * Service worker. Responsabilidades:
 * 1. Precache de los archivos de la app (workbox-precaching) para que instale como PWA.
 * 2. Escuchar el evento 'push' y mostrar la notificacion del temporizador (con sonido y vibracion).
 * 3. Escuchar 'notificationclick' para abrir/enfocar la app en la sesion de cocina.
 */
