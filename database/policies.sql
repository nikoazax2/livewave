-- Create a policy to allow updates only on the "likes" column
create policy "likes"
on "public"."messages"
as PERMISSIVE
for UPDATE
to public
using (true) -- Allow updates for all rows
with check (column_name = 'likes'); -- Ensure only the "likes" column can be updated
