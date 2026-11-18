package com.example.watchscroll

import android.os.Bundle
import android.view.InputDevice
import android.view.MotionEvent
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.InputDeviceCompat
import androidx.core.view.MotionEventCompat
import androidx.core.view.ViewConfigurationCompat
import androidx.lifecycle.lifecycleScope
import com.google.android.gms.wearable.Wearable
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

class MainActivity : AppCompatActivity() {

    private var lastRotary = 0L

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        findViewById<Button>(R.id.btnNext).setOnClickListener { send(Paths.NEXT) }
        findViewById<Button>(R.id.btnPrev).setOnClickListener { send(Paths.PREV) }
    }

    /** Corona/bisel giratorio: un "clic" = un vídeo (con antirrebote). */
    override fun onGenericMotionEvent(event: MotionEvent): Boolean {
        if (event.action == MotionEvent.ACTION_SCROLL &&
            event.isFromSource(InputDeviceCompat.SOURCE_ROTARY_ENCODER)
        ) {
            val now = System.currentTimeMillis()
            if (now - lastRotary > 350) {
                lastRotary = now
                val delta = event.getAxisValue(MotionEventCompat.AXIS_SCROLL)
                send(if (delta < 0) Paths.NEXT else Paths.PREV)
            }
            return true
        }
        return super.onGenericMotionEvent(event)
    }

    private fun send(path: String) {
        lifecycleScope.launch {
            try {
                val nodes = Wearable.getNodeClient(this@MainActivity).connectedNodes.await()
                if (nodes.isEmpty()) {
                    Toast.makeText(this@MainActivity, R.string.no_phone, Toast.LENGTH_SHORT).show()
                    return@launch
                }
                val client = Wearable.getMessageClient(this@MainActivity)
                nodes.forEach { client.sendMessage(it.id, path, ByteArray(0)).await() }
            } catch (e: Exception) {
                Toast.makeText(this@MainActivity, e.message ?: "Error", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
