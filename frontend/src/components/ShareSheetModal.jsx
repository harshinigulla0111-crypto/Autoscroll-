import React, { useState } from 'react';
import { Share2, MessageSquare, Mail, Globe, FileText, Send, X, Sparkles } from 'lucide-react';
import { extractFromSharedMessage, extractFromRawText } from '../services/contentExtractor';

const SAMPLE_SHARE_SOURCES = [
  {
    id: 'whatsapp-msg',
    appName: 'WhatsApp',
    iconColor: '#25D366',
    sender: 'Sarah Miller',
    snippet: 'Hey! Here is the long breakdown of our product launch strategy and Q3 milestones...',
    fullText: `Hey! Here is the long breakdown of our product launch strategy and Q3 milestones. Please review carefully before our 3 PM synchronization meeting.

1. Product Architecture & Decoupled APIs
We have completed the migration of legacy monolith handlers to modular microservices. Performance metrics show a 40% reduction in p99 latency across all read operations.

2. On-Device Personalization ML Model
The machine learning team deployed local weight training for user speed calibration. All model parameters remain strictly on-device, preserving privacy while delivering customized scrolling velocity based on readability difficulty scores.

3. Cross-Platform UI Component Library
The frontend squad built a glassmorphism design system compatible with both Material 3 and iOS Human Interface Guidelines.`
  },
  {
    id: 'telegram-msg',
    appName: 'Telegram',
    iconColor: '#229ED9',
    sender: 'Tech Research Group',
    snippet: 'Summary of recent Transformer model efficiency optimizations...',
    fullText: `Summary of recent Transformer model efficiency optimizations published at ICML:

Self-attention computational complexity scales quadratically O(N^2) with sequence length N. Modern sparse attention and linear key-value caching algorithms reduce memory overhead to O(N), enabling long-context windows up to 2 million tokens.

FlashAttention-3 leverages GPU tensor core asynchronous memory pipelines to overlap matrix multiplications with softmax normalization, achieving 75% theoretical peak TFLOPs.`
  },
  {
    id: 'chrome-article',
    appName: 'Chrome Web Article',
    iconColor: '#EA4335',
    sender: 'TechCrunch Article',
    snippet: 'The Future of Distraction-Free AI Reading Assistants...',
    fullText: `The Future of Distraction-Free AI Reading Assistants

Digital fatigue has prompted a surge in demand for minimal, high-velocity reading platforms. By combining optical tracking algorithms with dynamic baseline WPM adjustments, next-generation reading apps eliminate manual scroll fatigue while adapting to user comprehension rates.`
  }
];

export default function ShareSheetModal({ isOpen, onClose, onSelectDocument }) {
  const [activeTab, setActiveTab] = useState('apps'); // 'apps' | 'paste'
  const [customText, setCustomText] = useState('');

  if (!isOpen) return null;

  const handleShareFromApp = (source) => {
    const doc = extractFromSharedMessage({
      appName: source.appName,
      messageText: source.fullText,
      sender: source.sender
    });
    onSelectDocument(doc);
    onClose();
  };

  const handleSharePastedText = () => {
    if (!customText.trim()) return;
    const doc = extractFromRawText(customText, "Shared Copied Text", "paste");
    onSelectDocument(doc);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '24px',
        padding: '28px',
        color: '#f8fafc',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 30px rgba(59, 130, 246, 0.2)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'var(--accent-glow)', color: 'var(--accent-blue)' }}>
              <Share2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>OS Share Sheet Simulator</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Simulate sharing content into AutoScroll from mobile apps
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '6px', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('apps')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '700',
              backgroundColor: activeTab === 'apps' ? 'var(--accent-blue)' : 'transparent',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Shared Apps (WhatsApp / Gmail / Chrome)
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '700',
              backgroundColor: activeTab === 'paste' ? 'var(--accent-blue)' : 'transparent',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Paste Text / URL
          </button>
        </div>

        {/* Tab Content 1: Apps */}
        {activeTab === 'apps' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {SAMPLE_SHARE_SOURCES.map(source => (
              <div
                key={source.id}
                onClick={() => handleShareFromApp(source)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: source.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '800'
                }}>
                  <MessageSquare size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{source.appName}</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{source.sender}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '360px' }}>
                    {source.snippet}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content 2: Paste */}
        {activeTab === 'paste' && (
          <div>
            <textarea
              rows={5}
              placeholder="Paste any long message, web article text, or study notes here..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                marginBottom: '16px',
                resize: 'none'
              }}
            />
            <button
              onClick={handleSharePastedText}
              disabled={!customText.trim()}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: customText.trim() ? 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)' : 'rgba(255,255,255,0.1)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.95rem',
                border: 'none',
                cursor: customText.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={18} />
              Open in Distraction-Free Reader
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
