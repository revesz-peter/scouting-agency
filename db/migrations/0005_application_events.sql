-- 0005 — the moves, as a record.
--
-- "The move is the record: who advanced them, when, and what happened after."
-- A profile that shows a history needs somewhere for that history to live;
-- until now only the current stage was kept, so the past was unrecoverable.

BEGIN;

CREATE TABLE public.application_event (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid NOT NULL REFERENCES public.application(id) ON DELETE CASCADE,
    -- 'applied' and 'sent_on' are not stages; they are how it got here.
    kind           text NOT NULL
                   CHECK (kind IN ('applied', 'sent_on', 'stage')),
    stage          text
                   CHECK (stage IN ('applied', 'pre_select', 'scheduled',
                                    'final_voting', 'onboarding', 'on_board')),
    -- Null for things nobody did by hand, like the application arriving.
    actor_id       uuid REFERENCES neon_auth."user"(id) ON DELETE SET NULL,
    at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX application_event_application_idx
    ON public.application_event (application_id, at);

-- Backfill what can be known: everything applied when it was created, and
-- anything a scout has sent was sent at sent_at.
INSERT INTO public.application_event (application_id, kind, stage, at)
SELECT id, 'applied', 'applied', created_at FROM public.application;

INSERT INTO public.application_event (application_id, kind, at)
SELECT id, 'sent_on', sent_at
FROM public.application
WHERE scout_id IS NOT NULL AND sent_at IS NOT NULL;

COMMIT;
