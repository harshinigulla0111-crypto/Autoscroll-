import { parseMarkdownOrTextToNodes } from './documentProcessor';

/**
 * Universal Content Extraction Pipeline for AutoScroll AI
 * Extracts clean, readable semantic nodes from files, pasted text, shared messages, and web content.
 */

/**
 * Extract clean text and nodes from raw string / pasted content / shared app messages
 */
export function extractFromRawText(rawText, title = "Imported Content", fileType = "text") {
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    throw new Error("No text content found to extract.");
  }

  const cleanText = rawText.trim();
  const nodes = parseMarkdownOrTextToNodes(cleanText);
  const totalWords = nodes.reduce((sum, n) => sum + (n.wordCount || 0), 0);

  return {
    id: `extracted-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: title || "Extracted Reading Content",
    fileType: fileType || "text",
    originalText: cleanText,
    nodes,
    totalWords,
    avgDifficulty: nodes.length > 0 
      ? (nodes.reduce((sum, n) => sum + (n.difficulty || 0.2), 0) / nodes.length).toFixed(2)
      : 0.25,
    timestamp: new Date().toISOString()
  };
}

/**
 * Extract content from Shared Mobile Messages (WhatsApp, Telegram, Signal, Gmail, Chrome, Notes)
 */
export function extractFromSharedMessage({ appName = 'WhatsApp', messageText, sender = 'Shared Sender' }) {
  if (!messageText || messageText.trim().length === 0) {
    throw new Error(`Empty shared content received from ${appName}.`);
  }

  const cleanText = messageText.trim();
  const title = `Shared from ${appName} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
  
  return extractFromRawText(cleanText, title, `shared-${appName.toLowerCase()}`);
}

/**
 * Sample Pre-loaded Universal Content for Quick Testing
 */
export const SAMPLE_UNIVERSAL_DOCS = [
  {
    id: 'sample-whatsapp-1',
    title: '💬 WhatsApp: Long Travel Itinerary & Group Plan',
    fileType: 'whatsapp',
    category: 'story',
    avgDifficulty: 0.20,
    nodes: parseMarkdownOrTextToNodes(`# Group Trip Itinerary: Northern Highlands & Alpine Lakes

Hey everyone! Here is the finalized itinerary for our upcoming 5-day mountain trip starting next Thursday. Please read through carefully so we are all on the same page regarding transportation, gear, and daily schedules.

## Day 1: Departure & Basecamp Setup

We will assemble at the central station at 06:30 AM sharp. The express train departs at 07:15 AM and arrives at Riverdale Crossing around noon. From there, we take a 45-minute mountain shuttle directly to the Pine Ridge trailhead.

Once at the trailhead, we will divide communal gear (tents, cooking stoves, water filtration units) among everyone's packs. The hike to Basecamp 1 is approximately 4.5 miles with a moderate elevation gain of 1,200 feet. We expect to reach camp by 04:30 PM, set up tents before twilight, and gather around the campfire for dinner.

> Remember to pack a headlamp, extra warm layers for freezing evening temperatures, and at least 2 liters of water for the initial trail ascent.

## Day 2: Summit Trail & Alpine Pass

Day 2 features our most challenging hike: ascending the West Ridge Pass up to Sapphire Peak (elevation 8,400 ft). We will start early at 06:00 AM after a high-energy breakfast.

The trail begins with switchbacks through dense pine forest before opening up onto granite ridges. Weather at the summit can change rapidly, so windbreaker jackets and sunglasses are required. We will stop at the alpine lake for a 1-hour lunch break and photo session before descending back down to Basecamp 2.
`)
  },
  {
    id: 'sample-web-article',
    title: '🌐 Web Article: The Science of High-Velocity Reading',
    fileType: 'article',
    category: 'educational',
    avgDifficulty: 0.38,
    nodes: parseMarkdownOrTextToNodes(`# The Science of High-Velocity Cognitive Reading

Modern digital environments expose knowledge workers to thousands of words daily. Traditional linear reading techniques, developed primarily for physical print media, often struggle to keep pace with contemporary information density.

## Saccadic Eye Movements & Subvocalization

Human reading relies on rapid jerk-like eye movements known as saccades, interspersed with momentary pauses called fixations. During fixations, the visual cortex ingests clusters of 2 to 4 words simultaneously.

Subvocalization—the internal vocalization of words while reading—naturally caps human reading speeds near spoken language rates (~200 to 250 words per minute). However, adaptive visual tracking algorithms bypass subvocalization by establishing steady optical velocity streams.

\`\`\`javascript
// Mathematical Representation of Optical Tracking Velocity
function calculateOptimalVelocity(wpm, lineLengthPx) {
  const wordsPerSec = wpm / 60;
  const linesPerSec = wordsPerSec / 8.5; // Average 8.5 words per visual line
  return linesPerSec * lineLengthPx;
}
\`\`\`

## Cognitive Comprehension Retention Thresholds

Research demonstrates that progressive acceleration up to 350 WPM maintains comprehension rates above 85% when text difficulty is low. However, technical schemas, code blocks, and complex mathematical formalisms require dynamic velocity deceleration to prevent cognitive overload.
`)
  },
  {
    id: 'sample-research-paper',
    title: '🔬 Research Paper: Deep Neural Attention Mechanics',
    fileType: 'pdf',
    category: 'technical',
    avgDifficulty: 0.85,
    nodes: parseMarkdownOrTextToNodes(`# Scaled Dot-Product Attention in Deep Transformers

Self-attention mechanisms calculate weighted vector representations across sequence tokens by performing linear matrix projections into Query (Q), Key (K), and Value (V) embedding spaces.

Given input matrix X with sequence length N and feature dimension d_model, the attention weight matrix is computed via softmax normalization over scaled dot products:

\`\`\`python
import torch
import torch.nn as nn
import math

class ScaledDotProductAttention(nn.Module):
    def __init__(self, d_k):
        super().__init__()
        self.d_k = d_k

    def forward(self, Q, K, V, mask=None):
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        if mask is not null:
            scores = scores.masked_fill(mask == 0, -1e9)
        p_attn = torch.softmax(scores, dim=-1)
        return torch.matmul(p_attn, V), p_attn
\`\`\`

## Multi-Head Parallel Projection Layers

Rather than performing single attention computations, multi-head mechanisms project queries, keys, and values h times with learned parameter projections. This enables the network to jointly attend to information from different representation subspaces at different positions.
`)
  }
];
