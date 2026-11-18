package com.example.watchscroll

import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService

class WatchMessageService : WearableListenerService() {

    override fun onMessageReceived(event: MessageEvent) {
        val service = ScrollAccessibilityService.instance ?: return
        when (event.path) {
            Paths.NEXT -> service.swipe(next = true)
            Paths.PREV -> service.swipe(next = false)
        }
    }
}
