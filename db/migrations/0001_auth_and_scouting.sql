-- 0001 — agencies, scouts, and the two ways a scout joins an agency.
--
-- Identity lives in the managed `neon_auth` schema (Neon Auth / Better Auth):
--   agency      -> neon_auth.organization
--   membership  -> neon_auth.member   (role: owner | admin | member)
--   invitation  -> neon_auth.invitation
--
-- Nothing here duplicates membership or roles. `neon_auth.member` is the single
-- source of truth for who belongs to an agency and at what level; these tables
-- only carry what Better Auth has no column for.
--
-- Two constraints the `neon_auth` schema imposes: its columns are camelCase and
-- must be double-quoted, and Neon may re-migrate it on upgrade — so we reference
-- it by foreign key but never alter it.

BEGIN;

-- An agency is an organization. This is the rest of its record.
CREATE TABLE public.agency_profile (
    organization_id uuid PRIMARY KEY REFERENCES neon_auth.organization(id) ON DELETE CASCADE,
    website         text,
    city            text NOT NULL,
    country         text NOT NULL,
    board_size      int,
    notes           text,
    status          text NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'suspended')),
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- A scout is one person with one public code, across every agency they work with.
-- The code is theirs to choose, so it stays short enough for an Instagram bio.
CREATE TABLE public.scout_profile (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      uuid NOT NULL UNIQUE REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
    code         text NOT NULL UNIQUE
                 CHECK (code = lower(code) AND code ~ '^[a-z0-9-]{2,32}$'),
    display_name text NOT NULL,
    city         text,
    country      text,
    created_at   timestamptz NOT NULL DEFAULT now()
);

-- Payout terms are per agency: a scout working with two agencies has two rows.
-- Defaults mirror the arrangement the scout showcase demonstrates —
-- $100 on signing, $100 on first job, 20% of the agency's commission ongoing.
CREATE TABLE public.scout_terms (
    scout_id              uuid NOT NULL REFERENCES public.scout_profile(id) ON DELETE CASCADE,
    organization_id       uuid NOT NULL REFERENCES neon_auth.organization(id) ON DELETE CASCADE,
    signing_bonus_cents   int NOT NULL DEFAULT 10000,
    first_job_bonus_cents int NOT NULL DEFAULT 10000,
    ongoing_share_bps     int NOT NULL DEFAULT 2000,
    created_at            timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (scout_id, organization_id)
);

-- Path B: a prospective scout applies through the agency's public link, with no
-- account. Accepting one issues a real neon_auth.invitation and hands off to
-- path A, so membership is only ever created by accepting an invitation.
CREATE TABLE public.scout_application (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES neon_auth.organization(id) ON DELETE CASCADE,
    email           text NOT NULL,
    name            text NOT NULL,
    city            text,
    country         text,
    instagram       text,
    message         text,
    status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'invited', 'rejected')),
    -- The neon_auth.invitation this became. No FK: that table is managed.
    invitation_id   uuid,
    created_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (organization_id, email)
);

CREATE INDEX ON public.scout_application (organization_id, status, created_at DESC);

-- Agencies asking to join the platform. Access is invite-only while partner
-- agencies are onboarded, so this is a request an operator approves — approval
-- is what creates the organization.
CREATE TABLE public.agency_request (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_name  text NOT NULL,
    slug         text NOT NULL,
    website      text,
    contact_name text NOT NULL,
    role         text,
    email        text NOT NULL,
    phone        text,
    city         text NOT NULL,
    country      text NOT NULL,
    board_size   int,
    notes        text,
    status       text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.agency_request (status, created_at DESC);

-- Model applications. Anonymous by design: applicants never get accounts, which
-- keeps the platform from holding logins for 14-year-olds.
--
-- One row per targeted agency. A single submit that fans out to several agencies
-- shares a submission_id, and each agency reviews its own row independently.
CREATE TABLE public.application (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id   uuid NOT NULL,
    organization_id uuid NOT NULL REFERENCES neon_auth.organization(id) ON DELETE CASCADE,
    -- Credit follows the application through pre-select, vote, and signing.
    scout_id        uuid REFERENCES public.scout_profile(id) ON DELETE SET NULL,

    first_name      text NOT NULL,
    last_name       text NOT NULL,
    email           text NOT NULL,
    phone           text NOT NULL,
    dob             date NOT NULL,
    gender          text NOT NULL,
    city            text NOT NULL,
    country         text NOT NULL,
    instagram       text,

    height_cm       int NOT NULL,
    bust_cm         int NOT NULL,
    waist_cm        int NOT NULL,
    hips_cm         int NOT NULL,
    shoe_eu         int NOT NULL,
    hair_color      text NOT NULL,
    eye_color       text NOT NULL,

    video_link      text,
    portfolio_link  text,
    notes           text,

    -- Mirrors STAGES in src/lib/pipeline.ts, in order.
    stage           text NOT NULL DEFAULT 'applied'
                    CHECK (stage IN ('applied', 'pre_select', 'scheduled',
                                     'final_voting', 'onboarding', 'on_board')),
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.application (organization_id, stage, created_at DESC);
CREATE INDEX ON public.application (scout_id);
CREATE INDEX ON public.application (submission_id);

COMMIT;
