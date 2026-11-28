package com.example.ttlockwatch

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.Text
import com.google.android.gms.wearable.Wearable
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            var status by remember { mutableStateOf("Abrir") }
            val scope = rememberCoroutineScope()
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Button(onClick = {
                    scope.launch {
                        status = try {
                            val nodes = Wearable.getNodeClient(this@MainActivity).connectedNodes.await()
                            if (nodes.isEmpty()) "Sin móvil" else {
                                nodes.forEach {
                                    Wearable.getMessageClient(this@MainActivity)
                                        .sendMessage(it.id, "/unlock", ByteArray(0)).await()
                                }
                                "Enviado"
                            }
                        } catch (e: Exception) { "Error" }
                    }
                }) { Text(status) }
            }
        }
    }
}
