-- Agregar política para que los administradores puedan actualizar los perfiles de otros usuarios
DROP POLICY IF EXISTS "Los administradores pueden actualizar cualquier usuario" ON public.usuarios;

CREATE POLICY "Los administradores pueden actualizar cualquier usuario" 
ON public.usuarios 
FOR UPDATE 
USING ( public.is_admin() );

-- Actualizar caché
NOTIFY pgrst, 'reload schema';
