-- Deerva analytics standard: retention enforced automatically, not by hand.
-- analytics_purge_old() already exists and is service_role-only; this schedules it.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

DO $$
BEGIN
  PERFORM cron.unschedule('analytics-purge-old');
EXCEPTION
  WHEN OTHERS THEN NULL; -- job did not exist yet
END $$;

SELECT cron.schedule(
  'analytics-purge-old',
  '15 3 * * *', -- daily, 03:15 UTC (off-peak for a US East audience)
  $$SELECT public.analytics_purge_old();$$
);
