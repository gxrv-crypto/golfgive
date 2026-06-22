-- Migration 0002 — winner payout details on profiles.
-- Run this in the Supabase SQL editor if you created the project before these
-- columns existed. Idempotent.

alter table profiles add column if not exists payout_upi text;
alter table profiles add column if not exists payout_account_name text;
alter table profiles add column if not exists payout_account_number text;
alter table profiles add column if not exists payout_ifsc text;
