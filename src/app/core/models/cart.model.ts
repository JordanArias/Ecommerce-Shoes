/**
 * Interfaz que representa un artículo dentro del carrito de compras.
 */
export interface CartItem {
  id: string;
  name: string;
  descripcion: string;
  price: number;
  image: string;
  quantity: number;
}
