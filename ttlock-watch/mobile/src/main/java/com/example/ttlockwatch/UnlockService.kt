package com.example.ttlockwatch

import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService

/** Recibe "/unlock" desde el reloj y abre la cerradura por Bluetooth. */
class UnlockService : WearableListenerService() {
    override fun onMessageReceived(event: MessageEvent) {
        if (event.path == "/unlock") TtlockController.unlock(applicationContext) {}
    }
}
