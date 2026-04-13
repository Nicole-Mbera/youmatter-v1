-- Migration 004: Add missing columns to sessions table
-- The sessions table was created without meeting_link and session_type columns.
-- Run via: turso db shell <db-name> < migrations/004_add_missing_sessions_columns.sql

ALTER TABLE sessions ADD COLUMN meeting_link TEXT;
ALTER TABLE sessions ADD COLUMN session_type TEXT CHECK(session_type IN ('video', 'chat', 'phone'));
