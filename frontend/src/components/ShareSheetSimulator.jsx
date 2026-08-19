import React, { useState } from 'react';
import { 
  Share2, MessageSquare, Send, Mail, Globe, FileText, BookOpen, 
  Smartphone, ArrowRight, CheckCircle2, Sparkles, X, Layers, Play
} from 'lucide-react';
import { extractFromSharedMessage } from '../services/contentExtractor';

const SOURCE_APPS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageSquare,
    color: '#25D366',
    sampleSender: 'Alex (Family Group)',
    sampleText: `Hey guys! Here is the detailed breakdown of the travel itinerary for our trip next month:

1. Day 1: Arrive at the resort around 2 PM. Check-in, grab lunch at the beachside grill, and meet for sunset drinks at 6:30 PM.
2. Day 2: Morning hike through the canyon trail (bring good hiking boots and plenty of water). In the afternoon, we have a reserved boat tour leaving from Pier 4 at 3:00 PM sharp.
3. Day 3: Free morning to relax or explore the local market. Dinner reservation at 7:30 PM at La Trattoria.

Make sure to reply in the group if you need any adjustments to the schedule!`
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: Send,
    color: '#229ED9',
    sampleSender: 'Tech Digest Channel',
    sampleText: `🚀 Major Update on Autonomous AI Agents & Vector DB Architecture

Vector database indexing has undergone a fundamental shift toward dynamic graph-based HNSW indices. By reducing memory overhead by 40% while preserving sub-10ms query latencies, real-time context retrieval is now possible across multi-million token context windows.

Key takeaways for system architects:
- Prefer cosine distance for normalized embeddings.
- Implement quantization (PQ/SQ) for ultra-large datasets.
- Decouple index build pipelines from query execution nodes.`
  },
  {
    id: 'gmail',
    name: 'Gmail',
    icon: Mail,
    color: '#EA4335',
    sampleSender: 'Quarterly Financial Summary',
    sampleText: `Dear Team,

Below is the executive summary for Q3 performance across all active product divisions:

Revenue grew 24% year-over-year, driven primarily by strong enterprise adoption of our cloud automation toolkit. Customer retention rates reached an all-time high of 94.2%, while operating expenses remained strictly within approved budget parameters.

Key strategic priorities for Q4 include expanding international compliance certifications, launching the upgraded ML auto-scroll engine, and scaling customer support response teams.`
  },
  {
    id: 'chrome',
    name: 'Chrome / Web Article',
    icon: Globe,
    color: '#4285F4',
    sampleSender: 'TechCrunch / Web Page',
    sampleText: `The Evolution of Readable Typography in Mobile Interfaces

Mobile screen density has increased dramatically over the past decade, yet reading long-form content on handheld devices remains exhausting for many users. Eyestrain, constant manual thumb scrolling, and erratic line jumps disrupt reading flow.

Researchers in human-computer interaction suggest that visual pacing engines combined with transparent glassmorphism overlays can reduce saccade fatigue by over 30%.`
  },
  {
    id: 'pdf',
    name: 'PDF / Research Paper',
    icon: FileText,
    color: '#FF5722',
    sampleSender: 'ArXiv PDF Document',
    sampleText: `ABSTRACT: Neural Attention Mechanisms in High-Density Sequences

We propose a lightweight attention module capable of O(N) linear time complexity for continuous sequence processing. Traditional self-attention mechanisms scale quadratically with sequence length, causing memory bottlenecks in long-form document reading models.

Our empirical results demonstrate a 3.4x speedup during on-device inference while preserving perplexity scores across standard benchmark datasets.`
  },
  {
    id: 'notes',
    name: 'Notes App',
    icon: BookOpen,
    color: '#EAB308',
    sampleSender: 'Personal Study Notes',
    sampleText: `Key Principles of Distributed Consensus Protocols:

- Leader Election: Monotonic term numbers ensure single leader invariant per epoch.
- Log Replication: Heartbeat RPCs append log entries across follower replicas.
- Safety Guarantees: If a server has applied a log entry to its state machine, no other server can apply a different command for that index.`
  }
];

export default function ShareSheetSimulator({ isOpen, onClose, onLaunchReader }) {
  const [selectedApp, setSelectedApp] = useState(SOURCE_APPS[0]);
  const [shareStep, setShareStep] = useState(1); // 1 = View Source App, 2 = Share Sheet Pop-up, 3 = Extraction & Launch

  if (!isOpen) return null;

  const handleSimulateShare = () => {
    setShareStep(2);
  };

  const handleChooseAutoScroll = () => {
    setShareStep(3);
    setTimeout(() => {
      const extractedDoc = extractFromSharedMessage({
        appName: selectedApp.name,
        messageText: selectedApp.sampleText,
        sender: selectedApp.sampleSender
      });
      onLaunchReader(extractedDoc);
      onClose();
      setShareStep(1);
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      backgroundColor: 'rgba(10, 15, 30, 0.92)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '720px',
        width: '100%',
        backgroundColor: 'rgba(17, 24, 39, 0.92)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '24px',
        padding: '28px',
        color: '#f8fafc',
        boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <X size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Smartphone size={24} color="#60a5fa" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>
            Mobile Share Integration Simulator
          </h2>
        </div>

        <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '20px' }}>
          Simulate opening long content from external mobile apps directly into AutoScroll.
        </p>

        {/* Source App Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px' }}>
          {SOURCE_APPS.map((app) => {
            const Icon = app.icon;
            const isSelected = selectedApp.id === app.id;
            return (
              <button
                key={app.id}
                onClick={() => {
                  setSelectedApp(app);
                  setShareStep(1);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: isSelected ? `2px solid ${app.color}` : '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} color={app.color} />
                {app.name}
              </button>
            );
          })}
        </div>

        {/* SIMULATOR SCREEN CONTENT */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '18px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '20px',
          minHeight: '260px',
          position: 'relative',
          marginBottom: '20px'
        }}>

          {/* STEP 1: View Message inside source app */}
          {shareStep === 1 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <selectedApp.icon size={20} color={selectedApp.color} />
                  <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{selectedApp.name}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sender: {selectedApp.sampleSender}</span>
              </div>

              <div style={{ fontSize: '0.92rem', lineHeight: 1.6, color: '#e2e8f0', maxHeight: '160px', overflowY: 'auto', marginBottom: '16px' }}>
                {selectedApp.sampleText}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleSimulateShare}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    backgroundColor: selectedApp.color,
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.88rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Share2 size={16} />
                  Tap Share in {selectedApp.name}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Mobile Share Sheet Sheet Modal overlay simulation */}
          {shareStep === 2 && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              borderRadius: '18px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end'
            }}>
              <div style={{
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(255,255,255,0.15)'
              }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px', fontWeight: '700' }}>
                  SHARE SHEET INTEGRATION (Android / iOS)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div
                    onClick={handleChooseAutoScroll}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '12px 6px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(59, 130, 246, 0.25)',
                      border: '2px solid #3b82f6',
                      cursor: 'pointer',
                      boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
                    }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={20} color="#fff" />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#60a5fa' }}>AutoScroll</span>
                  </div>

                  <div style={{ opacity: 0.4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '12px 6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mail size={18} />
                    </div>
                    <span style={{ fontSize: '0.72rem' }}>Email</span>
                  </div>

                  <div style={{ opacity: 0.4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '12px 6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Send size={18} />
                    </div>
                    <span style={{ fontSize: '0.72rem' }}>Drive</span>
                  </div>

                  <div style={{ opacity: 0.4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '12px 6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={18} />
                    </div>
                    <span style={{ fontSize: '0.72rem' }}>Copy</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: AutoScroll Extracting & Launching */}
          {shareStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'spin 2s linear infinite' }}>
                <Sparkles size={24} color="#fff" />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                Extracting readable content from {selectedApp.name}...
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Opening distraction-free reader window at your personalized ML speed
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
