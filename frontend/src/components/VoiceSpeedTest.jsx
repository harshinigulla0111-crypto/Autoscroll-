import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Play, RefreshCw, CheckCircle2, Award, Sparkles, Volume2 } from 'lucide-react';

const TEST_PARAGRAPHS = [
  {
    id: 1,
    title: "Diagnostic Test 1: Standard Narrative (Intermediate)",
    difficulty: "Medium",
    words: 110,
    text: "The sun began to dip below the horizon, casting a warm golden radiance across the coastal hills. Ships docked in the harbor bobbed gently against the wooden piers as seagulls circled high above the blue waters. Travelers gathered near the village square to hear the evening music, enjoying the cool breeze after a long summer day."
  },
  {
    id: 2,
    title: "Diagnostic Test 2: Technical & Computational (Advanced)",
    difficulty: "High",
    words: 135,
    text: "Asynchronous event loops allow modern single-threaded web applications to process concurrent non-blocking operations efficiently. When a network request or filesystem read is dispatched, the operating system manages the underlying hardware interrupt, returning control back to the callback queue once execution completes. This non-blocking paradigm minimizes thread context switching overhead."
  },
  {
    id: 3,
    title: "Diagnostic Test 3: Rapid Information Scanning (Beginner)",
    difficulty: "Easy",
    words: 85,
    text: "Reading speed varies depending on comprehension goals and familiar vocabulary. Everyday news articles are typically scanned quickly, whereas dense academic literature demands deliberate pacing. Practicing aloud helps identify your natural speaking cadence and optimal reading speed."
  }
];

export default function VoiceSpeedTest({ onUpdateBaseline }) {
  const [selectedTestId, setSelectedTestId] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [testResult, setTestResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [micPermission, setMicPermission] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [transcript, setTranscript] = useState('');

  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const currentTest = TEST_PARAGRAPHS.find(p => p.id === selectedTestId) || TEST_PARAGRAPHS[0];

  // Clean up media on unmount
  useEffect(() => {
    return () => {
      stopRecordingSession();
    };
  }, []);

  const startRecordingSession = async () => {
    setTranscript('');
    setTestResult(null);
    setElapsedTime(0);

    // Try requesting microphone media stream
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        setMicPermission('granted');
      }
    } catch (err) {
      console.warn('Microphone access not granted or unavailable:', err);
      setMicPermission('denied');
    }

    // Initialize Web Speech API if supported in browser
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (err) => {
          console.warn('Speech recognition notice:', err);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition init error:', err);
      }
    }

    setIsRecording(true);

    // Start timer
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 0.1);
    }, 100);
  };

  const stopRecordingSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }

    setIsRecording(false);
  };

  const handleFinishTest = async () => {
    stopRecordingSession();

    const finalTime = Math.max(1, elapsedTime);
    const totalWords = currentTest.words;

    // Calculate Words Per Minute
    const calculatedWpm = Math.round((totalWords / finalTime) * 60);

    const result = {
      measuredWpm: calculatedWpm,
      timeSeconds: Math.round(finalTime * 10) / 10,
      totalWords,
      paragraphTitle: currentTest.title,
      transcript: transcript.trim()
    };

    setTestResult(result);

    // Save to Backend API and calibrate ML Model
    setIsSaving(true);
    try {
      const response = await fetch('/api/voicetest/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });
      const data = await response.json();
      if (data.success) {
        onUpdateBaseline(data.userBaselineWpm);
      }
    } catch (err) {
      console.warn('Could not connect to backend to persist voice test:', err);
      onUpdateBaseline(calculatedWpm);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px 40px 24px' }}>
      
      {/* Title Header */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Mic size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: '700' }}>
              Voice Reading Speed Diagnostic Test
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Read the paragraph aloud into your microphone. The AI will calculate your natural reading pace (WPM) and train your personalized model.
            </p>
          </div>
        </div>

        {/* Diagnostic Test Selector */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px',
          marginTop: '20px'
        }}>
          {TEST_PARAGRAPHS.map(paragraph => (
            <div
              key={paragraph.id}
              onClick={() => {
                if (!isRecording) {
                  setSelectedTestId(paragraph.id);
                  setTestResult(null);
                }
              }}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: selectedTestId === paragraph.id ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)',
                backgroundColor: selectedTestId === paragraph.id ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                cursor: isRecording ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ fontSize: '0.95rem' }}>Test #{paragraph.id}</strong>
                <span className={`badge ${paragraph.difficulty === 'High' ? 'badge-amber' : 'badge-primary'}`}>
                  {paragraph.difficulty}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {paragraph.title}
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Length: {paragraph.words} words
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Recording Test Card */}
      <div className="glass-panel" style={{ padding: '36px', boxShadow: 'var(--shadow-lg)' }}>
        
        {/* Recording Visualizer Bar */}
        {isRecording && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderRadius: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--status-red)',
            marginBottom: '24px'
          }} className="recording-pulse">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--status-red)' }} />
              <span style={{ fontWeight: '700', color: 'var(--status-red)' }}>RECORDING IN PROGRESS...</span>
            </div>

            {/* Audio Wave Bars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '32px' }}>
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
            </div>

            <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: '700', color: 'var(--status-red)' }}>
              {elapsedTime.toFixed(1)}s
            </div>
          </div>
        )}

        {/* Paragraph Text Content */}
        <div style={{
          padding: '28px',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          fontSize: '1.25rem',
          lineHeight: 1.8,
          fontFamily: 'var(--font-reading)',
          color: 'var(--text-primary)',
          marginBottom: '28px',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
        }}>
          {currentTest.text}
        </div>

        {/* Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            {!isRecording ? (
              <button
                onClick={startRecordingSession}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '1.05rem',
                  backgroundColor: 'var(--accent-blue)',
                  color: '#ffffff',
                  boxShadow: 'var(--shadow-glow)'
                }}
              >
                <Mic size={20} />
                Start Voice Diagnostic Test
              </button>
            ) : (
              <button
                onClick={handleFinishTest}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '1.05rem',
                  backgroundColor: 'var(--status-green)',
                  color: '#ffffff',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                }}
              >
                <Square size={20} />
                Finish Reading & Calculate WPM
              </button>
            )}
          </div>

          {transcript && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px' }}>
              Speech Detected: <em>"{transcript.slice(-60)}..."</em>
            </div>
          )}
        </div>

        {/* Results Banner */}
        {testResult && (
          <div style={{
            marginTop: '32px',
            padding: '24px',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-primary)',
            border: '2px solid var(--status-green)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--status-green)', marginBottom: '12px' }}>
              <CheckCircle2 size={24} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
                Voice Speed Diagnostic Complete!
              </h3>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Calculated Reading Speed</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-blue)' }}>
                  {testResult.measuredWpm} <span style={{ fontSize: '1rem' }}>WPM</span>
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Time Elapsed</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-purple)' }}>
                  {testResult.timeSeconds}s
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Words Read</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--status-amber)' }}>
                  {testResult.totalWords}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              🎉 Your new baseline reading speed of <strong>{testResult.measuredWpm} WPM</strong> has been updated and your machine learning model has been calibrated!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
