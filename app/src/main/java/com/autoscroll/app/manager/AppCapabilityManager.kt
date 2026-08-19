package com.autoscroll.app.manager

import android.view.accessibility.AccessibilityNodeInfo

enum class CapabilityLevel {
    FULL,
    PARTIAL,
    LIMITED,
    UNSUPPORTED
}

data class AppCapabilityResult(
    val level: CapabilityLevel,
    val hasScrollableNode: Boolean,
    val hasTextNode: Boolean,
    val supportsDirectScroll: Boolean,
    val reasonMessage: String
)

class AppCapabilityManager {

    companion object {
        fun evaluateNodeCapability(rootNode: AccessibilityNodeInfo?): AppCapabilityResult {
            if (rootNode == null) {
                return AppCapabilityResult(
                    level = CapabilityLevel.UNSUPPORTED,
                    hasScrollableNode = false,
                    hasTextNode = false,
                    supportsDirectScroll = false,
                    reasonMessage = "Direct AutoScroll isn't supported in this view."
                )
            }

            val scrollableNode = findScrollableNode(rootNode)
            val hasText = hasTextNodes(rootNode)

            return when {
                scrollableNode != null && hasText -> AppCapabilityResult(
                    level = CapabilityLevel.FULL,
                    hasScrollableNode = true,
                    hasTextNode = true,
                    supportsDirectScroll = true,
                    reasonMessage = "Full direct AutoScroll & text extraction available."
                )
                scrollableNode != null -> AppCapabilityResult(
                    level = CapabilityLevel.PARTIAL,
                    hasScrollableNode = true,
                    hasTextNode = false,
                    supportsDirectScroll = true,
                    reasonMessage = "Direct container scroll supported."
                )
                hasText -> AppCapabilityResult(
                    level = CapabilityLevel.LIMITED,
                    hasScrollableNode = false,
                    hasTextNode = true,
                    supportsDirectScroll = true,
                    reasonMessage = "Custom view detected. Programmatic gesture swipe fallback active."
                )
                else -> AppCapabilityResult(
                    level = CapabilityLevel.UNSUPPORTED,
                    hasScrollableNode = false,
                    hasTextNode = false,
                    supportsDirectScroll = false,
                    reasonMessage = "Direct AutoScroll isn't supported in this app."
                )
            }
        }

        fun findScrollableNode(node: AccessibilityNodeInfo?): AccessibilityNodeInfo? {
            if (node == null) return null
            if (node.isScrollable) return node

            for (i in 0 until node.childCount) {
                val child = node.getChild(i) ?: continue
                val scrollableChild = findScrollableNode(child)
                if (scrollableChild != null) return scrollableChild
            }
            return null
        }

        private fun hasTextNodes(node: AccessibilityNodeInfo?): Boolean {
            if (node == null) return false
            if (!node.text.isNullOrBlank()) return true

            for (i in 0 until node.childCount) {
                val child = node.getChild(i) ?: continue
                if (hasTextNodes(child)) return true
            }
            return false
        }
    }
}
