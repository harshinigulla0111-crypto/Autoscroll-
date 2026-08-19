import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Sliders, Zap, Brain, Lock, Unlock, 
  ChevronDown, ChevronUp, Eye, EyeOff, Sparkles, Move, Settings, X, Plus, Minus, Layers
} from 'lucide-react';
import { SCROLL_MODES, STEP_TYPES } from '../services/adaptiveScrollEngine';

export default function FloatingController({
  isScrolling,
  onTogglePlay,
  onReset,
  speedMultiplier,
  onChangeMultiplier,
  isAiMode,
  onToggleAiMode,
  scrollMode,
  onChangeScrollMode,
  stepType,
  onChangeStepType,
  currentWpm,
  userBaselineWpm,
  onChangeBaselineWpm,
  activeNodeDifficulty,
  activeNodeType,
  progressPercent,
  areControlsFaded,
  onUserInteract,
  onOpenSettings,
  onExitReader
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 });

  // Handle Dragging
  const handleMouseDown = (e) => {
    if (isLocked) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
    if (onUserInteract) onUserInteract();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (onUserInteract) onUserInteract();
      if (!isDragging) return;
      const dx = dragStartRef.current.x - e.clientX;
      const dy = dragStartRef.current.y - e.clientY;
      setPosition({
        x: Math.max(10, dragStartRef.current.initialX + dx),
        y: Math.max(10, dragStartRef.current.initialY + dy)
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onUserInteract]);

  const handleWpmChange = (delta) => {
    if (onUserInteract) onUserInteract();
    const current = Math.round((userBaselineWpm || 220) * speedMultiplier);
    const targetWpm = Math.max(50, Math.min(800, current + delta));
    const newMultiplier = targetWpm / (userBaselineWpm || 220);
    onChangeMultiplier(parseFloat(newMultiplier.toFixed(2)));
  };

  return (
    <div
      onMouseEnter={onUserInteract}
      onMouseMove={onUserInteract}
      style={{
        position: 'fixed',
        bottom: `${position.y}px`,
        right: `${position.x}px`,
        zIndex: 9999,
        transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: areControlsFaded ? 0.15 : 1.0,
        pointerEvents: areControlsFaded ? 'none' : 'auto',
        userSelect: isDragging ? 'none' : 'auto'
      }}
    >
      <div
        className="glass-panel"
        style={{
          borderRadius: '20px',
          padding: isMinimized ? '12px 18px' : '20px',
          backgroundColor: 'rgba(17, 24, 39, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.15)',
          color: '#f8fafc',
          width: isMinimized ? 'auto' : '340px'
        }}
      >
        {/* Header Handle Bar */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: isMinimized ? 0 : '14px',
            cursor: isLocked ? 'default' : 'grab',
            borderBottom: isMinimized ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: isMinimized ? 0 : '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Move size={14} color="#94a3b8" style={{ opacity: isLocked ? 0.3 : 0.8 }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.03em' }}>
              Auto<span style={{ color: '#60a5fa' }}>Scroll AI</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                style={{ padding: '4px', borderRadius: '6px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                title="Settings"
              >
                <Settings size={15} />
              </button>
            )}

            <button
              onClick={() => setIsLocked(!isLocked)}
              style={{
                padding: '4px',
                borderRadius: '6px',
                color: isLocked ? '#60a5fa' : '#94a3b8',
                backgroundColor: isLocked ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              title={isLocked ? 'Position Locked' : 'Lock Position'}
            >
              {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>

            <button
              onClick={() => setIsMinimized(!isMinimized)}
              style={{ padding: '4px', borderRadius: '6px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
              title={isMinimized ? 'Expand Controller' : 'Minimize Controller'}
            >
              {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {onExitReader && (
              <button
                onClick={onExitReader}
                style={{ padding: '4px', borderRadius: '6px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                title="Exit Reader"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Minimized Pill View */}
        {isMinimized ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={onTogglePlay}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: isScrolling ? '#f59e0b' : '#3b82f6',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {isScrolling ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
            </button>

            <div style={{ fontSize: '0.8rem', fontWeight: '700' }}>
              <span style={{ color: '#60a5fa' }}>{currentWpm} WPM</span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '6px' }}>({speedMultiplier.toFixed(2)}x)</span>
            </div>
          </div>
        ) : (
          /* Full Controller Layout */
          <div>
            {/* Play/Pause & Reset Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <button
                onClick={onTogglePlay}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  backgroundColor: isScrolling ? '#f59e0b' : '#3b82f6',
                  color: '#ffffff',
                  boxShadow: isScrolling ? '0 0 15px rgba(245, 158, 11, 0.4)' : '0 4px 15px rgba(59, 130, 246, 0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {isScrolling ? <Pause size={18} /> : <Play size={18} />}
                {isScrolling ? 'Pause Reading' : 'Start AutoScroll'}
              </button>

              <button
                onClick={onReset}
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#94a3b8',
                  marginLeft: '10px',
                  cursor: 'pointer'
                }}
                title="Reset Scroll Position"
              >
                <RotateCcw size={18} />
              </button>
            </div>

            {/* Scroll Mode Switcher: Smooth vs Stepped */}
            <div style={{
              display: 'flex',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '10px',
              padding: '3px',
              marginBottom: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <button
                onClick={() => onChangeScrollMode(SCROLL_MODES.SMOOTH)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '7px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: scrollMode === SCROLL_MODES.SMOOTH ? '#3b82f6' : 'transparent',
                  color: scrollMode === SCROLL_MODES.SMOOTH ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Zap size={14} />
                Smooth Mode
              </button>

              <button
                onClick={() => onChangeScrollMode(SCROLL_MODES.STEPPED)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '7px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: scrollMode === SCROLL_MODES.STEPPED ? '#a855f7' : 'transparent',
                  color: scrollMode === SCROLL_MODES.STEPPED ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Layers size={14} />
                Stepped Mode
              </button>
            </div>

            {/* Stepped Sub-Mode Selector */}
            {scrollMode === SCROLL_MODES.STEPPED && (
              <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', justifyContent: 'space-between' }}>
                {[
                  { id: STEP_TYPES.LINE, label: '1 Line' },
                  { id: STEP_TYPES.TWO_LINE, label: '2 Lines' },
                  { id: STEP_TYPES.PARAGRAPH, label: 'Paragraph' }
                ].map(step => (
                  <button
                    key={step.id}
                    onClick={() => onChangeStepType(step.id)}
                    style={{
                      flex: 1,
                      padding: '4px 0',
                      fontSize: '0.68rem',
                      fontWeight: '700',
                      borderRadius: '6px',
                      border: stepType === step.id ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: stepType === step.id ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255,255,255,0.03)',
                      color: stepType === step.id ? '#ffffff' : '#94a3b8',
                      cursor: 'pointer'
                    }}
                  >
                    {step.label}
                  </button>
                ))}
              </div>
            )}

            {/* Manual Speed Override & WPM Fine-Tuning */}
            <div style={{ marginBottom: '12px', backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '12px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>Reading Speed:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => handleWpmChange(-10)}
                    style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer' }}
                  >
                    <Minus size={12} />
                  </button>

                  <strong style={{ color: '#60a5fa', fontSize: '1rem' }}>
                    {currentWpm} WPM
                  </strong>

                  <button
                    onClick={() => handleWpmChange(10)}
                    style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer' }}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              <input
                type="range"
                min="0.25"
                max="3.0"
                step="0.05"
                value={speedMultiplier}
                onChange={(e) => onChangeMultiplier(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
              />
            </div>

            {/* Telemetry Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
              <div>
                Progress: <strong style={{ color: '#60a5fa' }}>{progressPercent}%</strong>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Controls auto-fade while reading
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
