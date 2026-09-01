-- 0002 — agencies register themselves.
--
-- Registration and account creation are now one screen: the founder fills in
-- the agency, gets a code by email, verifies, and creates the agency. Nobody
-- approves anything in between, so `status` no longer means anything.
--
-- The row is what carries the agency's details from the registration form to
-- the moment the founder creates the organization — it is a signup in progress,
-- not a request, hence the rename.

BEGIN;

ALTER TABLE public.agency_request RENAME TO agency_signup;

-- Dropping the column drops the (status, created_at) index with it.
ALTER TABLE public.agency_signup DROP COLUMN status;

-- The slug is claimed at registration, so no two signups can race for it.
-- Organizations already enforce their own uniqueness separately.
ALTER TABLE public.agency_signup ADD CONSTRAINT agency_signup_slug_key UNIQUE (slug);

-- Looked up by email on every sign-in, case-insensitively.
CREATE UNIQUE INDEX agency_signup_email_uidx ON public.agency_signup (lower(email));

COMMIT;
