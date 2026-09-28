-- Compteur de connectes reel (presence Realtime) : horodatage de la derniere mise a jour
alter table public.chats add column if not exists livers_at timestamptz;
grant update (livers, livers_at) on public.chats to anon, authenticated;
