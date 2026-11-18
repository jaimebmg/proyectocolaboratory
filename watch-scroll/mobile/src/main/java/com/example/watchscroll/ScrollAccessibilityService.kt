package com.example.watchscroll

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.view.accessibility.AccessibilityEvent

class ScrollAccessibilityService : AccessibilityService() {

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
    }

    override fun onUnbind(intent: android.content.Intent?): Boolean {
        instance = null
        return super.onUnbind(intent)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) { /* no se lee nada */ }
    override fun onInterrupt() {}

    /**
     * @param next true = siguiente vídeo (dedo hacia arriba), false = anterior (dedo hacia abajo)
     */
    fun swipe(next: Boolean) {
        val m = resources.displayMetrics
        val x = m.widthPixels / 2f
        val top = m.heightPixels * 0.30f
        val bottom = m.heightPixels * 0.75f
        val path = Path().apply {
            if (next) { moveTo(x, bottom); lineTo(x, top) }
            else { moveTo(x, top); lineTo(x, bottom) }
        }
        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, 180))
            .build()
        dispatchGesture(gesture, null, null)
    }

    companion object {
        @Volatile
        var instance: ScrollAccessibilityService? = null
    }
}
