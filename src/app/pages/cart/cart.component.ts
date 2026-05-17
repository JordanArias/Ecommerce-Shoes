import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Core
import { CartService } from '../../core/services/cart.service';

/**
 * Componente para gestionar la vista del carrito de compras.
 * Muestra el resumen de la orden y permite realizar el pedido por WhatsApp.
 */
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  /** Inyección del servicio del carrito para gestión de items y cálculos */
  public cartService = inject(CartService);

  /**
   * Navega hacia el enlace de WhatsApp generado por el servicio.
   * El servicio se encarga de formatear el mensaje con los productos actuales.
   */
  public proceedToWhatsApp(): void {
    const link = this.cartService.generateWhatsAppLink();
    window.open(link, '_blank');
  }
}
