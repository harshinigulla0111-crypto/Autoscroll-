-- Migration 001: Initial AutoScroll Database Schema

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reading_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  baseline_reading_speed INT NOT NULL DEFAULT 220,
  preferred_speed_multiplier NUMERIC(3,2) DEFAULT 1.00,
  preferred_scroll_mode VARCHAR(50) DEFAULT 'smooth',
  adaptive_speed_enabled BOOLEAN DEFAULT TRUE,
  calibration_status VARCHAR(50) DEFAULT 'pending',
  calibration_version INT DEFAULT 1,
  category_wpm_map JSONB DEFAULT '{"story":240,"news":220,"educational":195,"technical":160}'::jsonb,
  confidence_percent INT DEFAULT 35,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scroll_mode VARCHAR(50) DEFAULT 'smooth',
  step_type VARCHAR(50) DEFAULT 'paragraph',
  font_family VARCHAR(100) DEFAULT 'sans-serif',
  font_size INT DEFAULT 18,
  line_height NUMERIC(3,2) DEFAULT 1.60,
  theme_id VARCHAR(50) DEFAULT 'glass_dark',
  break_reminders_enabled BOOLEAN DEFAULT TRUE,
  break_interval_minutes INT DEFAULT 20,
  break_duration_seconds INT DEFAULT 30,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS calibration_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  calibration_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  estimated_reading_speed INT NOT NULL,
  difficulty_level NUMERIC(3,2) NOT NULL,
  passages_completed INT NOT NULL DEFAULT 4,
  calibration_version INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_start TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  session_duration_seconds INT DEFAULT 0,
  estimated_reading_speed INT NOT NULL,
  scroll_mode VARCHAR(50) DEFAULT 'smooth',
  content_type VARCHAR(50) DEFAULT 'blog',
  completion_percentage INT DEFAULT 0,
  manual_adjustments_count INT DEFAULT 0
);
