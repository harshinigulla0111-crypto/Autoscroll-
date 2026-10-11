import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Sliders, Type, FileText, Brain, 
  Sparkles, CheckCircle2, ChevronRight, Zap, Info, UploadCloud,
  BookOpen, Image as ImageIcon, Layers, Eye, X, Settings
} from 'lucide-react';
import UploadModal from './UploadModal';
import FloatingController from './FloatingController';
import SettingsModal from './SettingsModal';
import ShareSheetSimulator from './ShareSheetSimulator';
import { SmoothScrollEngine, SCROLL_MODES, STEP_TYPES } from '../services/adaptiveScrollEngine';
import { loadOverlayConfig, saveOverlayConfig, THEME_PRESETS } from '../services/overlayManager';
import { updateOnDeviceModel, loadMLProfile } from '../services/onDeviceML';

export default function AutoScrollReader({
  userBaselineWpm,
  activeDocument,
  onSelectDocument,
  onOpenUploadModal,
  onOpenShareSimulator,
  onProfileUpdate,
  onTriggerNotification
}) {
  // Controller state
  const [isScrolling, setIsScrolling] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [isAiMode, setIsAiMode] = useState(true);
  const [scrollMode, setScrollMode] = useState(SCROLL_MODES.SMOOTH);
  const [stepType, setStepType] = useState(STEP_TYPES.PARAGRAPH);
  
  // Overlay theme & typography config
  const [overlayConfig, setOverlayConfig] = useState(loadOverlayConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Auto-fading controls state
  const [areControlsFaded, setAreControlsFaded] = useState(false);

  // Telemetry state
  const [telemetry, setTelemetry] = useState({
    currentVelocityPxSec: 30,
    progressPercent: 0,
    activeNode: null
  });

  const containerRef = useRef(null);
  const engineRef = useRef(null);

  // Tap gesture refs for Single-Tap Pause & Double-Tap Resume
  const lastTapRef = useRef(0);
  const clickTimerRef = useRef(null);

  // Initialize SmoothScrollEngine
  useEffect(() => {
    engineRef.current = new SmoothScrollEngine({
      containerRef,
      onNodeChange: (node) => {
        setTelemetry(prev => ({ ...prev, activeNode: node }));
      },
      onProgressUpdate: (progress) => {
        setTelemetry(prev => ({
          ...prev,
          progressPercent: progress.progressPercent,
          currentVelocityPxSec: progress.currentVelocityPxSec
        }));
      },
      onStateChange: (running) => {
        setIsScrolling(running);
      },
      onAutoFadeChange: (faded) => {
        setAreControlsFaded(faded);
      }
    });

    return () => {
      if (engineRef.current) engineRef.current.pause();
    };
  }, []);

  // Sync document & parameters to engine
  useEffect(() => {
    if (engineRef.current && activeDocument) {
      engineRef.current.setDocument(activeDocument, userBaselineWpm || 220, speedMultiplier);
    }
  }, [activeDocument, userBaselineWpm]);

  useEffect(() => {
    if (engineRef.current) engineRef.current.setMultiplier(speedMultiplier);
  }, [speedMultiplier]);

  useEffect(() => {
    if (engineRef.current) engineRef.current.setScrollMode(scrollMode);
  }, [scrollMode]);

  useEffect(() => {
    if (engineRef.current) engineRef.current.setStepType(stepType);
  }, [stepType]);

  useEffect(() => {
    if (engineRef.current) engineRef.current.setAiAdaptiveMode(isAiMode);
  }, [isAiMode]);

  useEffect(() => {
    if (engineRef.current && overlayConfig.fontSize) {
      engineRef.current.setFontSize(overlayConfig.fontSize);
    }
  }, [overlayConfig.fontSize]);

  const handleTogglePlay = () => {
    if (!engineRef.current) return;
    if (isScrolling) {
      engineRef.current.pause();
    } else {
      engineRef.current.start();
    }
  };

  const handleResetScroll = () => {
    if (engineRef.current) engineRef.current.reset();
  };

  const handleUserInteract = () => {
    if (engineRef.current) engineRef.current.userInteracted();
  };

  // Single Tap = Pause; Double Tap = Resume from exact position
  const handleCanvasClick = (e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 280;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap -> Resume AutoScroll from exact current position
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      if (engineRef.current && !isScrolling) {
        engineRef.current.start();
      }
    } else {
      // Single tap -> Pause AutoScroll or reveal minimal controls
      clickTimerRef.current = setTimeout(() => {
        if (engineRef.current) {
          if (isScrolling) {
            engineRef.current.pause();
          } else {
            engineRef.current.userInteracted();
          }
        }
      }, DOUBLE_TAP_DELAY);
    }
    lastTapRef.current = now;
  };

  // Manual scroll detection handler
  const handleContainerScroll = () => {
    if (engineRef.current) {
      engineRef.current.userScrolled();
    }
  };

  const activeTheme = THEME_PRESETS[overlayConfig.themeId.toUpperCase().replace('-', '_')] || THEME_PRESETS.GLASS_DARK;
  const currentWpm = Math.round((userBaselineWpm || 220) * speedMultiplier);

  return (
    <div 
      onMouseMove={handleUserInteract}
      onTouchStart={handleUserInteract}
      style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 100px 24px' }}
    >
      {/* Top Header Bar with Document Meta & Quick Action Buttons */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '20px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.4)'
              }}>
                {activeDocument.fileType || 'Doc'}
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                {activeDocument.title}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              <span>Words: <strong>{activeDocument.totalWords || 0}</strong></span>
              <span>Estimated Reading: <strong>{Math.ceil((activeDocument.totalWords || 200) / (userBaselineWpm || 220))} min</strong></span>
              <span>Difficulty: <strong>{activeDocument.avgDifficulty || 0.25}</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onOpenShareSimulator}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.85rem',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                cursor: 'pointer'
              }}
            >
              Share Simulator
            </button>

            <button
              onClick={onOpenUploadModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
              }}
            >
              <UploadCloud size={16} />
              Import Document
            </button>
          </div>
        </div>

        {/* Reading Progress Top Bar */}
        <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '16px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${telemetry.progressPercent}%`,
            backgroundColor: '#3b82f6',
            transition: 'width 0.2s ease'
          }} />
        </div>
      </div>

      {/* Floating Glassmorphism Controller */}
      <FloatingController
        isScrolling={isScrolling}
        onTogglePlay={handleTogglePlay}
        onReset={handleResetScroll}
        speedMultiplier={speedMultiplier}
        onChangeMultiplier={(val) => {
          setSpeedMultiplier(val);
          const result = updateOnDeviceModel({ sessionWpm: Math.round((userBaselineWpm || 220) * val), manualAdjustments: 1 });
          if (onProfileUpdate) onProfileUpdate();
          if (result && result.justCalibratedNotification && onTriggerNotification) {
            onTriggerNotification({
              title: 'Personalization Threshold Achieved! 🎉',
              message: `AutoScroll AI has reached ${result.confidencePercent}% confidence for your reading rhythm (${result.userBaselineWpm} WPM baseline).`
            });
          }
        }}
        isAiMode={isAiMode}
        onToggleAiMode={(val) => setIsAiMode(val)}
        scrollMode={scrollMode}
        onChangeScrollMode={(m) => setScrollMode(m)}
        stepType={stepType}
        onChangeStepType={(s) => setStepType(s)}
        currentWpm={currentWpm}
        userBaselineWpm={userBaselineWpm}
        activeNodeDifficulty={telemetry.activeNode ? telemetry.activeNode.difficulty : activeDocument.avgDifficulty}
        activeNodeType={telemetry.activeNode ? telemetry.activeNode.type : 'p'}
        progressPercent={telemetry.progressPercent}
        areControlsFaded={areControlsFaded}
        onUserInteract={handleUserInteract}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        overlayConfig={overlayConfig}
        onChangeConfig={(cfg) => {
          setOverlayConfig(cfg);
          saveOverlayConfig(cfg);
        }}
        onResetCalibration={() => {
          // Reset action
        }}
      />

      {/* PURE DISTRACTION-FREE READING CANVAS */}
      <div 
        onClick={handleCanvasClick}
        style={{
          position: 'relative',
          padding: '44px',
          borderRadius: '24px',
          backgroundColor: activeTheme.panelBg,
          backdropFilter: `blur(${activeTheme.blurPx}px)`,
          WebkitBackdropFilter: `blur(${activeTheme.blurPx}px)`,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          cursor: 'pointer'
        }}
      >
        <div
          ref={containerRef}
          onScroll={handleContainerScroll}
          style={{
            height: '520px',
            overflowY: 'auto',
            paddingRight: '16px',
            fontFamily: overlayConfig.fontFamily,
            fontSize: `${overlayConfig.fontSize}px`,
            lineHeight: overlayConfig.lineHeight,
            color: activeTheme.textColor,
            scrollBehavior: scrollMode === SCROLL_MODES.STEPPED ? 'smooth' : 'auto'
          }}
        >
          {activeDocument.nodes && activeDocument.nodes.length > 0 ? (
            activeDocument.nodes.map((node) => {
              if (node.type === 'h1') {
                return (
                  <h1 key={node.id} style={{ fontSize: `${overlayConfig.fontSize * 1.5}px`, fontWeight: 800, margin: '1.4em 0 0.6em 0', color: activeTheme.textColor }}>
                    {node.text}
                  </h1>
                );
              } else if (node.type === 'h2') {
                return (
                  <h2 key={node.id} style={{ fontSize: `${overlayConfig.fontSize * 1.25}px`, fontWeight: 700, margin: '1.2em 0 0.5em 0', color: activeTheme.accentColor }}>
                    {node.text}
                  </h2>
                );
              } else if (node.type === 'h3') {
                return (
                  <h3 key={node.id} style={{ fontSize: `${overlayConfig.fontSize * 1.1}px`, fontWeight: 600, margin: '1em 0 0.4em 0' }}>
                    {node.text}
                  </h3>
                );
              } else if (node.type === 'quote') {
                return (
                  <blockquote key={node.id} style={{ fontStyle: 'italic', borderLeft: `4px solid ${activeTheme.accentColor}`, paddingLeft: '16px', margin: '1.2em 0', color: activeTheme.textMuted }}>
                    {node.text}
                  </blockquote>
                );
              } else if (node.type === 'code') {
                return (
                  <pre key={node.id} style={{
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    margin: '1.4em 0',
                    fontFamily: 'monospace',
                    fontSize: `${overlayConfig.fontSize * 0.85}px`,
                    overflowX: 'auto',
                    color: '#38bdf8'
                  }}>
                    <code>{node.text}</code>
                  </pre>
                );
              } else {
                return (
                  <p key={node.id} style={{ marginBottom: '1.4em', textIndent: '1em' }}>
                    {node.text}
                  </p>
                );
              }
            })
          ) : (
            <p style={{ color: activeTheme.textMuted, fontStyle: 'italic' }}>
              No readable content extracted. Click Import above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
