-- Function to get mutual connections count between two users
create or replace function public.get_mutual_connection_count(user_a_id uuid, user_b_id uuid)
returns integer as $$
  with user_a_connections as (
    select 
      case 
        when requester_id = user_a_id then receiver_id
        else requester_id
      end as connected_user_id
    from public.connections
    where (requester_id = user_a_id or receiver_id = user_a_id)
    and status = 'accepted'
  ),
  user_b_connections as (
    select 
      case 
        when requester_id = user_b_id then receiver_id
        else requester_id
      end as connected_user_id
    from public.connections
    where (requester_id = user_b_id or receiver_id = user_b_id)
    and status = 'accepted'
  )
  select count(*)::integer
  from user_a_connections a
  inner join user_b_connections b on a.connected_user_id = b.connected_user_id;
$$ language sql security definer;