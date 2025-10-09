-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create connections table
create table if not exists connections (
    id uuid primary key default uuid_generate_v4(),
    requester_id uuid not null references users(id) on delete cascade,
    receiver_id uuid not null references users(id) on delete cascade,
    status text not null check (status in ('pending', 'accepted', 'rejected')),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    
    -- Prevent duplicate connections
    constraint unique_connection unique (requester_id, receiver_id),
    -- Prevent self-connections
    constraint no_self_connection check (requester_id != receiver_id)
);

-- Create indexes for efficient querying
create index if not exists idx_connections_requester on connections(requester_id);
create index if not exists idx_connections_receiver on connections(receiver_id);
create index if not exists idx_connections_status on connections(status);

-- Enable Row Level Security
alter table connections enable row level security;

-- RLS Policies

-- Insert policy: Users can only create requests where they are the requester
create policy "Users can create their own connection requests"
    on connections
    for insert
    to authenticated
    with check (auth.uid()::uuid = requester_id);

-- Select policy: Users can read connections they are part of
create policy "Users can view their own connections"
    on connections
    for select
    to authenticated
    using (
        auth.uid()::uuid in (requester_id, receiver_id)
    );

-- Select policy: Users can read other users' accepted connections (for public profile viewing)
create policy "Users can view others' accepted connections"
    on connections
    for select
    to authenticated
    using (status = 'accepted');

-- Update policy: Only the receiver can accept/reject requests
create policy "Receivers can accept or reject connection requests"
    on connections
    for update
    to authenticated
    using (auth.uid()::uuid = receiver_id)
    with check (
        auth.uid()::uuid = receiver_id 
        and (status = 'accepted' or status = 'rejected')
        and (select status from connections where id = connections.id) = 'pending'
    );

-- Update policy: Requesters can retry rejected requests
create policy "Requesters can retry rejected requests"
    on connections
    for update
    to authenticated
    using (
        auth.uid()::uuid = requester_id
        and (select status from connections where id = connections.id) = 'rejected'
    )
    with check (
        auth.uid()::uuid = requester_id
        and status = 'pending'
        and (select status from connections where id = connections.id) = 'rejected'
    );

-- Trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_connections_updated_at
    before update on connections
    for each row
    execute procedure update_updated_at_column();