-- Migration 003: Patient Progress Tracking
-- Adds patient_files, progress_entries, and patient_goals tables
-- Run via: turso db shell <db-name> < migrations/003_patient_progress.sql

CREATE TABLE IF NOT EXISTS patient_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  therapist_id INTEGER NOT NULL,
  patient_id INTEGER NOT NULL,
  diagnoses_notes TEXT,
  treatment_goals TEXT DEFAULT '[]',
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(therapist_id, patient_id),
  FOREIGN KEY (therapist_id) REFERENCES therapists(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_patient_files_therapist ON patient_files(therapist_id);
CREATE INDEX IF NOT EXISTS idx_patient_files_patient ON patient_files(patient_id);

CREATE TABLE IF NOT EXISTS progress_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_file_id INTEGER NOT NULL,
  entry_date DATE NOT NULL,
  wellbeing_score INTEGER CHECK(wellbeing_score BETWEEN 1 AND 10),
  academic_score REAL CHECK(academic_score BETWEEN 0 AND 100),
  attendance_rate REAL CHECK(attendance_rate BETWEEN 0 AND 100),
  behavioral_incidents INTEGER DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_file_id) REFERENCES patient_files(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_progress_entries_file ON progress_entries(patient_file_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_date ON progress_entries(entry_date);

CREATE TABLE IF NOT EXISTS patient_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_file_id INTEGER NOT NULL,
  goal_text TEXT NOT NULL,
  status TEXT CHECK(status IN ('active', 'achieved', 'abandoned')) DEFAULT 'active',
  target_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_file_id) REFERENCES patient_files(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_patient_goals_file ON patient_goals(patient_file_id);
