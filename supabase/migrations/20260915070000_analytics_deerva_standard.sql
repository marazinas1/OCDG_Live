-- Deerva analytics standard: sessions, engagement duration, UTM capture
ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS session_id      text,
  ADD COLUMN IF NOT EXISTS duration_seconds integer,
  ADD COLUMN IF NOT EXISTS utm_source      text,
  ADD COLUMN IF NOT EXISTS utm_medium      text,
  ADD COLUMN IF NOT EXISTS utm_campaign    text;

CREATE INDEX IF NOT EXISTS page_views_session_idx ON public.page_views (day, session_id);

CREATE OR REPLACE FUNCTION public.analytics_summary(_from date, _to date)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not authorised';
  END IF;

  IF _from IS NULL OR _to IS NULL OR _to < _from OR (_to - _from) > 400 THEN
    RAISE EXCEPTION 'invalid date range';
  END IF;

  WITH cur AS (
    SELECT *, COALESCE(session_id, visitor_hash) AS sid
    FROM public.page_views
    WHERE day BETWEEN _from AND _to
  ),
  cur_sessions AS (
    SELECT sid,
           count(*) AS views,
           COALESCE(sum(duration_seconds), 0) AS duration
    FROM cur
    GROUP BY sid
  ),
  prev AS (
    SELECT *, COALESCE(session_id, visitor_hash) AS sid
    FROM public.page_views
    WHERE day BETWEEN (_from - (_to - _from) - 1) AND (_from - 1)
  ),
  prev_sessions AS (
    SELECT sid, count(*) AS views, COALESCE(sum(duration_seconds), 0) AS duration
    FROM prev
    GROUP BY sid
  )
  SELECT jsonb_build_object(
    'totals', (
      SELECT jsonb_build_object(
        'views', (SELECT count(*) FROM cur),
        'visitors', (SELECT count(DISTINCT visitor_hash) FROM cur),
        'sessions', (SELECT count(*) FROM cur_sessions),
        'avg_duration', COALESCE((SELECT round(avg(duration))::int FROM cur_sessions), 0),
        'bounce_rate', COALESCE((
          SELECT round(100.0 * count(*) FILTER (WHERE views = 1) / NULLIF(count(*), 0))::int
          FROM cur_sessions
        ), 0),
        'pages_per_visit', COALESCE((
          SELECT round(avg(views)::numeric, 2) FROM cur_sessions
        ), 0)
      )
    ),
    'previous', (
      SELECT jsonb_build_object(
        'views', (SELECT count(*) FROM prev),
        'visitors', (SELECT count(DISTINCT visitor_hash) FROM prev),
        'sessions', (SELECT count(*) FROM prev_sessions),
        'avg_duration', COALESCE((SELECT round(avg(duration))::int FROM prev_sessions), 0),
        'bounce_rate', COALESCE((
          SELECT round(100.0 * count(*) FILTER (WHERE views = 1) / NULLIF(count(*), 0))::int
          FROM prev_sessions
        ), 0),
        'pages_per_visit', COALESCE((
          SELECT round(avg(views)::numeric, 2) FROM prev_sessions
        ), 0)
      )
    ),
    'daily', COALESCE((
      SELECT jsonb_agg(row_to_json(d) ORDER BY d.day)
      FROM (
        SELECT day,
               count(*)                     AS views,
               count(DISTINCT visitor_hash) AS visitors
        FROM cur
        GROUP BY day
      ) d
    ), '[]'::jsonb),
    'top_pages', COALESCE((
      SELECT jsonb_agg(row_to_json(p))
      FROM (
        SELECT path, count(*) AS views
        FROM cur
        GROUP BY path
        ORDER BY count(*) DESC
        LIMIT 15
      ) p
    ), '[]'::jsonb),
    'sources', COALESCE((
      SELECT jsonb_agg(row_to_json(s))
      FROM (
        SELECT source, count(*) AS views
        FROM cur
        GROUP BY source
        ORDER BY count(*) DESC
      ) s
    ), '[]'::jsonb),
    'referrers', COALESCE((
      SELECT jsonb_agg(row_to_json(r))
      FROM (
        SELECT referrer_host AS host, count(*) AS views
        FROM cur
        WHERE referrer_host IS NOT NULL
        GROUP BY referrer_host
        ORDER BY count(*) DESC
        LIMIT 10
      ) r
    ), '[]'::jsonb),
    'countries', COALESCE((
      SELECT jsonb_agg(row_to_json(c))
      FROM (
        SELECT COALESCE(country, 'unknown') AS country, count(*) AS views
        FROM cur
        GROUP BY COALESCE(country, 'unknown')
        ORDER BY count(*) DESC
        LIMIT 10
      ) c
    ), '[]'::jsonb),
    'devices', COALESCE((
      SELECT jsonb_agg(row_to_json(v))
      FROM (
        SELECT device, count(*) AS views
        FROM cur
        GROUP BY device
      ) v
    ), '[]'::jsonb),
    'leads', (
      SELECT count(*) FROM public.leads
      WHERE created_at::date BETWEEN _from AND _to
    )
  ) INTO result;

  RETURN result;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.analytics_summary(date, date) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.analytics_summary(date, date) TO authenticated;

-- 14 month retention, per the analytics standard.
CREATE OR REPLACE FUNCTION public.analytics_purge_old()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  removed integer;
BEGIN
  DELETE FROM public.page_views
  WHERE day < ((now() AT TIME ZONE 'utc')::date - INTERVAL '14 months');
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.analytics_purge_old() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.analytics_purge_old() TO service_role;