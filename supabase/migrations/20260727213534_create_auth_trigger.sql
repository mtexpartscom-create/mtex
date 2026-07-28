/*
# Auth trigger - auto-create profile on signup

1. New Functions
- `handle_new_user()` - inserts a row into `profiles` when a new auth.users row is created, copying email.
2. New Triggers
- `on_auth_user_created` - fires AFTER INSERT on auth.users, calls handle_new_user().
3. Security
- The function runs with SECURITY DEFINER so it can insert into profiles even though the caller is anon/authenticated. Owned by postgres.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, phone, company_name, uic_eik, b2b_approved)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'b2c'),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'uic_eik',
    false
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();