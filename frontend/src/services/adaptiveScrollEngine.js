import { predictNodeReadingProfile } from './difficultyAnalyzer';

/**
 * AutoScroll Adaptive Scroll Engine
 * Supports:
 * 1. Smooth Mode: Continuous rAF smooth scrolling with sub-pixel EMA velocity smoothing.
 * 2. Stepped Mode: Line-by-line, Two-line, Paragraph-by-paragraph step pacing.
 * 3. Auto-fading timer signals for distraction-free floating controls.
 * 4. Telemetry observer for ML learning updates.
 */

export const SCROLL_MODES = {
  SMOOTH: 'smooth',
  STEPPED: 'stepped'
};

export const STEP_TYPES = {
  LINE: 'line',
  TWO_LINE: 'two_line',
  PARAGRAPH: 'paragraph'
};

/**
 * Build content-aware scroll timeline for a document node tree
 */
export function buildScrollTimeline(nodes = [], baseWpm = 220, userMultiplier = 1.0) {
  if (!nodes || nodes.length === 0) {
    return { blocks: [], totalEstimatedSec: 0 };
  }

  let totalEstimatedSec = 0;
  const blocks = nodes.map(node => {
    const profile = predictNodeReadingProfile(node, baseWpm, userMultiplier);
    totalEstimatedSec += profile.estimatedDurationSec;

    return {
      nodeId: node.id,
      nodeType: node.type,
      difficulty: profile.difficulty,
      targetWpm: profile.targetWpm,
      scrollSpeedPxSec: profile.scrollSpeedPxSec,
      pauseDurationSec: profile.pauseDurationSec,
      estimatedDurationSec: profile.estimatedDurationSec
    };
  });

  return {
    blocks,
    totalEstimatedSec: Math.round(totalEstimatedSec)
  };
}

/**
 * Controller class managing Smooth and Stepped Scrolling
 */
export class SmoothScrollEngine {
  constructor({ containerRef, onNodeChange, onProgressUpdate, onStateChange, onAutoFadeChange }) {
    this.containerRef = containerRef;
    this.onNodeChange = onNodeChange;
    this.onProgressUpdate = onProgressUpdate;
    this.onStateChange = onStateChange;
    this.onAutoFadeChange = onAutoFadeChange;

    this.isScrolling = false;
    this.scrollMode = SCROLL_MODES.SMOOTH;
    this.stepType = STEP_TYPES.PARAGRAPH;
    this.userMultiplier = 1.0;
    this.baseWpm = 220;
    this.useAiAdaptive = true;
    this.fontSize = 18;

    this.nodes = [];
    this.nodeMap = new Map();
    this.timeline = { blocks: [] };

    this.animFrameId = null;
    this.lastTimestamp = null;
    this.currentVelocityPxSec = 30.0;
    this.activeNodeIndex = 0;

    // Stepped Mode Timer & State
    this.stepTimeout = null;
    
    // Auto-fading timer state (fades controls after 3s of active reading)
    this.autoFadeTimer = null;
    this.areControlsFaded = false;
  }

  setDocument(doc, baseWpm = 220, userMultiplier = 1.0) {
    this.nodes = doc.nodes || [];
    this.nodeMap.clear();
    this.nodes.forEach(n => this.nodeMap.set(n.id, n));

    this.baseWpm = baseWpm;
    this.userMultiplier = userMultiplier;
    this.rebuildTimeline();
  }

  setMultiplier(newMultiplier) {
    this.userMultiplier = newMultiplier;
    this.rebuildTimeline();
  }

  setFontSize(size) {
    this.fontSize = size;
  }

  setScrollMode(mode) {
    this.scrollMode = mode;
    if (this.isScrolling && mode === SCROLL_MODES.STEPPED) {
      this.scheduleNextStep();
    }
  }

  setStepType(type) {
    this.stepType = type;
  }

  setAiAdaptiveMode(enabled) {
    this.useAiAdaptive = enabled;
  }

  rebuildTimeline() {
    this.timeline = buildScrollTimeline(this.nodes, this.baseWpm, this.userMultiplier);
  }

  // Trigger controls reveal on user interaction
  userInteracted() {
    if (this.areControlsFaded) {
      this.areControlsFaded = false;
      if (this.onAutoFadeChange) this.onAutoFadeChange(false);
    }
    this.resetAutoFadeTimer();
  }

  // Handle manual user scrolling (pause auto-scroll, sync reading position)
  userScrolled() {
    this.userInteracted();
    
    // Recalculate active node index based on current scroll position
    const container = this.containerRef.current;
    if (container && this.nodes.length > 0) {
      const containerRect = container.getBoundingClientRect();
      const focusPointY = containerRect.top + (containerRect.height * 0.25);
      const children = Array.from(container.children);
      
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const rect = child.getBoundingClientRect();
        if (rect.top <= focusPointY && rect.bottom >= focusPointY) {
          this.activeNodeIndex = i;
          break;
        }
      }

      // Update progress telemetry
      const { scrollTop, scrollHeight, clientHeight } = container;
      const progressPercent = scrollHeight > clientHeight ? Math.round((scrollTop / (scrollHeight - clientHeight)) * 100) : 100;
      if (this.onProgressUpdate) {
        this.onProgressUpdate({
          scrollTop,
          scrollHeight,
          clientHeight,
          progressPercent,
          currentVelocityPxSec: Math.round(this.currentVelocityPxSec),
          activeNode: this.nodes[this.activeNodeIndex] || null
        });
      }
    }
  }

  resetAutoFadeTimer() {
    if (this.autoFadeTimer) clearTimeout(this.autoFadeTimer);
    if (!this.isScrolling) return;

    this.autoFadeTimer = setTimeout(() => {
      if (this.isScrolling) {
        this.areControlsFaded = true;
        if (this.onAutoFadeChange) this.onAutoFadeChange(true);
      }
    }, 3000);
  }

  start() {
    if (this.isScrolling) return;

    const container = this.containerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight > clientHeight + 10 && scrollTop + clientHeight >= scrollHeight - 5) {
        container.scrollTop = 0;
      }
    }

    this.isScrolling = true;
    this.lastTimestamp = null;
    if (this.onStateChange) this.onStateChange(true);
    this.resetAutoFadeTimer();

    if (this.scrollMode === SCROLL_MODES.SMOOTH) {
      const step = (timestamp) => {
        if (!this.isScrolling || this.scrollMode !== SCROLL_MODES.SMOOTH) return;

        if (!this.lastTimestamp) this.lastTimestamp = timestamp;
        const deltaTime = Math.min(0.1, (timestamp - this.lastTimestamp) / 1000);
        this.lastTimestamp = timestamp;

        this.tickSmooth(deltaTime);

        if (this.isScrolling && this.scrollMode === SCROLL_MODES.SMOOTH) {
          this.animFrameId = requestAnimationFrame(step);
        }
      };
      this.animFrameId = requestAnimationFrame(step);
    } else {
      this.scheduleNextStep();
    }
  }

  pause() {
    this.isScrolling = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.stepTimeout) clearTimeout(this.stepTimeout);
    if (this.autoFadeTimer) clearTimeout(this.autoFadeTimer);
    this.animFrameId = null;
    this.stepTimeout = null;
    this.lastTimestamp = null;
    this.areControlsFaded = false;
    if (this.onAutoFadeChange) this.onAutoFadeChange(false);
    if (this.onStateChange) this.onStateChange(false);
  }

  reset() {
    this.pause();
    if (this.containerRef.current) {
      this.containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    this.activeNodeIndex = 0;
  }

  scheduleNextStep() {
    if (!this.isScrolling || this.scrollMode !== SCROLL_MODES.STEPPED) return;

    const container = this.containerRef.current;
    if (!container) return;

    // Calculate step delay based on WPM and step size
    const effectiveWpm = (this.baseWpm || 220) * (this.userMultiplier || 1.0);
    const wordsPerSec = effectiveWpm / 60;

    let stepPx = 40;
    let wordCountInStep = 10;

    if (this.stepType === STEP_TYPES.LINE) {
      stepPx = (this.fontSize || 18) * 1.8;
      wordCountInStep = 8;
    } else if (this.stepType === STEP_TYPES.TWO_LINE) {
      stepPx = (this.fontSize || 18) * 3.6;
      wordCountInStep = 16;
    } else {
      // Paragraph step
      stepPx = (this.fontSize || 18) * 6.0;
      wordCountInStep = 35;
    }

    const delayMs = Math.max(800, Math.round((wordCountInStep / wordsPerSec) * 1000));

    this.stepTimeout = setTimeout(() => {
      if (!this.isScrolling || this.scrollMode !== SCROLL_MODES.STEPPED) return;

      container.scrollBy({ top: stepPx, behavior: 'smooth' });

      // Update telemetry progress
      const { scrollTop, scrollHeight, clientHeight } = container;
      const progressPercent = scrollHeight > clientHeight ? Math.round((scrollTop / (scrollHeight - clientHeight)) * 100) : 100;
      if (this.onProgressUpdate) {
        this.onProgressUpdate({
          scrollTop,
          scrollHeight,
          clientHeight,
          progressPercent,
          currentVelocityPxSec: Math.round(stepPx / (delayMs / 1000)),
          activeNode: this.nodes[this.activeNodeIndex] || null
        });
      }

      if (scrollTop + clientHeight >= scrollHeight - 10) {
        this.pause();
      } else {
        this.scheduleNextStep();
      }
    }, delayMs);
  }

  tickSmooth(deltaTime) {
    const container = this.containerRef.current;
    if (!container) return;

    let targetPxSec = 30.0;

    if (this.nodes.length > 0 && this.useAiAdaptive) {
      const containerRect = container.getBoundingClientRect();
      const focusPointY = containerRect.top + (containerRect.height * 0.25);

      const children = Array.from(container.children);
      let foundIndex = 0;

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const rect = child.getBoundingClientRect();
        if (rect.top <= focusPointY && rect.bottom >= focusPointY) {
          foundIndex = i;
          break;
        }
      }

      if (foundIndex !== this.activeNodeIndex) {
        this.activeNodeIndex = foundIndex;
        const activeBlock = this.timeline.blocks[foundIndex];
        if (activeBlock) {
          if (this.onNodeChange) this.onNodeChange(this.nodes[foundIndex], activeBlock);
        }
      }

      const activeBlock = this.timeline.blocks[this.activeNodeIndex];
      if (activeBlock && Number.isFinite(activeBlock.scrollSpeedPxSec)) {
        targetPxSec = activeBlock.scrollSpeedPxSec;
      }
    } else {
      const effectiveWpm = (this.baseWpm || 220) * (this.userMultiplier || 1.0);
      const wordsPerSec = effectiveWpm / 60;
      const linePx = (this.fontSize || 18) * 1.8;
      const linesPerSec = wordsPerSec / 8;
      targetPxSec = linesPerSec * linePx * 1.5;
    }

    targetPxSec = Math.max(2.0, Math.min(450.0, Number.isFinite(targetPxSec) ? targetPxSec : 30.0));

    const smoothingFactor = Math.min(1.0, deltaTime * 8.0);
    this.currentVelocityPxSec = this.currentVelocityPxSec * (1 - smoothingFactor) + targetPxSec * smoothingFactor;

    const scrollDistance = this.currentVelocityPxSec * deltaTime;
    container.scrollTop += scrollDistance;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const progressPercent = scrollHeight > clientHeight ? Math.round((scrollTop / (scrollHeight - clientHeight)) * 100) : 100;

    if (this.onProgressUpdate) {
      this.onProgressUpdate({
        scrollTop,
        scrollHeight,
        clientHeight,
        progressPercent,
        currentVelocityPxSec: Math.round(this.currentVelocityPxSec),
        activeNode: this.nodes[this.activeNodeIndex] || null
      });
    }

    if (scrollHeight > clientHeight + 15 && scrollTop > 10 && scrollTop + clientHeight >= scrollHeight - 3) {
      this.pause();
    }
  }
}
