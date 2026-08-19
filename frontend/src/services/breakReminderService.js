/**
 * AutoScroll Break Reminder Service
 * 
 * Manages configurable reading session break reminders to protect eye health:
 * - Interval timer (e.g. 20 minutes)
 * - Duration of break (e.g. 20 seconds or 2 minutes)
 * - Enable/disable preference
 * - Triggers visual alert overlay in Standalone & Universal modes
 */

const STORAGE_KEY = 'autoscroll_break_reminder_config_v1';

export const DEFAULT_BREAK_CONFIG = {
  enabled: true,
  intervalMinutes: 20,
  breakDurationSec: 30,
  soundAlertEnabled: false,
  totalBreaksTaken: 0,
  lastBreakTimestamp: null
};

export function loadBreakReminderConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_BREAK_CONFIG;
    return { ...DEFAULT_BREAK_CONFIG, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Failed to load break reminder config:', err);
    return DEFAULT_BREAK_CONFIG;
  }
}

export function saveBreakReminderConfig(config) {
  try {
    const updated = { ...config, lastUpdated: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save break reminder config:', err);
    return config;
  }
}

export class BreakReminderEngine {
  constructor(onBreakTrigger) {
    this.onBreakTrigger = onBreakTrigger;
    this.config = loadBreakReminderConfig();
    this.timer = null;
    this.elapsedSec = 0;
    this.isRunning = false;
  }

  updateConfig(newConfig) {
    this.config = saveBreakReminderConfig(newConfig);
    if (this.isRunning) {
      this.restart();
    }
  }

  start() {
    if (!this.config.enabled) return;
    this.stop();
    this.isRunning = true;
    
    const intervalMs = (this.config.intervalMinutes || 20) * 60 * 1000;
    this.timer = setTimeout(() => {
      this.triggerBreak();
    }, intervalMs);
  }

  stop() {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  restart() {
    this.stop();
    this.start();
  }

  triggerBreak() {
    this.config.totalBreaksTaken += 1;
    this.config.lastBreakTimestamp = new Date().toISOString();
    saveBreakReminderConfig(this.config);

    if (this.onBreakTrigger) {
      this.onBreakTrigger({
        title: 'Time for a Reading Break! 👁️✨',
        message: `You've been reading for ${this.config.intervalMinutes} minutes. Rest your eyes for ${this.config.breakDurationSec} seconds by looking into the distance.`,
        durationSec: this.config.breakDurationSec
      });
    }

    // Schedule next break cycle
    this.start();
  }
}
