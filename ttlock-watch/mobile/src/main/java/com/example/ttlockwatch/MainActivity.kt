package com.example.ttlockwatch

import android.Manifest
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity

/** Pantalla simple para guardar lockData y MAC de la cerradura. */
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestPermissions(arrayOf(
            Manifest.permission.BLUETOOTH_SCAN, Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.ACCESS_FINE_LOCATION), 1)
        val prefs = getSharedPreferences("lock", MODE_PRIVATE)
        val mac = EditText(this).apply { hint = "MAC (AA:BB:CC:DD:EE:FF)"; setText(prefs.getString("mac", "")) }
        val data = EditText(this).apply { hint = "lockData (de la API de TTLock)"; setText(prefs.getString("lockData", "")) }
        val save = Button(this).apply { text = "Guardar" }
        val test = Button(this).apply { text = "Probar abrir" }
        save.setOnClickListener {
            prefs.edit().putString("mac", mac.text.toString().trim())
                .putString("lockData", data.text.toString().trim()).apply()
            Toast.makeText(this, "Guardado", Toast.LENGTH_SHORT).show()
        }
        test.setOnClickListener { TtlockController.unlock(this) { msg -> Toast.makeText(this, msg, Toast.LENGTH_SHORT).show() } }
        setContentView(LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL; setPadding(48, 96, 48, 48)
            addView(mac); addView(data); addView(save); addView(test)
        })
    }
}
