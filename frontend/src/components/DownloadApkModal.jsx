import React, { useState, useEffect } from 'react';
import { 
  Download, Smartphone, CheckCircle2, ShieldCheck, 
  Sparkles, X, ArrowRight, ExternalLink, QrCode, Layers, Info, Share2, Copy, Send, MessageSquare
} from 'lucide-react';

export default function DownloadApkModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install AutoScroll as a WebAPK on Android: Tap Chrome menu (⋮) -> Select "Add to Home screen" / "Install app"');
    }
  };

  const handleDirectApkDownload = () => {
    const link = document.createElement('a');
    link.href = '/AutoScroll-v1.0.0.apk';
    link.download = 'AutoScroll-v1.0.0.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAppUrl = () => {
    return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  };

  const getApkUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    return `${origin}/AutoScroll-v1.0.0.apk`;
  };

  const handleNativeShare = async (shareType = 'app') => {
    const shareUrl = shareType === 'apk' ? getApkUrl() : getAppUrl();
    const title = shareType === 'apk' ? 'AutoScroll AI - Download APK' : 'AutoScroll AI - Reading Assistant App';
    const text = 'AutoScroll AI: AI-powered distraction-free reading assistant for long-form content!';

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl
        });
      } catch (err) {
        console.log('Native share error/cancel:', err);
      }
    } else {
      handleCopyLink(shareType);
    }
  };

  const handleCopyLink = (shareType = 'app') => {
    const shareUrl = shareType === 'apk' ? getApkUrl() : getAppUrl();
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(shareType === 'apk' ? 'apk' : 'app');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShareWhatsApp = (shareType = 'app') => {
    const shareUrl = shareType === 'apk' ? getApkUrl() : getAppUrl();
    const text = encodeURIComponent(`Open AutoScroll AI Reading Assistant: ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareTelegram = (shareType = 'app') => {
    const shareUrl = shareType === 'apk' ? getApkUrl() : getAppUrl();
    const text = encodeURIComponent('AutoScroll AI Reading Assistant App Link');
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`, '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      backgroundColor: 'rgba(10, 15, 30, 0.92)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '720px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        backgroundColor: 'rgba(17, 24, 39, 0.96)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(34, 197, 94, 0.4)'
          }}>
            <Smartphone size={28} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: '#4ade80', letterSpacing: '0.05em' }}>
              Official Android & Web Package
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>
              Download & Share AutoScroll APK
            </h2>
          </div>
        </div>

        <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '24px' }}>
          Install AutoScroll directly on your Android device or share the APK package with friends to give them an AI-powered distraction-free reading assistant.
        </p>

        {/* Action Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          
          {/* Card 1: Direct APK Download */}
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            border: '2px solid #3b82f6',
            borderRadius: '18px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Download size={20} color="#60a5fa" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Download Standalone APK</h4>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '16px' }}>
                Get the compiled standalone Android application installer package (v1.0.0).
              </p>
            </div>

            <button
              onClick={handleDirectApkDownload}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
              }}
            >
              <Download size={18} />
              Download AutoScroll.apk
            </button>
          </div>

          {/* Card 2: One-Click WebAPK PWA Install */}
          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.12)',
            border: '2px solid #22c55e',
            borderRadius: '18px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={20} color="#4ade80" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Instant WebAPK Install</h4>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '16px' }}>
                Install natively via browser WebAPK technology without downloading file installers.
              </p>
            </div>

            <button
              onClick={handleInstallPwa}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)'
              }}
            >
              <CheckCircle2 size={18} />
              {isInstalled ? 'App Installed Natively' : 'Install Native WebAPK'}
            </button>
          </div>

        </div>

        {/* LIVE APPLICATION DIRECT LINK CARD */}
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          border: '2px solid #3b82f6',
          borderRadius: '18px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ExternalLink size={20} color="#60a5fa" />
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Live Application Direct Link</h4>
            </div>
            {copiedLink === 'app' && (
              <span style={{ fontSize: '0.78rem', color: '#4ade80', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> App Link Copied!
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.84rem', color: '#cbd5e1', marginBottom: '14px', lineHeight: 1.5 }}>
            Share this direct link with your users. Clicking it opens the live <strong>AutoScroll AI</strong> application in any browser or mobile phone:
          </p>

          {/* Link Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '14px' }}>
            <code style={{ flex: 1, fontSize: '0.88rem', color: '#60a5fa', fontWeight: '700', wordBreak: 'break-all' }}>
              {getAppUrl()}
            </code>
            <button
              onClick={() => handleCopyLink('app')}
              style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Copy size={14} /> Copy Link
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleNativeShare('app')}
              style={{ flex: 1, padding: '8px 14px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Share2 size={14} /> Share App Link
            </button>
            <button
              onClick={() => handleShareWhatsApp('app')}
              style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: '#25D366', color: '#fff', border: 'none', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <MessageSquare size={14} /> WhatsApp
            </button>
            <button
              onClick={() => handleShareTelegram('app')}
              style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: '#229ED9', color: '#fff', border: 'none', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={14} /> Telegram
            </button>
          </div>
        </div>

        {/* SHARE APK SECTION */}
        <div style={{
          backgroundColor: 'rgba(168, 85, 247, 0.12)',
          border: '1px solid rgba(168, 85, 247, 0.4)',
          borderRadius: '18px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Share2 size={22} color="#c084fc" />
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Share APK Package With Friends</h4>
            </div>
            {copiedLink && (
              <span style={{ fontSize: '0.78rem', color: '#4ade80', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> Link Copied!
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.84rem', color: '#cbd5e1', marginBottom: '16px', lineHeight: 1.5 }}>
            Send the APK download link to your phone, friends, or messaging apps so they can install AutoScroll immediately:
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleNativeShare}
              style={{
                flex: 1,
                minWidth: '140px',
                padding: '10px 16px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Share2 size={16} />
              Share App APK
            </button>

            <button
              onClick={handleShareWhatsApp}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                backgroundColor: '#25D366',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MessageSquare size={16} />
              WhatsApp
            </button>

            <button
              onClick={handleShareTelegram}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                backgroundColor: '#229ED9',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Send size={16} />
              Telegram
            </button>

            <button
              onClick={handleCopyLink}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Copy size={16} />
              Copy APK Link
            </button>
          </div>
        </div>

        {/* QR Code Scan Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: 'rgba(0, 0, 0, 0.4)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px' }}>
          <div style={{
            width: '90px',
            height: '90px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* SVG QR Code Illustration */}
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <path d="M0,0 h35 v35 h-35 z M10,10 h15 v15 h-15 z" fill="#0f172a" />
              <path d="M65,0 h35 v35 h-35 z M75,10 h15 v15 h-15 z" fill="#0f172a" />
              <path d="M0,65 h35 v35 h-35 z M10,75 h15 v15 h-15 z" fill="#0f172a" />
              <path d="M45,10 h10 v10 h-10 z M45,45 h10 v10 h-10 z M75,45 h15 v10 h-15 z M45,75 h20 v20 h-20 z M75,75 h20 v20 h-20 z" fill="#3b82f6" />
            </svg>
          </div>
          <div>
            <h5 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '4px' }}>Scan QR Code on Mobile Phone</h5>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
              Scan with your phone camera to download <strong>AutoScroll-v1.0.0.apk</strong> directly onto your mobile device.
            </p>
          </div>
        </div>

        {/* Installation Instructions */}
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '16px', padding: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#60a5fa', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Installation Guide & Requirements:
          </h5>
          <ul style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.7, paddingLeft: '18px' }}>
            <li><strong>Android:</strong> Allow "Install from Unknown Sources" if prompted when launching the APK file, or tap Chrome menu (⋮) → "Add to Home screen".</li>
            <li><strong>iOS Safari:</strong> Tap Share icon (⎘) → Select "Add to Home Screen" to install native standalone reader.</li>
            <li><strong>On-Device Privacy:</strong> 100% local operation—no background server tracking.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

