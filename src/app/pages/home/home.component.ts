import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Core
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';

/**
 * Componente para la página de inicio (Home).
 * Muestra productos destacados y las últimas novedades del catálogo.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  // --- Inyecciones ---
  private _productService = inject(ProductService);
  private _cartService = inject(CartService);
  
  // --- Estado ---
  /** Productos destacados para la sección principal */
  public featuredProducts = signal<Product[]>([]);
  /** Novedades recientes del catálogo */
  public latestProducts = signal<Product[]>([]);
  /** Estado de carga de la página */
  public loading = signal<boolean>(true);

  // --- Estado Modal Detalle ---
  public showDetailModal = signal(false);
  public selectedProduct = signal<Product | null>(null);

  // --- Ciclo de Vida ---
  ngOnInit(): void {
    this._loadDashboardData();
  }

  // --- Métodos Públicos ---
  
  /**
   * Abre el modal con el detalle completo del producto.
   */
  public openDetail(product: Product): void {
    this.selectedProduct.set(product);
    this.showDetailModal.set(true);
  }

  /**
   * Cierra el modal de detalle.
   */
  public closeDetail(): void {
    this.showDetailModal.set(false);
    setTimeout(() => this.selectedProduct.set(null), 300);
  }

  /**
   * Añade un producto directamente al carrito desde la vista previa.
   * @param product Instancia del producto a añadir.
   */
  public addToCart(product: Product): void {
    this._cartService.addToCart({
      id: product.id,
      name: product.nombre,
      descripcion: product.descripcion,
      price: product.precio,
      image: product.imagen_url
    });
  }

  // --- Métodos Privados ---
  /**
   * Carga inicial de datos para las secciones de la Home.
   * @private
   */
  private async _loadDashboardData(): Promise<void> {
    try {
      this.loading.set(true);
      
      const [featured, all] = await Promise.all([
        this._productService.getFeaturedProducts(),
        this._productService.getProducts()
      ]);

      this.featuredProducts.set(featured);
      
      // Filtrar novedades: productos que no están en destacados y limitar a 4
      const featuredIds = new Set(featured.map(p => p.id));
      const latest = all
        .filter(p => !featuredIds.has(p.id))
        .slice(0, 4);
        
      this.latestProducts.set(latest);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      this.loading.set(false);
    }
  }
}
