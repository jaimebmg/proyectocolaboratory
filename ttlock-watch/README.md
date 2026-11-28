# TTLock desde Galaxy Watch (Wear OS)

Reloj -> mensaje Data Layer "/unlock" -> móvil -> SDK TTLock -> Bluetooth -> cerradura.

## Pasos
1. Regístrate en open.ttlock.com y descarga el SDK Android (AAR) a `mobile/libs/`.
2. Obtén `lockData` de tu cerradura con la API en la nube (`/v3/lock/list`) y la MAC (en la app TTLock, Básicos).
3. Compila: `./gradlew :mobile:assembleDebug :wear:assembleDebug` (necesita Android Studio / Gradle wrapper).
4. Instala `mobile` en el móvil y `wear` en el reloj (depuración ADB por Wi-Fi). Ambos usan el mismo applicationId.
5. En el móvil, guarda MAC y lockData y prueba "Probar abrir"; luego usa el botón del reloj.

Nota: el código del SDK TTLock está sin compilar contra el AAR real; ajusta nombres si difieren.
