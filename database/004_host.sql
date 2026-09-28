-- Messages de l'animateur LiveWave : seul le serveur (service_role) peut poser le drapeau host
alter table public.messages add column if not exists host boolean not null default false;
revoke insert on public.messages from anon, authenticated;
grant insert (chat_id, username, content, reply) on public.messages to anon, authenticated;
