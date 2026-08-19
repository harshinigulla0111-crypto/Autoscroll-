/**
 * AutoScroll Cross-Platform Native Bridge Interface
 * 
 * Defines modular native platform bindings and contract interfaces for:
 * 1. Android: WindowManager System Overlay, AccessibilityService text extraction, Quick Settings Tile, Intent.ACTION_SEND Share receiver
 * 2. iOS: UIViewController Picture-in-Picture window overlay, Share Extension receiver, App Groups shared cache
 */

export const PLATFORM_TYPES = {
  WEB: 'web',
  ANDROID: 'android',
  IOS: 'ios'
};

/**
 * Detect active execution platform environment
 */
export function detectPlatform() {
  if (typeof window === 'undefined') return PLATFORM_TYPES.WEB;
  
  const userAgent = window.navigator.userAgent || window.navigator.vendor || '';
  if (/android/i.test(userAgent)) return PLATFORM_TYPES.ANDROID;
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return PLATFORM_TYPES.IOS;
  
  return PLATFORM_TYPES.WEB;
}

/**
 * Platform Capabilities Register
 */
export function getPlatformCapabilities() {
  const platform = detectPlatform();

  return {
    platform,
    supportsNativeOverlay: platform !== PLATFORM_TYPES.WEB,
    supportsShareSheetExtension: true,
    overlayMode: platform === PLATFORM_TYPES.ANDROID 
      ? 'Android WindowManager Overlay (SYSTEM_ALERT_WINDOW)'
      : platform === PLATFORM_TYPES.IOS
      ? 'iOS UIViewController Float / PiP Window'
      : 'Simulated Web Overlay Container',
    contentExtractionService: platform === PLATFORM_TYPES.ANDROID
      ? 'Android AccessibilityService / DOM Text Node Inspector'
      : platform === PLATFORM_TYPES.IOS
      ? 'iOS Reader Mode Parser / Share Target Extension'
      : 'Universal JS Multi-Format Extractor Engine'
  };
}

/**
 * Android Specific Native Bridge Specifications
 */
export const AndroidNativeContract = {
  checkOverlayPermission: async () => {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AutoScrollNative) {
      return await window.Capacitor.Plugins.AutoScrollNative.checkOverlayPermission();
    }
    return true; // Web preview returns true for overlay simulation
  },
  requestOverlayPermission: async () => {
    console.log('[NativeBridge:Android] Opening Settings.ACTION_MANAGE_OVERLAY_PERMISSION');
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AutoScrollNative) {
      return await window.Capacitor.Plugins.AutoScrollNative.requestOverlayPermission();
    }
    return true;
  },
  checkAccessibilityPermission: async () => {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AutoScrollNative) {
      return await window.Capacitor.Plugins.AutoScrollNative.checkAccessibilityPermission();
    }
    return true;
  },
  requestAccessibilityPermission: async () => {
    console.log('[NativeBridge:Android] Opening Settings.ACTION_ACCESSIBILITY_SETTINGS');
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AutoScrollNative) {
      return await window.Capacitor.Plugins.AutoScrollNative.requestAccessibilityPermission();
    }
    return true;
  },
  toggleUniversalOverlayService: async (enabled) => {
    console.log(`[NativeBridge:Android] Toggle Universal Overlay Service: ${enabled}`);
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AutoScrollNative) {
      return await window.Capacitor.Plugins.AutoScrollNative.toggleOverlayService({ enabled });
    }
    return enabled;
  },
  syncMLProfileToNative: async (profile) => {
    console.log('[NativeBridge:Android] Syncing ML profile baseline WPM to native DataStore:', profile.userBaselineWpm);
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AutoScrollNative) {
      return await window.Capacitor.Plugins.AutoScrollNative.syncProfile({ profile: JSON.stringify(profile) });
    }
    return true;
  },
  receiveSharedIntent: (callback) => {
    console.log('[NativeBridge:Android] Registered Share Intent Receiver');
    return () => {};
  }
};

/**
 * iOS Specific Native Bridge Specifications
 */
export const IOSNativeContract = {
  checkShareExtensionConfig: async () => {
    return true;
  },
  togglePipOverlayWindow: async (enabled) => {
    console.log(`[NativeBridge:iOS] Toggle PiP Floating Window: ${enabled}`);
    return enabled;
  },
  readAppGroupSharedCache: async () => {
    console.log('[NativeBridge:iOS] Checking App Group shared documents');
    return null;
  }
};

/**
 * Universal Share Receiver Bridge Hook
 */
export function registerUniversalShareHandler(onReceiveContent) {
  const capabilities = getPlatformCapabilities();
  
  if (capabilities.platform === PLATFORM_TYPES.ANDROID) {
    return AndroidNativeContract.receiveSharedIntent(onReceiveContent);
  }
  
  console.log(`[NativeBridge:${capabilities.platform}] Universal share listener ready.`);
  return () => {};
}
