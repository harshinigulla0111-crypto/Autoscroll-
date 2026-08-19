/**
 * AutoScroll Modular Personalization Engine
 * 
 * Acts as the bridge between scrolling telemetry (reading speed, pause duration,
 * manual speed overrides, scroll reversals, and reading rhythm) and the on-device ML profile.
 */

import { loadMLProfile, saveMLProfile, updateOnDeviceModel } from './onDeviceML';

export class PersonalizationEngine {
  constructor(onNotificationCallback) {
    this.onNotificationCallback = onNotificationCallback;
    this.sessionTelemetry = {
      startTime: null,
      wordsRead: 0,
      pauseCount: 0,
      pauseTotalSec: 0,
      manualAdjustments: 0,
      reversals: 0,
      scrollDirectionChanges: 0,
      readingCategory: 'news'
    };
  }

  startSession(category = 'news') {
    this.sessionTelemetry = {
      startTime: Date.now(),
      wordsRead: 0,
      pauseCount: 0,
      pauseTotalSec: 0,
      manualAdjustments: 0,
      reversals: 0,
      scrollDirectionChanges: 0,
      readingCategory: category
    };
  }

  recordManualAdjustment() {
    this.sessionTelemetry.manualAdjustments += 1;
  }

  recordReversal() {
    this.sessionTelemetry.reversals += 1;
  }

  recordPause(durationSec) {
    this.sessionTelemetry.pauseCount += 1;
    this.sessionTelemetry.pauseTotalSec += durationSec;
  }

  endSession(sessionWpm) {
    if (!this.sessionTelemetry.startTime) return;

    const result = updateOnDeviceModel({
      sessionWpm,
      manualAdjustments: this.sessionTelemetry.manualAdjustments,
      reversals: this.sessionTelemetry.reversals,
      pauseSec: this.sessionTelemetry.pauseTotalSec,
      category: this.sessionTelemetry.readingCategory
    });

    if (result && result.justCalibratedNotification && this.onNotificationCallback) {
      this.onNotificationCallback({
        title: 'Personalization Threshold Achieved! 🎉',
        message: `AutoScroll AI has reached ${result.confidencePercent}% confidence for your reading rhythm (${result.userBaselineWpm} WPM baseline).`,
        confidencePercent: result.confidencePercent
      });
    }

    return result;
  }
}
