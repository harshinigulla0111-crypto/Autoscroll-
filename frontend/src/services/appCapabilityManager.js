/**
 * AutoScroll App Capability Manager
 * 
 * Dynamically determines application capability level for Universal AutoScroll across third-party applications:
 * 1. FULL: Accessible text + scrollable container node + reading position (e.g. Chrome, News Apps, Blog Sites)
 * 2. PARTIAL: Scrollable container node + text nodes available (e.g. WhatsApp, Telegram, Reddit)
 * 3. LIMITED: Custom views without standard scroll node; programmatic gesture swipe supported (e.g. Kindle, Docs)
 * 4. UNSUPPORTED: Direct accessibility interaction unavailable; triggers Fallback System ([Share to AutoScroll], [Copy Text], [Import File]).
 */

export const CAPABILITY_LEVELS = {
  FULL: 'FULL',
  PARTIAL: 'PARTIAL',
  LIMITED: 'LIMITED',
  UNSUPPORTED: 'UNSUPPORTED'
};

export const POPULAR_APP_REGISTRY = [
  {
    packageName: 'com.whatsapp',
    appName: 'WhatsApp',
    category: 'Messaging',
    capability: CAPABILITY_LEVELS.PARTIAL,
    supportsDirectScroll: true,
    supportsTextExtract: true,
    notes: 'Direct node scroll on long message threads'
  },
  {
    packageName: 'org.telegram.messenger',
    appName: 'Telegram',
    category: 'Messaging',
    capability: CAPABILITY_LEVELS.PARTIAL,
    supportsDirectScroll: true,
    supportsTextExtract: true,
    notes: 'Scrolls chat message container naturally'
  },
  {
    packageName: 'com.android.chrome',
    appName: 'Google Chrome',
    category: 'Browser',
    capability: CAPABILITY_LEVELS.FULL,
    supportsDirectScroll: true,
    supportsTextExtract: true,
    notes: 'Full DOM accessibility & reading node position'
  },
  {
    packageName: 'com.amazon.kindle',
    appName: 'Kindle',
    category: 'E-Reader',
    capability: CAPABILITY_LEVELS.LIMITED,
    supportsDirectScroll: true,
    supportsTextExtract: false,
    notes: 'Custom canvas view; uses programmatic gesture swipe fallback'
  },
  {
    packageName: 'com.google.android.apps.docs.editors.docs',
    appName: 'Google Docs',
    category: 'Productivity',
    capability: CAPABILITY_LEVELS.PARTIAL,
    supportsDirectScroll: true,
    supportsTextExtract: true,
    notes: 'Direct scroll on document viewport'
  },
  {
    packageName: 'com.reddit.frontpage',
    appName: 'Reddit',
    category: 'Social Media',
    capability: CAPABILITY_LEVELS.FULL,
    supportsDirectScroll: true,
    supportsTextExtract: true,
    notes: 'Full post text & comment thread auto-scrolling'
  },
  {
    packageName: 'com.adobe.reader',
    appName: 'Adobe Acrobat PDF',
    category: 'Document Reader',
    capability: CAPABILITY_LEVELS.FULL,
    supportsDirectScroll: true,
    supportsTextExtract: true,
    notes: 'Page & continuous PDF auto-scrolling'
  },
  {
    packageName: 'com.sec.android.app.sbrowser',
    appName: 'Samsung Internet',
    category: 'Browser',
    capability: CAPABILITY_LEVELS.FULL,
    supportsDirectScroll: true,
    supportsTextExtract: true,
    notes: 'Full webpage article auto-scrolling'
  }
];

export function getAppCapabilityInfo(packageNameOrName) {
  if (!packageNameOrName) {
    return {
      appName: 'Generic App',
      capability: CAPABILITY_LEVELS.PARTIAL,
      supportsDirectScroll: true,
      supportsTextExtract: true,
      notes: 'Standard Android Accessibility interaction'
    };
  }

  const query = packageNameOrName.toLowerCase();
  const matched = POPULAR_APP_REGISTRY.find(
    app => app.packageName.toLowerCase().includes(query) || app.appName.toLowerCase().includes(query)
  );

  if (matched) return matched;

  return {
    appName: packageNameOrName,
    capability: CAPABILITY_LEVELS.PARTIAL,
    supportsDirectScroll: true,
    supportsTextExtract: true,
    notes: 'Dynamic accessibility inspection active'
  };
}

export function evaluateActiveCapability(nodeInfo) {
  if (!nodeInfo) {
    return {
      capability: CAPABILITY_LEVELS.UNSUPPORTED,
      reason: 'No scrollable container or text node detected in active application window.'
    };
  }

  if (nodeInfo.hasScrollContainer && nodeInfo.hasReadableText) {
    return {
      capability: CAPABILITY_LEVELS.FULL,
      reason: 'Readable text and scroll container fully available.'
    };
  }

  if (nodeInfo.hasScrollContainer) {
    return {
      capability: CAPABILITY_LEVELS.PARTIAL,
      reason: 'Scroll container available for direct AutoScroll.'
    };
  }

  if (nodeInfo.supportsGesture) {
    return {
      capability: CAPABILITY_LEVELS.LIMITED,
      reason: 'Custom view detected. Programmatic gesture swipe fallback active.'
    };
  }

  return {
    capability: CAPABILITY_LEVELS.UNSUPPORTED,
    reason: 'Direct AutoScroll unavailable in this view.'
  };
}
