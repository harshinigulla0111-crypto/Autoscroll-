import React from 'react';
import { Brain, BookOpen, Share2, Award, ShieldCheck, Sparkles, RefreshCw, Download, Smartphone, Zap, User } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  userBaselineWpm,
  onResetOnboarding,
  onOpenDownloadApk,
  user = null,
  onOpenAuth,
  confidencePercent = 85,
  isUniversalEnabled = true
}) {
  return (
    <header className="glass-panel" style={{
      margin: '16px 24px 0 24px',
      padding: '14px 28px',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      {/* Brand / Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
        }}>
          <Brain size={22} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, lineHeight: 1.1 }}>
            Auto<span style={{ color: '#60a5fa' }}>Scroll</span> AI
          </h1>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600' }}>
            Reading Assistant • On-Device ML
          </span>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <nav style={{ display: 'flex', gap: '6px', backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '4px', borderRadius: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('reader')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '9px',
            border: 'none',
            backgroundColor: activeTab === 'reader' ? '#3b82f6' : 'transparent',
            color: activeTab === 'reader' ? '#ffffff' : '#94a3b8',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <BookOpen size={16} />
          Reading Interface
        </button>

        <button
          onClick={() => setActiveTab('universal')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '9px',
            border: 'none',
            backgroundColor: activeTab === 'universal' ? '#10b981' : 'transparent',
            color: activeTab === 'universal' ? '#ffffff' : '#94a3b8',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <Smartphone size={16} />
          Universal AutoScroll
        </button>

        <button
          onClick={() => setActiveTab('sharesimulator')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '9px',
            border: 'none',
            backgroundColor: activeTab === 'sharesimulator' ? '#3b82f6' : 'transparent',
            color: activeTab === 'sharesimulator' ? '#ffffff' : '#94a3b8',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <Share2 size={16} />
          Share Simulator
        </button>

        <button
          onClick={() => setActiveTab('mldashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '9px',
            border: 'none',
            backgroundColor: activeTab === 'mldashboard' ? '#3b82f6' : 'transparent',
            color: activeTab === 'mldashboard' ? '#ffffff' : '#94a3b8',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <Brain size={16} />
          ML Personalization
        </button>
      </nav>

      {/* Right User Stats, Auth Button, Download APK & Calibration Reset */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onOpenAuth}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '10px',
            backgroundColor: user ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.08)',
            border: user ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
            color: user ? '#818cf8' : '#ffffff',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          <User size={16} />
          {user ? user.email.split('@')[0] : 'Sign In'}
        </button>

        <button
          onClick={onOpenDownloadApk}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            color: '#ffffff',
            fontWeight: '700',
            fontSize: '0.85rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)'
          }}
        >
          <Download size={16} />
          Download APK
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '6px 12px', borderRadius: '10px' }}>
          <Sparkles size={15} color="#60a5fa" />
          <span>Learned WPM: <strong style={{ color: '#60a5fa' }}>{userBaselineWpm}</strong></span>
        </div>

        <button
          onClick={onResetOnboarding}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#94a3b8',
            fontSize: '0.75rem',
            fontWeight: '700',
            cursor: 'pointer'
          }}
          title="Re-open Onboarding Setup"
        >
          <RefreshCw size={13} />
          Onboarding
        </button>
      </div>
    </header>
  );
}

