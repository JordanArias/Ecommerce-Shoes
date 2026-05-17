import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

// Core
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Componente de la barra de navegación principal.
 * Gestiona el menú, enlaces de navegación y el acceso rápido al carrito con contador reactivo.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  /** Inyección del servicio de carrito para mostrar el contador de productos en tiempo real */
  public cartService = inject(CartService);
  /** Inyección del servicio de autenticación para controlar visibilidad de menús */
  public authService = inject(AuthService);

  /**
   * Cierra la sesión activa del usuario.
   */
  public logout(): void {
    this.authService.logout();
  }
}
