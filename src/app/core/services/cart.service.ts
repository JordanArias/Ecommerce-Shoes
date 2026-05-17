import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../models/cart.model';

/**
 * Servicio central para la gestión del carrito de compras.
 * Proporciona métodos reactivos para añadir, eliminar y actualizar productos.
 */
@Injectable({
  providedIn: 'root',
})
export class CartService {
  /**
   * Estado privado del carrito (Signal).
   * @private
   */
  private _cartItems = signal<CartItem[]>([]);

  /**
   * Items del carrito expuestos como Readonly para evitar mutaciones externas.
   */
  public items = this._cartItems.asReadonly();

  /**
   * Subtotal calculado de todos los productos en el carrito.
   */
  public subtotal = computed(() => {
    return this._cartItems().reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  /**
   * Total final de la orden (Sin impuestos, solo subtotal por solicitud del usuario).
   */
  public total = computed(() => {
    return this.subtotal();
  });

  /**
   * Cantidad total de artículos individuales en el carrito.
   */
  public itemCount = computed(() => {
    return this._cartItems().reduce((total, item) => total + item.quantity, 0);
  });

  /**
   * Añade un producto al carrito o incrementa su cantidad si ya existe.
   * @param item Datos del producto a añadir.
   */
  public addToCart(item: Omit<CartItem, 'quantity'>): void {
    this._cartItems.update(items => {
      const existing = items.find(i => i.id === item.id);
      if (existing) {
        return items.map(i => i === existing ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...items, { ...item, quantity: 1 }];
    });
  }

  /**
   * Elimina un producto del carrito por su ID.
   * @param id ID del producto.
   */
  public removeFromCart(id: string): void {
    this._cartItems.update(items => items.filter(i => i.id !== id));
  }

  /**
   * Actualiza la cantidad de un producto específico.
   * @param id ID del producto.
   * @param quantity Nueva cantidad (si es <= 0 se elimina el producto).
   */
  public updateQuantity(id: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(id);
      return;
    }
    this._cartItems.update(items =>
      items.map(i => i.id === id ? { ...i, quantity } : i)
    );
  }

  /**
   * Vacía completamente el carrito.
   */
  public clearCart(): void {
    this._cartItems.set([]);
  }

  /**
   * Genera un enlace de WhatsApp con el resumen de la orden.
   * @returns URL de WhatsApp pre-llenada.
   */
  public generateWhatsAppLink(): string {
    const phone = '59167940579';
    let message = 'Hola, quisiera comprar los siguientes productos:%0A';
    
    this._cartItems().forEach(item => {
      message += `- ${item.quantity}x ${item.name} (Descripción: ${item.descripcion}) - $${(item.price * item.quantity).toFixed(2)}%0A`;
    });
    
    message += `%0A*Total:* $${this.total().toFixed(2)}`;
    return `https://wa.me/${phone}?text=${message}`;
  }
}
