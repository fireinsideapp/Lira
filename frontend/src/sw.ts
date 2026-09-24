/// <reference lib="webworker" />
// Service worker. Fase 1: solo precache para poder instalar la PWA.
// Semana 3: aqui se agregan los eventos 'push' y 'notificationclick' de los temporizadores.
import { precacheAndRoute } from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<any> };

precacheAndRoute(self.__WB_MANIFEST);
