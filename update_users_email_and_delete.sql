-- 1. Agregar columna email a public.usuarios
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 2. Actualizar correos existentes
UPDATE public.usuarios 
SET email = auth.users.email 
FROM auth.users 
WHERE public.usuarios.id = auth.users.id;

-- 3. Actualizar la función del trigger para nuevos usuarios para que inserte el email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre, apellidos, rol)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'nombre', new.raw_user_meta_data->>'apellidos', 'cliente');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Crear función para eliminar usuarios (incluyendo auth.users)
CREATE OR REPLACE FUNCTION public.delete_user_admin(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Verificar que el usuario que ejecuta la función es admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acceso denegado: se requiere rol de administrador';
  END IF;

  -- Borrar de auth.users (si public.usuarios no tiene CASCADE, borramos primero en public)
  DELETE FROM public.usuarios WHERE id = target_user_id;
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Dar permisos explícitos para que la aplicación (Angular) pueda llamar a la función
GRANT EXECUTE ON FUNCTION public.delete_user_admin(UUID) TO authenticated;

-- 6. Forzar actualización de la caché de Supabase
NOTIFY pgrst, 'reload schema';
