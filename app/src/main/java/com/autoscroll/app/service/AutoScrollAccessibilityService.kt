package com.autoscroll.app.service

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.graphics.Rect
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.autoscroll.app.manager.AppCapabilityManager
import com.autoscroll.app.manager.CapabilityLevel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class AutoScrollAccessibilityService : AccessibilityService() {

    companion object {
        private val _isServiceConnected = MutableStateFlow(false)
        val isServiceConnected: StateFlow<Boolean> = _isServiceConnected

        private val _activePackageName = MutableStateFlow("com.whatsapp")
        val activePackageName: StateFlow<String> = _activePackageName

        private val _currentHighlightRect = MutableStateFlow<Rect?>(null)
        val currentHighlightRect: StateFlow<Rect?> = _currentHighlightRect

        var instance: AutoScrollAccessibilityService? = null
            private set
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        _isServiceConnected.value = true
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val pkg = event.packageName?.toString()
            if (!pkg.isNull_or_empty() && pkg != packageName) {
                _activePackageName.value = pkg
            }
        }
    }

    override fun onInterrupt() {
        _isServiceConnected.value = false
    }

    override fun onDestroy() {
        super.onDestroy()
        if (instance == this) {
            instance = null
        }
        _isServiceConnected.value = false
    }

    /**
     * Perform direct scroll action on currently visible scroll container
     */
    fun performAutoScrollAction(forward: Boolean = true, distancePx: Float = 120f): Boolean {
        val root = rootInActiveWindow ?: return performFallbackGesture(forward)
        val scrollNode = AppCapabilityManager.findScrollableNode(root)

        if (scrollNode != null) {
            val action = if (forward) {
                AccessibilityNodeInfo.ACTION_SCROLL_FORWARD
            } else {
                AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD
            }
            val success = scrollNode.performAction(action)
            updateReadingHighlight(root)
            if (success) return true
        }

        // Fallback to programmatic gesture swipe if direct node scroll action fails
        return performFallbackGesture(forward)
    }

    private fun performFallbackGesture(forward: Boolean): Boolean {
        val displayMetrics = resources.displayMetrics
        val width = displayMetrics.widthPixels.toFloat()
        val height = displayMetrics.heightPixels.toFloat()

        val startX = width / 2f
        val startY = if (forward) height * 0.7f else height * 0.3f
        val endY = if (forward) height * 0.3f else height * 0.7f

        performScrollGesture(startX, startY, startX, endY, 350L)
        return true
    }

    private fun updateReadingHighlight(root: AccessibilityNodeInfo) {
        val rect = Rect()
        val focusNode = findFirstReadableTextNode(root)
        if (focusNode != null) {
            focusNode.getBoundsInScreen(rect)
            _currentHighlightRect.value = rect
        }
    }

    private fun findFirstReadableTextNode(node: AccessibilityNodeInfo?): AccessibilityNodeInfo? {
        if (node == null) return null
        if (!node.text.isNullOrBlank() && node.isVisibleToUser) return node

        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            val found = findFirstReadableTextNode(child)
            if (found != null) return found
        }
        return null
    }

    /**
     * Perform programmatic gesture drag across screen
     */
    fun performScrollGesture(
        startX: Float,
        startY: Float,
        endX: Float,
        endY: Float,
        durationMs: Long = 300L
    ) {
        val path = Path().apply {
            moveTo(startX, startY)
            lineTo(endX, endY)
        }

        val stroke = GestureDescription.StrokeDescription(path, 0, durationMs)
        val gesture = GestureDescription.Builder().addStroke(stroke).build()

        dispatchGesture(gesture, null, null)
    }
}

private fun String?.isNull_or_empty(): Boolean = this == null || this.isEmpty()
