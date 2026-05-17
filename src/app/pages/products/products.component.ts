import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Core
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { Product, Category } from '../../core/models/product.model';

/**
 * Componente para el catálogo de productos.
 * Permite buscar, filtrar por categoría y rango de precio.
 */
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent implements OnInit {
  // --- Inyecciones ---
  private _productService = inject(ProductService);
  private _categoryService = inject(CategoryService);
  private _cartService = inject(CartService);
  
  // --- Estado de Datos ---
  /** Lista completa de productos activos */
  public products = signal<Product[]>([]);
  /** Lista de categorías disponibles */
  public categories = signal<Category[]>([]);
  /** Estado de carga */
  public loading = signal<boolean>(true);
  /** Mensaje de error si ocurre un fallo en la carga */
  public error = signal<string | null>(null);

  // --- Estado de Filtros ---
  /** Query de búsqueda de texto */
  public searchQuery = signal<string>('');
  /** Precio máximo seleccionado en el slider */
  public priceMax = signal<number>(1000);
  /** ID de la categoría seleccionada para filtrar */
  public selectedCategory = signal<string | null>(null);

  // --- Estado Modal Detalle ---
  /** Controla la visibilidad del modal de detalle de producto */
  public showDetailModal = signal(false);
  /** Almacena el producto seleccionado para mostrar en el modal */
  public selectedProduct = signal<Product | null>(null);

  /**
   * Signal computado que aplica los filtros activos sobre la lista de productos.
   * Se actualiza automáticamente cuando cualquier parámetro de filtro cambia.
   */
  public filteredProducts = computed(() => {
    let result = this.products();
    
    // 1. Filtro por búsqueda (nombre, descripción, categoría)
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter(p =>
        p.nombre.toLowerCase().includes(query) ||
        p.descripcion.toLowerCase().includes(query) ||
        (p.categorias?.nombre || '').toLowerCase().includes(query)
      );
    }

    // 2. Filtro por rango de precio
    const maxPrice = this.priceMax();
    if (maxPrice < 1000) {
      result = result.filter(p => p.precio <= maxPrice);
    }

    // 3. Filtro por categoría seleccionada
    const catId = this.selectedCategory();
    if (catId) {
      result = result.filter(p => p.categoria_id === catId);
    }

    return result;
  });

  // --- Ciclo de Vida ---
  ngOnInit(): void {
    this._loadInitialData();
  }

  // --- Métodos de Interacción (UI) ---
  /**
   * Maneja el cambio en el input de búsqueda.
   */
  public onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  /**
   * Maneja el cambio en el slider de precio.
   */
  public onPriceChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.priceMax.set(value);
  }

  /**
   * Alterna la selección de una categoría desde los botones de escritorio.
   * @param id ID de la categoría (null para resetear).
   */
  public selectCategory(id: string | null): void {
    this.selectedCategory.set(this.selectedCategory() === id ? null : id);
  }

  /**
   * Maneja la selección de categoría desde el dropdown móvil.
   */
  public onCategorySelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCategory.set(value || null);
  }

  /**
   * Abre el modal con el detalle completo del producto.
   * @param product El producto seleccionado.
   */
  public openDetail(product: Product): void {
    this.selectedProduct.set(product);
    this.showDetailModal.set(true);
  }

  /**
   * Cierra el modal de detalle del producto.
   */
  public closeDetail(): void {
    this.showDetailModal.set(false);
    setTimeout(() => this.selectedProduct.set(null), 300); // Pequeño delay para la animación de cierre
  }

  /**
   * Añade el producto seleccionado al carrito.
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
   * Carga los productos y categorías necesarios para el catálogo.
   * @private
   */
  private async _loadInitialData(): Promise<void> {
    try {
      this.loading.set(true);
      const [products, categories] = await Promise.all([
        this._productService.getProducts(),
        this._categoryService.getCategories()
      ]);
      this.products.set(products);
      this.categories.set(categories);
    } catch (err: any) {
      this.error.set(err.message || 'Error al conectar con el servidor');
    } finally {
      this.loading.set(false);
    }
  }
}
