/**
 * AutoScroll Active App Manager Service
 * 
 * Monitors and manages active application detection, universal session tracking,
 * and state synchronization between web interface and native Android services.
 */

import { POPULAR_APP_REGISTRY, getAppCapabilityInfo } from './appCapabilityManager';

const UNIVERSAL_STATE_KEY = 'autoscroll_universal_active_v1';

export function loadUniversalAutoScrollState() {
  try {
    const raw = localStorage.getItem(UNIVERSAL_STATE_KEY);
    if (!raw) return { isUniversalEnabled: true, activeApp: POPULAR_APP_REGISTRY[0], isOverlayActive: false };
    return JSON.parse(raw);
  } catch (err) {
    return { isUniversalEnabled: true, activeApp: POPULAR_APP_REGISTRY[0], isOverlayActive: false };
  }
}

export function saveUniversalAutoScrollState(state) {
  try {
    localStorage.setItem(UNIVERSAL_STATE_KEY, JSON.stringify(state));
    return state;
  } catch (err) {
    return state;
  }
}

export class ActiveAppMonitor {
  constructor(onAppChange) {
    this.onAppChange = onAppChange;
    this.currentApp = POPULAR_APP_REGISTRY[0]; // Default WhatsApp for demo/sim
    this.isUniversalEnabled = true;
  }

  setActiveApp(packageNameOrName) {
    const info = getAppCapabilityInfo(packageNameOrName);
    this.currentApp = info;
    if (this.onAppChange) this.onAppChange(info);
  }

  setUniversalEnabled(enabled) {
    this.isUniversalEnabled = enabled;
    saveUniversalAutoScrollState({
      isUniversalEnabled: enabled,
      activeApp: this.currentApp,
      isOverlayActive: enabled
    });
  }
}
