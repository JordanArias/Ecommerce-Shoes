import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Core
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { Product, Category } from '../../core/models/product.model';

/**
 * Categoría enriquecida con imagen de producto representativa y conteo para la vista Home.
 */
export interface CategoryWithImage {
  id: string;
  nombre: string;
  descripcion?: string;
  imagen_url: string;
  count: number;
}

/**
 * Componente para la página de inicio (Home).
 * Muestra categorías dinámicas y productos destacados del inventario.
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
  private _categoryService = inject(CategoryService);
  private _cartService = inject(CartService);
  
  // --- Estado ---
  /** Categorías registradas con imagen del inventario */
  public categories = signal<CategoryWithImage[]>([]);
  /** Productos destacados para la sección principal */
  public featuredProducts = signal<Product[]>([]);
  /** Estado de carga de la página */
  public loading = signal<boolean>(true);

  // --- Estado Modal Detalle ---
  public showDetailModal = signal(false);
  public selectedProduct = signal<Product | null>(null);
  public activeModalImage = signal<string>('');

  // --- Ciclo de Vida ---
  ngOnInit(): void {
    this._loadDashboardData();
  }

  // --- Métodos Públicos ---
  
  /**
   * Abre el modal con el detalle completo del producto y resetea la imagen activa.
   */
  public openDetail(product: Product): void {
    this.selectedProduct.set(product);
    this.activeModalImage.set(product.imagen_url);
    this.showDetailModal.set(true);
  }

  /**
   * Cambia la imagen principal mostrada en el modal.
   */
  public setActiveModalImage(url: string): void {
    this.activeModalImage.set(url);
  }

  /**
   * Obtiene la lista completa de imágenes (portada + secundarias) para la galería.
   */
  public getAllProductImages(product: Product | null): string[] {
    if (!product) return [];
    const list: string[] = [];
    if (product.imagen_url) list.push(product.imagen_url);
    if (product.imagenes && Array.isArray(product.imagenes)) {
      for (const img of product.imagenes) {
        if (img && !list.includes(img)) list.push(img);
      }
    }
    return list;
  }

  /**
   * Cierra el modal de detalle.
   */
  public closeDetail(): void {
    this.showDetailModal.set(false);
    setTimeout(() => {
      this.selectedProduct.set(null);
      this.activeModalImage.set('');
    }, 300);
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
   * Carga inicial de datos para las secciones de la Home (categorías y destacados).
   * @private
   */
  private async _loadDashboardData(): Promise<void> {
    try {
      this.loading.set(true);
      
      const [categoriesData, featured, allProducts] = await Promise.all([
        this._categoryService.getCategories(),
        this._productService.getFeaturedProducts(),
        this._productService.getProducts()
      ]);

      this.featuredProducts.set(featured);

      // Imágenes de respaldo en caso de que alguna categoría no tenga productos registrados aún
      const fallbackImages = [
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80'
      ];

      // Mapear cada categoría con su imagen de producto real del inventario
      const mappedCategories: CategoryWithImage[] = categoriesData.map((cat, index) => {
        const catProducts = allProducts.filter(p => p.categoria_id === cat.id);
        const repImage = catProducts.find(p => p.destacado)?.imagen_url 
          || catProducts[0]?.imagen_url 
          || fallbackImages[index % fallbackImages.length];

        return {
          id: cat.id,
          nombre: cat.nombre,
          descripcion: cat.descripcion,
          imagen_url: repImage,
          count: catProducts.length
        };
      });

      this.categories.set(mappedCategories);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      this.loading.set(false);
    }
  }
}
