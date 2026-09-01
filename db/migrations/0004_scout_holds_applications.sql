-- 0004 — an application through a scout's link waits for the scout.
--
-- A scout finds a face and sends it in; the agency should see what the scout
-- chose to pass on, not everything that ever touched their link. So an
-- application credited to a scout is held until they send it, and only then
-- does it appear in the agency's Applied column.
--
-- `sent_at` rather than another stage: the six stages are the agency's record
-- of an applicant moving through their pipeline, and this happens before that
-- record starts. NULL means the scout still has it.

BEGIN;

ALTER TABLE public.application
    ADD COLUMN IF NOT EXISTS sent_at timestamptz;

-- Everything that already exists is already with its agency.
UPDATE public.application SET sent_at = created_at WHERE sent_at IS NULL;

-- The agency's first column reads this constantly; the scout's queue is the
-- same index read the other way.
CREATE INDEX IF NOT EXISTS application_agency_inbox_idx
    ON public.application (organization_id, stage, sent_at);

CREATE INDEX IF NOT EXISTS application_scout_queue_idx
    ON public.application (scout_id, sent_at);

COMMIT;
