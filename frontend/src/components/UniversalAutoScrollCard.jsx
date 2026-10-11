import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Shield, Settings, Zap, CheckCircle2, AlertTriangle, 
  ExternalLink, Layers, Copy, Share2, FileText, Sparkles, MessageSquare, Globe, BookOpen, Download
} from 'lucide-react';
import { POPULAR_APP_REGISTRY } from '../services/appCapabilityManager';
import { AndroidNativeContract, detectPlatform, PLATFORM_TYPES } from '../native/nativeBridge';

export default function UniversalAutoScrollCard({
  isUniversalEnabled,
  onToggleUniversal,
  onOpenSettings,
  onLaunchReaderWithContent
}) {
  const [selectedApp, setSelectedApp] = useState(POPULAR_APP_REGISTRY[0]); // WhatsApp
  const [platform, setPlatform] = useState(detectPlatform());
  const [isAccessibilityGranted, setIsAccessibilityGranted] = useState(false);
  const [isOverlayGranted, setIsOverlayGranted] = useState(false);
  const [simulatedFallbackOpen, setSimulatedFallbackOpen] = useState(false);

  // Check live device permissions
  useEffect(() => {
    async function checkPermissions() {
      if (platform === PLATFORM_TYPES.ANDROID) {
        const acc = await AndroidNativeContract.checkAccessibilityPermission();
        const ovr = await AndroidNativeContract.checkOverlayPermission();
        setIsAccessibilityGranted(acc);
        setIsOverlayGranted(ovr);
      }
    }
    checkPermissions();
  }, [platform]);

  const handleGrantAccessibility = async () => {
    await AndroidNativeContract.requestAccessibilityPermission();
  };

  const handleGrantOverlay = async () => {
    await AndroidNativeContract.requestOverlayPermission();
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

      {/* Distinction Section: Web Prototype vs Android Device Integration */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* CARD 1: Web Prototype / Web Demo */}
        <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Web Demo & Dashboard
            </span>
            <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
              PROTOTYPE ACTIVE
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '14px' }}>
            The Web Dashboard demonstrates ML speed estimation, document extraction, floating controller UI, and adaptive pacing algorithms in your browser.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', color: '#94a3b8' }}>
            <span style={{ color: '#4ade80' }}>✓ In-Browser Reading Canvas & ML Model</span>
            <span style={{ color: '#4ade80' }}>✓ Multi-format Document Extractor</span>
            <span style={{ color: '#4ade80' }}>✓ Glassmorphism Control Pill Preview</span>
          </div>
        </div>

        {/* CARD 2: Android Device Integration */}
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Android Device Integration
            </span>
            <span style={{
              fontSize: '0.72rem',
              backgroundColor: platform === PLATFORM_TYPES.ANDROID ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: platform === PLATFORM_TYPES.ANDROID ? '#4ade80' : '#fbbf24',
              padding: '2px 8px',
              borderRadius: '6px',
              fontWeight: '700'
            }}>
              {platform === PLATFORM_TYPES.ANDROID ? 'NATIVE ANDROID' : 'REQUIRES ANDROID APP'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Accessibility Service (System Scroll)</span>
              {isAccessibilityGranted ? (
                <span style={{ color: '#4ade80', fontWeight: '800', fontSize: '0.75rem' }}>✓ GRANTED</span>
              ) : (
                <button onClick={handleGrantAccessibility} style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
                  Setup
                </button>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Display Overlay (Floating Controls)</span>
              {isOverlayGranted ? (
                <span style={{ color: '#4ade80', fontWeight: '800', fontSize: '0.75rem' }}>✓ GRANTED</span>
              ) : (
                <button onClick={handleGrantOverlay} style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
                  Setup
                </button>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Quick Settings Tile Bar Toggle</span>
              <span style={{ color: '#a855f7', fontWeight: '800', fontSize: '0.75rem' }}>AVAILABLE IN ANDROID APP</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href="/AutoScroll-v1.0.0.apk"
              download="AutoScroll-v1.0.0.apk"
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.8rem',
                textDecoration: 'none',
                textAlign: 'center',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Download size={14} /> Download Native Android APK
            </a>
          </div>
        </div>

      </div>

      {/* Supported Application Inspection Registry */}
      <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="#a855f7" />
          Supported Third-Party Applications Capabilities
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
            <span style={{ fontSize: '0.88rem', fontWeight: '800' }}>{selectedApp.appName} ({selectedApp.packageName})</span>
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
            <span>Accessibility Scroll: <strong style={{ color: '#4ade80' }}>ACTION_SCROLL_FORWARD</strong></span>
            <span>Fallback Gesture: <strong style={{ color: '#4ade80' }}>PROGRAMMATIC SWIPE</strong></span>
          </div>
        </div>
      </div>

      {/* Footer controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
          💡 On Android, swipe down Quick Settings and tap <strong>AutoScroll</strong> to launch floating control overlay.
        </span>

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
          <Settings size={14} /> Android Preferences
        </button>
      </div>
    </div>
  );
}
