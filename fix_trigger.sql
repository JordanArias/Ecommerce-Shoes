CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, apellidos, rol)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'nombre', 'Admin'), 
    COALESCE(new.raw_user_meta_data->>'apellidos', 'Temporal'), 
    'cliente'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
