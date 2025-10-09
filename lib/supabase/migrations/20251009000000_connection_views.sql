-- Drop the old view if it exists
drop view if exists public.user_connections;

-- Then recreate the updated version
create or replace view public.user_connections as
select 
  c.id,
  c.status,
  c.created_at,
  c.requester_id,
  c.receiver_id,
  r.username as requester_username,
  r.first_name as requester_first_name,
  r.last_name as requester_last_name,
  r.avatar_url as requester_avatar_url,
  p.username as receiver_username,
  p.first_name as receiver_first_name,
  p.last_name as receiver_last_name,
  p.avatar_url as receiver_avatar_url
from public.connections c
inner join public.users r on r.id = c.requester_id
inner join public.users p on p.id = c.receiver_id
where c.status = 'accepted';

grant select on public.user_connections to authenticated;
