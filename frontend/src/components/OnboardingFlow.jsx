import React, { useState } from 'react';
import { 
  Sparkles, Brain, Zap, ArrowRight, CheckCircle2, ShieldCheck, 
  BookOpen, Sliders, Play, Pause, RefreshCw, X, Award, Eye, Bell
} from 'lucide-react';
import { recordCalibrationResults, saveMLProfile, loadMLProfile } from '../services/onDeviceML';

const CALIBRATION_PASSAGES = [
  {
    id: 'pass-story',
    category: 'story',
    badge: 'Passage 1 of 4 • Narrative Story',
    title: 'The Amber Beacon',
    difficulty: 0.18,
    text: `The mountain pass had settled into midnight quiet, leaving behind an eerie stillness broken only by the crunching of frost beneath Eldrin's boots. He adjusted his heavy wool cloak against the northern wind and looked down at the lanterns glowing across the valley below.

For three nights, the ancient beacon atop the high tower had burned with a bright amber flame—a signal that had not been lit in over two centuries. Rumors spread through the surrounding villages. Some whispered of forgotten relics unearthed in the deep mines, while others feared the return of the Shadow Knights.`
  },
  {
    id: 'pass-news',
    category: 'news',
    badge: 'Passage 2 of 4 • News & Editorial',
    title: 'Breakthroughs in Clean Fusion Energy',
    difficulty: 0.32,
    text: `Researchers at the European Thermal Research Facility announced a milestone in magnetic confinement fusion. During a 90-second test run, the tokamak reactor achieved net energy gain while maintaining plasma stability at over 100 million degrees Celsius.

Engineers utilized high-temperature superconducting magnets alongside real-time neural network plasma stabilization algorithms to prevent turbulence along the reactor vessel walls.`
  },
  {
    id: 'pass-educational',
    category: 'educational',
    badge: 'Passage 3 of 4 • Educational & Science',
    title: 'Neurological Mechanics of Working Memory',
    difficulty: 0.55,
    text: `Human working memory relies on synchronized oscillatory patterns between the prefrontal cortex and the hippocampus. Short-term memory buffers temporarily hold approximately four distinct chunks of conceptual information before either consolidating into synaptic long-term potentiation or fading.`
  },
  {
    id: 'pass-technical',
    category: 'technical',
    badge: 'Passage 4 of 4 • Technical Code & Math',
    title: 'Distributed Consensus & Raft Protocol',
    difficulty: 0.88,
    text: `The Raft consensus algorithm decomposes state machine replication into leader election, log replication, and safety guarantees. Leaders maintain monotonic term numbers (T) and issue AppendEntries RPC heartbeats to followers.

\`\`\`python
def append_entries(term, leader_id, prev_log_index, entries):
    if term < current_term:
        return False, current_term
    if log[prev_log_index].term != prev_log_term:
        return False, current_term
    return True, current_term
\`\`\``
  }
];

export default function OnboardingFlow({ onCompleteOnboarding }) {
  const [step, setStep] = useState(1); // 1 = Intro/Vision, 2 = Choose Option A or B, 3 = Option A Calibration Test, 4 = Option B Confirmation
  
  // Calibration Test State
  const [currentPassageIdx, setCurrentPassageIdx] = useState(0);
  const [testStartTime, setTestStartTime] = useState(null);
  const [completedPassages, setCompletedPassages] = useState([]);

  // Handle Option A Selection -> Start Calibration Test
  const handleStartCalibration = () => {
    setStep(3);
    setCurrentPassageIdx(0);
    setTestStartTime(Date.now());
  };

  // Handle Option B Selection -> Learn Automatically
  const handleSelectAutoLearn = () => {
    const profile = loadMLProfile();
    profile.calibrationCompleted = false;
    profile.autoLearnActive = true;
    saveMLProfile(profile);
    setStep(4);
  };

  const handleFinishAutoLearnConfirm = () => {
    const profile = loadMLProfile();
    onCompleteOnboarding(profile);
  };

  // Finish reading current passage in test
  const handleFinishPassage = () => {
    const elapsedSec = Math.max(2, (Date.now() - testStartTime) / 1000);
    const currentPassage = CALIBRATION_PASSAGES[currentPassageIdx];
    const wordCount = currentPassage.text.trim().split(/\s+/).length;
    const measuredWpm = Math.round((wordCount / elapsedSec) * 60);

    const passageResult = {
      id: currentPassage.id,
      category: currentPassage.category,
      measuredWpm,
      elapsedSec
    };

    const nextCompleted = [...completedPassages, passageResult];
    setCompletedPassages(nextCompleted);

    if (currentPassageIdx + 1 < CALIBRATION_PASSAGES.length) {
      setCurrentPassageIdx(prev => prev + 1);
      setTestStartTime(Date.now());
    } else {
      // Finished all 4 calibration passages!
      const updatedProfile = recordCalibrationResults(nextCompleted);
      onCompleteOnboarding(updatedProfile);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      backgroundColor: 'rgba(10, 15, 30, 0.94)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '680px',
        width: '100%',
        backgroundColor: 'rgba(17, 24, 39, 0.90)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '24px',
        padding: '36px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(59, 130, 246, 0.15)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>

        {/* STEP 1: Vision & Privacy Intro */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 24px rgba(59, 130, 246, 0.4)'
              }}>
                <Brain size={28} color="#ffffff" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: '#60a5fa', letterSpacing: '0.05em' }}>
                  Welcome to AutoScroll AI
                </span>
                <h2 style={{ fontSize: '1.65rem', fontWeight: '800', lineHeight: 1.2 }}>
                  Your AI-Powered Reading Assistant
                </h2>
              </div>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '24px' }}>
              AutoScroll eliminates manual scrolling by extracting readable text from any source and pacing it automatically using on-device Machine Learning tailored to your personal reading speed.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <ShieldCheck size={22} color="#38bdf8" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '4px' }}>100% On-Device Privacy</h4>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Your documents and reading speed metrics stay strictly local on your device.</p>
              </div>

              <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Zap size={22} color="#a855f7" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '4px' }}>Universal Content Support</h4>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Read PDFs, Word files, web articles, or messages shared directly from any app.</p>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)'
              }}
            >
              Configure AI Personalization
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* STEP 2: Choose Option A (Calibration Test) or Option B (Learn Automatically) */}
        {step === 2 && (
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: '#60a5fa', letterSpacing: '0.05em' }}>
              Step 2 of 2 • Initialization
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '6px 0 16px 0' }}>
              Select your personalized AI calibration mode
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              
              {/* OPTION A: Reading Calibration Test */}
              <div
                onClick={handleStartCalibration}
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  border: '2px solid #3b82f6',
                  borderRadius: '18px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ padding: '10px', backgroundColor: '#3b82f6', borderRadius: '12px', color: '#fff' }}>
                    <Award size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>OPTION A – Take Reading Calibration Test</h3>
                      <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#22c55e', color: '#000', fontWeight: '800' }}>
                        RECOMMENDED
                      </span>
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: '6px 0 10px 0', lineHeight: 1.5 }}>
                      Read 4 short passages of increasing complexity (Story, News, Educational, Technical). AutoScroll observes your speed, pauses, and rhythm to initialize high-precision ML weights instantly.
                    </p>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Start 1-Minute Calibration <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>

              {/* OPTION B: Learn Automatically */}
              <div
                onClick={handleSelectAutoLearn}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '18px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#94a3b8' }}>
                    <Brain size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>OPTION B – Learn Automatically While Reading</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '6px 0 10px 0', lineHeight: 1.5 }}>
                      Start immediately with our generalized baseline reading model. AutoScroll will automatically learn whenever you read, observing manual adjustments, scroll direction, and pauses until full accuracy is achieved.
                    </p>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Skip Test & Enable Background Auto-Learn <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STEP 3: Interactive Option A Calibration Test */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#60a5fa', letterSpacing: '0.05em' }}>
                {CALIBRATION_PASSAGES[currentPassageIdx].badge}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {currentPassageIdx + 1} / {CALIBRATION_PASSAGES.length} Completed
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '12px', color: '#f8fafc' }}>
              {CALIBRATION_PASSAGES[currentPassageIdx].title}
            </h3>

            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '24px',
              maxHeight: '260px',
              overflowY: 'auto',
              fontSize: '1.05rem',
              lineHeight: 1.7,
              color: '#e2e8f0',
              marginBottom: '24px'
            }}>
              {CALIBRATION_PASSAGES[currentPassageIdx].text}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                Read the passage at your natural speed, then click Finish.
              </p>

              <button
                onClick={handleFinishPassage}
                style={{
                  padding: '12px 28px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)'
                }}
              >
                <CheckCircle2 size={18} />
                Finished Reading Passage
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Option B Auto-Learn Confirmation */}
        {step === 4 && (
          <div>
            <div style={{ textAlign: 'center', padding: '10px 0 20px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                <Bell size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px' }}>
                Auto-Learning Model Activated!
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 24px auto' }}>
                AutoScroll is initialized with our generalized baseline reading model. As you read documents, it will track your manual scrolling, speed adjustments, and reading pauses to continuously update its ML weights locally.
              </p>
              
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '16px', borderRadius: '16px', textAlign: 'left', marginBottom: '28px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Automatic Confidence Notification
                </span>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '4px', margin: 0 }}>
                  You will receive an in-app notification as soon as the model achieves high confidence (&gt;85% accuracy) for your personal reading speed.
                </p>
              </div>

              <button
                onClick={handleFinishAutoLearnConfirm}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)'
                }}
              >
                Launch Reading Interface
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
