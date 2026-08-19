import React, { useState } from 'react';
import { 
  UploadCloud, FileText, Globe, BookOpen, X, CheckCircle2, 
  Sparkles, Layers, ArrowRight
} from 'lucide-react';
import { importFromFile, importFromPastedText, importFromWebUrl } from '../services/importManager';

export default function UploadModal({ isOpen, onClose, onSelectDocument, uploadedDocs, setUploadedDocs }) {
  const [activeTab, setActiveTab] = useState('file'); // 'file' | 'paste' | 'url'
  const [pastedText, setPastedText] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const extracted = await importFromFile(file);
      setUploadedDocs(prev => [extracted, ...prev]);
      onSelectDocument(extracted);
      setIsProcessing(false);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to process file.');
      setIsProcessing(false);
    }
  };

  const handleImportPaste = () => {
    if (!pastedText.trim()) {
      setErrorMsg('Please paste readable text first.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const extracted = importFromPastedText(pastedText, customTitle);
      setUploadedDocs(prev => [extracted, ...prev]);
      onSelectDocument(extracted);
      setIsProcessing(false);
      setPastedText('');
      setCustomTitle('');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to process text.');
      setIsProcessing(false);
    }
  };

  const handleImportUrl = async () => {
    if (!webUrl.trim()) {
      setErrorMsg('Please enter a Web Article URL.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const extracted = await importFromWebUrl(webUrl);
      setUploadedDocs(prev => [extracted, ...prev]);
      onSelectDocument(extracted);
      setIsProcessing(false);
      setWebUrl('');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to extract web article.');
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      backgroundColor: 'rgba(10, 15, 30, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '640px',
        width: '100%',
        backgroundColor: 'rgba(17, 24, 39, 0.94)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '24px',
        padding: '28px',
        color: '#f8fafc',
        boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <UploadCloud size={24} color="#60a5fa" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Import Content to AutoScroll</h2>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '12px', marginBottom: '20px' }}>
          {[
            { id: 'file', label: 'Upload File', icon: FileText },
            { id: 'paste', label: 'Paste Text', icon: BookOpen },
            { id: 'url', label: 'Web Article URL', icon: Globe }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setErrorMsg('');
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '9px',
                  border: 'none',
                  backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        {/* TAB 1: File Upload */}
        {activeTab === 'file' && (
          <div>
            <div style={{
              border: '2px dashed rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '36px 20px',
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              cursor: 'pointer'
            }}>
              <UploadCloud size={40} color="#60a5fa" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '6px' }}>
                Select a document file to extract & read
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px' }}>
                Supported Formats: PDF, PPT, PPTX, DOC, DOCX, TXT, EPUB, Markdown (.md)
              </p>

              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                borderRadius: '10px',
                backgroundColor: '#3b82f6',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}>
                Browse Files
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.epub,.md"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: Paste Raw Text */}
        {activeTab === 'paste' && (
          <div>
            <input
              type="text"
              placeholder="Document Title (Optional)"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: '0.88rem',
                marginBottom: '12px'
              }}
            />

            <textarea
              rows={6}
              placeholder="Paste your long-form text, message, or article here..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                marginBottom: '16px',
                resize: 'none'
              }}
            />

            <button
              onClick={handleImportPaste}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: '#3b82f6',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Extract & Open in Reader
            </button>
          </div>
        )}

        {/* TAB 3: Web Article URL */}
        {activeTab === 'url' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                Enter Web Article Link:
              </label>
              <input
                type="url"
                placeholder="https://example.com/long-article"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <button
              onClick={handleImportUrl}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: '#3b82f6',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Extract Web Text & Open Reader
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
