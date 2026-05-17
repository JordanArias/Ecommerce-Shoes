-- Eliminar políticas conflictivas en usuarios
DROP POLICY IF EXISTS "Los administradores pueden ver todos los usuarios" ON public.usuarios;

-- Evitar recursión usando una subconsulta genérica o evitando la tabla principal
CREATE POLICY "Los administradores pueden ver todos los usuarios" ON public.usuarios 
FOR SELECT USING (
  (SELECT rol FROM public.usuarios WHERE id = auth.uid() LIMIT 1) = 'admin'
);

-- Nota: Incluso con eso, Postgres podría dar error de recursión. La mejor forma de manejar RLS de admin 
-- sin recursión es usar una función SECURITY DEFINER para verificar el rol.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  SELECT rol INTO user_role FROM public.usuarios WHERE id = auth.uid() LIMIT 1;
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reemplazar políticas para usar la nueva función y evitar recursión en todas las tablas

DROP POLICY IF EXISTS "Los administradores pueden ver todos los usuarios" ON public.usuarios;
CREATE POLICY "Los administradores pueden ver todos los usuarios" ON public.usuarios FOR SELECT USING ( public.is_admin() );

DROP POLICY IF EXISTS "Solo admins pueden modificar categorías" ON public.categorias;
CREATE POLICY "Solo admins pueden modificar categorías" ON public.categorias FOR ALL USING ( public.is_admin() );

DROP POLICY IF EXISTS "Solo admins pueden ver todos y modificar productos" ON public.productos;
CREATE POLICY "Solo admins pueden ver todos y modificar productos" ON public.productos FOR ALL USING ( public.is_admin() );

DROP POLICY IF EXISTS "Solo admins pueden modificar variantes" ON public.producto_variantes;
CREATE POLICY "Solo admins pueden modificar variantes" ON public.producto_variantes FOR ALL USING ( public.is_admin() );

-- Permitir inserts anónimos temporalmente para inicializar la base de datos (luego puedes borrar esto)
CREATE POLICY "Permitir inserts publicos temporal" ON public.productos FOR INSERT WITH CHECK (true);

-- Insertar Datos de Semilla de Productos (si no existen)
DO $$
DECLARE
  perf_id UUID;
  street_id UUID;
BEGIN
  SELECT id INTO perf_id FROM public.categorias WHERE nombre = 'Performance' LIMIT 1;
  SELECT id INTO street_id FROM public.categorias WHERE nombre = 'Street' LIMIT 1;

  IF perf_id IS NOT NULL AND street_id IS NOT NULL THEN
    INSERT INTO public.productos (categoria_id, nombre, descripcion, precio, imagen_url, estado, destacado)
    VALUES 
    (perf_id, 'Vortex Neon 01', 'Zapatilla de alto rendimiento con detalles en verde neón.', 240.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcrnOYNXOOgitQjrJxZiAmzhoyeWOnyIOinNmEWX2mOS8-EO6DmTXlkXFdmi4lM6Z3ZEtA5E8gi5WjCdlQPh4ozaVKaJv9Z0aBjw349RYuXwlN16te3jNZ7WHXx23n9fbLoHwhrzlKyrrUox2aSUJh84otBTOPA6Gv0QOMmI0eT_iCyheIyGDw1o1hLp_CM47Tuw9n5OAlwqeEwGTmxi2QZnoS-Qo4TEGgReMHI-bVEPV9fFD10ynSuq9SSjEfuoDAWy-j4ywboys', 'activo', true),
    (street_id, 'Legacy White 04', 'Clásico blanco reimaginado para el futuro.', 185.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNzboQdT6hSjJRL-eQDwg2DWCEK0nR1IjH5Kirb3W8UKoIzzPBd_n0AmeRY1Mh7TCfuRVrABlQFqu_F3JY1FzBzHKjjgYJn1nILh01jhCLFpKELex56VUBZs3t3hBmktEXcIw3s9YElw1vupaJYb5mLtUggnVZ-HcTRfUJ2Nps7AaVrBwO7-1Ig-fVOWrsasXb0lUYTTprFV8xNKE6WWP5mqrgqD_AnIFOZ79suwopP9KcnYPPa7IpQ6L3On_NDuqIoiuX6UCNZC0', 'activo', true),
    (street_id, 'Obsidian X-Treme', 'Tech-wear oscuro y sigiloso.', 320.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIF-bR3LpEdh1s1hVQxVWKgdd1G2VWIoOj6u0aX2DW55PQ78v33oulcRkg25lL4TSOtDvHTglhiBtcqeLMDh0fwYeYeMnNtTGs4n5uqJe9CxQyQg5c5N7IDpVULhEDSyeTpmk_ci6IoX8VM-MbfOp4Bchov1nLZS_i1XO_t0y30Q0HyBUIq005k8EWvV7U-gPahzrUlLeVh2c6aWh2-ldsCnlq2fe3w2YkjDwK2VrASL9BuOgrYzAiPYIdw0xxTvYMr4iDLViMD-k', 'activo', true),
    (perf_id, 'Blaze Orange 22', 'Zapatilla naranja vibrante para correr.', 210.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeosua7a4yqG6bXIo2QMFvaEa1GXm7J3i3SP2n7LH8fFP-p9n48K8IoBjnOYxyNKc6cZZf8BlT1EyVpGnhYp2ce--4zY3C5JeiPpqEczIcrpsRanFFKOljDQfl8uH_KxwdtNoTv6Be9NzORXyya3ck-RL8Pjxuc1dqoDeMzXCBDLD6wCzdlNA_byGXBCRyyq2ms69Ag1OFhE6LxEhF8xDQbgUeYZ0fNdDFsu43qr62G5hQaP5xe3BT_CDe-NWmgsk_VQl9L3l00pw', 'activo', true)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

