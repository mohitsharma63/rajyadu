-- Migration: Add OTP table and phone verification column
-- Date: 2025-01-XX
-- Description: Add OTP functionality and phone verification to users table

-- Create OTP table for storing OTP codes
CREATE TABLE IF NOT EXISTS otps (
    id BIGSERIAL PRIMARY KEY,
    phone VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_otps_phone ON otps(phone);
CREATE INDEX IF NOT EXISTS idx_otps_phone_verified ON otps(phone, verified);

-- Add phone_verified column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Update existing users to have phone_verified as false (optional, only if you want to verify existing users)
-- UPDATE users SET phone_verified = FALSE WHERE phone_verified IS NULL;

