# Watch Scroll

Controla el scroll del teléfono (TikTok, Reels, Shorts…) desde un reloj Wear OS (Galaxy Watch 4+).

```
Reloj (botones / corona) ──Data Layer MessageClient──▶ Teléfono
                                                      WatchMessageService
                                                      └▶ ScrollAccessibilityService.dispatchGesture()
```

## Compilar
1. Abre la carpeta `watch-scroll/` en Android Studio (creará el Gradle wrapper).
2. Instala `mobile` en el teléfono y `wear` en el reloj (ADB por Wi-Fi o depuración del reloj).
   Ambos módulos comparten `applicationId` y deben firmarse con la misma clave.
3. En el teléfono: abre la app > "Abrir ajustes de accesibilidad" > activa **Watch Scroll**.
4. Abre TikTok y usa los botones (▲ siguiente, ▼ anterior) o la corona del reloj.

## Notas
- El gesto es un swipe vertical centrado (30 % ↔ 75 % de la altura, 180 ms). Ajusta en `ScrollAccessibilityService.swipe`.
- Para distribuir en Google Play, el uso de `AccessibilityService` requiere justificación de accesibilidad y declaración; para uso personal basta el sideload.
- La app no lee eventos ni contenido de pantalla.
