package com.autoscroll.app.service

import android.content.Intent
import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService
import androidx.annotation.RequiresApi

@RequiresApi(Build.VERSION_CODES.N)
class AutoScrollTileService : TileService() {

    override fun onStartListening() {
        super.onStartListening()
        updateTileState()
    }

    override fun onClick() {
        super.onClick()
        val tile = qsTile ?: return

        if (tile.state == Tile.STATE_ACTIVE) {
            // Turn AutoScroll OFF
            stopOverlayService()
            tile.state = Tile.STATE_INACTIVE
            tile.label = "AutoScroll OFF"
        } else {
            // Turn AutoScroll ON
            startOverlayService()
            tile.state = Tile.STATE_ACTIVE
            tile.label = "AutoScroll ON"
        }
        tile.updateTile()
    }

    private fun updateTileState() {
        val tile = qsTile ?: return
        val isRunning = AutoScrollOverlayService.isServiceRunning

        tile.state = if (isRunning) Tile.STATE_ACTIVE else Tile.STATE_INACTIVE
        tile.label = if (isRunning) "AutoScroll ON" else "AutoScroll OFF"
        tile.updateTile()
    }

    private fun startOverlayService() {
        val intent = Intent(this, AutoScrollOverlayService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
    }

    private fun stopOverlayService() {
        val intent = Intent(this, AutoScrollOverlayService::class.java)
        stopService(intent)
    }
}
