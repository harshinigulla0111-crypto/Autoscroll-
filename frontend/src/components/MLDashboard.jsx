import React, { useState, useEffect } from 'react';
import { 
  Brain, ShieldCheck, Zap, Activity, RefreshCw, Award, 
  BarChart2, Lock, CheckCircle2, Sliders, ChevronRight
} from 'lucide-react';
import { loadMLProfile, resetMLProfile } from '../services/onDeviceML';

export default function MLDashboard({ onOpenCalibration }) {
  const [profile, setProfile] = useState(loadMLProfile());

  useEffect(() => {
    setProfile(loadMLProfile());
  }, []);

  const handleReset = () => {
    if (window.confirm('Reset your ML reading model profile back to default baseline?')) {
      const reset = resetMLProfile();
      setProfile(reset);
    }
  };

  const getConfidenceBadgeColor = (conf) => {
    if (conf >= 85) return '#22c55e'; // High accuracy
    if (conf >= 60) return '#3b82f6'; // Moderate confidence
    return '#f59e0b'; // Generalized model initializing
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px 80px 24px', color: '#f8fafc' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.35)'
            }}>
              <Brain size={28} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>
                  On-Device Machine Learning Dashboard
                </h2>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  color: '#22c55e',
                  border: '1px solid rgba(34, 197, 94, 0.3)'
                }}>
                  100% PRIVATE
                </span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '2px' }}>
                On-device continuous learning engine adapting scrolling velocity to your natural reading speed.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCalibration}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              fontWeight: '700',
              fontSize: '0.88rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Award size={18} />
            Re-run Calibration Test
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* Baseline WPM */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>
            Baseline Reading Speed
          </span>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#60a5fa', margin: '4px 0' }}>
            {profile.userBaselineWpm} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>WPM</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {profile.calibrationCompleted ? 'Calibrated via Reading Test' : 'Initialized from Baseline Model'}
          </span>
        </div>

        {/* Model Accuracy / Confidence */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>
            Model Confidence
          </span>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', color: getConfidenceBadgeColor(profile.confidencePercent), margin: '4px 0' }}>
            {profile.confidencePercent}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>
            <CheckCircle2 size={14} color={getConfidenceBadgeColor(profile.confidencePercent)} />
            {profile.confidencePercent >= 85 ? 'High Accuracy Personalization' : 'Continuous Training Active'}
          </div>
        </div>

        {/* Total Reading Sessions */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>
            Reading Sessions
          </span>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#c084fc', margin: '4px 0' }}>
            {profile.totalSessionsCompleted}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            On-device telemetry recorded
          </span>
        </div>

        {/* Data Privacy Status */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>
            Privacy Guarantee
          </span>
          <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#38bdf8', margin: '8px 0' }}>
            Local Storage Only
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Zero text upload permission required
          </span>
        </div>

      </div>

      {/* Speed Curves by Text Complexity Tier */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={20} color="#60a5fa" />
          Personalized WPM Speeds by Complexity Tier
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {[
            { key: 'story', label: 'Narrative Story', color: '#22c55e', desc: 'Easy prose, dialog & descriptive text' },
            { key: 'news', label: 'News & Editorial', color: '#3b82f6', desc: 'Standard journalistic articles & posts' },
            { key: 'educational', label: 'Educational Science', color: '#a855f7', desc: 'Informative & academic explanations' },
            { key: 'technical', label: 'Technical Code & Math', color: '#f59e0b', desc: 'Dense code blocks, formulas & formalisms' }
          ].map(tier => {
            const wpm = profile.categoryWpmMap ? profile.categoryWpmMap[tier.key] || profile.userBaselineWpm : profile.userBaselineWpm;
            return (
              <div key={tier.key} style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: tier.color, textTransform: 'uppercase' }}>
                  {tier.label}
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', margin: '4px 0', color: '#fff' }}>
                  {wpm} <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>WPM</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                  {tier.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
