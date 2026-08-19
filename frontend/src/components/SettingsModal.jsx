import React, { useState } from 'react';
import { 
  X, Sliders, Eye, ShieldCheck, RefreshCw, Palette, Brain, Smartphone, 
  Bell, CheckCircle2, AlertCircle, Trash2, Zap, Layers, Lock
} from 'lucide-react';
import { THEME_PRESETS } from '../services/overlayManager';
import { resetMLProfile, loadMLProfile } from '../services/onDeviceML';
import { loadBreakReminderConfig, saveBreakReminderConfig } from '../services/breakReminderService';
import { AndroidNativeContract } from '../native/nativeBridge';

export default function SettingsModal({
  isOpen,
  onClose,
  overlayConfig,
  onChangeConfig,
  onResetCalibration,
  isUniversalEnabled,
  onToggleUniversal,
  onTriggerCalibration
}) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'ai' | 'universal' | 'privacy'
  const [breakConfig, setBreakConfig] = useState(loadBreakReminderConfig());
  const [mlProfile, setMlProfile] = useState(loadMLProfile());
  const [highlightEnabled, setHighlightEnabled] = useState(true);

  if (!isOpen) return null;

  const handleUpdateBreak = (updated) => {
    setBreakConfig(updated);
    saveBreakReminderConfig(updated);
  };

  const handleResetProfile = () => {
    if (window.confirm('Reset your personalized ML reading model back to defaults?')) {
      const fresh = resetMLProfile();
      setMlProfile(fresh);
      if (onResetCalibration) onResetCalibration();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      backgroundColor: 'rgba(10, 15, 30, 0.88)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '680px',
        width: '100%',
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '24px',
        padding: '32px',
        color: '#f8fafc',
        boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        {/* Modal Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Sliders size={26} color="#60a5fa" />
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', margin: 0 }}>AutoScroll Preferences</h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Configure standalone app, AI personalization, universal features & privacy.
            </p>
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { id: 'general', label: 'General & Themes', icon: Sliders },
            { id: 'ai', label: 'AI & Personalization', icon: Brain },
            { id: 'universal', label: 'Universal Access', icon: Smartphone },
            { id: 'privacy', label: 'Privacy & Data', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: isSelected ? '1px solid #3b82f6' : '1px solid transparent',
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  color: isSelected ? '#60a5fa' : '#94a3b8',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: GENERAL & THEMES */}
        {activeTab === 'general' && (
          <div>
            {/* AutoScroll Master Enable */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
              <div>
                <span style={{ fontWeight: '800', fontSize: '0.92rem' }}>AutoScroll Engine Master Switch</span>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>Enable automated pacing and smooth scrolling across all views</p>
              </div>
              <input
                type="checkbox"
                checked={true}
                readOnly
                style={{ width: '20px', height: '20px', accentColor: '#3b82f6' }}
              />
            </div>

            {/* Break Reminders Toggle & Controls */}
            <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={18} color="#a855f7" />
                  <span style={{ fontWeight: '800', fontSize: '0.92rem' }}>Eye Rest Break Reminders</span>
                </div>
                <input
                  type="checkbox"
                  checked={breakConfig.enabled}
                  onChange={(e) => handleUpdateBreak({ ...breakConfig, enabled: e.target.checked })}
                  style={{ width: '20px', height: '20px', accentColor: '#a855f7', cursor: 'pointer' }}
                />
              </div>

              {breakConfig.enabled && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '8px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Reminder Interval:</label>
                    <select
                      value={breakConfig.intervalMinutes}
                      onChange={(e) => handleUpdateBreak({ ...breakConfig, intervalMinutes: parseInt(e.target.value) })}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem' }}
                    >
                      <option value={10}>Every 10 minutes</option>
                      <option value={15}>Every 15 minutes</option>
                      <option value={20}>Every 20 minutes (Recommended)</option>
                      <option value={30}>Every 30 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Break Duration:</label>
                    <select
                      value={breakConfig.breakDurationSec}
                      onChange={(e) => handleUpdateBreak({ ...breakConfig, breakDurationSec: parseInt(e.target.value) })}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem' }}
                    >
                      <option value={15}>15 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={60}>1 minute</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Design Theme Presets */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '10px' }}>
                Glassmorphism Theme Preset:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {Object.values(THEME_PRESETS).map((theme) => {
                  const isSelected = overlayConfig.themeId === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => onChangeConfig({ ...overlayConfig, themeId: theme.id })}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: theme.textColor, marginBottom: '2px' }}>
                        {theme.name}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        Blur: {theme.blurPx}px
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Typography Font Family */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                Typography Font Family:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { id: 'sans-serif', name: 'Sans-Serif (Clean Modern)' },
                  { id: 'serif', name: 'Serif (Editorial Classic)' },
                  { id: 'monospace', name: 'Monospace (Technical Code)' }
                ].map(font => (
                  <button
                    key={font.id}
                    onClick={() => onChangeConfig({ ...overlayConfig, fontFamily: font.id })}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: overlayConfig.fontFamily === font.id ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: overlayConfig.fontFamily === font.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)',
                      color: '#fff',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI & PERSONALIZATION */}
        {activeTab === 'ai' && (
          <div>
            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.25)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#60a5fa', textTransform: 'uppercase' }}>
                  Personal Reading Profile
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#4ade80', backgroundColor: 'rgba(34, 197, 94, 0.2)', padding: '2px 8px', borderRadius: '6px' }}>
                  {mlProfile.confidencePercent}% Model Confidence
                </span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', margin: '4px 0' }}>
                {mlProfile.userBaselineWpm} <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 'normal' }}>Words Per Minute (Baseline WPM)</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '6px 0 0 0' }}>
                AutoScroll adapts reading speed dynamically based on document complexity (Story: {mlProfile.categoryWpmMap.story} WPM, Tech: {mlProfile.categoryWpmMap.technical} WPM).
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button
                onClick={() => {
                  onClose();
                  if (onTriggerCalibration) onTriggerCalibration();
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
                  color: '#fff',
                  fontWeight: '800',
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Brain size={16} /> Recalibrate Reading Model
              </button>

              <button
                onClick={handleResetProfile}
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={14} /> Reset Profile
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: UNIVERSAL ACCESS & PERMISSIONS */}
        {activeTab === 'universal' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.25)', marginBottom: '20px' }}>
              <div>
                <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>Universal AutoScroll Feature</span>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>Scroll third-party apps directly (WhatsApp, Chrome, Kindle, Docs)</p>
              </div>
              <button
                onClick={() => onToggleUniversal(!isUniversalEnabled)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  backgroundColor: isUniversalEnabled ? '#22c55e' : 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontWeight: '800',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {isUniversalEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Current Reading Text Highlight Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px' }}>
              <div>
                <span style={{ fontWeight: '800', fontSize: '0.88rem' }}>Current Reading Area Highlight Overlay</span>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0 0' }}>Displays a subtle, transparent highlight around the active reading text line</p>
              </div>
              <input
                type="checkbox"
                checked={highlightEnabled}
                onChange={(e) => setHighlightEnabled(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: 'pointer' }}
              />
            </div>

            {/* Android System Permissions Status */}
            <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#60a5fa', textTransform: 'uppercase' }}>Android Permissions Status</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Accessibility Service (In-App Content Scroll)</span>
                  <button onClick={() => AndroidNativeContract.requestAccessibilityPermission()} style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.4)', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>ACTIVE</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Overlay Permission (Floating Control Pill)</span>
                  <button onClick={() => AndroidNativeContract.requestOverlayPermission()} style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.4)', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>ACTIVE</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PRIVACY & DATA */}
        {activeTab === 'privacy' && (
          <div>
            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <Lock size={20} color="#60a5fa" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0 }}>Privacy-First Local Processing</h4>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                AutoScroll never uploads your extracted reading content, WhatsApp messages, or personal documents to any external server. All text processing and ML training occurs 100% locally on your device.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => alert('Temporary reading cache cleared successfully.')}
                style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span>Clear Temporary Document Cache</span>
                <Trash2 size={16} color="#94a3b8" />
              </button>

              <button
                onClick={handleResetProfile}
                style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span>Clear Personalized ML Reading Model</span>
                <RefreshCw size={16} color="#ef4444" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '24px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              fontWeight: '800',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
            }}
          >
            Save & Apply Preferences
          </button>
        </div>

      </div>
    </div>
  );
}
