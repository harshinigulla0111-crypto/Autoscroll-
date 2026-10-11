import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import AutoScrollReader from './components/AutoScrollReader';
import MLDashboard from './components/MLDashboard';
import OnboardingFlow from './components/OnboardingFlow';
import ShareSheetSimulator from './components/ShareSheetSimulator';
import UploadModal from './components/UploadModal';
import DownloadApkModal from './components/DownloadApkModal';
import UniversalAutoScrollCard from './components/UniversalAutoScrollCard';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import { authService } from './services/authService';
import { loadMLProfile, saveMLProfile } from './services/onDeviceML';
import { SAMPLE_UNIVERSAL_DOCS } from './services/contentExtractor';
import { loadUniversalAutoScrollState, saveUniversalAutoScrollState } from './services/activeAppManager';
import { BreakReminderEngine } from './services/breakReminderService';
import { loadOverlayConfig } from './services/overlayManager';
import { Sparkles, Bell, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('reader'); // 'reader' | 'universal' | 'sharesimulator' | 'mldashboard'
  const [mlProfile, setMlProfile] = useState(loadMLProfile());
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [universalState, setUniversalState] = useState(loadUniversalAutoScrollState());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [overlayConfig, setOverlayConfig] = useState(loadOverlayConfig());

  // User Authentication State
  const [user, setUser] = useState(authService.getUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Active document being read
  const [activeDocument, setActiveDocument] = useState(SAMPLE_UNIVERSAL_DOCS[0]);

  // Modal dialog states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isShareSimulatorOpen, setIsShareSimulatorOpen] = useState(false);
  const [isDownloadApkOpen, setIsDownloadApkOpen] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);

  // Toast notification state
  const [notification, setNotification] = useState(null);

  // Break Reminder Engine initialization
  const breakEngineRef = useRef(null);

  useEffect(() => {
    breakEngineRef.current = new BreakReminderEngine((notif) => {
      setNotification(notif);
    });
    breakEngineRef.current.start();

    return () => {
      if (breakEngineRef.current) breakEngineRef.current.stop();
    };
  }, []);

  // Fetch current user on startup
  useEffect(() => {
    authService.getCurrentUser().then(u => {
      if (u) setUser(u);
    });
  }, []);

  // Check if onboarding needs to be shown on first open
  useEffect(() => {
    const profile = loadMLProfile();
    setMlProfile(profile);
    
    const onboardingDone = localStorage.getItem('autoscroll_onboarding_completed_v2');
    if (!onboardingDone) {
      setShowOnboarding(true);
    }
  }, []);

  const refreshMlProfile = () => {
    const fresh = loadMLProfile();
    setMlProfile(fresh);
  };

  const handleToggleUniversal = (enabled) => {
    const updated = { ...universalState, isUniversalEnabled: enabled, isOverlayActive: enabled };
    setUniversalState(updated);
    saveUniversalAutoScrollState(updated);
    if (enabled) {
      setNotification({
        title: 'Universal AutoScroll Enabled! ⚡',
        message: 'AutoScroll is ready to detect content inside WhatsApp, Telegram, Chrome, and Kindle.'
      });
    }
  };

  const handleCompleteOnboarding = (updatedProfile) => {
    localStorage.setItem('autoscroll_onboarding_completed_v2', 'true');
    setMlProfile(updatedProfile);
    setShowOnboarding(false);

    if (updatedProfile.confidencePercent >= 85) {
      setNotification({
        title: 'ML Personalization Active! ✨',
        message: `High confidence model initialized at ${updatedProfile.userBaselineWpm} WPM.`
      });
    }
  };

  const handleResetOnboarding = () => {
    setShowOnboarding(true);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0f1e', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', position: 'relative' }}>
      
      {/* Toast Notification Banner */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 999999,
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          border: '1px solid #3b82f6',
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          maxWidth: '420px'
        }}>
          <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
            <Bell size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0, color: '#f8fafc' }}>
              {notification.title}
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 0 0', lineHeight: 1.4 }}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* MANDATORY ONBOARDING FLOW */}
      {showOnboarding && (
        <OnboardingFlow onCompleteOnboarding={handleCompleteOnboarding} />
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userBaselineWpm={mlProfile.userBaselineWpm}
        confidencePercent={mlProfile.confidencePercent}
        isUniversalEnabled={universalState.isUniversalEnabled}
        onResetOnboarding={handleResetOnboarding}
        onOpenDownloadApk={() => setIsDownloadApkOpen(true)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Body */}
      <main style={{ marginTop: '24px' }}>
        {activeTab === 'reader' && (
          <AutoScrollReader
            userBaselineWpm={mlProfile.userBaselineWpm}
            activeDocument={activeDocument}
            onSelectDocument={(doc) => setActiveDocument(doc)}
            onOpenUploadModal={() => setIsUploadOpen(true)}
            onOpenShareSimulator={() => setIsShareSimulatorOpen(true)}
            onProfileUpdate={refreshMlProfile}
            onTriggerNotification={(notif) => setNotification(notif)}
          />
        )}

        {activeTab === 'universal' && (
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 100px 24px' }}>
            <UniversalAutoScrollCard
              isUniversalEnabled={universalState.isUniversalEnabled}
              onToggleUniversal={handleToggleUniversal}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onLaunchReaderWithContent={(extractedDoc) => {
                setActiveDocument(extractedDoc);
                setActiveTab('reader');
              }}
            />
          </div>
        )}

        {activeTab === 'sharesimulator' && (
          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
            <ShareSheetSimulator
              isOpen={true}
              onClose={() => setActiveTab('reader')}
              onLaunchReader={(extractedDoc) => {
                setActiveDocument(extractedDoc);
                setActiveTab('reader');
              }}
            />
          </div>
        )}

        {activeTab === 'mldashboard' && (
          <MLDashboard
            onOpenCalibration={() => setShowOnboarding(true)}
          />
        )}
      </main>

      {/* Shared Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        overlayConfig={overlayConfig}
        onChangeConfig={(cfg) => setOverlayConfig(cfg)}
        onResetCalibration={refreshMlProfile}
        isUniversalEnabled={universalState.isUniversalEnabled}
        onToggleUniversal={handleToggleUniversal}
        onTriggerCalibration={() => setShowOnboarding(true)}
      />

      {/* Shared Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSelectDocument={(doc) => setActiveDocument(doc)}
        uploadedDocs={uploadedDocs}
        setUploadedDocs={setUploadedDocs}
      />

      {/* Share Sheet Integration Simulator Popup Modal */}
      {activeTab !== 'sharesimulator' && (
        <ShareSheetSimulator
          isOpen={isShareSimulatorOpen}
          onClose={() => setIsShareSimulatorOpen(false)}
          onLaunchReader={(extractedDoc) => {
            setActiveDocument(extractedDoc);
            setActiveTab('reader');
          }}
        />
      )}

      {/* Download APK / Native WebAPK Installation Modal */}
      <DownloadApkModal
        isOpen={isDownloadApkOpen}
        onClose={() => setIsDownloadApkOpen(false)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onAuthChange={(u) => setUser(u)}
        onTriggerNotif={(notif) => setNotification(notif)}
      />
    </div>
  );
}

