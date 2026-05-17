-- Extended Seed Data para Productos y Usuarios
DO $$
DECLARE
  perf_id UUID;
  street_id UUID;
  skate_id UUID;
BEGIN
  -- Obtener IDs de categorías
  SELECT id INTO perf_id FROM public.categorias WHERE nombre = 'Performance' LIMIT 1;
  SELECT id INTO street_id FROM public.categorias WHERE nombre = 'Street' LIMIT 1;
  SELECT id INTO skate_id FROM public.categorias WHERE nombre = 'Skate' LIMIT 1;

  IF skate_id IS NULL THEN
    INSERT INTO public.categorias (nombre, descripcion) VALUES ('Skate', 'Zapatillas de skate') RETURNING id INTO skate_id;
  END IF;

  -- 10 Productos de ejemplo
  INSERT INTO public.productos (categoria_id, nombre, descripcion, precio, imagen_url, estado, destacado)
  VALUES 
  (perf_id, 'Aero-Runner 360', 'Ligereza absoluta para maratones intensos con suela de fibra de carbono.', 210.50, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'activo', true),
  (street_id, 'Urban Retro X', 'El clásico estilo callejero de los 90 rediseñado con materiales modernos.', 145.00, 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80', 'activo', false),
  (skate_id, 'Grind Master Low', 'Resistencia extrema a la fricción, ideales para la tabla.', 95.00, 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80', 'activo', false),
  (perf_id, 'Gravity Defier', 'Amortiguación de gravedad cero que cuida tus articulaciones.', 280.00, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80', 'activo', true),
  (street_id, 'Neon Walker', 'Brillan en la oscuridad. Perfectas para la noche urbana.', 175.99, 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800&q=80', 'activo', false),
  (perf_id, 'Trail Blazer Pro', 'Diseñadas para terrenos escarpados y montañas lluviosas.', 190.00, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80', 'activo', false),
  (street_id, 'Minimalist White', 'Diseño limpio y sin logos. La elegancia hecha zapatilla.', 110.00, 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&q=80', 'agotado', false),
  (skate_id, 'Concrete Surfer', 'Plantilla acolchada para saltos de gran impacto.', 130.00, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80', 'activo', true),
  (perf_id, 'Sonic Sprint', 'Zapatillas aerodinámicas para velocistas de pista.', 250.00, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80', 'inactivo', false),
  (street_id, 'Camo Stealth', 'Edición militar para el camuflaje urbano.', 160.00, 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=800&q=80', 'activo', false);

END $$;
