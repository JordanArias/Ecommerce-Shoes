/**
 * Interfaz que representa una categoría de productos.
 */
export interface Category {
  id: string;
  nombre: string;
  descripcion: string;
}

/**
 * Interfaz que representa un producto en el sistema.
 */
export interface Product {
  id: string;
  categoria_id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  estado: string;
  destacado: boolean;
  categorias?: { nombre: string }; // Relación con categorías
}

/**
 * Interfaz que representa una variante específica de un producto (talla/color/stock).
 */
export interface ProductVariant {
  id: string;
  producto_id: string;
  talla: string;
  color: string;
  stock: number;
}
