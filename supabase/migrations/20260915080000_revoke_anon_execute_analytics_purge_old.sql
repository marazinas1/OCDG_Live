REVOKE EXECUTE ON FUNCTION public.analytics_purge_old() FROM anon;
REVOKE EXECUTE ON FUNCTION public.analytics_purge_old() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.analytics_purge_old() TO service_role;