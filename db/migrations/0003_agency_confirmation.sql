-- 0003 — an agency's public links go live only once confirmed.
--
-- Verifying the email proves someone controls an inbox. It does not prove they
-- are the agency they say they are, and the apply link is the thing applicants
-- trust. So registration stays self-serve — they get in, see their workspace,
-- and set everything up — but the two public links stay dark until an operator
-- confirms the agency is real.
--
-- This is a different gate from the one 0002 removed: nobody is blocked at the
-- door, only at going live.

BEGIN;

ALTER TABLE public.agency_profile
    DROP CONSTRAINT IF EXISTS agency_profile_status_check;

ALTER TABLE public.agency_profile
    ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE public.agency_profile
    ADD CONSTRAINT agency_profile_status_check
    CHECK (status IN ('pending', 'active', 'suspended'));

-- When an operator confirmed it, and who. Kept for the record: "who let this
-- agency in" is the kind of question that gets asked later.
ALTER TABLE public.agency_profile
    ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;

ALTER TABLE public.agency_profile
    ADD COLUMN IF NOT EXISTS confirmed_by uuid REFERENCES neon_auth."user"(id) ON DELETE SET NULL;

-- Agencies that already exist predate this gate; taking their links away would
-- be a change they never asked for.
UPDATE public.agency_profile
SET status = 'active', confirmed_at = now()
WHERE status = 'active' AND confirmed_at IS NULL;

CREATE INDEX IF NOT EXISTS agency_profile_status_idx
    ON public.agency_profile (status);

COMMIT;
