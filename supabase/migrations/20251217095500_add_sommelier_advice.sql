-- Add cached sommelier advice to wines to avoid repeated AI calls
alter table public.wines
add column if not exists sommelier_advice jsonb;


