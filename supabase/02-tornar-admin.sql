-- Rode DEPOIS de criar seu usuário em Authentication > Users.
-- Troque SEU_EMAIL_AQUI pelo e-mail EXATO que você cadastrou (mantenha as aspas simples).
insert into public.admins (user_id)
select id from auth.users where email = 'SEU_EMAIL_AQUI'
on conflict do nothing;

-- Conferência: deve listar 1 linha com o seu usuário.
select a.user_id, u.email from public.admins a join auth.users u on u.id = a.user_id;
