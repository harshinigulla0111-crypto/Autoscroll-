package com.autoscroll.app.manager

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import javax.inject.Inject
import javax.inject.Singleton

data class ActiveAppInfo(
    val packageName: String,
    val appName: String,
    val isSupported: Boolean = true,
    val capabilityLevel: String = "FULL"
)

@Singleton
class ActiveAppManager @Inject constructor() {

    private val _activeApp = MutableStateFlow(
        ActiveAppInfo(
            packageName = "com.whatsapp",
            appName = "WhatsApp",
            isSupported = true,
            capabilityLevel = "PARTIAL"
        )
    )
    val activeApp: StateFlow<ActiveAppInfo> = _activeApp

    fun updateActiveApp(packageName: String, label: String? = null) {
        val name = label ?: parsePackageLabel(packageName)
        val capability = evaluateCapabilityForPackage(packageName)
        _activeApp.value = ActiveAppInfo(
            packageName = packageName,
            appName = name,
            isSupported = capability != "UNSUPPORTED",
            capabilityLevel = capability
        )
    }

    private fun parsePackageLabel(packageName: String): String {
        return when {
            packageName.contains("whatsapp") -> "WhatsApp"
            packageName.contains("telegram") -> "Telegram"
            packageName.contains("chrome") -> "Google Chrome"
            packageName.contains("kindle") -> "Kindle"
            packageName.contains("docs") -> "Google Docs"
            packageName.contains("reddit") -> "Reddit"
            else -> packageName.substringAfterLast('.')
                .replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }
        }
    }

    private fun evaluateCapabilityForPackage(packageName: String): String {
        return when {
            packageName.contains("chrome") || packageName.contains("reddit") || packageName.contains("browser") -> "FULL"
            packageName.contains("whatsapp") || packageName.contains("telegram") || packageName.contains("docs") -> "PARTIAL"
            packageName.contains("kindle") -> "LIMITED"
            else -> "PARTIAL"
        }
    }
}
