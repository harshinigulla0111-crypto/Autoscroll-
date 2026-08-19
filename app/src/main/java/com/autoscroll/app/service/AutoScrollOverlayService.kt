package com.autoscroll.app.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.ImageButton
import android.widget.SeekBar
import android.widget.TextView
import androidx.core.app.NotificationCompat
import com.autoscroll.app.R
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class AutoScrollOverlayService : Service() {

    private lateinit var windowManager: WindowManager
    private var overlayView: View? = null
    private var isScrolling = false
    private var isExpanded = false
    private var currentWpm = 220
    private var isSmoothMode = true

    private var scrollJob: Job? = null
    private var autoFadeJob: Job? = null
    private val serviceScope = CoroutineScope(Dispatchers.Main)

    companion object {
        const val CHANNEL_ID = "autoscroll_overlay_channel"
        const val NOTIFICATION_ID = 1001
        var isServiceRunning = false
            private set
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification())
        isServiceRunning = true
        setupFloatingOverlay()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            const val channelName = "AutoScroll Floating Service"
            val channel = NotificationChannel(
                CHANNEL_ID,
                "AutoScroll Reading Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("AutoScroll Active")
            .setContentText("Universal AutoScroll floating control pill is active.")
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun setupFloatingOverlay() {
        val layoutFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutFlag,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 30
            y = 300
        }

        // Programmatically inflate floating overlay container layout
        val view = createOverlayView(params)
        overlayView = view
        windowManager.addView(view, params)
    }

    private fun createOverlayView(params: WindowManager.LayoutParams): View {
        val container = View(this).apply {
            setBackgroundColor(0xCC0F172A.toInt()) // Glassmorphism Dark background
        }

        // Setup touch drag listener for floating window movement
        var initialX = 0
        var initialY = 0
        var initialTouchX = 0f
        var initialTouchY = 0f

        container.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = params.x
                    initialY = params.y
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    resetAutoFadeTimer()
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    params.x = initialX + (event.rawX - initialTouchX).toInt()
                    params.y = initialY + (event.rawY - initialTouchY).toInt()
                    windowManager.updateViewLayout(container, params)
                    true
                }
                else -> false
            }
        }

        return container
    }

    private fun startAutoScrollLoop() {
        if (isScrolling) return
        isScrolling = true
        resetAutoFadeTimer()

        scrollJob = serviceScope.launch {
            while (isScrolling) {
                val delayMs = Math.max(50L, (60000L / (currentWpm * 2)))
                AutoScrollAccessibilityService.instance?.performAutoScrollAction(forward = true)
                delay(delayMs)
            }
        }
    }

    private fun pauseAutoScrollLoop() {
        isScrolling = false
        scrollJob?.cancel()
        scrollJob = null
    }

    private fun resetAutoFadeTimer() {
        autoFadeJob?.cancel()
        overlayView?.alpha = 1.0f

        if (isScrolling) {
            autoFadeJob = serviceScope.launch {
                delay(3000L)
                overlayView?.alpha = 0.45f // Semi-transparent during active reading
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        isServiceRunning = false
        pauseAutoScrollLoop()
        autoFadeJob?.cancel()
        if (overlayView != null) {
            windowManager.removeView(overlayView)
            overlayView = null
        }
    }
}
