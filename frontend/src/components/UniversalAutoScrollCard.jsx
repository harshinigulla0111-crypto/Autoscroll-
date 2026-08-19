import React, { useState } from 'react';
import { 
  Smartphone, Shield, Settings, Zap, CheckCircle2, AlertTriangle, 
  ExternalLink, Layers, Copy, Share2, FileText, Sparkles, MessageSquare, Globe, BookOpen
} from 'lucide-react';
import { POPULAR_APP_REGISTRY } from '../services/appCapabilityManager';
import { AndroidNativeContract } from '../native/nativeBridge';

export default function UniversalAutoScrollCard({
  isUniversalEnabled,
  onToggleUniversal,
  onOpenSettings,
  onLaunchReaderWithContent
}) {
  const [selectedApp, setSelectedApp] = useState(POPULAR_APP_REGISTRY[0]); // WhatsApp
  const [isAccessibilityGranted, setIsAccessibilityGranted] = useState(true);
  const [isOverlayGranted, setIsOverlayGranted] = useState(true);
  const [simulatedFallbackOpen, setSimulatedFallbackOpen] = useState(false);

  const handleGrantAccessibility = async () => {
    await AndroidNativeContract.requestAccessibilityPermission();
    setIsAccessibilityGranted(true);
  };

  const handleGrantOverlay = async () => {
    await AndroidNativeContract.requestOverlayPermission();
    setIsOverlayGranted(true);
  };

  return (
    <div style={{
      backgroundColor: 'rgba(17, 24, 39, 0.85)',
      border: '1px solid rgba(59, 130, 246, 0.25)',
      borderRadius: '24px',
      padding: '28px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
      color: '#f8fafc',
      marginBottom: '24px'
    }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
          }}>
            <Smartphone size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>Universal AutoScroll</h3>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: isUniversalEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: isUniversalEnabled ? '#4ade80' : '#f87171',
                border: `1px solid ${isUniversalEnabled ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
              }}>
                {isUniversalEnabled ? 'FEATURE ACTIVE' : 'FEATURE OFF'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Read inside WhatsApp, Telegram, Chrome, or Kindle without switching apps.
            </p>
          </div>
        </div>

        {/* Master Universal Toggle */}
        <button
          onClick={() => onToggleUniversal(!isUniversalEnabled)}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            background: isUniversalEnabled 
              ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
              : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            fontWeight: '800',
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: isUniversalEnabled ? '0 4px 15px rgba(34, 197, 94, 0.3)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Zap size={18} />
          {isUniversalEnabled ? 'Universal AutoScroll ON' : 'Turn Universal AutoScroll ON'}
        </button>
      </div>

      {/* Grid: Permission Cards & Supported Apps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* System Permissions Card */}
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="#38bdf8" />
            Android System Permissions
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <div>
                <span style={{ fontWeight: '700' }}>Accessibility Service</span>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Content scroll detection</p>
              </div>
              {isAccessibilityGranted ? (
                <span style={{ color: '#4ade80', fontWeight: '800', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> GRANTED
                </span>
              ) : (
                <button onClick={handleGrantAccessibility} style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
                  Enable
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <div>
                <span style={{ fontWeight: '700' }}>Display Overlay</span>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Floating reading control pill</p>
              </div>
              {isOverlayGranted ? (
                <span style={{ color: '#4ade80', fontWeight: '800', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> GRANTED
                </span>
              ) : (
                <button onClick={handleGrantOverlay} style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
                  Enable
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <div>
                <span style={{ fontWeight: '700' }}>Quick Settings Tile</span>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>System drop-down tile toggle</p>
              </div>
              <span style={{ color: '#a855f7', fontWeight: '800', fontSize: '0.78rem' }}>
                READY IN TILE BAR
              </span>
            </div>
          </div>
        </div>

        {/* Third-Party App Compatibility Inspector */}
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#a855f7" />
            Tested Applications & Capability
          </h4>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {POPULAR_APP_REGISTRY.slice(0, 5).map((app) => (
              <button
                key={app.packageName}
                onClick={() => setSelectedApp(app)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: selectedApp.packageName === app.packageName ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.04)',
                  border: selectedApp.packageName === app.packageName ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                  color: selectedApp.packageName === app.packageName ? '#60a5fa' : '#94a3b8',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {app.appName}
              </button>
            ))}
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: '800' }}>{selectedApp.appName}</span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: '800',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: selectedApp.capability === 'FULL' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                color: selectedApp.capability === 'FULL' ? '#4ade80' : '#facc15'
              }}>
                {selectedApp.capability} CAPABILITY
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '4px 0 8px 0' }}>
              {selectedApp.notes}
            </p>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', gap: '12px' }}>
              <span>Direct Scroll: <strong style={{ color: '#4ade80' }}>YES</strong></span>
              <span>Text Highlight: <strong style={{ color: selectedApp.supportsTextExtract ? '#4ade80' : '#facc15' }}>{selectedApp.supportsTextExtract ? 'YES' : 'GESTURE'}</strong></span>
            </div>
          </div>
        </div>

      </div>

      {/* Demonstration / Simulator Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        paddingTop: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          💡 <strong>How to use:</strong> Open WhatsApp or Chrome, swipe down Quick Settings, tap <strong>AutoScroll</strong> to turn ON.
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setSimulatedFallbackOpen(!simulatedFallbackOpen)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Preview Fallback Dialog
          </button>

          <button
            onClick={onOpenSettings}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Settings size={14} /> Universal Settings
          </button>
        </div>
      </div>

      {/* Simulated Fallback Dialog Popup */}
      {simulatedFallbackOpen && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          borderRadius: '14px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <AlertTriangle size={20} color="#f87171" style={{ marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <h5 style={{ fontSize: '0.9rem', fontWeight: '800', margin: 0, color: '#f87171' }}>
              Direct AutoScroll isn't supported in this app.
            </h5>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '4px 0 12px 0' }}>
              This view doesn't expose a standard scroll container. Choose a fallback option below to continue reading with AutoScroll AI:
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setSimulatedFallbackOpen(false);
                  onLaunchReaderWithContent({
                    id: 'fallback-shared',
                    title: 'Shared Application Content',
                    totalWords: 340,
                    avgDifficulty: 0.28,
                    fileType: 'Share',
                    nodes: [
                      { id: 'f1', type: 'h2', text: 'Content Imported via Universal Fallback' },
                      { id: 'f2', type: 'p', text: 'This text was automatically extracted via fallback share sheet. AutoScroll engine will now smoothly scroll this content with your personalized ML speed profile.' }
                    ]
                  });
                }}
                style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Share2 size={12} /> Share to AutoScroll
              </button>
              <button
                onClick={() => setSimulatedFallbackOpen(false)}
                style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Copy size={12} /> Copy Text
              </button>
              <button
                onClick={() => setSimulatedFallbackOpen(false)}
                style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <FileText size={12} /> Import File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
