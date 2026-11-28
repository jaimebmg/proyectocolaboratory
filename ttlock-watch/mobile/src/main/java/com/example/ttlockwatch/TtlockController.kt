package com.example.ttlockwatch

import android.content.Context
import com.ttlock.bl.sdk.api.TTLockClient
import com.ttlock.bl.sdk.callback.ControlLockCallback
import com.ttlock.bl.sdk.constant.ControlAction
import com.ttlock.bl.sdk.entity.ControlLockResult
import com.ttlock.bl.sdk.entity.LockError

/**
 * NOTA: los nombres de clase/paquete del SDK están escritos de memoria; verifícalos
 * contra la versión del AAR que descargues de open.ttlock.com y ajusta si difieren.
 */
object TtlockController {
    private var ready = false

    fun unlock(ctx: Context, report: (String) -> Unit) {
        val prefs = ctx.getSharedPreferences("lock", Context.MODE_PRIVATE)
        val mac = prefs.getString("mac", "").orEmpty()
        val lockData = prefs.getString("lockData", "").orEmpty()
        if (mac.isEmpty() || lockData.isEmpty()) { report("Falta MAC o lockData"); return }
        if (!ready) { TTLockClient.getDefault().prepareBTService(ctx.applicationContext); ready = true }
        TTLockClient.getDefault().controlLock(ControlAction.UNLOCK, lockData, mac, object : ControlLockCallback {
            override fun onControlLockSuccess(result: ControlLockResult) = report("Abierto")
            override fun onFail(error: LockError) = report("Error: ${error.errorMsg}")
        })
    }
}
