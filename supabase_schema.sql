-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Usuarios (Extiende la tabla auth.users de Supabase)
CREATE TABLE public.usuarios (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'cliente' CHECK (rol IN ('admin', 'cliente')),
    telefono VARCHAR(50),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security para usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON public.usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Los administradores pueden ver todos los usuarios" ON public.usuarios FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
);
CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON public.usuarios FOR UPDATE USING (auth.uid() = id);

-- 2. Tabla de Categorías
CREATE TABLE public.categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para categorías
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Políticas para categorías
CREATE POLICY "Todos pueden ver las categorías" ON public.categorias FOR SELECT USING (true);
CREATE POLICY "Solo admins pueden modificar categorías" ON public.categorias FOR ALL USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
);

-- 3. Tabla de Productos
CREATE TABLE public.productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    imagen_url TEXT NOT NULL,
    estado VARCHAR(50) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'agotado')),
    destacado BOOLEAN DEFAULT false,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para productos
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- Políticas para productos
CREATE POLICY "Todos pueden ver los productos activos" ON public.productos FOR SELECT USING (estado = 'activo' OR estado = 'agotado');
CREATE POLICY "Solo admins pueden ver todos y modificar productos" ON public.productos FOR ALL USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
);

-- 4. Tabla de Tallas y Colores (Inventario y Variantes)
CREATE TABLE public.producto_variantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID REFERENCES public.productos(id) ON DELETE CASCADE,
    talla VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    stock INTEGER DEFAULT 0,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para variantes
ALTER TABLE public.producto_variantes ENABLE ROW LEVEL SECURITY;

-- Políticas para variantes
CREATE POLICY "Todos pueden ver las variantes" ON public.producto_variantes FOR SELECT USING (true);
CREATE POLICY "Solo admins pueden modificar variantes" ON public.producto_variantes FOR ALL USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
);

-- 5. Función para sincronizar nuevos usuarios de Auth a Public
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, apellidos, rol)
  VALUES (new.id, new.raw_user_meta_data->>'nombre', new.raw_user_meta_data->>'apellidos', 'cliente');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función cuando un usuario se registra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insertar Datos de Prueba (Semilla)
INSERT INTO public.categorias (nombre, descripcion) VALUES 
('Performance', 'Zapatillas técnicas para alto rendimiento'),
('Street', 'Estilo urbano y moda exclusiva'),
('Sport', 'Calzado especializado para deportes');
